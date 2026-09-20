import pytest
import tempfile
import json
from pathlib import Path

import hfjev
from hfjev import HFDataset, get_dynamic_dimensions


def test_detects_intent_from_dict_rows():
    rows = [
        {"text": "A thrilling, cinematic masterpiece with sublime performances."},
        {"text": "Dull plot and uninspired direction."},
    ]
    ds = hfjev(rows, simulate=True)
    assert len(ds) == 2
    assert ds.text_column == "text"

    results = ds.classify()
    assert len(results) == 2
    assert "answers" in results[0]
    assert results[0]["confidence"] > 0
    assert "sentiment" in results[0]["answers"]


def test_detects_intent_from_string_array():
    items = [
        "Breaking news: NASA discovers new exoplanet.",
        "Markets tumble following interest rate hikes.",
    ]
    ds = hfjev(items, simulate=True)
    assert len(ds) == 2
    results = ds.classify()
    assert len(results) == 2
    assert results[0]["text"] == items[0]


def test_adapts_dimensions_to_film_datasets():
    pack = get_dynamic_dimensions("cornell-movie-review-data/rotten_tomatoes")
    assert pack["pack"] == "Film & Media Reviews"
    ids = [d["id"] for d in pack["dimensions"]]
    assert "sentiment" in ids
    assert "is_spoiler" in ids
    assert "depth" in ids


def test_adapts_dimensions_to_news_datasets():
    pack = get_dynamic_dimensions("fancyzhx/ag_news")
    assert pack["pack"] == "News & Media Beats"
    ids = [d["id"] for d in pack["dimensions"]]
    assert "topic" in ids
    assert "sensationalism" in ids


def test_custom_dimension_overrides():
    rows = [{"message": "Password reset request not working"}]
    ds = hfjev(rows, column="message", simulate=True)

    ds.adapt([
        {"id": "is_auth", "type": "noul", "instructions": "Is this an authentication issue?"}
    ])

    results = ds.classify()
    assert "is_auth" in results[0]["answers"]
    assert "noul" in results[0]["answers"]["is_auth"]


def test_streaming_evaluations():
    rows = ["First review", "Second review"]
    ds = hfjev(rows, simulate=True)

    streamed = []
    for item in ds.stream():
        streamed.append(item)

    assert len(streamed) == 2
    assert streamed[0]["text"] == "First review"


def test_local_file_loading():
    with tempfile.NamedTemporaryFile(mode="w", suffix=".jsonl", delete=False) as f:
        f.write(json.dumps({"text": "Great service!"}) + "\n")
        f.write(json.dumps({"text": "Poor support."}) + "\n")
        tmp_path = f.name

    try:
        ds = hfjev(tmp_path, simulate=True)
        assert len(ds) == 2
        results = ds.classify()
        assert len(results) == 2
    finally:
        Path(tmp_path).unlink(missing_ok=True)


@pytest.mark.asyncio
async def test_async_classify():
    items = ["Async row 1", "Async row 2"]
    ds = hfjev(items, simulate=True)
    results = await ds.aclassify()
    assert len(results) == 2
    assert results[0]["text"] == "Async row 1"
