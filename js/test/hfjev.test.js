import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import hfjev from '../src/index.js';
import { getDynamicDimensions } from '../src/utils.js';

describe('hfjev module', () => {
  it('detects intent from raw rows array', async () => {
    const rows = [
      { text: 'A thrilling, cinematic masterpiece with sublime performances.' },
      { text: 'Dull plot and uninspired direction.' }
    ];

    const ds = await hfjev(rows, { simulate: true });
    assert.equal(ds.rows.length, 2);
    assert.equal(ds.textColumn, 'text');

    const results = await ds.classify();
    assert.equal(results.length, 2);
    assert.ok(results[0].answers);
    assert.ok(results[0].confidence > 0);
  });

  it('detects intent from string array', async () => {
    const list = [
      'Breaking news: NASA discovers new exoplanet.',
      'Markets tumble following interest rate hikes.'
    ];

    const ds = await hfjev(list, { simulate: true });
    assert.equal(ds.rows.length, 2);
    const results = await ds.classify();
    assert.equal(results.length, 2);
  });

  it('adapts dimensions to film datasets', () => {
    const pack = getDynamicDimensions('cornell-movie-review-data/rotten_tomatoes');
    assert.equal(pack.pack, 'Film & Media Reviews');
    assert.ok(pack.dimensions.some(d => d.id === 'sentiment'));
    assert.ok(pack.dimensions.some(d => d.id === 'is_spoiler'));
  });

  it('adapts dimensions to news datasets', () => {
    const pack = getDynamicDimensions('fancyzhx/ag_news');
    assert.equal(pack.pack, 'News & Media Beats');
    assert.ok(pack.dimensions.some(d => d.id === 'topic'));
  });

  it('supports custom dimension overrides', async () => {
    const rows = [{ message: 'Password reset request not working' }];
    const ds = await hfjev(rows, { column: 'message', simulate: true });

    ds.adapt([
      { id: 'is_auth', type: 'noul', instructions: 'Is this an authentication or login issue?' }
    ]);

    const results = await ds.classify();
    assert.ok(results[0].answers.is_auth);
    assert.ok(results[0].answers.is_auth.noul !== undefined);
  });

  it('supports streaming row-by-row', async () => {
    const rows = [{ text: 'Great review' }, { text: 'Terrible review' }];
    const ds = await hfjev(rows, { simulate: true });

    const streamed = [];
    await ds.stream((row) => {
      streamed.push(row);
    });

    assert.equal(streamed.length, 2);
    assert.equal(streamed[0].text, 'Great review');
  });
});
