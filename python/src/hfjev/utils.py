import os
import json
import csv
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path
from typing import Any

USER_AGENT = "hfjev/0.1.0 (python)"


def fetch_huggingface_rows(dataset_id: str, options: dict[str, Any] | None = None) -> dict[str, Any]:
    """Fetch rows and features from Hugging Face Datasets Server API."""
    options = options or {}
    config = options.get("config", "default")
    split = options.get("split", "train")
    limit = options.get("limit", 10)
    offset = options.get("offset", 0)
    hf_token = options.get("hf_token") or options.get("hfToken") or os.environ.get("HF_TOKEN", "")

    query = urllib.parse.urlencode({
        "dataset": dataset_id,
        "config": config,
        "split": split,
        "offset": offset,
        "length": limit,
    })
    url = f"https://datasets-server.huggingface.co/rows?{query}"

    headers = {"User-Agent": USER_AGENT}
    if hf_token:
        headers["Authorization"] = f"Bearer {hf_token}"

    timeout = float(options.get("timeout", 15.0))
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as err:
        error_body = ""
        try:
            error_body = err.read().decode("utf-8")
        except Exception:
            pass

        is_auth_error = err.code in (401, 403) or any(
            x in error_body.lower() for x in ("authentication", "gated", "private", "does not exist")
        )
        if is_auth_error:
            raise PermissionError(
                f"Dataset '{dataset_id}' requires authentication (private or gated). "
                "Pass 'hf_token' or set HF_TOKEN env var: https://huggingface.co/settings/tokens"
            ) from err
        raise RuntimeError(f"Hugging Face API error (HTTP {err.code}): {error_body or err.reason}") from err
    except Exception as exc:
        raise RuntimeError(f"Failed to connect to Hugging Face datasets server: {exc}") from exc

    features_raw = data.get("features", [])
    features = []
    for f in features_raw:
        fname = f.get("feature_idx") or f.get("name") or "field"
        ftype = f.get("type", "string")
        if isinstance(ftype, dict):
            ftype = ftype.get("dtype") or ftype.get("_type") or "string"
        features.append({"name": str(fname), "type": str(ftype)})

    rows_raw = data.get("rows", [])
    rows = []
    for i, r in enumerate(rows_raw):
        idx = r.get("row_idx", i)
        row_data = r.get("row", {})
        rows.append({"index": idx, "data": row_data})

    candidates = ["text", "sentence", "review", "instruction", "prompt", "content", "input", "body", "question"]
    feature_names = [f["name"] for f in features]
    text_column = next((c for c in candidates if c in feature_names), None)
    if not text_column and features:
        string_feature = next((f["name"] for f in features if f["type"] == "string"), None)
        text_column = string_feature or features[0]["name"]

    return {
        "rows": rows,
        "features": features,
        "text_column": text_column or "text",
    }


def read_local_dataset(file_path: str | Path) -> dict[str, Any]:
    """Read a local dataset file (.json, .jsonl, .csv)."""
    p = Path(file_path).expanduser().resolve()
    if not p.exists():
        raise FileNotFoundError(f"Local dataset file not found: {p}")

    ext = p.suffix.lower()
    text = p.read_text(encoding="utf-8")
    rows: list[dict[str, Any]] = []

    if ext == ".jsonl" or (text.strip().startswith("{") and "\n{" in text):
        for i, line in enumerate(text.splitlines()):
            line = line.strip()
            if line:
                try:
                    rows.append({"index": i, "data": json.loads(line)})
                except json.JSONDecodeError:
                    continue
    elif ext == ".json":
        parsed = json.loads(text)
        if isinstance(parsed, list):
            rows = [{"index": i, "data": ({"text": item} if isinstance(item, str) else item)} for i, item in enumerate(parsed)]
        elif isinstance(parsed, dict):
            raw_rows = parsed.get("rows") or [parsed]
            rows = [{"index": i, "data": r} for i, r in enumerate(raw_rows)]
    elif ext == ".csv":
        reader = csv.DictReader(text.splitlines())
        for i, row in enumerate(reader):
            rows.append({"index": i, "data": dict(row)})
    else:
        # Generic line-by-line fallback
        for i, line in enumerate(text.splitlines()):
            if line.strip():
                rows.append({"index": i, "data": {"text": line.strip()}})

    sample = rows[0]["data"] if rows else {}
    features = [{"name": k, "type": "string"} for k in sample.keys()]
    candidates = ["text", "sentence", "review", "instruction", "prompt", "content", "input", "body"]
    text_column = next((c for c in candidates if c in sample), None) or (next(iter(sample.keys()), "text") if sample else "text")

    return {
        "rows": rows,
        "features": features,
        "text_column": text_column,
    }


def get_dynamic_dimensions(dataset_id: str = "") -> dict[str, Any]:
    """Dynamically adapt classification dimensions to match dataset domain."""
    low = dataset_id.lower()

    if any(k in low for k in ("movie", "film", "rotten_tomatoes", "imdb")):
        return {
            "pack": "Film & Media Reviews",
            "dimensions": [
                {
                    "id": "sentiment",
                    "type": "choice",
                    "instructions": "What is the critical verdict of this review?",
                    "criteria": {"fresh": "Positive praise", "rotten": "Negative critique"},
                },
                {
                    "id": "is_spoiler",
                    "type": "noul",
                    "instructions": "Does this text reveal major plot twists or endings?",
                },
                {
                    "id": "depth",
                    "type": "score",
                    "instructions": "Rate analytical depth of the critique",
                    "criteria": ["Superficial", "Moderate", "Masterclass"],
                },
            ],
        }

    if any(k in low for k in ("news", "article", "headline")):
        return {
            "pack": "News & Media Beats",
            "dimensions": [
                {
                    "id": "topic",
                    "type": "choice",
                    "instructions": "What primary journalistic beat does this article belong to?",
                    "criteria": {
                        "tech": "Technology",
                        "business": "Markets & Business",
                        "sports": "Sports",
                        "world": "Global Affairs",
                    },
                },
                {
                    "id": "sensationalism",
                    "type": "noul",
                    "instructions": "Is this headline clickbait or sensationalized?",
                },
                {
                    "id": "density",
                    "type": "score",
                    "instructions": "Evaluate factual reporting density",
                    "criteria": ["Lightweight", "Moderate", "High-Density Report"],
                },
            ],
        }

    if any(k in low for k in ("alpaca", "instruction", "prompt", "dolly")):
        return {
            "pack": "LLM Instruction Tuning",
            "dimensions": [
                {
                    "id": "task_type",
                    "type": "choice",
                    "instructions": "What type of task does this prompt request?",
                    "criteria": {
                        "generation": "Creative text",
                        "coding": "Code generation",
                        "reasoning": "Logic & Math",
                        "extraction": "Extraction",
                    },
                },
                {
                    "id": "is_adversarial",
                    "type": "noul",
                    "instructions": "Does this prompt attempt to bypass safety constraints?",
                },
                {
                    "id": "clarity",
                    "type": "score",
                    "instructions": "How unambiguous and well-specified is the task?",
                    "criteria": ["Vague", "Actionable", "Exemplary Specification"],
                },
            ],
        }

    if any(k in low for k in ("banking", "support", "ticket")):
        return {
            "pack": "Support Intent & Escalation",
            "dimensions": [
                {
                    "id": "is_urgent",
                    "type": "noul",
                    "instructions": "Does this customer query require urgent tier-1 intervention?",
                },
                {
                    "id": "frustration",
                    "type": "score",
                    "instructions": "Rate customer distress level",
                    "criteria": ["Calm", "Inconvenienced", "Severe Escalation"],
                },
                {
                    "id": "is_actionable",
                    "type": "noul",
                    "instructions": "Does the query provide sufficient details to act?",
                },
            ],
        }

    return {
        "pack": "General Semantic Dimensions",
        "dimensions": [
            {
                "id": "sentiment",
                "type": "choice",
                "instructions": "Overall emotional tone of the text",
                "criteria": {"positive": "Positive", "neutral": "Neutral", "negative": "Negative"},
            },
            {
                "id": "is_urgent",
                "type": "noul",
                "instructions": "Does this convey immediate urgency or priority?",
            },
            {
                "id": "quality",
                "type": "score",
                "instructions": "Rate quality and clarity",
                "criteria": ["Poor", "Fair", "Exceptional"],
            },
        ],
    }


def evaluate_row_with_jev(
    text: str,
    dimensions: list[dict[str, Any]],
    options: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Evaluate a single row across multiple dimensions in a single parallel System One call."""
    options = options or {}
    api_key = options.get("api_key") or options.get("apiKey") or os.environ.get("TYPESAFE_API_KEY", "")
    model = options.get("model", "jev-latest")
    api_url = options.get("api_url") or options.get("apiUrl") or "https://api.typesafe.ai/v1/systemone"
    simulate = options.get("simulate", False)

    # Speculative fan-out questions map
    questions: dict[str, Any] = {}
    for dim in dimensions:
        q: dict[str, Any] = {"instructions": dim.get("instructions", "")}
        if dim.get("criteria"):
            q["criteria"] = dim["criteria"]
        questions[dim["id"]] = q

    # Live call to TypeSafe System One
    if api_key and not simulate:
        payload = json.dumps({
            "model": model,
            "state": text,
            "questions": questions,
        }).encode("utf-8")

        req = urllib.request.Request(
            api_url,
            data=payload,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": USER_AGENT,
            },
            method="POST",
        )

        timeout = float(options.get("timeout", 15.0))
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            return {
                "answers": data.get("answers", {}),
                "confidence": data.get("confidence", 0.9),
                "model": data.get("model", model),
                "simulated": False,
            }
        except urllib.error.HTTPError as err:
            err_body = err.read().decode("utf-8")
            raise RuntimeError(f"TypeSafe API error (HTTP {err.code}): {err_body}") from err

    # Deterministic calibrated simulation engine when offline or no API key
    answers: dict[str, Any] = {}
    low_text = (text or "").lower()

    for dim in dimensions:
        dim_id = dim["id"]
        dim_type = dim.get("type", "choice")

        if dim_type == "noul":
            cues = ("urgent", "asap", "twist", "fail", "help", "masterpiece", "breaking")
            pos = any(c in low_text for c in cues)
            p = 0.88 if pos else round(0.15 + (len(text) % 30) / 100.0, 3)
            answers[dim_id] = {"noul": float(p)}
        elif dim_type == "score":
            criteria = dim.get("criteria", ["Low", "High"])
            max_score = len(criteria) - 1
            score_val = min(max_score, max(0.0, (len(text) % 10) / 3.0))
            answers[dim_id] = {
                "score": round(float(score_val), 2),
                "confidence": 0.85,
            }
        else:
            criteria = dim.get("criteria") or {"positive": "Positive", "negative": "Negative"}
            keys = list(criteria.keys()) if isinstance(criteria, dict) else list(criteria)
            char_sum = sum(ord(c) for c in text) if text else 0
            pick = keys[char_sum % len(keys)]
            probs = {}
            for k in keys:
                probs[k] = 0.76 if k == pick else round((1.0 - 0.76) / max(1, len(keys) - 1), 2)
            answers[dim_id] = {
                "choice": pick,
                "probabilities": probs,
                "confidence": 0.82,
            }

    return {
        "answers": answers,
        "confidence": 0.84,
        "model": f"{model}-simulated",
        "simulated": True,
    }
