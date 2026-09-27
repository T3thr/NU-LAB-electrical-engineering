/* Reversible bench commands. Derived readings are recomputed, never replayed as fake values. */
(() => {
  if (typeof document === 'undefined') return;
  const copy = value => JSON.parse(JSON.stringify(value));
  const scopeKeys = EE.scopeStateKeys;
  const pick = (object, keys) => Object.fromEntries(keys.map(key => [key, copy(object[key])]));
  class CommandHistory {
    constructor(bench) {
      this.bench = bench; this.past = []; this.future = []; this.log = []; this.locked = false; this.group = null;
      this.current = this.snapshot();
    }
    snapshot() {
      const m = this.bench.model, s = this.bench.scope;
      return copy({ parts:m.parts, wires:m.wires, sequence:m.sequence, experiment:m.experiment,
        generator:pick(m.generator,['frequency','vpp','offset','waveform','load','enabled','duty']), supply:m.psu.channels.map(c => pick(c,['setVoltage','limit','enabled'])),
        meter:pick(m.dmm,['mode','nullValue','fuse']), termination:m.termination,
        failure:{active:[...m.failure.active],history:m.failure.history},
        scope:pick(s,scopeKeys), frozen:!s.run ? s.signals : null,
        layout:EE.scene?.boardOffset || [0,0] });
    }
    describe(before, after) {
      if (before.parts.length < after.parts.length) return 'Place component';
      if (before.parts.length > after.parts.length) return 'Remove component';
      if (before.wires.length < after.wires.length) return 'Connect lead';
      if (before.wires.length > after.wires.length) return 'Unplug lead';
      if (JSON.stringify(before.parts) !== JSON.stringify(after.parts)) return 'Change component';
      if (JSON.stringify(before.wires) !== JSON.stringify(after.wires)) return 'Move lead';
      if (JSON.stringify(before.generator) !== JSON.stringify(after.generator)) return 'Set generator';
      if (JSON.stringify(before.supply) !== JSON.stringify(after.supply)) return 'Set power supply';
      if (JSON.stringify(before.meter) !== JSON.stringify(after.meter)) return 'Set multimeter';
      if (JSON.stringify(before.layout) !== JSON.stringify(after.layout)) return 'Move breadboard';
      return 'Adjust oscilloscope';
    }
    record(label) {
      if (this.locked) return;
      const next = this.snapshot();
      if (JSON.stringify(next) === JSON.stringify(this.current)) return;
      if (this.group) { this.group.label ||= label; return; }
      this.past.push({before:this.current,after:next,label:label || this.describe(this.current,next)});
      if (this.past.length > 100) this.past.shift();
      this.future = []; this.current = next;
      this.note(this.past.at(-1).label);
      this.changed();
    }
    begin(label) { if (!this.group) this.group = {label}; }
    end() { if (!this.group) return; const label=this.group.label;this.group=null;this.record(label); }
    transact(label, action) { this.begin(label);try { action(); } finally { this.end(); } }
    restore(state) {
      this.locked = true;
      try {
        const m=this.bench.model,s=this.bench.scope,data=copy(state);
        this.bench.cancelInteraction(); EE.interaction?.clearSelection();
        m.parts=data.parts;m.wires=data.wires;m.sequence=data.sequence;m.experiment=data.experiment;
        Object.assign(m.generator,data.generator);
        m.generator.menu=null;m.generator.entry=null;m.generator.shift=false;m.generator.error='';
        m.psu.channels.forEach((c,i)=>Object.assign(c,data.supply[i]));
        Object.assign(m.dmm,data.meter);m.termination=data.termination;
        m.failure.active=new Set(data.failure.active);m.failure.history=data.failure.history;
        Object.assign(s,data.scope);
        if(EE.scene)EE.scene.boardOffset=data.layout || [0,0];
        if(data.frozen) s.signals=data.frozen.map(signal=>({...signal,sample:time=>signal.offset+signal.terms.reduce((sum,term)=>{const angle=2*Math.PI*signal.frequency*term.h*time;return sum+term.re*Math.cos(angle)-term.im*Math.sin(angle);},0)}));
        this.bench.update();
        if(EE.scene)EE.scene.lastTexture=0;
      } finally { this.locked=false;this.current=this.snapshot();this.changed(); }
    }
    undo() {
      this.end();const command=this.past.pop();if(!command)return false;
      this.future.push(command);this.restore(command.before);this.note('Undo',command.label);this.changed();return true;
    }
    redo() {
      this.end();const command=this.future.pop();if(!command)return false;
      this.past.push(command);this.restore(command.after);this.note('Redo',command.label);this.changed();return true;
    }
    note(label,detail='') { this.log.unshift({label,detail,time:Date.now()});this.log.length=Math.min(this.log.length,200); }
    changed() { window.dispatchEvent(new CustomEvent('benchchange')); }
  }
  EE.CommandHistory=CommandHistory;EE.history=new CommandHistory(EE.bench);
})();
