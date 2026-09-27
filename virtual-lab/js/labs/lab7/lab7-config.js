(() => {
  const benchmarks = [
    { id: '7.5', c: 2.2e-6, f: 300.1, input: 9.6, output: 2.4, dt: 0.0007, time: 0.001 },
    { id: '7.6', c: 1e-6, f: 300, input: 9.7, output: 4.3, dt: 0.00057, time: 0.001 },
    { id: '7.7', c: 0.1e-6, f: 300.1, input: 9.8, output: 9.8, dt: 0.0001, time: 0.001 },
    { id: '7.9', c: 1e-6, f: 50, input: 10, output: 9.5, time: 0.005 },
    { id: '7.10', c: 1e-6, f: 200, input: 9.7, output: 5.9, time: 0.001 },
    { id: '7.11', c: 1e-6, f: 500.1, input: 9.7, output: 3, time: 0.0005 },
    { id: '7.12', c: 1e-6, f: 1000.1, input: 10.7, output: 1.8, time: 0.0002 },
    { id: '7.13', c: 1e-6, f: 2000.2, input: 11.2, output: 1, time: 0.0001 },
    { id: '7.14', c: 1e-6, f: 5000.5, input: 11.5, output: 0.5, time: 0.00005 },
    { id: '7.16', c: 0.6875e-6, f: 300, input: 10.1, output: 10.1, dt: 0, time: 0.001, anomaly: true }
  ];
  const theory = (f, r, c, input = 10) => { const x = 2 * Math.PI * f * r * c, phase = -Math.atan(x) * 180 / Math.PI; return { peak: input / 2 / Math.hypot(1, x), vpp: input / Math.hypot(1, x), phase, dt: -phase / (360 * f), gain: 1 / Math.hypot(1, x) }; };
  function create(options = {}) {
    const c = options.c || 2.2e-6, series = options.series || false;
    const parts = [EE.ComponentPalette.create('R', 1000, 'E12', 'E29', 'R1')];
    if (series) { parts.push(EE.ComponentPalette.create('C', 1e-6, 'D29', 'F29', 'C1'), EE.ComponentPalette.create('C', 2.2e-6, 'G29', 'G49', 'C2')); }
    else parts.push(EE.ComponentPalette.create('C', c, 'D29', 'D49', 'C1'));
    const wires = [ ['gen.out', 'A12', '#c67845'], ['gen.gnd', 'A49', '#343d42'], ['scope.ch1', 'B12', '#dac355'], ['scope.ch2', options.anomaly ? 'B12' : 'B29', '#6daf85'], ['scope.g1', 'B49', '#343d42'], ['scope.g2', 'C49', '#343d42'], ['dmm.hi', 'C29', '#b35e54'], ['dmm.lo', 'E49', '#343d42'] ];
    if (series) wires.push(['J49', 'A49', '#547e9c']);
    return { parts, wires: wires.map((w, i) => ({ id: 'w' + i, a: w[0], b: w[1], color: w[2] })), frequency: options.f || 300 };
  }
  EE.Lab7 = { id: 7, title: 'AC response of a series RC circuit', create, theory, benchmarks, frequencies: [50, 200, 500, 1000, 2000, 5000] };
})();
