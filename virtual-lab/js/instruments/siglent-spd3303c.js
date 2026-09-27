(() => {
  class SPD3303C {
    constructor() { this.channels = [1, 2, 3].map(() => ({ setVoltage: 5, limit: 3.2, enabled: false, voltage: 0, current: 0, mode: 'OFF' })); this.tracking = 'independent'; }
    sources() {
      return this.channels.filter(c => c.enabled).map(c => { const i = this.channels.indexOf(c) + 1; return { id: 'psu' + i, a: 'psu.' + i + '+', b: 'psu.' + i + '-', dc: c.setVoltage, resistance: 0.01 }; });
    }
    applyLimits(netlist) {
      // Active-set CV/CC solve. Recheck after topology and damage changes.
      for (const channel of this.channels) { channel.current = 0; channel.voltage = 0; channel.mode = channel.enabled ? 'CV' : 'OFF'; }
      for (let iteration = 0; iteration < 4; iteration++) {
        const solver = new EE.CircuitSolver(netlist), dc = solver.solve(0);
        let changed = false;
        for (let i = 0; i < 3; i++) {
          const channel = this.channels[i], source = netlist.sources.find(s => s.id === 'psu' + (i + 1));
          if (!source) continue;
          const short = solver.connected(source.a, source.b);
          const v = dc.between(source.a, source.b).re;
          const current = source.currentMode !== undefined ? channel.limit : Math.max(0, (source.dc - v) / source.resistance);
          channel.voltage = Math.max(0, v); channel.current = current;
          if (short || current > channel.limit + 1e-7) {
            channel.mode = 'CC'; channel.current = channel.limit;
            if (short) { channel.voltage = 0; source.dc = 0; }
            else if (source.currentMode === undefined) { source.currentMode = channel.limit; changed = true; }
          } else if (source.currentMode !== undefined) channel.mode = 'CC';
        }
        if (!changed) break;
      }
      return netlist;
    }
  }
  EE.SPD3303C = SPD3303C;
})();
