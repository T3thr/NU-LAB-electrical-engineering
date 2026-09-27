(() => {
  class LabRegistry {
    constructor() { this.labs = new Map(); }
    register(lab) {
      if (!Number.isInteger(lab.id) || lab.id < 1 || lab.id > 9 || typeof lab.create !== 'function') throw new Error('Lab registration requires id 1–9 and create().');
      if (this.labs.has(lab.id)) throw new Error('Lab already registered.');
      this.labs.set(lab.id, lab);
    }
    get(id) { const lab = this.labs.get(Number(id)); if (!lab) throw new Error('This curriculum module has not been installed.'); return lab; }
    activate(id, simulation, options = {}) { simulation.lab = this.get(id); simulation.load(options); return simulation; }
    list() { return [...this.labs.values()]; }
  }
  EE.LabRegistry = LabRegistry;
})();
