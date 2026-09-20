# hfjev Benchmarks

Empirical performance evaluation of TypeSafe Jev System One semantic dataset classification in both JavaScript and Python runtimes.

## Architecture

- **Speculative Fan-out**: All active dimension questions (Choice, Noul, Score) are evaluated in a single parallel call per row rather than sequential per-dimension roundtrips.
- **Calibrated In-Tree Simulation**: Deterministic offline simulation engine evaluates categorical distributions and continuous score positions in sub-millisecond latencies without network overhead.
- **Zero-Dependency Native Execution**: Pure standard-library network and parsing primitives in both JS and Python.

## Running benchmarks

```bash
# Python benchmark (100 rows across 3 semantic dimensions)
python3 bench/bench_runtimes.py

# JavaScript benchmark (100 rows across 3 semantic dimensions)
node bench/bench_runtimes.js
```
