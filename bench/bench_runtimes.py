import time
import sys
import os

# Add python source to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../python/src")))

import hfjev

def run_benchmark():
    rows = [
        {"text": "A breathtaking cinematic masterpiece with flawless storytelling and exceptional performances."},
        {"text": "Dull, tedious, and completely uninspired with pacing issues throughout the entire script."},
        {"text": "An average film that entertains for two hours but fades quickly from memory."},
        {"text": "Revolutionary cinematography paired with an unforgettable orchestral score."},
        {"text": "The plot twist at the climax felt cheap and completely unearned."},
    ] * 20  # 100 rows

    print(f"⚡ Benchmarking Python hfjev across {len(rows)} rows (speculative fan-out)...")

    # Ingestion & setup
    t0 = time.perf_counter()
    ds = hfjev(rows, simulate=True)
    t_ingest = (time.perf_counter() - t0) * 1000

    # Classification
    t1 = time.perf_counter()
    results = ds.classify()
    t_classify = (time.perf_counter() - t1) * 1000

    # Streaming
    t2 = time.perf_counter()
    streamed_count = 0
    for _ in ds.stream():
        streamed_count += 1
    t_stream = (time.perf_counter() - t2) * 1000

    print(f"  • Ingest time:   {t_ingest:.2f} ms")
    print(f"  • Classify time: {t_classify:.2f} ms ({t_classify / len(rows):.3f} ms/row)")
    print(f"  • Stream time:   {t_stream:.2f} ms ({t_stream / len(rows):.3f} ms/row)")
    print(f"  • Rows evaluated: {len(results)}")
    print("✅ Python benchmark passed.")

if __name__ == "__main__":
    run_benchmark()
