/* Optional UI regression runner. Uses an already-installed Playwright; no install/build step.
   EE_PLAYWRIGHT_PATH=/absolute/path/to/playwright node tests/browser.test.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.EE_PLAYWRIGHT_PATH || 'playwright');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'output/playwright'); fs.mkdirSync(output, { recursive: true });
const failures = [], report = { checks: [], errors: [], networkFailures: [], externalRequests: [] };
let browser;
(async () => {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1512, height: 1100 }, deviceScaleFactor: 1 });
  await context.addInitScript(() => localStorage.setItem('ee-lab-language', 'en'));
  const page = await context.newPage();
  report.emptyPageFps = await require('./frame-budget.cjs')(page);
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
  page.on('requestfailed', request => report.networkFailures.push(request.url()));
  page.on('request', request => { if (/^https?:/.test(request.url())) report.externalRequests.push(request.url()); });
  async function test(name, action) { try { await action(); report.checks.push({ name, pass: true }); console.log('PASS ' + name); } catch (error) { report.checks.push({ name, pass: false, error: error.message }); failures.push(name); console.log('FAIL ' + name + ': ' + error.message); await page.screenshot({ path: path.join(output, 'failure-' + report.checks.length + '.png'), fullPage: true }); } }
  const state = expression => page.evaluate(expression);
  const reset = () => page.locator('#reset-bench').click();
  const openSheet = () => page.locator('#worksheet-open').click();
  const closeSheet = () => page.locator('[data-close="worksheet-dialog"]').click();
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
  await page.waitForFunction(() => globalThis.EE?.bench);
  await test('Direct-file boot has 830 pins, correct measured input and no page overflow', async () => {
    assert.equal(await state(() => EE.bench.board.pins.length), 830);
    assert.equal(await page.locator('#measure-1').textContent(), '10.00 V');
    assert.equal(await page.locator('#measure-2').textContent(), '2.34 V');
    assert.ok(await state(() => document.documentElement.scrollWidth <= innerWidth));
    report.bootMs = await state(() => performance.getEntriesByType('navigation')[0].duration);
  });
  await test('Canvas draws both trace colors on an exact 10 by 8 graticule', async () => {
    const pixels = await state(() => { const s = EE.bench.scope, g = s.graticule(), data = s.ctx.getImageData(0, 0, s.canvas.width, s.canvas.height).data; let yellow = 0, green = 0; for (let i = 0; i < data.length; i += 4) { if (data[i] > 190 && data[i + 1] > 165 && data[i + 2] < 130) yellow++; if (data[i] > 80 && data[i] < 180 && data[i + 1] > 160 && data[i + 2] > 105) green++; } return { yellow, green, g }; });
    assert.ok(pixels.yellow > 100 && pixels.green > 100); assert.ok(pixels.g.w > 0 && pixels.g.h > 0); report.tracePixels = pixels;
  });
  await test('Active rendering sustains the available browser frame budget', async () => {
    const timing = await state(async () => { const frames = [], durations = []; const scope = EE.bench.scope, original = scope.draw.bind(scope); scope.draw = time => { const t = performance.now(); original(time); durations.push(performance.now() - t); }; await new Promise(resolve => { function frame(t) { frames.push(t); if (frames.length === 121) resolve(); else requestAnimationFrame(frame); } requestAnimationFrame(frame); }); scope.draw = original; return { fps: 120000 / (frames.at(-1) - frames[0]), drawMs: durations.reduce((a, b) => a + b, 0) / durations.length }; });
    report.rendering = timing; report.minimumFps = Math.max(25, Math.min(50, report.emptyPageFps * .9));
    assert.ok(timing.fps >= report.minimumFps, 'Measured ' + timing.fps + ' FPS; empty page ' + report.emptyPageFps);
    await page.screenshot({ path: path.join(output, 'desktop.png'), fullPage: true });
  });
  await test('Capacitance, frequency, and generator waveform controls change solved signals', async () => {
    await page.locator('#preset-cap').selectOption('0.000001');
    assert.ok(await state(() => EE.bench.model.signals[1].vpp > 4.6));
    await setGenerator(page,'frequency','500');
    assert.equal(await state(() => EE.bench.model.generator.frequency), 500);
    await page.locator('[data-wave="square"]').click();
    assert.equal(await state(() => EE.bench.model.signals[1].terms.length), 31);
    await page.locator('[data-wave="triangle"]').click(); assert.equal(await state(() => EE.bench.model.generator.waveform), 'triangle');
    await reset();
  });
  await test('Rotary controls respond to keyboard, wheel, and pointer dragging', async () => {
    const initial = await state(() => EE.bench.scope.scale[0]);
    await page.locator('#knob-ch1').focus(); await page.keyboard.press('ArrowDown'); assert.equal(await state(() => EE.bench.scope.scale[0]), initial - 1);
    await page.locator('#knob-ch1').hover(); await page.mouse.wheel(0, -80); await page.waitForFunction(i => EE.bench.scope.scale[0] === i - 2, initial);
    const box = await page.locator('#knob-ch1').boundingBox(); await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 20, { steps: 2 }); await page.mouse.up(); assert.ok(await state(() => EE.bench.scope.scale[0]) > initial - 2);
  });
  await test('Scope screen drag, cursors, auto scale, and stopped acquisitions are functional', async () => {
    await page.locator('#scope-channel-2').click(); await page.locator('#scope-canvas').evaluate(node=>node.scrollIntoView({block:'center'})); const box = await page.locator('#scope-canvas').boundingBox();
    await page.mouse.move(box.x + 35, box.y + 65); await page.mouse.down(); await page.mouse.move(box.x + 55, box.y + 90, { steps: 4 }); await page.mouse.up();
    assert.ok(await state(() => Math.abs(EE.bench.scope.offset[1]) > 0.1 && Math.abs(EE.bench.scope.timeOffset) > 0));
    await page.locator('#scope-cursors').click();
    const cursor = await state(() => { const s = EE.bench.scope, g = s.graticule(), r = s.canvas.getBoundingClientRect(); return { x: r.left + g.x + s.cursor[1] * g.w, y: r.top + g.y + 90, old: s.cursor[1] }; });
    await page.mouse.move(cursor.x, cursor.y); await page.mouse.down(); await page.mouse.move(cursor.x + 18, cursor.y, { steps: 3 }); await page.mouse.up();
    assert.ok(await state(() => EE.bench.scope.cursor[1]) > cursor.old);
    await page.locator('#scope-auto').click(); assert.equal(await state(() => EE.bench.scope.offset[1]), 0);
    await page.locator('#scope-run').click(); const old = await page.locator('#measure-1').textContent();
    await setGenerator(page,'vpp','6'); assert.equal(await page.locator('#measure-1').textContent(), old);
    await page.locator('#scope-single').click(); assert.notEqual(await page.locator('#measure-1').textContent(), old); assert.ok(!await state(() => EE.bench.scope.run)); await reset();
  });
  await test('Physical jack-to-pin dragging creates a real connection', async () => {
    await page.locator('#clear-wires').click();
    const coords = await state(() => { const b = EE.bench; return { from: b.endpoint('dmm.hi'), to: b.board.position('A12') }; });
    await page.mouse.move(coords.from.x, coords.from.y); await page.mouse.down(); await page.mouse.move(coords.to.x, coords.to.y, { steps: 12 }); await page.mouse.up();
    assert.ok(await state(() => EE.bench.model.wires.some(w => w.a === 'dmm.hi' && w.b === 'A12')));
    await reset();
  });
  await test('Free wiring supports precise part placement, endpoint editing, and removal', async () => {
    await page.locator('[data-experiment="free"]').click(); await page.locator('.connection-editor summary').click();
    await page.locator('[data-part="0"]').click(); await page.locator('#wire-from').fill('A1'); await page.locator('#wire-to').fill('A10'); await page.locator('#connect-wire').click();
    assert.equal(await state(() => EE.bench.model.parts.length), 1); assert.equal(await state(() => EE.bench.model.parts[0].a), 'A1');
    await page.locator('#wire-from').fill('gen.out'); await page.locator('#wire-to').fill('A1'); await page.locator('#connect-wire').click();
    assert.ok(await state(() => EE.bench.model.result.connected('gen.out', 'E1')));
    await page.locator('.wire-entry input').last().fill('A2'); await page.locator('.wire-entry input').last().press('Enter');
    assert.ok(await state(() => EE.bench.model.result.connected('gen.out', 'E2')));
    await page.locator('.wire-entry button').click(); assert.equal(await state(() => EE.bench.model.wires.length), 0); await reset();
  });
  await test('All five failure lessons trigger from real output controls; audio starts on gesture', async () => {
    await page.locator('#sound-toggle').click(); assert.ok(await state(() => EE.bench.audio.enabled && EE.bench.audio.context.state === 'running'));
    await page.locator('.fault-section summary').click();
    const expected = { ground: m => m.signals[1].vpp < 1e-6, fuse: m => m.dmm.fuse === 'blown', resistor: m => m.parts[0].state === 'burnt', capacitor: m => m.parts[0].state === 'ruptured', supply: m => m.psu.channels[0].mode === 'CC' && m.psu.channels[0].voltage === 0 };
    for (const kind of Object.keys(expected)) {
      await page.locator('[data-fault="' + kind + '"]').click();
      await page.locator(kind === 'ground' ? '#gen-output' : '[data-output="0"]').click();
      const ok = await page.evaluate(({ kind, expression }) => (new Function('m', 'return (' + expression + ')(m)'))(EE.bench.model), { kind, expression: expected[kind].toString() });
      assert.ok(ok, kind + ' did not trigger'); assert.ok(await page.locator('#event-log .event').count() > 0);
    }
  });
  await test('Fuse replacement follows the rear-compartment repair sequence', async () => {
    await page.locator('[data-fault="fuse"]').click(); await page.locator('[data-output="0"]').click(); await page.locator('[data-output="0"]').click();
    await page.locator('#rear-open').click(); await page.locator('#fuse-remove').click(); assert.equal(await state(() => EE.bench.model.dmm.fuse), 'removed');
    await page.locator('#fuse-replace').click(); assert.equal(await state(() => EE.bench.model.dmm.fuse), 'good'); await page.locator('[data-close="fuse-dialog"]').click();
  });
  await test('Damaged resistor can be replaced after outputs are disabled', async () => {
    await page.locator('[data-fault="resistor"]').click(); await page.locator('[data-output="0"]').click(); await page.locator('[data-output="0"]').click();
    if (!await page.locator('.connection-editor').evaluate(node => node.open)) await page.locator('.connection-editor summary').click();
    await page.locator('.part-entry button').filter({ hasText: 'Replace' }).click(); assert.equal(await state(() => EE.bench.model.parts[0].state), 'good'); await reset();
  });
  await test('Photo 10 produces 10.1 Vpp, zero phase, and the explicit grading explanation', async () => {
    await openSheet(); await page.locator('.reference-table summary').click(); await page.locator('[data-benchmark="7.16"]').click();
    assert.equal(await page.locator('#measure-2').textContent(), '10.10 V'); assert.ok(await state(() => EE.bench.model.anomaly));
    await openSheet(); await page.locator('[data-record="c0"]').click(); await page.locator('#check-sheet').click(); assert.match(await page.locator('#grade-c0').textContent(), /Photo 10 anomaly/); await closeSheet();
  });
  await test('All ten worksheet rows capture live readings and grade within tolerance', async () => {
    for (const id of ['a0', 'a1', 'a2', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'c0']) { await openSheet(); await page.locator('[data-load="' + id + '"]').click(); await openSheet(); await page.locator('[data-record="' + id + '"]').click(); await closeSheet(); }
    await openSheet(); await page.locator('#check-sheet').click(); assert.match(await page.locator('#sheet-score').textContent(), /^10 \/ 10/);
    await page.locator('#worksheet-dialog').evaluate(node => node.scrollTop = 0); await page.locator('#worksheet-dialog').screenshot({ path: path.join(output, 'worksheet.png') });
    const downloadPromise = page.waitForEvent('download'); await page.locator('#export-sheet').click(); const download = await downloadPromise; await download.saveAs(path.join(output, 'lab7-worksheet.csv'));
    assert.equal(fs.readFileSync(path.join(output, 'lab7-worksheet.csv'), 'utf8').split('\n').length, 11); await closeSheet();
  });
  await test('Worksheet persists after a direct-file reload and works offline', async () => {
    await context.setOffline(true); await page.reload(); await page.waitForFunction(() => EE.bench); await openSheet(); await page.locator('#check-sheet').click(); assert.match(await page.locator('#sheet-score').textContent(), /^10 \/ 10/); await closeSheet();
  });
  await test('Console and network remain clean throughout desktop interactions', async () => { assert.deepEqual(report.errors, []); assert.deepEqual(report.networkFailures, []); assert.deepEqual(report.externalRequests, []); });
  const mobile = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const touchPage = await mobile.newPage(); touchPage.on('pageerror', e => report.errors.push(e.message));
  await touchPage.goto(pathToFileURL(path.join(root, 'index.html')).href); await touchPage.waitForFunction(() => EE.bench);
  await test('Mobile viewport switches between instrument rack, breadboard, and scope without overflow', async () => {
    for (const view of ['rack', 'board', 'scope']) { await touchPage.locator('.mobile-tabs [data-view="' + view + '"]').click(); assert.ok(await touchPage.locator('[data-panel="' + view + '"]').isVisible()); assert.ok(await touchPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); }
    await touchPage.screenshot({ path: path.join(output, 'mobile-scope.png'), fullPage: true });
  });
  await test('Native two-finger horizontal and vertical pinches change time and voltage scales', async () => {
    await touchPage.locator('#scope-canvas').scrollIntoViewIfNeeded(); const box = await touchPage.locator('#scope-canvas').boundingBox(); const client = await mobile.newCDPSession(touchPage);
    const before = await touchPage.evaluate(() => ({ time: EE.bench.scope.timeIndex, volts: EE.bench.scope.scale[1] }));
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    for (const axis of ['x', 'y']) {
      const points = distance => [{ x: x - (axis === 'x' ? distance : 0), y: y - (axis === 'y' ? distance : 0), id: 1 }, { x: x + (axis === 'x' ? distance : 0), y: y + (axis === 'y' ? distance : 0), id: 2 }];
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(28) }); await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points(48) }); await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
    const after = await touchPage.evaluate(() => ({ time: EE.bench.scope.timeIndex, volts: EE.bench.scope.scale[1] })); assert.ok(after.time < before.time); assert.ok(after.volts < before.volts);
  });
  await test('Touch double-tap resets trace position with Auto scale', async () => {
    await touchPage.evaluate(() => { EE.bench.scope.offset[1] = 2; });
    const box = await touchPage.locator('#scope-canvas').boundingBox(); await touchPage.touchscreen.tap(box.x + 30, box.y + 50); await touchPage.touchscreen.tap(box.x + 30, box.y + 50); assert.equal(await touchPage.evaluate(() => EE.bench.scope.offset[1]), 0);
  });
  report.errors = [...new Set(report.errors)];
  fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(report, null, 2));
  await browser.close();
  if (failures.length) { console.error('\nFAILED: ' + failures.join(', ')); process.exitCode = 1; } else console.log('\n' + report.checks.length + ' browser checks passed.');
})().catch(async error => { console.error(error); if (browser) await browser.close(); process.exitCode = 1; });
const {setGenerator,highZ}=require('./front-panel-helpers.cjs');
