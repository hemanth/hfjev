import { evaluateRowWithJev, getDynamicDimensions } from './utils.js';

/**
 * HFDataset wrapper returned by hfjev().
 */
export class HFDataset {
  constructor(metadata, options = {}) {
    this.id = metadata.id;
    this.rows = metadata.rows || [];
    this.features = metadata.features || [];
    this.textColumn = metadata.textColumn || 'text';
    this.options = options;

    const dynamic = getDynamicDimensions(this.id);
    this.dimensions = options.dimensions || dynamic.dimensions;
    this.packName = dynamic.pack;
  }

  /**
   * Set or customize the active classification dimensions.
   */
  adapt(newDimensions) {
    if (Array.isArray(newDimensions)) {
      this.dimensions = newDimensions;
    } else {
      const dynamic = getDynamicDimensions(this.id);
      this.dimensions = dynamic.dimensions;
      this.packName = dynamic.pack;
    }
    return this;
  }

  /**
   * Classify all rows across active dimensions using speculative fan-out.
   */
  async classify(overrideDimensions) {
    const activeDims = overrideDimensions || this.dimensions;
    const results = [];

    for (const item of this.rows) {
      const text = item.data[this.textColumn] || Object.values(item.data)[0] || '';
      const evaluation = await evaluateRowWithJev(text, activeDims, this.options);
      results.push({
        index: item.index,
        text,
        answers: evaluation.answers,
        confidence: evaluation.confidence,
        simulated: evaluation.simulated,
        raw: item.data
      });
    }

    return results;
  }

  /**
   * Stream evaluations row-by-row for real-time telemetry.
   */
  async stream(onRow, overrideDimensions) {
    const activeDims = overrideDimensions || this.dimensions;

    for (const item of this.rows) {
      const text = item.data[this.textColumn] || Object.values(item.data)[0] || '';
      const evaluation = await evaluateRowWithJev(text, activeDims, this.options);
      const evaluated = {
        index: item.index,
        text,
        answers: evaluation.answers,
        confidence: evaluation.confidence,
        simulated: evaluation.simulated,
        raw: item.data
      };
      if (typeof onRow === 'function') {
        await onRow(evaluated);
      }
    }
  }
}
