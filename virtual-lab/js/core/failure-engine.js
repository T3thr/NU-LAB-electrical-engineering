(() => {
  class FailureEngine {
    constructor(onEvent) { this.onEvent = onEvent; this.active = new Set(); this.history = []; }
    emit(key, message, kind, part) {
      if (this.active.has(key)) return;
      this.active.add(key); const event = { key, message, kind, part, time: Date.now() }; this.history.unshift(event); this.history.length = Math.min(this.history.length, 30); this.onEvent(event);
    }
    groundCheck(result, wires) {
      const current = new Set();
      for (const ground of ['scope.g1', 'scope.g2']) {
        if (!wires.some(w => w.a === ground || w.b === ground)) continue;
        if (result.signal(ground).totalRms > 0.02) { current.add(ground); this.emit(ground, 'Earth clip shorts an active node. Move the black clip to the common return.', 'arc', ground); }
      }
      for (const key of ['scope.g1', 'scope.g2']) if (!current.has(key)) this.active.delete(key);
    }
    evaluate(result, parts, dmm, psu) {
      let changed = false;
      if (dmm.evaluate(result)) { changed = true; this.emit('fuse', 'The current shunt exceeded 3 A. Fuse open. Disconnect outputs, open the rear compartment, and replace the fuse.', 'pop', 'dmm.i'); }
      for (const part of parts) {
        if (part.state !== 'good') continue;
        const s = result.signal(part.a, part.b);
        if (part.type === 'R' && s.totalRms * s.totalRms / part.value > part.rating) {
          part.state = 'burnt'; changed = true; this.emit(part.id, part.id + ' dissipated ' + (s.totalRms * s.totalRms / part.value).toFixed(3) + ' W, exceeding 0.25 W. The resistor is now open.', 'smoke', part.a);
        }
        if (part.type === 'C' && part.value >= 1e-6 && s.offset < -1.5) {
          part.state = 'ruptured'; changed = true; this.emit(part.id, part.id + ' has ' + (-s.offset).toFixed(2) + ' V reverse DC bias. The ruptured capacitor is a 0.01 Ω short.', 'pop', part.a);
        }
      }
      psu.channels.forEach((c, i) => { const key = 'cc' + i; if (c.mode === 'CC') this.emit(key, 'Supply CH' + (i + 1) + ' entered constant-current protection at ' + c.limit.toFixed(3) + ' A. Remove the overload to restore CV.', 'relay', 'psu.' + (i + 1) + '+'); else this.active.delete(key); });
      return changed;
    }
    reset() { this.active.clear(); this.history = []; }
  }
  EE.FailureEngine = FailureEngine;
})();
