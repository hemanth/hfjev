import argparse
import json
import sys
from .core import HFDataset
from .utils import fetch_huggingface_rows, read_local_dataset
from pathlib import Path


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="hfjev",
        description="Classify Hugging Face datasets across typed semantic dimensions with TypeSafe Jev System One.",
    )
    parser.add_argument("dataset", help="Hugging Face dataset identifier (e.g. rotten_tomatoes) or local file path")
    parser.add_argument("--limit", "-n", type=int, default=5, help="Number of rows to sample (default: 5)")
    parser.add_argument("--split", default="train", help="Dataset split (default: train)")
    parser.add_argument("--config", default="default", help="Dataset config (default: default)")
    parser.add_argument("--column", "-c", help="Target text column name")
    parser.add_argument("--token", help="Hugging Face User Access Token")
    parser.add_argument("--api-key", help="TypeSafe API Key")
    parser.add_argument("--simulate", action="store_true", help="Force offline calibrated simulation engine")
    parser.add_argument("--json", action="store_true", dest="json_output", help="Output raw JSON results")

    args = parser.parse_args(argv)

    options = {
        "limit": args.limit,
        "split": args.split,
        "config": args.config,
        "column": args.column,
        "hf_token": args.token,
        "api_key": args.api_key,
        "simulate": args.simulate,
    }

    target = args.dataset
    is_local = target.endswith((".json", ".jsonl", ".csv")) or Path(target).exists()

    try:
        if is_local:
            local = read_local_dataset(target)
            rows = local["rows"]
            features = local["features"]
            text_column = args.column or local["text_column"]
            if args.limit and len(rows) > args.limit:
                rows = rows[:args.limit]
            dataset = HFDataset({"id": target, "rows": rows, "features": features, "text_column": text_column}, options)
        else:
            remote = fetch_huggingface_rows(target, options)
            dataset = HFDataset({
                "id": target,
                "rows": remote["rows"],
                "features": remote["features"],
                "text_column": args.column or remote["text_column"],
            }, options)

        results = dataset.classify()

        if args.json_output:
            print(json.dumps(results, indent=2))
            return 0

        print(f"\n⚡ hfjev classification: {dataset.id}")
        print(f"📦 Domain Pack: {dataset.pack_name}")
        print(f"📊 Evaluated Rows: {len(results)}\n" + "─" * 60)

        for item in results:
            preview = (item["text"][:75] + "...") if len(item["text"]) > 75 else item["text"]
            print(f"\n[Row {item['index']}] \"{preview}\"")
            for dim_id, ans in item["answers"].items():
                if "choice" in ans:
                    prob_str = f"({ans.get('confidence', 0):.0%})"
                    if "probabilities" in ans:
                        highest_prob = ans["probabilities"].get(ans["choice"], 0.76)
                        prob_str = f"({highest_prob:.0%})"
                    print(f"  • {dim_id:<16} ❯ {ans['choice'].upper():<12} {prob_str}")
                elif "noul" in ans:
                    p = ans["noul"]
                    bar = "■" * int(p * 10) + "□" * (10 - int(p * 10))
                    flag = "YES" if p > 0.5 else "NO"
                    print(f"  • {dim_id:<16} ❯ {flag:<5} [{bar}] ({p:.1%})")
                elif "score" in ans:
                    s = ans["score"]
                    print(f"  • {dim_id:<16} ❯ Score: {s:.2f} (confidence: {ans.get('confidence', 0.85):.0%})")

        print("\n" + "─" * 60)
        return 0

    except Exception as err:
        print(f"hfjev error: {err}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
