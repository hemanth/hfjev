# hfjev

Classify Hugging Face datasets across typed semantic dimensions with TypeSafe Jev System One.

```bash
pip install hfjev
```

## Quick start

```python
import hfjev

dataset = hfjev('cornell-movie-review-data/rotten_tomatoes')
results = dataset.classify()

print(results[0]['answers'])
```

`hfjev()` loads any Hugging Face dataset, auto-adapts evaluation rubrics to the domain, and classifies each row in a single parallel System One call with calibrated probabilities.

## Gated & private datasets

```python
dataset = hfjev('meta-llama/Llama-2-7b', hf_token=os.environ['HF_TOKEN'], api_key=os.environ['TYPESAFE_API_KEY'])
```

Pass your Hugging Face User Access Token to authenticate gated or private datasets.

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

## Local files and in-memory lists

```python
# Local JSON, JSONL, or CSV
local = hfjev('./reviews.json')

# In-memory list of strings or dicts
custom = hfjev([
    'The acting was phenomenal throughout.',
    'Pacing dragged during the second act.'
])
```

`hfjev()` detects intent directly from the input type.

## CLI

```bash
hfjev cornell-movie-review-data/rotten_tomatoes --limit 5
```

Runs classifications directly from your terminal and prints formatted dimension scores and probabilities.

## License

MIT © [Hemanth.HM](https://h3manth.com)
