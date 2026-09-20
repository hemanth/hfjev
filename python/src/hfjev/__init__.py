from __future__ import annotations

import os
import sys
from pathlib import Path
from types import ModuleType
from typing import Any, Sequence

from .core import HFDataset
from .utils import (
    fetch_huggingface_rows,
    read_local_dataset,
    get_dynamic_dimensions,
    evaluate_row_with_jev,
)

__version__ = "0.1.0"
__all__ = ["hfjev", "HFDataset", "get_dynamic_dimensions", "evaluate_row_with_jev"]


def hfjev(input_data: str | Path | Sequence[Any], **options: Any) -> HFDataset:
    """Ingest and prepare any Hugging Face dataset or local file for semantic classification with TypeSafe Jev.

    Args:
        input_data: Hugging Face dataset name, local file path (.json/.jsonl/.csv),
                    or raw sequence of strings/dicts.
        **options: Flat configuration options:
            - limit (int): Number of rows to sample (default: 10).
            - split (str): Dataset split (default: 'train').
            - config (str): Dataset config (default: 'default').
            - column (str): Target text column name.
            - hf_token (str): Hugging Face token for gated/private datasets.
            - api_key (str): TypeSafe API key.
            - simulate (bool): Force offline calibrated simulation.
            - model (str): Jev model identifier (default: 'jev-latest').

    Returns:
        HFDataset: Ready for .classify(), .stream(), or .adapt().

    Example:
        >>> import hfjev
        >>> ds = hfjev('cornell-movie-review-data/rotten_tomatoes')
        >>> results = ds.classify()
        >>> print(results[0]['answers'])
    """
    text_column = options.get("column")
    limit = options.get("limit")

    if isinstance(input_data, (str, Path)):
        s_input = str(input_data)
        p = Path(s_input)
        is_local = s_input.endswith((".json", ".jsonl", ".csv")) or p.exists()

        if is_local:
            dataset_id = s_input
            local = read_local_dataset(p)
            rows = local["rows"]
            features = local["features"]
            text_column = text_column or local["text_column"]
        else:
            dataset_id = s_input
            remote = fetch_huggingface_rows(s_input, options)
            rows = remote["rows"]
            features = remote["features"]
            text_column = text_column or remote["text_column"]

    elif isinstance(input_data, (list, tuple)):
        dataset_id = "in-memory"
        rows = []
        for idx, item in enumerate(input_data):
            if isinstance(item, str):
                rows.append({"index": idx, "data": {"text": item}})
            elif isinstance(item, dict):
                rows.append({"index": idx, "data": item})
            else:
                rows.append({"index": idx, "data": {"text": str(item)}})

        sample = rows[0]["data"] if rows else {}
        features = [{"name": k, "type": "string"} for k in sample.keys()]
        if not text_column:
            text_column = "text" if "text" in sample else (next(iter(sample.keys()), "text") if sample else "text")

    else:
        raise TypeError(
            f"hfjev requires a dataset name (str), local file path, or sequence of rows, got {type(input_data).__name__}"
        )

    if limit is not None and len(rows) > limit:
        rows = rows[:limit]

    return HFDataset({
        "id": dataset_id,
        "rows": rows,
        "features": features,
        "text_column": text_column or "text",
    }, options)


class _CallableModule(ModuleType):
    """Allows calling `hfjev(...)` directly on the imported module (import hfjev; hfjev(...))."""
    def __call__(self, *args: Any, **kwargs: Any) -> HFDataset:
        return hfjev(*args, **kwargs)


sys.modules[__name__].__class__ = _CallableModule
