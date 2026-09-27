/* Independent periodic sources use linear superposition through the existing nodal solver. */
(() => {
  function probeCompSource() {
    return { id: 'probe-comp', a: 'scope.comp', b: 'scope.compGround', resistance: 50, dc: 1.5, frequency: 1000,
      phasor: h => {
        const x = Math.PI * h / 62;
        return EE.Complex.C(h % 2 ? 6 / Math.PI * Math.sin(h * Math.PI / 2) / h * (Math.sin(x) / x) ** 2 : 0);
      } };
  }
  function analyzeSources(netlist, defaultFrequency) {
    const frequencies = new Set();
    for (const source of netlist.sources) if (source.phasor) {
      for (let h = 1; h <= 61; h++) {
        if (EE.Complex.abs(source.phasor(h)) > 1e-12) frequencies.add((source.frequency || defaultFrequency) * h);
      }
    }
    const solver = new EE.CircuitSolver(netlist), dc = solver.solve(0);
    const ac = [...frequencies].sort((a, b) => a - b).map(frequency => {
      const sources = netlist.sources.map(source => ({ ...source, phasor: () => {
        const harmonic = frequency / (source.frequency || defaultFrequency), h = Math.round(harmonic);
        return source.phasor && h >= 1 && h <= 61 && Math.abs(harmonic - h) < 1e-8 ? source.phasor(h) : EE.Complex.C();
      } }));
      return { frequency, h: frequency / defaultFrequency, result: new EE.CircuitSolver({ ...netlist, sources }).solve(frequency) };
    });
    const signal = (a, b = 'earth') => {
      const offset = dc.between(a, b).re;
      const terms = ac.map(t => ({ frequency: t.frequency, ...t.result.between(a, b) })).filter(t => Math.hypot(t.re, t.im) > 1e-10);
      const fundamental = terms.reduce((best, term) => !best || Math.hypot(term.re, term.im) > Math.hypot(best.re, best.im) ? term : best, null);
      const frequency = fundamental?.frequency || defaultFrequency;
      terms.forEach(term => { term.h = term.frequency / frequency; });
      const sample = time => offset + terms.reduce((sum, term) => {
        const angle = 2 * Math.PI * term.frequency * time;
        return sum + term.re * Math.cos(angle) - term.im * Math.sin(angle);
      }, 0);
      const rms = Math.sqrt(terms.reduce((sum, t) => sum + (t.re * t.re + t.im * t.im) / 2, 0));
      let min = offset, max = offset;
      for (let i = 0; i < 4096; i++) { const value = sample(i / (4096 * (terms[0]?.frequency || frequency))); min = Math.min(min, value); max = Math.max(max, value); }
      return { offset, terms, frequency, sample, rms, totalRms: Math.hypot(offset, rms), min, max, vpp: max - min,
        phase: fundamental ? Math.atan2(fundamental.im, fundamental.re) : 0,
        multiTone: terms.some(t => Math.abs(t.h - Math.round(t.h)) > 1e-7) };
    };
    return { dc, ac, signal, connected: solver.connected.bind(solver) };
  }
  Object.assign(EE, { probeCompSource, analyzeSources });
})();
