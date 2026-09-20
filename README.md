# hfjev

Classify Hugging Face datasets across typed semantic dimensions with TypeSafe Jev System One.

```bash
# Python
pip install hfjev

# Node.js
npm install hfjev
```

## Quick start

### Python

```python
import hfjev

dataset = hfjev('cornell-movie-review-data/rotten_tomatoes')
results = dataset.classify()

print(results[0]['answers'])
```

### JavaScript

```js
import hfjev from 'hfjev';

const dataset = await hfjev('cornell-movie-review-data/rotten_tomatoes');
const results = await dataset.classify();

console.log(results[0].answers);
```

`hfjev()` loads any Hugging Face dataset, auto-adapts evaluation rubrics to the domain, and classifies each row in a single parallel System One call with calibrated probabilities.

## Custom dimensions

```python
dataset = hfjev('ag_news')

dataset.adapt([
    {'id': 'tech_relevance', 'type': 'noul', 'instructions': 'Is this about artificial intelligence?'},
    {'id': 'urgency', 'type': 'score', 'instructions': 'Rate story urgency', 'criteria': ['Low', 'Breaking']}
])

results = dataset.classify()
```

`adapt()` overrides the default domain pack with your own Choice, Noul, or Score primitives.

## Streaming evaluations

```python
for row in dataset.stream():
    print(f"[Row {row['index']}]", row['answers'])
```

`stream()` yields evaluations row-by-row for live feeds and telemetry without blocking on batch completion.

## CLI

```bash
# Python CLI
hfjev cornell-movie-review-data/rotten_tomatoes --limit 5

# Node CLI
npx hfjev cornell-movie-review-data/rotten_tomatoes --limit 5
```

## Interactive Studio / Playground

Launch the interactive web studio to import, inspect, classify, and export Hugging Face datasets:
👉 **[https://hemanth.github.io/hfjev/](https://hemanth.github.io/hfjev/)**

- **Dataset Import**: Search & load any dataset or split from the Hugging Face Hub, or upload local CSV / JSON / JSONL files.
- **Dynamic Dimension Adaptation**: Auto-detect domain rubrics or customize Choice, Noul, and Score primitives.
- **Real-Time Classification**: Execute single-row inspections or parallel batch evaluations with calibrated probabilities and zero hallucinated tokens.
- **Data Export**: Export enriched datasets with all evaluation scores and token telemetry to CSV, JSON, or JSONL.

## Repository structure

- `python/`: Python package (`hfjev` on PyPI)
- `js/`: JavaScript / Node.js package (`hfjev` on npm)
- `playground/`: Interactive React 19 Studio & Playground source code
- `docs/`: Built static studio web app deployed to GitHub Pages
- `bench/`: Runtime benchmarks comparing speculative fan-out execution latency

## License

MIT © [Hemanth.HM](https://h3manth.com)
