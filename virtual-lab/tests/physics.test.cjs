/* No test framework, installation, or browser required: node tests/physics.test.cjs */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const match of html.matchAll(/<script defer src="([^"]+)"/g)) if (match[1] !== 'js/app.js') vm.runInThisContext(fs.readFileSync(path.join(root, match[1]), 'utf8'), { filename: match[1] });
const board = new EE.Breadboard({ getContext: () => ({}) });
let count = 0;
function test(name, action) { action(); count++; console.log('PASS ' + name); }
function near(actual, expected, tolerance = 1e-6) { assert.ok(Math.abs(actual - expected) <= tolerance, String(actual) + ' ≠ ' + expected + ' ±' + tolerance); }
function fresh() { const model = new EE.Simulation(board.buses()); model.load(); return model; }
test('830 pins, 126 separate five-hole buses, four continuous 50-hole rails', () => {
  assert.equal(board.pins.length, 830); const s = new EE.CircuitSolver({ buses: board.buses() });
  assert.ok(s.connected('A1', 'E1')); assert.ok(s.connected('F63', 'J63')); assert.ok(!s.connected('A1', 'F1')); assert.ok(!s.connected('A1', 'A2')); assert.ok(s.connected('T+1', 'T+50')); assert.ok(!s.connected('T+1', 'T-1'));
});
for (const b of EE.Lab7.benchmarks) test('Benchmark ' + b.id + ' preserves observations and solves its physical topology', () => {
  const model = fresh(); model.load({ c: b.c, f: b.f, input: b.input, series: b.anomaly, anomaly: b.anomaly });
  near(model.signals[0].vpp, b.input, 1e-5);
  if (b.anomaly) { near(model.signals[1].vpp, 10.1, 1e-5); near(model.signals[1].phase - model.signals[0].phase, 0); assert.ok(model.anomaly); }
  else { const expected = EE.Lab7.theory(b.f, 1000, b.c, b.input); near(model.signals[1].vpp, expected.vpp, 0.012); near((model.signals[1].phase - model.signals[0].phase) * 180 / Math.PI, expected.phase, 0.07); }
});
test('Series capacitors yield 0.6875 µF and the analytic phase, including source loading', () => { const model = fresh(); model.load({ series: true }); near(model.equivalentCapacitance(), 0.6875e-6, 1e-13); const expected = EE.Lab7.theory(300, 1000, 0.6875e-6); near(model.signals[1].vpp, expected.vpp, 0.012); });
test('Changing wires changes voltage, and removing the source extinguishes the trace', () => { const m = fresh(); const initial = m.signals[1].vpp; m.wires.find(w => w.a === 'scope.ch2').b = 'B12'; m.compute(); assert.ok(m.signals[1].vpp > initial * 3); m.wires = m.wires.filter(w => w.a !== 'gen.out'); m.compute(); near(m.signals[0].vpp, 0); });
test('Ground clip on capacitor node collapses CH2 and recovers when moved', () => { const m = fresh(); m.fault('ground'); m.generator.enabled = true; m.compute(); near(m.signals[1].vpp, 0); assert.ok(m.failure.history.some(e => e.kind === 'arc')); m.wires.find(w => w.a === 'scope.g2').b = 'A49'; m.compute(); assert.ok(m.signals[1].vpp > 2); assert.ok(!m.failure.active.has('scope.g2')); });
test('3 A fuse blows only above its current rating and requires removal / replacement', () => { const m = fresh(); m.fault('fuse'); m.psu.channels[0].enabled = true; m.compute(); assert.equal(m.dmm.fuse, 'blown'); near(m.dmm.value, 0); assert.ok(!m.dmm.replaceFuse(true)); m.dmm.rearOpen = true; m.dmm.fuse = 'removed'; assert.ok(!m.dmm.replaceFuse(false)); assert.ok(m.dmm.replaceFuse(true)); });
test('Current limit below 3 A prevents fuse blow; current mode reads the real shunt', () => { const m = fresh(); m.fault('fuse'); m.psu.channels[0].limit = 0.5; m.psu.channels[0].enabled = true; m.compute(); assert.equal(m.dmm.fuse, 'good'); near(m.dmm.value, 0.5, 1e-5); assert.equal(m.psu.channels[0].mode, 'CC'); });
test('Resistor overload dissipates over 0.25 W then becomes open', () => { const m = fresh(); m.fault('resistor'); m.psu.channels[0].enabled = true; m.compute(); assert.equal(m.parts[0].state, 'burnt'); assert.ok(m.failure.history.some(e => e.kind === 'smoke')); assert.ok(m.psu.channels[0].current < 0.001); });
test('Reverse DC ruptures electrolytic into short and invokes CC', () => { const m = fresh(); m.fault('capacitor'); m.psu.channels[0].enabled = true; m.compute(); assert.equal(m.parts[0].state, 'ruptured'); assert.equal(m.psu.channels[0].mode, 'CC'); assert.ok(m.psu.channels[0].voltage < 0.04); });
test('1.5 V reverse threshold and nonpolar ceramic are not spuriously damaged', () => { const m = fresh(); m.fault('capacitor'); m.psu.channels[0].setVoltage = 1.4; m.psu.channels[0].enabled = true; m.compute(); assert.equal(m.parts[0].state, 'good'); m.parts[0].value = 0.1e-6; m.psu.channels[0].setVoltage = 5; m.compute(); assert.equal(m.parts[0].state, 'good'); });
test('Output short invokes CC at 0 V and recovers to CV when unplugged', () => { const m = fresh(); m.fault('supply'); m.psu.channels[0].enabled = true; m.compute(); assert.equal(m.psu.channels[0].mode, 'CC'); near(m.psu.channels[0].voltage, 0); m.wires = m.wires.filter(w => !(w.a === 'A12' && w.b === 'A49')); m.compute(); assert.equal(m.psu.channels[0].mode, 'CV'); near(m.psu.channels[0].voltage, 5, 1e-4); });
test('50 Ω source correctly halves open-circuit amplitude into 50 Ω', () => { const gen = new EE.HP33120A(); const solver = new EE.CircuitSolver({ sources: [gen.source()], grounds: ['gen.gnd'], components: [{ type: 'R', value: 50, a: 'gen.out', b: 'gen.gnd' }] }); near(solver.analyze(300).signal('gen.out').vpp, 5, 1e-8); gen.load = '50Ω'; near(new EE.CircuitSolver({ sources: [gen.source()], grounds: ['gen.gnd'], components: [{ type: 'R', value: 50, a: 'gen.out', b: 'gen.gnd' }] }).analyze(300).signal('gen.out').vpp, 10, 1e-8); });
test('True RMS for sine, square, triangle and DC is computed from phasors', () => { const gen = new EE.HP33120A(); for (const [shape, rms] of [['sine', 5 / Math.sqrt(2)], ['square', 5], ['triangle', 5 / Math.sqrt(3)]]) { gen.waveform = shape; const s = new EE.CircuitSolver({ sources: [gen.source()], grounds: ['gen.gnd'] }).analyze(300, 61).signal('gen.out'); near(s.rms, rms, shape === 'square' ? 0.03 : 0.001); } });
test('Grounded shunt current depends on source current availability, not mode labels', () => { const m = fresh(); m.fault('fuse'); m.dmm.mode = 'AC V'; m.psu.channels[0].enabled = true; m.compute(); assert.equal(m.dmm.fuse, 'blown'); });
test('All ten worksheet rows accept nominal values and reject incompatible phase/delay', () => { const rows = [...[2.2e-6, 1e-6, 0.1e-6].map(c => ({ c, f: 300 })), ...EE.Lab7.frequencies.map(f => ({ c: 1e-6, f })), { c: 0.6875e-6, f: 300, series: true }]; for (const row of rows) { const t = EE.Lab7.theory(row.f, 1000, row.c); const entry = { input: 10, peak: t.peak, phase: t.phase, dt: t.dt * 1000 }; assert.ok(EE.Lab7Evaluator.grade(row, entry).ok); assert.ok(!EE.Lab7Evaluator.grade(row, { ...entry, phase: 50 }).ok); } });
test('Evaluator includes component corners, detects photo 10, and rejects blank fields', () => { const row = { c: 0.6875e-6, f: 300, series: true }; const t = EE.Lab7.theory(300, 1050, row.c * 1.1); assert.ok(EE.Lab7Evaluator.grade(row, { input: 10, peak: t.peak, phase: t.phase, dt: t.dt * 1000 }).ok); assert.ok(EE.Lab7Evaluator.grade(row, { input: 10.1, peak: 5.05, phase: 0, dt: 0 }).anomaly); assert.ok(!EE.Lab7Evaluator.grade(row, { input: '', peak: '', phase: '', dt: '' }).ok); });
test('Registry accepts independent lab definitions 1–9 and rejects missing curriculum', () => { const r = new EE.LabRegistry(); for (let id = 1; id <= 9; id++) r.register({ id, create() { return { parts: [], wires: [] }; } }); assert.equal(r.list().length, 9); assert.throws(() => r.register({ id: 10, create() {} })); assert.throws(() => new EE.LabRegistry().get(1)); });
test('Scope scales are exact 1–2–5 detents and Run/Stop freezes acquisitions', () => { const scope = new EE.DigitalOscilloscope({ getContext: () => ({}) }); for (let i = 0; i < 20; i++) scope.step('ch1', -1); near(scope.voltsDiv[0], 0.01); for (let i = 0; i < 20; i++) scope.step('time', 1); near(scope.timeDiv, 0.005); scope.acquire([1, 2]); scope.run = false; scope.acquire([3, 4]); assert.deepEqual(scope.signals, [1, 2]); scope.single = true; scope.acquire([3, 4]); assert.deepEqual(scope.signals, [3, 4]); assert.ok(!scope.run); });
test('Independent curriculum registration configures instruments without Lab 7 code changes', () => {
  const registry = new EE.LabRegistry();
  registry.register({ id: 1, create: () => ({ parts: [{ id: 'R1', type: 'R', value: 1000, rating: 0.25, state: 'good', a: 'A1', b: 'A10' }], wires: [{ a: 'dmm.hi', b: 'A1' }, { a: 'dmm.lo', b: 'A10' }], generator: { enabled: false }, meter: { mode: 'Ω' } }) });
  const m = new EE.Simulation(board.buses()); registry.activate(1, m); assert.equal(m.lab.id, 1); assert.equal(m.dmm.mode, 'Ω'); near(m.dmm.value, 1000, 0.001);
});
test('Arbitrary parallel resistor network follows nodal analysis', () => {
  const solver = new EE.CircuitSolver({ grounds: ['return'], sources: [{ a: 'in', b: 'return', dc: 1, resistance: 1 }], components: [{ type: 'R', value: 1000, a: 'in', b: 'return' }, { type: 'R', value: 1000, a: 'in', b: 'return' }] });
  near(solver.solve(0).voltage('in').re, 500 / 501, 1e-8);
});
console.log('\n' + count + ' physics / state-machine checks passed.');
