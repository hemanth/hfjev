import { HFDataset } from './core.js';
import { fetchHuggingFaceRows, readLocalDataset, getDynamicDimensions } from './utils.js';
import fs from 'node:fs';

/**
 * Ingest and prepare any Hugging Face dataset or local file for semantic classification with TypeSafe Jev.
 *
 * @param {string|Array<object>} input - Hugging Face dataset name, local file path (.json/.csv), or raw rows array.
 * @param {object} [options] - Configuration options.
 * @param {string} [options.hfToken] - Hugging Face User Access Token (for gated/private datasets).
 * @param {string} [options.apiKey] - TypeSafe API Key.
 * @param {number} [options.limit=10] - Number of rows to sample.
 * @param {string} [options.split='train'] - Dataset split.
 * @param {string} [options.config='default'] - Dataset config.
 * @param {string} [options.column] - Target text column name.
 * @returns {Promise<HFDataset>}
 */
export default async function hfjev(input, options = {}) {
  let id = 'custom';
  let rows = [];
  let features = [];
  let textColumn = options.column;

  if (typeof input === 'string') {
    // Check if input is a local file
    if (input.endsWith('.json') || input.endsWith('.jsonl') || input.endsWith('.csv') || (fs.existsSync && fs.existsSync(input))) {
      id = input;
      const local = await readLocalDataset(input);
      rows = local.rows;
      features = local.features;
      textColumn = textColumn || local.textColumn;
    } else {
      // Hugging Face dataset identifier (e.g. "cornell-movie-review-data/rotten_tomatoes")
      id = input;
      const remote = await fetchHuggingFaceRows(input, options);
      rows = remote.rows;
      features = remote.features;
      textColumn = textColumn || remote.textColumn;
    }
  } else if (Array.isArray(input)) {
    // Direct array of rows/objects
    rows = input.map((item, idx) => ({
      index: idx,
      data: typeof item === 'string' ? { text: item } : item
    }));
    const sample = rows[0]?.data || {};
    features = Object.keys(sample).map(name => ({ name, type: 'string' }));
    textColumn = textColumn || (sample.text !== undefined ? 'text' : Object.keys(sample)[0] || 'text');
  } else {
    throw new TypeError('hfjev requires a dataset name (string), file path, or an array of rows.');
  }

  // Slice rows if limit option provided and input was local
  if (options.limit && rows.length > options.limit) {
    rows = rows.slice(0, options.limit);
  }

  return new HFDataset({
    id,
    rows,
    features,
    textColumn
  }, options);
}

// Re-exports
export { HFDataset, getDynamicDimensions };
