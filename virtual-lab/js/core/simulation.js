(() => {
  class Simulation {
    constructor(buses, onEvent = () => {}, lab = EE.Lab7) {
      this.lab = lab; this.buses = buses; this.generator = new EE.HP33120A(); this.psu = new EE.SPD3303C(); this.dmm = new EE.HP34401A(); this.failure = new EE.FailureEngine(onEvent); this.parts = []; this.wires = []; this.termination = [1e6, 1e6]; this.sequence = 20; this.experiment = '7.1';
    }
    netlist(groundClips = true) {
      const compConnected = this.wires.some(w => w.a === 'scope.comp' || w.b === 'scope.comp');
      return { buses: this.buses, wires: this.wires, grounds: ['gen.gnd', 'psu.gnd', 'scope.compGround', ...(groundClips ? ['scope.g1', 'scope.g2'] : [])], components: [...this.parts.map(p => ({ ...p })), ...this.dmm.components(), ...[0, 1].map(i => ({ id: 'scope-input-' + i, type: 'R', value: this.termination[i], a: 'scope.ch' + (i + 1), b: 'earth' }))], sources: [this.generator.source(), this.generator.syncSource(), ...this.psu.sources(), ...(compConnected ? [EE.probeCompSource()] : [])] };
    }
    solve(groundClips = true) {
      const netlist = this.psu.applyLimits(this.netlist(groundClips));
      const syncConnected = this.wires.some(w => w.a === 'gen.sync' || w.b === 'gen.sync');
      if (netlist.sources.some(s => s.id === 'probe-comp') || this.generator.waveform === 'square' && this.generator.duty !== 50) return EE.analyzeSources(netlist, this.generator.frequency);
      return new EE.CircuitSolver(netlist).analyze(this.generator.frequency, this.generator.waveform === 'sine' && !syncConnected ? 1 : 61);
    }
    compute() {
      this.failure.groundCheck(this.solve(false), this.wires);
      for (let pass = 0; pass < 5; pass++) {
        this.result = this.solve();
        if (!this.failure.evaluate(this.result, this.parts, this.dmm, this.psu)) break;
      }
      this.signals = [this.result.signal('scope.ch1'), this.result.signal('scope.ch2')];
      this.dmm.read(this.result, this.dmm.mode === 'Ω' ? this.resistance() : Infinity);
      this.anomaly = this.generator.enabled && this.result.connected('scope.ch1', 'scope.ch2') && this.signals[0].vpp > 0.1;
      return this.result;
    }
    resistance() {
      const netlist = this.netlist(); netlist.components = netlist.components.filter(p => p.id !== 'dmm-input'); netlist.sources = [{ a: 'dmm.hi', b: 'dmm.lo', currentMode: 0.001, resistance: 1e12 }]; netlist.grounds.push('dmm.lo');
      const value = new EE.CircuitSolver(netlist).solve(0).between('dmm.hi', 'dmm.lo').re / 0.001;
      return value > 1e8 ? Infinity : Math.max(0, value);
    }
    wire(a, b, color = '#c67845') {
      if (a === b || this.wires.some(w => (w.a === a && w.b === b) || (w.a === b && w.b === a))) return false;
      this.wires.push({ id: 'w' + this.sequence++, a, b, color }); return true;
    }
    load(options = {}) {
      const config = this.lab.create(options); this.parts = config.parts; this.wires = config.wires; this.experiment = options.series ? '7.3' : (options.experiment || '7.1');
      this.generator = new EE.HP33120A(); this.psu = new EE.SPD3303C(); this.dmm = new EE.HP34401A(); this.termination = [1e6, 1e6]; this.generator.frequency = config.frequency || 300; this.failure.reset();
      if (config.generator) {
        const g = config.generator;
        if (['sine', 'square', 'triangle'].includes(g.waveform)) this.generator.waveform = g.waveform;
        if (['Hi-Z', '50Ω'].includes(g.load)) this.generator.load = g.load;
        for (const key of ['frequency', 'vpp', 'offset']) if (g[key] !== undefined) this.generator.set(key, g[key]);
        if (g.enabled !== undefined) this.generator.enabled = !!g.enabled;
      }
      if (config.supply) config.supply.slice(0, 3).forEach((c, i) => { const channel = this.psu.channels[i]; channel.setVoltage = Math.max(0, Math.min(i === 2 ? 5 : 32, c.voltage ?? 5)); channel.limit = Math.max(0.001, Math.min(3.2, c.limit ?? 3.2)); channel.enabled = !!c.enabled; });
      if (config.meter && ['AC V', 'DC V', 'AC A', 'DC A', 'Ω', 'Hz'].includes(config.meter.mode)) this.dmm.mode = config.meter.mode;
      this.compute();
      // Match the prescribed voltage at the loaded INPUT, as when adjusting from CH1 on a bench.
      if (this.lab.id === 7 && this.signals[0].vpp > 0.001) this.generator.set('vpp', this.generator.vpp * (options.input || 10) / this.signals[0].vpp);
      this.compute();
    }
    fault(kind) {
      this.load(); this.generator.enabled = false; this.experiment = 'free'; this.wires = []; this.parts = [];
      const wire = (a, b) => this.wire(a, b);
      if (kind === 'ground') {
        const config = EE.Lab7.create(); this.parts = config.parts; this.wires = config.wires.filter(w => w.a !== 'scope.g2'); wire('scope.g2', 'A29');
      } else {
        wire('psu.1-', 'A49'); wire('A49', 'gen.gnd'); wire('scope.ch1', 'A12'); wire('scope.g1', 'A49'); wire('scope.g2', 'A49');
        if (kind === 'fuse') { wire('psu.1+', 'A12'); wire('dmm.i', 'A12'); wire('dmm.lo', 'A49'); this.dmm.mode = 'DC A'; }
        if (kind === 'resistor') { wire('psu.1+', 'A12'); this.parts.push(EE.ComponentPalette.create('R', 1000, 'E12', 'E49', 'R1')); this.psu.channels[0].setVoltage = 25; wire('dmm.hi', 'A12'); wire('dmm.lo', 'A49'); this.dmm.mode = 'DC V'; }
        if (kind === 'capacitor') { wire('psu.1+', 'A29'); wire('A29', 'A12'); this.parts.push(EE.ComponentPalette.create('C', 2.2e-6, 'D49', 'D29', 'C1')); wire('scope.ch2', 'A29'); }
        if (kind === 'supply') { wire('psu.1+', 'A12'); wire('A12', 'A49'); }
      }
      this.compute();
    }
    equivalentCapacitance() {
      const caps = this.parts.filter(p => p.type === 'C' && p.state === 'good');
      const resistors = this.parts.filter(p => p.type === 'R' && p.state === 'good');
      if (resistors.length !== 1 || caps.length < 1 || caps.length > 2) return null;
      const connected = this.result.connected, r = resistors[0];
      if (!(connected(r.a, 'A12') && connected(r.b, 'A29') || connected(r.b, 'A12') && connected(r.a, 'A29'))) return null;
      const joins = (p, a, b) => connected(p.a, a) && connected(p.b, b) || connected(p.b, a) && connected(p.a, b);
      if (caps.length === 1) return joins(caps[0], 'A29', 'A49') ? caps[0].value : null;
      for (const [p, q] of [[caps[0], caps[1]], [caps[1], caps[0]]]) for (const mid of [p.a, p.b]) if (!connected(mid, 'A29') && !connected(mid, 'A49') && joins(p, 'A29', mid) && joins(q, mid, 'A49')) return 1 / (1 / p.value + 1 / q.value);
      return null;
    }
  }
  EE.Simulation = Simulation;
})();
