/* DOM orchestration. Instrument models and lab definitions do not depend on this file. */
(() => {
  'use strict';
  EE.InstrumentPanels.mount();
  const el = id => document.getElementById(id);
  const all = query => [...document.querySelectorAll(query)];
  const setText = (id, text) => { el(id).textContent = text; };
  const finite = (value, fallback) => Number.isFinite(Number(value)) && value !== '' ? Number(value) : fallback;
  const board = new EE.Breadboard(el('breadboard'));
  const scope = new EE.DigitalOscilloscope(el('scope-canvas'));
  const audio = new EE.AudioSynthesizer();
  const registry = new EE.LabRegistry(); registry.register(EE.Lab7);
  let pending = null, placing = null, selectedPart = null, pointerStart = null, statusNote = '', plotCap = null;
  const terminals = new Set([...board.pins.map(p => p.id), ...all('[data-terminal]').map(e => e.dataset.terminal)]);
  function endpoint(id) {
    const local = EE.interaction?.localEndpoint(id);
    if (local) return local;
    if (EE.scene?.active) {
      const dockJack = all('#scene-dock [data-terminal]').find(e => e.dataset.terminal === id && e.getClientRects().length);
      if (!dockJack) return EE.scene.endpoint(id);
    }
    const node = all('[data-terminal]').find(e => e.dataset.terminal === id && e.getClientRects().length);
    if (node) { const rect = node.getBoundingClientRect(); return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; }
    if (el('breadboard').getClientRects().length && board.byId.has(id)) { const pos = board.position(id), rect = el('breadboard').getBoundingClientRect(); return pos.x >= rect.left && pos.x <= rect.right && pos.y >= rect.top && pos.y <= rect.bottom ? pos : null; }
    return null;
  }
  const cables = new EE.CablePhysics(el('wire-layer'), endpoint, id => { model.wires = model.wires.filter(w => w.id !== id); audio.play('switch'); update(); });
  const model = new EE.Simulation(board.buses(), event => {
    audio.play(event.kind === 'smoke' ? 'switch' : event.kind);
    const point = endpoint(event.part) || { x: innerWidth / 2, y: innerHeight / 2 };
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (let i = 0; i < (event.kind === 'arc' ? 12 : 16); i++) {
        const particle = document.createElement('i'); particle.className = 'failure-particle ' + event.kind;
        particle.style.left = point.x + 'px'; particle.style.top = point.y + 'px'; particle.style.setProperty('--drift', ((i * 31 % 91) - 45) + 'px'); particle.style.setProperty('--angle', i * 30 + 'deg'); particle.style.animationDelay = (event.kind === 'arc' ? 0 : i * 0.045) + 's';
        el('failure-layer').append(particle); setTimeout(() => particle.remove(), 4000);
      }
    }
    statusNote = event.message; EE.history?.note('Circuit event', event.message);
  });
  const panels = new EE.InstrumentPanels(model, scope, update, refreshReadings, audio);
  function hint(text) { setText('bench-hint', text); }
  function drawWires() { cables.draw(model.wires); }
  function cancel() { board.preview = null; pending = null; placing = null; cables.pending = null; all('.selected').forEach(n => n.classList.remove('selected')); drawWires(); hint('Drag a jack to a pin, or select two terminals. Double-click a cable to unplug.'); }
  function update() {
    model.compute(); scope.termination = [...model.termination]; scope.acquire(model.signals);
    refreshControls(); refreshReadings(); refreshConnections(); board.draw(model.parts, selectedPart); drawWires(); drawResponse();
    if (statusNote) { hint(statusNote); statusNote = ''; }
    EE.history?.record(); EE.interaction?.refresh();
  }
  function refreshControls() {
    const gen = model.generator, dmm = model.dmm;
    panels.renderGenerator();
    all('[data-mode]').forEach(n => { n.classList.toggle('active', n.dataset.mode === dmm.mode); n.setAttribute('aria-pressed', String(n.dataset.mode === dmm.mode)); });
    setText('dmm-function', dmm.mode + (dmm.nullValue ? ' · NULL' : ''));
    setText('fuse-status', dmm.fuse === 'good' ? 'FUSE OK · 6½ DIGITS' : dmm.fuse === 'removed' ? 'NO FUSE' : 'FUSE OPEN');
    const reading = dmm.message || (Number.isFinite(dmm.value) ? dmm.value.toFixed(Math.max(0, Math.min(6, 6 - Math.floor(Math.log10(Math.abs(dmm.value) || 1)))) ) + ' ' + dmm.unit : 'OPEN / OVERLOAD');
    setText('dmm-reading', reading); el('dmm-reading').style.fontSize = reading.length > 17 ? '16px' : '';
    model.psu.channels.forEach((c, i) => {
      if (i < 2) { el('psu-v-' + (i + 1)).innerHTML = c.voltage.toFixed(2) + '<small>V</small>'; el('psu-a-' + (i + 1)).innerHTML = c.current.toFixed(3) + '<small>A</small>'; const mode = el('psu-mode-' + (i + 1)); mode.textContent = c.mode; mode.className = c.mode.toLowerCase(); }
      const button = document.querySelector('[data-output="' + i + '"]'); button.classList.toggle('active', c.enabled); button.setAttribute('aria-pressed', String(c.enabled));
    });
    const third = model.psu.channels[2]; setText('psu-third-status', 'CH3 ' + third.mode + (third.enabled ? ' ' + third.voltage.toFixed(2) + ' V / ' + third.current.toFixed(3) + ' A' : ''));
    const channelIndex = Number(el('psu-channel').value) - 1, channel = model.psu.channels[channelIndex];
    el('psu-knob').style.setProperty('--rotation', channel.setVoltage*12+'deg'); el('psu-voltage').value = channel.setVoltage; el('psu-voltage').disabled = channelIndex === 2; el('psu-knob').disabled = channelIndex === 2; el('psu-limit').value = channel.limit; el('psu-fixed').value = third.setVoltage.toFixed(1);
    all('[data-experiment]').forEach(button => button.classList.toggle('active', button.dataset.experiment === model.experiment));
    setText('experiment-label', model.experiment === 'free' ? 'FREE WIRING' : 'EXPERIMENT ' + model.experiment);
    const cap = model.equivalentCapacitance(); plotCap = cap;
    el('preset-cap').disabled = model.experiment === '7.3'; if (cap && model.experiment !== '7.3') el('preset-cap').value = String(cap);
    setText('quick-status', gen.frequency.toLocaleString() + ' Hz · ' + (model.signals[0].vpp).toFixed(2) + ' Vpp · ' + (cap ? (cap * 1e6).toFixed(cap < 0.8e-6 ? 4 : 1) + ' µF' : 'custom circuit'));
    setText('circuit-state', model.failure.active.size ? 'CHECK CONNECTIONS' : model.signals[0].vpp > 0.01 ? 'LIVE CIRCUIT' : 'NO AC INPUT');
    el('event-log').replaceChildren();
    for (const event of model.failure.history.slice(0, 4)) { const note = document.createElement('div'); note.className = 'event'; const time = document.createElement('time'); time.textContent = new Date(event.time).toLocaleTimeString(); note.append(time, document.createTextNode(event.message)); el('event-log').append(note); }
    el('fuse-visual').className = 'ceramic-fuse ' + dmm.fuse; el('fuse-remove').disabled = dmm.fuse === 'removed'; el('fuse-replace').disabled = dmm.fuse !== 'removed';
    const anomaly = model.anomaly;
    el('observation-note').innerHTML = anomaly ? '<span class="note-mark">!</span><div><h3>Same signal. Wrong measurement.</h3><p>CH2 is connected to the source, just like photo 10. Equal Vpp and φ ≈ 0° do not describe the capacitor. Move the green probe to A29.</p></div>' : '<span class="note-mark">↳</span><div><h3>Why does the green trace lag?</h3><p>The capacitor charges through the resistor. Increasing capacitance or frequency reduces its voltage and increases phase lag.</p></div>';
  }
  function refreshReadings() {
    panels.renderScope();
    const s = scope.signals; if (!s) return;
    const phase = scope.phaseDifference();
    setText('response-peak', (s[1].vpp / 2).toFixed(3) + ' V'); setText('response-phase', phase === null ? '—' : phase.toFixed(2) + '°'); setText('response-delay', phase === null ? '—' : EE.formatTime(-phase / (360 * s[0].frequency)));
    EE.history?.record();
  }
  function refreshConnections() {
    setText('connection-count', model.wires.length + ' leads · ' + model.parts.length + ' parts'); el('wire-list').replaceChildren();
    for (const wire of model.wires) {
      const row = document.createElement('div'); row.className = 'wire-entry';
      const color = document.createElement('i'); color.style.background = wire.color; row.append(color);
      for (const side of ['a', 'b']) { const input = document.createElement('input'); input.value = wire[side]; input.setAttribute('list', 'terminals'); input.setAttribute('aria-label', 'Cable ' + wire.id + ' endpoint ' + side); input.addEventListener('change', () => { const value = input.value.trim(); if (!terminals.has(value)) { hint('Unknown terminal. Use A1–J63 or a listed instrument jack.'); input.value = wire[side]; return; } wire[side] = value; update(); }); row.append(input); if (side === 'a') row.append(' → '); }
      const remove = document.createElement('button'); remove.textContent = 'Unplug'; remove.addEventListener('click', () => { model.wires = model.wires.filter(w => w !== wire); update(); }); row.append(remove); el('wire-list').append(row);
    }
    el('parts-list').replaceChildren();
    for (const part of model.parts) {
      const row = document.createElement('div'); row.className = 'part-entry'; const label = document.createElement('span'); label.textContent = part.id + ' · ' + (part.type === 'R' ? '1 kΩ' : (part.value * 1e6).toFixed(1) + ' µF') + ' · ' + part.a + ' → ' + part.b + ' · ' + part.state; row.append(label);
      const actions = part.type === 'C' ? ['Flip', 'Move', 'Replace', 'Remove'] : ['Move', 'Replace', 'Remove'];
      for (const action of actions) { const button = document.createElement('button'); button.textContent = action; button.addEventListener('click', () => { if (action === 'Flip') [part.a, part.b] = [part.b, part.a]; if (action === 'Replace') { if (model.generator.enabled || model.psu.channels.some(c => c.enabled)) { hint('Turn the generator and supply outputs off before replacing the component.'); return; } part.state = 'good'; model.failure.active.delete(part.id); } if (action === 'Remove') model.parts = model.parts.filter(p => p !== part); if (action === 'Move') { cancel(); placing = { ...part, moving: part }; selectedPart = part.id; hint('Select two new breadboard pins for ' + part.id + '. First pin is positive.'); board.draw(model.parts, selectedPart); return; } update(); }); row.append(button); }
      el('parts-list').append(row);
    }
  }
  function drawResponse() {
    const canvas = el('response-plot'), ctx = canvas.getContext('2d'), w = canvas.clientWidth, h = canvas.clientHeight, dpr = devicePixelRatio || 1; if (!w) return;
    canvas.width = w * dpr; canvas.height = h * dpr; ctx.scale(dpr, dpr); ctx.clearRect(0, 0, w, h);
    const left = 28, right = w - 9, top = 8, bottom = h - 21; ctx.font = '8px monospace'; ctx.fillStyle = '#8e9b87';
    for (let db = 0; db >= -40; db -= 20) { const y = top - db / 40 * (bottom - top); ctx.strokeStyle = '#dce2d4'; ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke(); ctx.fillText(String(db), 1, y + 3); }
    for (const f of [50, 200, 1000, 5000]) { const x = left + Math.log10(f / 50) / 2 * (right - left); ctx.fillText(f >= 1000 ? f / 1000 + 'k' : String(f), x - 6, h - 4); }
    if (!plotCap) { setText('cutoff-label', 'CUSTOM TOPOLOGY'); setText('response-note', 'Measured values above follow the connected probes. The RC reference curve requires the standard series topology.'); return; }
    setText('cutoff-label', 'f_c ' + (1 / (2 * Math.PI * 1000 * plotCap)).toFixed(2) + ' Hz');
    setText('response-note', 'A_c = A ÷ √(1 + (2πfRC)²) · click curve to set f');
    ctx.save(); ctx.beginPath(); ctx.rect(left, top, right - left, bottom - top); ctx.clip(); ctx.strokeStyle = '#72987d'; ctx.lineWidth = 1.8; ctx.beginPath();
    const point = f => { const gain = EE.Lab7.theory(f, 1000, plotCap).gain; return { x: left + Math.log10(f / 50) / 2 * (right - left), y: top - 20 * Math.log10(gain) / 40 * (bottom - top) }; };
    for (let i = 0; i <= 200; i++) { const p = point(50 * Math.pow(100, i / 200)); if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); } ctx.stroke(); const p = point(model.generator.frequency); ctx.fillStyle = '#b3824a'; ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI); ctx.fill(); ctx.restore();
  }
  function load(options = {}) {
    cancel(); model.load(options); scope.reset(); scope.run = true; scope.single = false; scope.scale = [7, 7]; scope.timeIndex = EE.scopeTimes.reduce((best, t, i) => Math.abs(Math.log(t * model.generator.frequency / 0.25)) < Math.abs(Math.log(EE.scopeTimes[best] * model.generator.frequency / 0.25)) ? i : best, 0); scope.offset = [0, 0]; scope.timeOffset = 0; scope.coupling = ['DC', 'DC']; scope.triggerLevel = 0; scope.cursors = false; update();
  }
  const worksheet = new EE.Lab7Worksheet(el('worksheet-content'), row => {
    if (!scope.run) return { ok: false, message: 'Run the scope to capture a current acquisition.' };
    if (Math.abs(model.generator.frequency / row.f - 1) > 0.01 || !plotCap || Math.abs(plotCap / row.c - 1) > 0.001 || model.generator.waveform !== 'sine') return { ok: false, message: 'Set up this row’s capacitance and sine-wave frequency first.' };
    if (scope.signals.some(s => s.vpp < 0.001)) return { ok: false, message: 'No measurable signal. Check both probe connections and source output.' };
    const phase = scope.phaseDifference();
    if(phase===null)return {ok:false,message:'Both channels must measure the same sine-wave frequency.'};
    return { ok: true, input: scope.signals[0].vpp.toFixed(4), peak: (scope.signals[1].vpp / 2).toFixed(4), phase: phase.toFixed(3), dt: (-phase / (360 * model.generator.frequency) * 1000).toFixed(5) };
  }, row => {
    if (row.benchmark) {
      const b = row.benchmark; load({ c: b.c, f: b.f, input: b.input, series: !!b.anomaly, anomaly: !!b.anomaly }); scope.timeIndex = EE.scopeTimes.indexOf(b.time); refreshReadings(); hint('Figure ' + b.id + ': measured input calibrated to ' + b.input + ' Vpp. Analytical CH2 remains independent of the photographed reading.');
    } else load({ c: row.c, f: row.f, series: row.series, experiment: row.section });
    el('worksheet-dialog').close();
  });
  all('[data-close]').forEach(button => button.addEventListener('click', () => el(button.dataset.close).close()));
  ['worksheet-open', 'worksheet-bottom'].forEach(id => el(id).addEventListener('click', () => { cancel(); el('worksheet-dialog').showModal(); }));
  el('help-open').addEventListener('click', () => { cancel(); el('help-dialog').showModal(); });
  el('reset-bench').addEventListener('click', () => { load(); audio.play('relay'); hint('Bench reset. Worksheet readings are retained.'); });
  el('sound-toggle').addEventListener('click', async () => { if (!audio.enabled) { const ok = await audio.unlock(); audio.enabled = ok; } else audio.enabled = false; el('sound-toggle').setAttribute('aria-pressed', String(audio.enabled)); setText('sound-toggle', audio.enabled ? 'Sound on' : 'Sound off'); audio.play(); });
  all('[data-experiment]').forEach(button => button.addEventListener('click', () => { const mode = button.dataset.experiment; if (mode === 'free') { load(); model.wires = []; model.parts = []; model.generator.enabled = false; model.generator.setLoad('50Ω'); model.experiment = 'free'; update(); hint('Empty bench. Select a part, then two pins. Connect the source and probes using the jacks or pin entry.'); } else load({ c: mode === '7.2' ? 1e-6 : 2.2e-6, f: mode === '7.2' ? 50 : 300, series: mode === '7.3', experiment: mode }); audio.play('relay'); }));
  el('preset-cap').addEventListener('change', event => { const cap = model.parts.find(p => p.type === 'C'); if (cap) { cap.value = Number(event.target.value); cap.state = 'good'; model.failure.active.delete(cap.id); } else { hint('Place a capacitor on the board first.'); return; } update(); audio.play('relay'); });
  el('clear-wires').addEventListener('click', () => { cancel(); model.wires = []; update(); });
  el('wire-tool').addEventListener('click', cancel);
  new EE.ComponentPalette(el('component-palette'), part => { cancel(); placing = { ...part, a: null }; hint('Place ' + part.label + ': select the first breadboard pin' + (part.type === 'C' && part.value >= 1e-6 ? ' (positive lead)' : '') + ', then the second pin.'); });
  el('board-zoom').addEventListener('click', () => { board.zoom = board.zoom === 1 ? 2 : 1; board.pan = 0; el('board-pan').value = 0; el('breadboard').style.height = (board.zoom === 2 ? Math.max(300, el('breadboard').clientWidth * 0.64) : Math.max(175, el('breadboard').clientWidth * 0.35)) + 'px'; setText('board-zoom', board.zoom === 2 ? '− Zoom' : '＋ Zoom'); board.draw(model.parts, selectedPart); drawWires(); });
  el('board-pan').addEventListener('input', event => { board.pan = Number(event.target.value) * el('breadboard').clientWidth * (board.zoom - 1); board.draw(model.parts, selectedPart); drawWires(); });
  for (const terminal of terminals) { const option = document.createElement('option'); option.value = terminal; el('terminals').append(option); }
  function leadColor(a,b) {
    if(el('wire-color').dataset.custom==='true')return el('wire-color').value;
    const colors={'gen.out':'#c67845','gen.gnd':'#425962','scope.ch1':'#dac355','scope.ch2':'#6daf85','scope.g1':'#425962','scope.g2':'#425962','dmm.hi':'#b35e54','dmm.lo':'#425962'};
    return colors[a] || colors[b] || el('wire-color').value;
  }
  el('wire-color').addEventListener('change',()=>el('wire-color').dataset.custom='true');
  function chooseTerminal(id) {
    if (placing) {
      if (!board.byId.has(id)) { hint('Components must be placed in breadboard pins.'); return; }
      if (!placing.a || placing.moving && !placing.newA) { placing.newA = id; placing.a = id; hint('First lead at ' + id + '. Select the second breadboard pin.'); return; }
      if (placing.a === id) { hint('Select a different pin for the second lead.'); return; }
      if (placing.moving) { placing.moving.a = placing.a; placing.moving.b = id; } else model.parts.push(EE.ComponentPalette.create(placing.type, placing.value, placing.a, id, placing.type + model.sequence++));
      placing = null; selectedPart = null; EE.interaction?.pulse(id); update(); audio.play('switch'); hint('Component placed. Its leads now participate in the circuit.'); return;
    }
    if (!pending) { EE.interaction?.clearSelection(); pending = id; all('[data-terminal]').filter(n => n.dataset.terminal === id).forEach(n => n.classList.add('selected')); hint(id + ' selected. Choose a destination pin or jack. Escape cancels.'); drawWires(); }
    else if (pending !== id) { model.wire(pending, id, leadColor(pending,id)); cancel(); update(); audio.play('switch'); }
  }
  function terminalAt(x, y) {
    const nodes = document.elementsFromPoint(x, y); const terminal = nodes.map(n => n.closest?.('[data-terminal]')).find(Boolean); if (terminal) return terminal.dataset.terminal;
    if (nodes.includes(el('breadboard'))) return board.hit(x, y)?.id || null;
    return null;
  }
  document.addEventListener('pointerdown', event => {
    if (event.button !== 0 || document.querySelector('dialog[open]') || EE.interaction?.drag) return;
    const id = terminalAt(event.clientX, event.clientY); if (!id) return;
    pointerStart = { id, x: event.clientX, y: event.clientY, moved: false }; event.preventDefault();
  });
  document.addEventListener('pointermove', event => {
    if (!EE.interaction?.drag && event.target === el('breadboard')) { board.hover = board.hit(event.clientX, event.clientY)?.id || null; board.draw(model.parts, selectedPart); drawWires(); if (board.hover) setText('pin-status', board.hover + ' · BUS ' + board.byId.get(board.hover).bus.toUpperCase()); }
    if (!pointerStart) return;
    if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 5) pointerStart.moved = true;
    if (pointerStart.moved && !placing) { cables.pending = { a: pointerStart.id, color: leadColor(pointerStart.id,null), point: { x: event.clientX, y: event.clientY } }; drawWires(); }
  });
  document.addEventListener('pointerup', event => {
    if (!pointerStart) return;
    const start = pointerStart; pointerStart = null; const target = terminalAt(event.clientX, event.clientY); cables.pending = null;
    if (start.moved && target && target !== start.id && !placing) { model.wire(start.id, target, leadColor(start.id,target)); cancel(); update(); audio.play(); }
    else if (!start.moved && target) chooseTerminal(target);
    drawWires();
  });
  document.addEventListener('pointercancel', () => { pointerStart = null; cables.pending = null; drawWires(); });
  all('[data-terminal]').forEach(button => button.addEventListener('click', event => { if (event.detail === 0) chooseTerminal(button.dataset.terminal); }));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') cancel(); });
  el('connect-wire').addEventListener('click', () => {
    const a = el('wire-from').value.trim(), b = el('wire-to').value.trim(); if (!terminals.has(a) || !terminals.has(b)) { hint('Unknown terminal. Use a listed jack or breadboard pin A1–J63 / T+1–B-50.'); return; }
    if (placing) { chooseTerminal(a); chooseTerminal(b); } else { model.wire(a, b, leadColor(a,b)); cancel(); update(); }
  });
  all('[data-mode]').forEach(button => button.addEventListener('click', () => { model.dmm.mode = button.dataset.mode; model.dmm.nullValue = 0; update(); audio.play('relay'); }));
  el('dmm-null').addEventListener('click', () => { model.dmm.nullValue = model.dmm.nullValue ? 0 : (Number.isFinite(model.dmm.value) ? model.dmm.value : 0); update(); audio.play('relay'); });
  el('psu-channel').addEventListener('change', refreshControls);
  el('psu-voltage').addEventListener('change', event => { const channel = model.psu.channels[Number(el('psu-channel').value) - 1]; channel.setVoltage = Math.max(0, Math.min(32, finite(event.target.value, channel.setVoltage))); update(); });
  el('psu-limit').addEventListener('change', event => { const channel = model.psu.channels[Number(el('psu-channel').value) - 1]; channel.limit = Math.max(0.001, Math.min(3.2, finite(event.target.value, channel.limit))); update(); });
  el('psu-fixed').addEventListener('change', event => { model.psu.channels[2].setVoltage = Number(event.target.value); update(); });
  EE.bindKnob(el('psu-knob'), direction => { const i = Number(el('psu-channel').value) - 1; if (i === 2) return; const channel = model.psu.channels[i]; channel.setVoltage = Math.max(0, Math.min(32, Math.round((channel.setVoltage + direction * 0.1) * 100) / 100)); update(); audio.play('detent'); });
  all('[data-output]').forEach(button => button.addEventListener('click', () => { const channel = model.psu.channels[Number(button.dataset.output)]; channel.enabled = !channel.enabled; update(); audio.play('relay'); }));
  el('psu-all').addEventListener('click', () => { const on = !model.psu.channels.some(c => c.enabled); model.psu.channels.forEach(c => c.enabled = on); update(); audio.play('relay'); });
  new EE.GestureEngine(el('scope-canvas'), scope, refreshReadings);
  el('response-plot').addEventListener('click', event => { if (!plotCap) return; const rect = event.target.getBoundingClientRect(); const t = Math.max(0, Math.min(1, (event.clientX - rect.left - 28) / (rect.width - 37))); model.generator.set('frequency', Math.round(50 * Math.pow(100, t))); update(); });
  all('[data-fault]').forEach(button => button.addEventListener('click', () => { cancel(); model.fault(button.dataset.fault); scope.run = true; scope.offset = [0, 0]; update(); hint(button.dataset.fault === 'ground' ? 'Ground clip is on A29. Turn the generator OUTPUT on to observe the short.' : 'Fault wired. Enable supply CH1 to observe the response.'); }));
  const outputsOff = () => !model.generator.enabled && !model.psu.channels.some(c => c.enabled);
  el('rear-open').addEventListener('click', () => { model.dmm.rearOpen = true; refreshControls(); setText('fuse-message', 'Switch all generator and supply outputs off before servicing.'); el('fuse-dialog').showModal(); });
  el('fuse-dialog').addEventListener('close', () => { model.dmm.rearOpen = false; });
  el('fuse-remove').addEventListener('click', () => { if (!outputsOff()) { setText('fuse-message', 'Outputs are still enabled. Switch them off before removing the fuse.'); return; } model.dmm.fuse = 'removed'; update(); setText('fuse-message', 'Fuse removed. Insert a fresh 3 A / 250 V ceramic fuse.'); });
  el('fuse-replace').addEventListener('click', () => { if (!model.dmm.replaceFuse(outputsOff())) { setText('fuse-message', 'Outputs must be off and the old fuse removed.'); return; } model.failure.active.delete('fuse'); update(); setText('fuse-message', 'New fuse installed. Correct the current-input wiring before enabling output.'); audio.play('switch'); });
  all('.mobile-tabs button').forEach(button => button.addEventListener('click', () => { document.body.dataset.view = button.dataset.view; all('.mobile-tabs button').forEach(b => b.classList.toggle('active', b === button)); requestAnimationFrame(() => { board.draw(model.parts, selectedPart); drawWires(); drawResponse(); }); }));
  window.addEventListener('languagechange', () => { board.draw(model.parts, selectedPart); drawWires(); drawResponse(); });
  window.addEventListener('resize', () => { board.draw(model.parts, selectedPart); drawWires(); drawResponse(); });
  window.addEventListener('scroll', drawWires, { passive: true });
  new ResizeObserver(() => { board.draw(model.parts, selectedPart); drawWires(); }).observe(el('breadboard'));
  let fpsTime = 0;
  function frame(time) { if (!document.hidden) { scope.draw(time); if (time - fpsTime > 1000) { setText('fps-status', scope.fps + ' FPS · ' + (scope.run ? 'RUN' : 'STOP')); fpsTime = time; } } requestAnimationFrame(frame); }
  load(); requestAnimationFrame(frame);
  // Explicit inspection surface for the deterministic regression runner and curriculum extensions.
  EE.bench = { model, board, scope, audio, worksheet, registry, update, load, endpoint, selectTerminal: chooseTerminal, cancelInteraction: cancel, interaction: () => ({ pending, placing }), hint, refreshReadings, cables, selectPart: id => { selectedPart = id; board.draw(model.parts, selectedPart); }, redraw: () => { board.draw(model.parts, selectedPart); drawWires(); drawResponse(); } };
})();
