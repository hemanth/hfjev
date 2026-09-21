import { test, expect } from '@playwright/test';

test.describe('HF-Jev Studio & WebML-Kit (WebGPU) Classification', () => {
  test('evaluates dimensions with webml-kit (WebGPU) and renders Sentiment, Recommendation, Critique Depth, Emotional Impact without hanging', async ({ page }) => {
    // Collect console logs and failed requests
    const consoleLogs: string[] = [];
    const failed404s: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      consoleLogs.push(`[${msg.type()}] ${text}`);
      if (msg.type() === 'error') {
        console.log(`PAGE ERROR: ${text}`);
      }
    });

    page.on('response', (response) => {
      if (response.status() === 404) {
        failed404s.push(response.url());
        console.log(`404 ERROR: ${response.url()}`);
      }
    });

    console.log('Navigating to https://hemanth.github.io/hfjev/#/studio ...');
    await page.goto('https://hemanth.github.io/hfjev/#/studio', { waitUntil: 'domcontentloaded' });

    // Wait for the table rows to load
    const rowsLocator = page.locator('tbody tr');
    await expect(rowsLocator.first()).toBeVisible({ timeout: 20000 });

    const rowCount = await rowsLocator.count();
    console.log(`Loaded ${rowCount} rows on studio.`);
    expect(rowCount).toBeGreaterThan(0);

    // Verify dimension headers are visible: Sentiment, Recommendation, Critique Depth, Emotional Impact
    await expect(page.locator('th:has-text("Sentiment")')).toBeVisible();
    await expect(page.locator('th:has-text("Recommendation")')).toBeVisible();
    await expect(page.locator('th:has-text("Critique Depth")')).toBeVisible();
    await expect(page.locator('th:has-text("Emotional Impact")')).toBeVisible();

    // Select webml-kit (WebGPU) engine
    const webmlButton = page.locator('button:has-text("webml-kit (WebGPU)")');
    await expect(webmlButton).toBeVisible();
    await webmlButton.click();
    console.log('Switched engine to webml-kit (WebGPU).');

    // Confirm webml-kit model selector is visible
    const modelSelect = page.locator('select').filter({ hasText: 'qwen3-0.6b' });
    await expect(modelSelect).toBeVisible();

    // Find the first row's "Classify this row" button
    const firstRow = rowsLocator.first();
    const classifyButton = firstRow.locator('button[title="Classify this row"]');
    await expect(classifyButton).toBeVisible();

    console.log('Clicking "Classify this row" on Row 1...');
    await classifyButton.click();

    // Wait for classification to complete (must NOT hang on Judging...)
    console.log('Waiting for classification to complete...');
    await expect(firstRow.locator('button[title="Classify this row"]')).toBeHidden({ timeout: 45000 });

    // Verify that "Judging..." is NOT present in the row anymore
    await expect(firstRow.locator('text=Judging...')).toHaveCount(0);

    // Verify Inspect button is present
    const inspectBtn = firstRow.locator('button:has-text("Inspect")');
    await expect(inspectBtn).toBeVisible();

    // Verify that badges exist in the row for the dimensions
    const badges = firstRow.locator('.truncate, [style*="background-color"]');
    const badgeCount = await badges.count();
    console.log(`Found ${badgeCount} badge elements in classified row.`);
    expect(badgeCount).toBeGreaterThan(0);

    // Check that there were NO 404s for wllama.wasm (the magic word error cause)
    const wasm404s = failed404s.filter(url => url.includes('wllama.wasm'));
    expect(wasm404s).toEqual([]);

    // Open Inspect Modal
    await inspectBtn.click();
    const modalTitle = page.locator('h3:has-text("Inspection")');
    await expect(modalTitle).toBeVisible({ timeout: 5000 });
    console.log('Inspection Modal opened successfully.');

    // Verify Judgments tab shows probabilities
    await expect(page.locator('text=Evaluation state, judgments, and calibrated probability distributions')).toBeVisible();

    // Close modal
    const closeBtn = page.locator('button[aria-label="Close"]');
    await closeBtn.click();
    await expect(modalTitle).toBeHidden();

    console.log('WebML-Kit WebGPU test passed cleanly!');
  });

  test('evaluates batch classification in Simulated mode', async ({ page }) => {
    console.log('Navigating to https://hemanth.github.io/hfjev/#/studio ...');
    await page.goto('https://hemanth.github.io/hfjev/#/studio', { waitUntil: 'domcontentloaded' });

    // Switch to Simulated engine
    const simButton = page.locator('button:has-text("Simulated")');
    await expect(simButton).toBeVisible();
    await simButton.click();

    // Click Classify Button
    const classifyBatchBtn = page.locator('button[data-testid="classify-button"]');
    await expect(classifyBatchBtn).toBeVisible();
    await classifyBatchBtn.click();

    // First row should transition from evaluating to completed
    const firstRow = page.locator('tbody tr').first();
    const inspectBtn = firstRow.locator('button:has-text("Inspect")');
    await expect(inspectBtn).toBeVisible({ timeout: 15000 });

    // Ensure no Judging... text remains on row 1
    await expect(firstRow.locator('text=Judging...')).toHaveCount(0);
    console.log('Simulated batch test passed cleanly!');
  });
});
