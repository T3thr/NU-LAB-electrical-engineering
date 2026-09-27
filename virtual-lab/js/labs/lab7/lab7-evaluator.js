(() => {
  function envelope(f, r, c, input) {
    const values = [];
    for (const rt of [0.95, 1.05]) for (const ct of [0.9, 1.1]) values.push(EE.Lab7.theory(f, r * rt, c * ct, input));
    const range = key => [Math.min(...values.map(v => v[key])), Math.max(...values.map(v => v[key]))];
    return { peak: range('peak'), phase: range('phase'), dt: range('dt'), vpp: range('vpp') };
  }
  function grade(row, entry) {
    const required = ['input', 'peak', 'phase', 'dt'];
    if (required.some(key => entry[key] === '' || !Number.isFinite(Number(entry[key])))) return { ok: false, message: 'Enter all four readings before checking.' };
    const input = Number(entry.input), peak = Number(entry.peak), phase = Number(entry.phase), dt = Number(entry.dt) / 1000;
    if (input <= 0 || input > 40 || peak < 0 || dt < 0) return { ok: false, message: 'Use positive input Vpp, nonnegative peak amplitude and delay.' };
    if (row.series && Math.abs(peak * 2 / input - 1) < 0.08 && Math.abs(phase) < 3) return { ok: false, anomaly: true, message: 'Photo 10 anomaly: CH2 measures the generator. Equal amplitudes and φ ≈ 0° do not measure C_eq. Move CH2 to the R–C junction.' };
    const bounds = envelope(row.f, 1000, row.c, input);
    const within = (value, range, resolution) => value >= range[0] - resolution && value <= range[1] + resolution;
    const checks = [within(peak, bounds.peak, 0.025), within(phase, bounds.phase, 1), within(dt, bounds.dt, 0.00001), Math.abs(phase + 360 * row.f * dt) <= 2];
    return { ok: checks.every(Boolean), checks, bounds, message: checks.every(Boolean) ? 'Within ±5% R / ±10% C and reading resolution. Phase and Δt agree.' : 'Recheck ' + ['A_c = Vpp(2) ÷ 2', 'phase (negative for lag)', 'Δt in ms', 'φ = −360 × f × Δt'][checks.indexOf(false)] + '.' };
  }
  EE.Lab7Evaluator = { envelope, grade };
})();
