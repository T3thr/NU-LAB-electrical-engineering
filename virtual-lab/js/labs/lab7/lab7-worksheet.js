(() => {
  class Lab7Worksheet {
    constructor(container, capture, load) {
      this.container = container; this.capture = capture; this.load = load;
      this.rows = [2.2e-6, 1e-6, 0.1e-6].map((c, i) => ({ id: 'a' + i, section: '7.1', c, f: 300 }));
      this.rows.push(...EE.Lab7.frequencies.map((f, i) => ({ id: 'b' + i, section: '7.2', c: 1e-6, f })));
      this.rows.push({ id: 'c0', section: '7.3', c: 0.6875e-6, f: 300, series: true });
      this.saved = {}; try { const stored = JSON.parse(localStorage.getItem('ee-lab7-worksheet-v1') || '{}'); if (stored && typeof stored === 'object' && !Array.isArray(stored)) this.saved = stored; } catch { /* Storage can be unavailable in private/file contexts. */ }
      this.render();
    }
    render() {
      let html = '<div class="sheet-intro"><div><p class="eyebrow">LABORATORY RECORD · ใบบันทึกผล</p><h2>Read the trace. Explain the response.</h2><p>Record A_c = Pk-Pk(2) ÷ 2 and a negative phase for lag. The checker uses your measured input, ±5% R, ±10% C, and display resolution.</p></div><button id="export-sheet">Export CSV ↗</button></div>';
      for (const section of ['7.1', '7.2', '7.3']) {
        html += '<details class="table-section" open><summary>Table ' + section + ' · ' + ({ '7.1': 'Capacitance at 300 Hz', '7.2': 'Frequency response · C = 1.0 µF', '7.3': 'Series capacitors · C_eq = 0.6875 µF' })[section] + '</summary><div class="table-scroll"><table><thead><tr><th>Configuration</th><th>Nominal A_c / φ</th><th>Input Vpp</th><th>A_c (V)</th><th>Δt (ms)</th><th>φ (°)</th><th>Actions</th></tr></thead><tbody>';
        for (const row of this.rows.filter(r => r.section === section)) {
          const t = EE.Lab7.theory(row.f, 1000, row.c);
          html += '<tr data-row="' + row.id + '"><th>' + (row.series ? '1.0 + 2.2 µF' : (row.c * 1e6).toFixed(1) + ' µF') + '<small>' + row.f + ' Hz</small></th><td>' + t.peak.toFixed(3) + ' V<br>' + t.phase.toFixed(2) + '°</td>';
          for (const key of ['input', 'peak', 'dt', 'phase']) html += '<td><input type="number" step="any" data-field="' + key + '" aria-label="Table ' + section + ' ' + row.f + ' Hz ' + row.c * 1e6 + ' µF ' + key + '"></td>';
          html += '<td class="sheet-actions"><button data-load="' + row.id + '">Set up</button><button data-record="' + row.id + '">Record</button></td></tr><tr><td colspan="7" class="grade-note" id="grade-' + row.id + '">Awaiting readings</td></tr>';
        }
        html += '</tbody></table></div></details>';
      }
      html += '<div class="sheet-footer"><button class="primary" id="check-sheet">Check all readings</button><output id="sheet-score" aria-live="polite"></output><span id="save-status">Saved on this device when storage is available.</span></div><details class="reference-table"><summary>Compare the 10 physical benchmarks</summary><p>These are observations, not replacement equations. High-frequency readings include departures that component tolerance alone cannot explain. Nominal predictions below use the photographed CH1 input.</p><div class="table-scroll"><table><thead><tr><th>Figure</th><th>Hz</th><th>CH1 Vpp</th><th>Observed CH2</th><th>Analytical CH2</th><th>Interpretation</th></tr></thead><tbody>';
      for (const b of EE.Lab7.benchmarks) {
        const t = EE.Lab7.theory(b.f, 1000, b.c, b.input), bound = EE.Lab7Evaluator.envelope(b.f, 1000, b.c, b.input);
        const inBand = b.output >= bound.vpp[0] - 0.05 && b.output <= bound.vpp[1] + 0.05;
        html += '<tr><th><button data-benchmark="' + b.id + '">' + b.id + ' ↗</button></th><td>' + b.f + '</td><td>' + b.input.toFixed(1) + '</td><td>' + b.output.toFixed(2) + ' V</td><td>' + t.vpp.toFixed(2) + ' V</td><td>' + (b.anomaly ? 'CH2 across source · φ = 0°' : inBand ? 'Within component / reading envelope' : 'Outside component tolerance; inspect measurement') + '</td></tr>';
      }
      html += '</tbody></table></div></details>';
      this.container.innerHTML = html;
      for (const row of this.rows) {
        const tr = this.container.querySelector('[data-row="' + row.id + '"]');
        for (const input of tr.querySelectorAll('input')) { const value = this.saved[row.id]?.[input.dataset.field]; if (typeof value === 'number' || typeof value === 'string') input.value = value; input.addEventListener('input', () => this.save()); }
      }
      this.container.addEventListener('click', event => {
        const button = event.target.closest('button'); if (!button) return;
        const row = this.rows.find(r => r.id === (button.dataset.load || button.dataset.record));
        if (button.dataset.load) this.load(row);
        if (button.dataset.record) {
          const reading = this.capture(row), note = document.getElementById('grade-' + row.id);
          if (!reading.ok) { note.textContent = reading.message; return; }
          const tr = this.container.querySelector('[data-row="' + row.id + '"]');
          for (const input of tr.querySelectorAll('input')) input.value = reading[input.dataset.field];
          note.textContent = 'Recorded the current scope acquisition. Check readings to evaluate.'; this.save();
        }
        if (button.dataset.benchmark) this.load({ benchmark: EE.Lab7.benchmarks.find(b => b.id === button.dataset.benchmark) });
        if (button.id === 'check-sheet') this.check();
        if (button.id === 'export-sheet') this.export();
      });
    }
    entries() { const result = {}; for (const row of this.rows) { result[row.id] = {}; for (const input of this.container.querySelectorAll('[data-row="' + row.id + '"] input')) result[row.id][input.dataset.field] = input.value; } return result; }
    save() { this.saved = this.entries(); try { localStorage.setItem('ee-lab7-worksheet-v1', JSON.stringify(this.saved)); document.getElementById('save-status').textContent = 'Saved on this device.'; } catch { document.getElementById('save-status').textContent = 'Storage unavailable. Export CSV to keep your readings.'; } }
    check() { let passed = 0; const entries = this.entries(); for (const row of this.rows) { const grade = EE.Lab7Evaluator.grade(row, entries[row.id]), note = document.getElementById('grade-' + row.id); note.textContent = grade.message; note.classList.toggle('pass', grade.ok); if (grade.ok) passed++; } document.getElementById('sheet-score').textContent = passed + ' / 10 configurations within tolerance'; }
    export() {
      const entries = this.entries(), lines = ['Table,C_uF,Frequency_Hz,Input_Vpp,Ac_V,Delay_ms,Phase_deg'];
      for (const row of this.rows) { const e = entries[row.id]; lines.push([row.section, row.c * 1e6, row.f, ...['input', 'peak', 'dt', 'phase'].map(k => e[k] === '' ? '' : Number(e[k]))].join(',')); }
      const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })), a = document.createElement('a'); a.href = url; a.download = 'lab7-worksheet.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }
  EE.Lab7Worksheet = Lab7Worksheet;
})();
