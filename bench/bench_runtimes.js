import hfjev from '../js/src/index.js';
import { performance } from 'node:perf_hooks';

async function runBenchmark() {
  const rows = [
    { text: 'A breathtaking cinematic masterpiece with flawless storytelling and exceptional performances.' },
    { text: 'Dull, tedious, and completely uninspired with pacing issues throughout the entire script.' },
    { text: 'An average film that entertains for two hours but fades quickly from memory.' },
    { text: 'Revolutionary cinematography paired with an unforgettable orchestral score.' },
    { text: 'The plot twist at the climax felt cheap and completely unearned.' }
  ];

  // 100 rows
  const datasetRows = [];
  for (let i = 0; i < 20; i++) {
    datasetRows.push(...rows);
  }

  console.log(`⚡ Benchmarking JS hfjev across ${datasetRows.length} rows (speculative fan-out)...`);

  const t0 = performance.now();
  const ds = await hfjev(datasetRows, { simulate: true });
  const tIngest = performance.now() - t0;

  const t1 = performance.now();
  const results = await ds.classify();
  const tClassify = performance.now() - t1;

  const t2 = performance.now();
  let streamCount = 0;
  await ds.stream(() => {
    streamCount++;
  });
  const tStream = performance.now() - t2;

  console.log(`  • Ingest time:   ${tIngest.toFixed(2)} ms`);
  console.log(`  • Classify time: ${tClassify.toFixed(2)} ms (${(tClassify / datasetRows.length).toFixed(3)} ms/row)`);
  console.log(`  • Stream time:   ${tStream.toFixed(2)} ms (${(tStream / datasetRows.length).toFixed(3)} ms/row)`);
  console.log(`  • Rows evaluated: ${results.length}`);
  console.log('✅ JS benchmark passed.');
}

runBenchmark();
