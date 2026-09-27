(() => {
  class HP33120A {
    constructor() {
      this.frequency = 300; this.vpp = 10; this.offset = 0; this.waveform = 'sine'; this.load = 'Hi-Z'; this.enabled = true; this.duty = 50;
      this.parameter = 'frequency'; this.digit = 1; this.shift = false; this.menu = null; this.entry = null; this.error = ''; this.rotation = 0;
    }
    set(parameter, value) {
      if (!Number.isFinite(value)) return;
      const maxFreq = this.waveform === 'triangle' ? 100000 : 15000000;
      const bounds = { frequency: [0.0001, maxFreq], vpp: this.load === 'Hi-Z' ? [0.1, 20] : [0.05, 10], offset: this.load === 'Hi-Z' ? [-10, 10] : [-5, 5], duty: this.frequency > 5e6 ? [40, 60] : [20, 80] };
      if (bounds[parameter]) this[parameter] = Math.min(bounds[parameter][1], Math.max(bounds[parameter][0], value));
      const peakLimit = this.load === 'Hi-Z' ? 10 : 5;
      this.offset = Math.max(-peakLimit + this.vpp / 2, Math.min(peakLimit - this.vpp / 2, this.offset));
      this.duty = Math.max(this.frequency > 5e6 ? 40 : 20, Math.min(this.frequency > 5e6 ? 60 : 80, this.duty));
    }
    setLoad(load) {
      if(!['Hi-Z','50Ω'].includes(load))return;
      if (load === this.load) return;
      const ratio = load === 'Hi-Z' ? 2 : 0.5;
      this.vpp *= ratio; this.offset *= ratio; this.load = load;
    }
    select(parameter) {
      this.parameter = parameter; this.digit = parameter === 'frequency' ? 0 : parameter === 'duty' ? 0 : -2;
      this.menu = null; this.entry = null; this.shift = false; this.error = '';
    }
    turn(direction) {
      this.rotation += direction * 18;
      if (this.menu) return this.navigate(direction > 0 ? 'right' : 'left');
      if (this.entry !== null) return;
      this.set(this.parameter, Number((this[this.parameter] + direction * 10 ** this.digit).toFixed(4)));
      this.error = '';
    }
    key(key) {
      if (key === 'shift') { this.shift = !this.shift; return; }
      const shifted = this.shift; this.shift = false; this.error = '';
      if (key === 'enter' && shifted) { this.menu = this.menu ? null : { level: 0, group: 0, item: 0, value: this.load }; this.entry = null; return; }
      if (key === 'number') { this.entry = shifted ? null : ''; this.menu = null; return; }
      if (key === 'offset' && shifted) { if (this.waveform === 'square') this.select('duty'); else this.error = 'SELECT SQUARE'; return; }
      if (['frequency', 'vpp', 'offset'].includes(key)) { this.select(key); return; }
      if (['left', 'right', 'up', 'down'].includes(key)) {
        if (this.entry !== null) {
          if (key === 'left') this.entry = this.entry.slice(0, -1);
          else this.commitEntry(key, shifted);
        } else this.navigate(key);
        return;
      }
      if (key === 'enter') {
        if (this.menu?.level === 2 && this.menu.group === 3 && this.menu.item === 0) { this.setLoad(this.menu.value); this.menu = null; }
        else if (this.menu) this.navigate('down');
        else if (this.entry !== null) this.commitEntry('enter', false);
        return;
      }
      if (this.entry !== null && /^[0-9.\-]$/.test(key)) {
        if (key === '-') this.entry = this.entry.startsWith('-') ? this.entry.slice(1) : '-' + this.entry;
        else if (this.entry.length < 12 && (key !== '.' || !this.entry.includes('.'))) this.entry += key;
      }
    }
    navigate(key) {
      const m = this.menu, delta = key === 'right' ? 1 : -1;
      if (m) {
        if (key === 'up') { if (m.level === 0) this.menu = null; else m.level--; }
        else if (key === 'down') { if (m.level < 2) m.level++; }
        else if (m.level === 0) { m.group = (m.group + delta + 6) % 6; m.item = 0; }
        else if (m.level === 1 && m.group === 3) m.item = (m.item + delta + 6) % 6;
        else if (m.level === 2 && m.group === 3 && m.item === 0) m.value = m.value === 'Hi-Z' ? '50Ω' : 'Hi-Z';
        return;
      }
      if (key === 'left' || key === 'right') this.digit = Math.max(this.parameter === 'frequency' ? -4 : this.parameter === 'duty' ? 0 : -2, Math.min(this.parameter === 'frequency' ? 7 : 1, this.digit + (key === 'left' ? 1 : -1)));
      else this.turn(key === 'up' ? 1 : -1);
    }
    commitEntry(unit, shifted) {
      const n = Number(this.entry);
      if (!this.entry || !Number.isFinite(n)) { this.error = 'INVALID NUMBER'; return; }
      let value = n;
      if (this.parameter === 'frequency') value *= unit === 'up' ? 1e6 : unit === 'down' ? 1e3 : 1;
      if (this.parameter === 'vpp') {
        if (unit === 'up' || unit === 'down') value *= shifted ? 1e-3 : 1;
        if (unit === 'down') value *= this.waveform === 'sine' ? 2 * Math.sqrt(2) : this.waveform === 'square' ? 2 : 2 * Math.sqrt(3);
        if (unit === 'right' && shifted) {
          if (this.load === 'Hi-Z') { this.error = 'USE 50 OHM LOAD'; return; }
          value = Math.sqrt(0.05 * 10 ** (n / 10)) * (this.waveform === 'sine' ? 2*Math.sqrt(2) : this.waveform === 'square' ? 2 : 2*Math.sqrt(3));
        }
      }
      if (this.parameter === 'offset' && shifted) value *= 1e-3;
      const previous = {frequency:this.frequency,vpp:this.vpp,offset:this.offset,duty:this.duty}; this.set(this.parameter, value);
      if (Math.abs(this[this.parameter] - value) > 1e-7) { Object.assign(this,previous); this.error = 'OUT OF RANGE'; return; }
      this.entry = null;
    }
    display() {
      if (this.error) return { text: this.error, unit: '', digit: -1 };
      if (this.menu) {
        const m = this.menu, groups = ['A: MOD MENU', 'B: SWP MENU', 'C: EDIT MENU', 'D: SYS MENU', 'E: I/O MENU', 'F: CAL MENU'];
        const items = ['1: OUT TERM', '2: POWER ON', '3: ERROR', '4: TEST', '5: COMMA', '6: REVISION'];
        return { text: m.level === 0 ? groups[m.group] : m.group === 3 ? m.level === 1 ? items[m.item] : m.item === 0 ? (m.value === 'Hi-Z' ? 'HIGH Z' : '50 OHM') : m.item === 2 ? '0: NO ERROR' : 'NOT AVAILABLE' : 'NOT AVAILABLE', unit: '', digit: -1 };
      }
      if (this.entry !== null) return { text: this.entry || '0', unit: 'ENTER', digit: -1 };
      const p = this.parameter, value = this[p];
      const power = p === 'frequency' ? Math.min(value>=1e6?6:value>=1e3?3:0,Math.max(0,Math.floor((this.digit+4)/3)*3)) : 0;
      const decimals = p === 'frequency' ? 4 : 2, text = (value / 10 ** power).toFixed(decimals);
      const decimal = text.indexOf('.'), position = decimal - 1 - (this.digit - power);
      return { text, unit: p === 'frequency' ? ['Hz', 'kHz', 'MHz'][power / 3] : p === 'vpp' ? 'Vpp' : p === 'duty' ? '%' : 'VDC', digit: position >= decimal ? position + 1 : position };
    }
    source() {
      const multiplier = this.load === '50Ω' ? 2 : 1;
      const amplitude = this.enabled ? this.vpp / 2 * multiplier : 0;
      return { id: 'generator', a: 'gen.out', b: 'gen.gnd', resistance: 50, frequency: this.frequency, dc: this.enabled ? this.offset * multiplier + (this.waveform === 'square' ? amplitude * (2 * this.duty / 100 - 1) : 0) : 0,
        phasor: h => {
          if (this.waveform === 'sine') return EE.Complex.C(h === 1 ? amplitude : 0);
          if (this.waveform === 'square') return EE.Complex.C(amplitude * 4 / Math.PI * Math.sin(h * Math.PI * this.duty / 100) / h);
          if (h % 2 === 0) return EE.Complex.C();
          return EE.Complex.C(amplitude * 8 / (Math.PI * Math.PI * h * h));
        } };
    }
    syncSource() { return { id: 'sync', a: 'gen.sync', b: 'gen.gnd', resistance: 50, dc: this.enabled ? 2.5 : 0, phasor: h => EE.Complex.C(this.enabled ? 10 / Math.PI * Math.sin(h * Math.PI / 2) / h : 0) }; }
  }
  EE.HP33120A = HP33120A;
})();
