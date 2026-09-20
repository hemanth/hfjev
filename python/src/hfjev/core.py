from __future__ import annotations

import asyncio
from typing import Any, Callable, Generator, AsyncGenerator
from .utils import evaluate_row_with_jev, get_dynamic_dimensions


class HFDataset:
    """Hugging Face Dataset semantic classifier interface powered by TypeSafe Jev."""

    def __init__(self, metadata: dict[str, Any], options: dict[str, Any] | None = None) -> None:
        self.id: str = metadata.get("id", "custom")
        self.rows: list[dict[str, Any]] = metadata.get("rows", [])
        self.features: list[dict[str, Any]] = metadata.get("features", [])
        self.text_column: str = metadata.get("text_column", "text")
        self.options: dict[str, Any] = options or {}

        dynamic = get_dynamic_dimensions(self.id)
        self.pack_name: str = dynamic.get("pack", "General Semantic Dimensions")
        self.dimensions: list[dict[str, Any]] = self.options.get("dimensions") or dynamic.get("dimensions", [])

    def adapt(self, new_dimensions: list[dict[str, Any]] | None = None) -> "HFDataset":
        """Set or customize active classification dimensions (returns self for chaining)."""
        if isinstance(new_dimensions, list):
            self.dimensions = new_dimensions
        else:
            dynamic = get_dynamic_dimensions(self.id)
            self.dimensions = dynamic.get("dimensions", [])
            self.pack_name = dynamic.get("pack", "General Semantic Dimensions")
        return self

    def classify(self, override_dimensions: list[dict[str, Any]] | None = None) -> list[dict[str, Any]]:
        """Classify all rows across active dimensions using single-pass speculative fan-out."""
        dims = override_dimensions or self.dimensions
        results: list[dict[str, Any]] = []

        for item in self.rows:
            raw_data = item.get("data", {})
            text = raw_data.get(self.text_column)
            if text is None:
                text = next(iter(raw_data.values()), "") if raw_data else ""
            text = str(text)

            eval_res = evaluate_row_with_jev(text, dims, self.options)
            results.append({
                "index": item.get("index", len(results)),
                "text": text,
                "answers": eval_res.get("answers", {}),
                "confidence": eval_res.get("confidence", 0.9),
                "simulated": eval_res.get("simulated", False),
                "raw": raw_data,
            })

        return results

    def stream(
        self,
        callback: Callable[[dict[str, Any]], None] | None = None,
        override_dimensions: list[dict[str, Any]] | None = None,
    ) -> Generator[dict[str, Any], None, None]:
        """Stream evaluations row-by-row for real-time processing, yielding each evaluated row."""
        dims = override_dimensions or self.dimensions

        for item in self.rows:
            raw_data = item.get("data", {})
            text = raw_data.get(self.text_column)
            if text is None:
                text = next(iter(raw_data.values()), "") if raw_data else ""
            text = str(text)

            eval_res = evaluate_row_with_jev(text, dims, self.options)
            record = {
                "index": item.get("index", 0),
                "text": text,
                "answers": eval_res.get("answers", {}),
                "confidence": eval_res.get("confidence", 0.9),
                "simulated": eval_res.get("simulated", False),
                "raw": raw_data,
            }
            if callback and callable(callback):
                callback(record)
            yield record

    async def aclassify(self, override_dimensions: list[dict[str, Any]] | None = None) -> list[dict[str, Any]]:
        """Asynchronously classify all rows using worker thread execution."""
        return await asyncio.to_thread(self.classify, override_dimensions)

    async def astream(
        self,
        callback: Callable[[dict[str, Any]], None] | None = None,
        override_dimensions: list[dict[str, Any]] | None = None,
    ) -> AsyncGenerator[dict[str, Any], None]:
        """Asynchronously stream evaluations row-by-row."""
        dims = override_dimensions or self.dimensions

        for item in self.rows:
            raw_data = item.get("data", {})
            text = raw_data.get(self.text_column)
            if text is None:
                text = next(iter(raw_data.values()), "") if raw_data else ""
            text = str(text)

            eval_res = await asyncio.to_thread(evaluate_row_with_jev, text, dims, self.options)
            record = {
                "index": item.get("index", 0),
                "text": text,
                "answers": eval_res.get("answers", {}),
                "confidence": eval_res.get("confidence", 0.9),
                "simulated": eval_res.get("simulated", False),
                "raw": raw_data,
            }
            if callback and callable(callback):
                if asyncio.iscoroutinefunction(callback):
                    await callback(record)
                else:
                    callback(record)
            yield record

    def __iter__(self) -> Generator[dict[str, Any], None, None]:
        for row in self.rows:
            yield row.get("data", {})

    def __len__(self) -> int:
        return len(self.rows)

    def __repr__(self) -> str:
        return f"HFDataset(id='{self.id}', rows={len(self.rows)}, pack='{self.pack_name}', dimensions={len(self.dimensions)})"
