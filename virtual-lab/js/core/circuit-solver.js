/* Complex nodal analysis. Peak phasors; SI units; finite source impedances.
   Scoped scripts also work under file://. The ES-module facade is js/lab.js. */
globalThis.EE = globalThis.EE || {};
(() => {
  const C = (re = 0, im = 0) => ({ re, im });
  const add = (a, b) => C(a.re + b.re, a.im + b.im);
  const sub = (a, b) => C(a.re - b.re, a.im - b.im);
  const mul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const div = (a, b) => { const d = b.re * b.re + b.im * b.im; return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
  const abs = a => Math.hypot(a.re, a.im);
  class UnionFind {
    constructor() { this.parent = new Map(); }
    find(a) { if (!this.parent.has(a)) this.parent.set(a, a); const p = this.parent.get(a); if (p !== a) this.parent.set(a, this.find(p)); return this.parent.get(a); }
    join(a, b) { a = this.find(a); b = this.find(b); if (a !== b) this.parent.set(a, b); }
  }
  function gaussian(matrix, rhs) {
    const n = rhs.length;
    for (let k = 0; k < n; k++) {
      let pivot = k;
      for (let i = k + 1; i < n; i++) if (abs(matrix[i][k]) > abs(matrix[pivot][k])) pivot = i;
      if (abs(matrix[pivot][k]) < 1e-20) throw new Error('Singular circuit matrix');
      [matrix[k], matrix[pivot]] = [matrix[pivot], matrix[k]];
      [rhs[k], rhs[pivot]] = [rhs[pivot], rhs[k]];
      for (let i = k + 1; i < n; i++) {
        const factor = div(matrix[i][k], matrix[k][k]);
        if (abs(factor) === 0) continue;
        for (let j = k + 1; j < n; j++) matrix[i][j] = sub(matrix[i][j], mul(factor, matrix[k][j]));
        rhs[i] = sub(rhs[i], mul(factor, rhs[k]));
      }
    }
    const x = Array.from({ length: n }, () => C());
    for (let i = n - 1; i >= 0; i--) {
      let b = rhs[i];
      for (let j = i + 1; j < n; j++) b = sub(b, mul(matrix[i][j], x[j]));
      x[i] = div(b, matrix[i][i]);
    }
    return x;
  }
  class CircuitSolver {
    constructor(netlist) {
      this.netlist = netlist;
      this.graph = new UnionFind();
      for (const [a, b] of netlist.buses || []) this.graph.join(a, b);
      for (const wire of netlist.wires || []) this.graph.join(wire.a, wire.b);
      for (const node of netlist.grounds || []) this.graph.join(node, 'earth');
    }
    connected(a, b) { return this.graph.find(a) === this.graph.find(b); }
    solve(frequency = 0, harmonic = 1) {
      const graph = this.graph, ground = graph.find('earth');
      const components = this.netlist.components || [], sources = this.netlist.sources || [];
      const nodes = new Set();
      for (const item of [...components, ...sources]) { nodes.add(graph.find(item.a)); nodes.add(graph.find(item.b)); }
      nodes.delete(ground);
      const index = new Map([...nodes].map((node, i) => [node, i]));
      const n = index.size;
      const matrix = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => C(i === j ? 1e-12 : 0)));
      const rhs = Array.from({ length: n }, () => C());
      const stamp = (a, b, y, current = C()) => {
        const i = index.get(graph.find(a)), j = index.get(graph.find(b));
        if (i !== undefined) { matrix[i][i] = add(matrix[i][i], y); rhs[i] = add(rhs[i], current); }
        if (j !== undefined) { matrix[j][j] = add(matrix[j][j], y); rhs[j] = sub(rhs[j], current); }
        if (i !== undefined && j !== undefined) { matrix[i][j] = sub(matrix[i][j], y); matrix[j][i] = sub(matrix[j][i], y); }
      };
      for (const part of components) {
        if (part.state === 'burnt' || part.state === 'open') continue;
        const y = part.state === 'ruptured' ? C(100) : part.type === 'R' ? C(1 / part.value) : C(0, 2 * Math.PI * frequency * harmonic * part.value);
        stamp(part.a, part.b, y);
      }
      for (const source of sources) {
        const voltage = frequency === 0 ? C(source.dc || 0) : (source.phasor ? source.phasor(harmonic) : C());
        if (source.currentMode && frequency === 0) stamp(source.a, source.b, C(1e-10), C(source.currentMode));
        else stamp(source.a, source.b, C(1 / source.resistance), div(voltage, C(source.resistance)));
      }
      const solution = gaussian(matrix, rhs);
      const voltage = node => solution[index.get(graph.find(node))] || C();
      const between = (a, b) => sub(voltage(a), voltage(b));
      return { voltage, between, graph };
    }
    analyze(frequency, harmonics = 1) {
      const dc = this.solve(0);
      const ac = [];
      for (let h = 1; h <= harmonics; h += 2) ac.push({ h, result: this.solve(frequency, h) });
      const signal = (a, b = 'earth') => {
        const offset = dc.between(a, b).re;
        const terms = ac.map(({ h, result }) => ({ h, ...result.between(a, b) }));
        const rms = Math.sqrt(terms.reduce((sum, t) => sum + (t.re * t.re + t.im * t.im) / 2, 0));
        const sample = time => offset + terms.reduce((sum, t) => { const angle = 2 * Math.PI * frequency * t.h * time; return sum + t.re * Math.cos(angle) - t.im * Math.sin(angle); }, 0);
        let min = offset, max = offset;
        if (terms.length === 1) { const peak = abs(terms[0]); min -= peak; max += peak; }
        else for (let i = 0; i < 2048; i++) { const v = sample(i / (2048 * frequency)); min = Math.min(min, v); max = Math.max(max, v); }
        return { offset, terms, rms, totalRms: Math.hypot(offset, rms), vpp: max - min, min, max, phase: Math.atan2(terms[0].im, terms[0].re), frequency, sample };
      };
      return { dc, ac, signal, connected: this.connected.bind(this) };
    }
  }
  Object.assign(EE, { Complex: { C, add, sub, mul, div, abs }, CircuitSolver, UnionFind });
})();
