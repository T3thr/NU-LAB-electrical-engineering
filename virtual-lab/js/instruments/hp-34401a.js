(() => {
  class HP34401A {
    constructor() { this.mode = 'AC V'; this.fuse = 'good'; this.rearOpen = false; this.nullValue = 0; this.value = 0; this.unit = 'V'; this.message = ''; }
    components() {
      const parts = [{ id: 'dmm-input', type: 'R', value: 1e7, a: 'dmm.hi', b: 'dmm.lo' }];
      if (this.fuse === 'good') parts.push({ id: 'dmm-shunt', type: 'R', value: 0.1, a: 'dmm.i', b: 'dmm.lo' });
      return parts;
    }
    evaluate(result) {
      const shunt = result.signal('dmm.i', 'dmm.lo');
      if (this.fuse === 'good' && shunt.totalRms / 0.1 > 3 + 1e-6) { this.fuse = 'blown'; return 'fuse'; }
      return null;
    }
    read(result, resistance = Infinity) {
      const s = result.signal(this.mode.includes(' A') ? 'dmm.i' : 'dmm.hi', 'dmm.lo');
      this.message = '';
      this.unit = this.mode.includes(' A') ? 'A' : this.mode === 'Hz' ? 'Hz' : this.mode === 'Ω' ? 'Ω' : 'V';
      if (this.unit === 'A' && this.fuse !== 'good') { this.value = 0; this.message = 'FUSE OPEN · 0.000 A'; return; }
      if (this.mode === 'AC V') this.value = s.rms;
      if (this.mode === 'DC V') this.value = s.offset;
      if (this.mode === 'DC A') this.value = s.offset / 0.1;
      if (this.mode === 'AC A') this.value = s.rms / 0.1;
      if (this.mode === 'Hz') this.value = s.vpp > 0.01 && s.frequency >= 3 && s.frequency <= 300000 ? s.frequency : 0;
      if (this.mode === 'Ω') { this.value = resistance; if (s.totalRms > 0.05) this.message = 'LIVE CIRCUIT'; }
      if ((this.mode === 'AC V' && (s.rms > 750 || (s.rms > 0.001 && (s.frequency < 3 || s.frequency > 300000)))) || (this.mode === 'DC V' && Math.abs(s.offset) > 1000)) this.message = 'OVERLOAD / RANGE';
      this.value -= this.nullValue;
    }
    replaceFuse(outputsOff) { if (!outputsOff || !this.rearOpen || this.fuse !== 'removed') return false; this.fuse = 'good'; return true; }
  }
  EE.HP34401A = HP34401A;
})();
