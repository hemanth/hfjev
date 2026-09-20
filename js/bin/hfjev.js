#!/usr/bin/env node

import hfjev from '../src/index.js';

function parseArgs(args) {
  const options = {
    limit: 5,
    split: 'train',
    json: false
  };
  let input = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--limit' || arg === '-l') {
      options.limit = parseInt(args[++i], 10);
    } else if (arg === '--split' || arg === '-s') {
      options.split = args[++i];
    } else if (arg === '--hf-token') {
      options.hfToken = args[++i];
    } else if (arg === '--api-key') {
      options.apiKey = args[++i];
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: hfjev <dataset-or-file> [options]

Arguments:
  dataset-or-file      Hugging Face dataset ID (e.g. rotten_tomatoes) or local file path

Options:
  -l, --limit <n>      Number of rows to evaluate (default: 5)
  -s, --split <s>      Dataset split (default: train)
  --hf-token <t>       Hugging Face User Access Token
  --api-key <k>        TypeSafe API Key
  --json               Output raw JSON
  -h, --help           Show help
`);
      process.exit(0);
    } else if (!input && !arg.startsWith('-')) {
      input = arg;
    }
  }

  return { input, options };
}

async function run() {
  const { input, options } = parseArgs(process.argv.slice(2));

  if (!input) {
    console.error('Error: Please provide a Hugging Face dataset name or local file.');
    console.error('Example: hfjev cornell-movie-review-data/rotten_tomatoes --limit 3');
    process.exit(1);
  }

  try {
    const dataset = await hfjev(input, options);

    if (!options.json) {
      console.log(`\x1b[36mLoaded dataset:\x1b[0m ${dataset.id} (${dataset.rows.length} rows)`);
      console.log(`\x1b[35mAdapted pack:\x1b[0m ${dataset.packName}`);
      console.log(`\x1b[90mEvaluating with TypeSafe Jev System One...\x1b[0m\n`);
    }

    const results = await dataset.classify();

    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      for (const res of results) {
        console.log(`\x1b[1m[Row ${res.index}]\x1b[0m ${res.text.slice(0, 80)}...`);
        for (const [dim, ans] of Object.entries(res.answers)) {
          if (ans.choice) {
            console.log(`  \x1b[32m${dim}:\x1b[0m ${ans.choice} (conf: ${(ans.confidence * 100).toFixed(0)}%)`);
          } else if (ans.noul !== undefined) {
            console.log(`  \x1b[33m${dim}:\x1b[0m P(Yes) = ${(ans.noul * 100).toFixed(1)}%`);
          } else if (ans.score !== undefined) {
            console.log(`  \x1b[34m${dim}:\x1b[0m score = ${ans.score} (conf: ${(ans.confidence * 100).toFixed(0)}%)`);
          }
        }
        console.log();
      }
    }
  } catch (err) {
    console.error(`\x1b[31mError:\x1b[0m ${err.message}`);
    process.exit(1);
  }
}

run();
