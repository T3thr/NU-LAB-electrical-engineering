(() => {
  class AudioSynthesizer {
    constructor() { this.enabled = false; this.context = null; this.seed = 13; }
    async unlock() {
      const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!Context) return false;
      try { this.context = this.context || new Context(); await this.context.resume(); return true; } catch { return false; }
    }
    tone(frequency, start, duration, volume) {
      const ctx = this.context, osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.frequency.value = frequency; gain.gain.setValueAtTime(volume, start); gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain).connect(ctx.destination); osc.start(start); osc.stop(start + duration);
    }
    play(kind = 'switch') {
      if (!this.enabled || !this.context || this.context.state !== 'running') return;
      const ctx = this.context, time = ctx.currentTime;
      if (kind === 'success') { [659.25,830.61,987.77].forEach((note,i)=>this.tone(note,time+i*.075,.20,.035)); return; }
      if (kind === 'detent') return this.tone(2500, time, 0.008, 0.05);
      if (kind === 'relay') { this.tone(1800, time, 0.008, 0.05); this.tone(2200, time + 0.015, 0.008, 0.05); return; }
      if (kind === 'pop' || kind === 'arc') {
        const duration = kind === 'pop' ? 0.22 : 0.07, buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate), data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) { this.seed = (1664525 * this.seed + 1013904223) >>> 0; data[i] = (this.seed / 2147483648 - 1) * Math.exp(-i / (data.length / 7)); }
        const source = ctx.createBufferSource(), high = ctx.createBiquadFilter(), low = ctx.createBiquadFilter(), gain = ctx.createGain();
        source.buffer = buffer; high.type = 'highpass'; high.frequency.value = 800; low.type = 'lowpass'; low.frequency.value = 4000; gain.gain.value = 0.22;
        source.connect(high).connect(low).connect(gain).connect(ctx.destination); source.start(); return;
      }
      this.tone(50, time, 0.045, 0.09); this.tone(1200, time + 0.006, 0.02, 0.06);
    }
  }
  EE.AudioSynthesizer = AudioSynthesizer;
})();
