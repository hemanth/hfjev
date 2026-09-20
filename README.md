# hfjev

Classify Hugging Face datasets across typed semantic dimensions with TypeSafe Jev System One.

```bash
npm install hfjev
```

## Quick start

```js
import hfjev from 'hfjev';

const dataset = await hfjev('cornell-movie-review-data/rotten_tomatoes');
const results = await dataset.classify();

console.log(results[0].answers);
```

`hfjev()` loads any Hugging Face dataset, auto-adapts evaluation rubrics to the domain, and classifies each row in a single parallel System One call with calibrated probabilities.

## Gated & private datasets

```js
const dataset = await hfjev('meta-llama/Llama-2-7b', {
  hfToken: process.env.HF_TOKEN,
  apiKey: process.env.TYPESAFE_API_KEY
});
```

Pass your Hugging Face User Access Token to authenticate gated or private datasets.

## Custom dimensions

```js
const dataset = await hfjev('ag_news');

dataset.adapt([
  { id: 'tech_relevance', type: 'noul', instructions: 'Is this about artificial intelligence?' },
  { id: 'urgency', type: 'score', instructions: 'Rate story urgency', criteria: ['Low', 'Breaking'] }
]);

const results = await dataset.classify();
```

`adapt()` overrides the default domain pack with your own Choice, Noul, or Score primitives.

## Streaming evaluations

```js
await dataset.stream((row) => {
  console.log(`[Row ${row.index}]`, row.answers);
});
```

`stream()` yields evaluations row-by-row for live feeds and telemetry without blocking on batch completion.

## Local files and raw arrays

```js
// Local JSON, JSONL, or CSV
const local = await hfjev('./reviews.json');

// In-memory array of strings or objects
const custom = await hfjev([
  'The acting was phenomenal throughout.',
  'Pacing dragged during the second act.'
]);
```

`hfjev()` detects intent directly from the input type.

## CLI

```bash
npx hfjev cornell-movie-review-data/rotten_tomatoes --limit 5
```

Runs classifications directly from your terminal and prints formatted dimension scores and probabilities.

## License

MIT © [Hemanth.HM](https://h3manth.com)
