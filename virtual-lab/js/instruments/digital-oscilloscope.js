(() => {
  const volts = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5];
  const times = [0.00005, 0.0001, 0.0002, 0.0005, 0.001, 0.002, 0.005];
  const formatVolts = v => v < 1 ? (v * 1000).toFixed(0) + ' mV' : v.toFixed(2) + ' V';
  const formatTime = t => Math.abs(t) < 0.001 ? (t * 1e6).toFixed(1) + ' µs' : (t * 1e3).toFixed(3) + ' ms';
  class DigitalOscilloscope {
    constructor(canvas) {
      this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.scale = [7, 7]; this.timeIndex = 4; this.offset = [0, 0]; this.timeOffset = 0; this.active = 1; this.run = true; this.single = false; this.cursors = false; this.cursor = [0.4, 0.6]; this.signals = null; this.triggerLevel = 0; this.coupling = ['DC', 'DC']; this.termination = [1e6, 1e6]; this.enabled = [true, true]; this.frames = 0; this.fps = 0; this.lastFrame = 0; this.lastMeasure = 0;
      this.menu = 'channel'; this.entryTarget = null; this.choice = null; this.triggerSource = 0; this.triggerSlope = 'Rising'; this.triggerMode = 'Auto'; this.acquisition = 'Normal'; this.averageCount = 8;
      this.cursorMode = 'Manual'; this.cursorSource = 0; this.cursorSelected = 'X1'; this.cursorUnits = 'Seconds'; this.yCursor = [-1, 1]; this.invert = [false, false]; this.probe = [1, 1]; this.measurement = 'Pk-Pk'; this.measureSource = 0; this.measurements = [{type:'Pk-Pk',source:0},{type:'Pk-Pk',source:1},{type:'Frequency',source:0},{type:'Phase',source:1}];
    }
    get timeDiv() { return times[this.timeIndex]; }
    get voltsDiv() { return this.scale.map(i => volts[i]); }
    step(kind, direction) {
      if (kind === 'time') this.timeIndex = Math.max(0, Math.min(times.length - 1, this.timeIndex + direction));
      else { const ch = kind === 'ch1' ? 0 : 1; this.active = ch; this.scale[ch] = Math.max(0, Math.min(volts.length - 1, this.scale[ch] + direction)); }
    }
    trigger(signals = this.signals) {
      const s = signals?.[this.triggerSource];
      if (!s?.sample || s.vpp < 0.001 || this.coupling[this.triggerSource] === 'GND' || !this.enabled[this.triggerSource]) return null;
      const level = this.triggerLevel;
      const rising = this.triggerSlope === 'Rising', period = 1 / s.frequency;
      let a = -period / 2, va = this.voltage(s,a,this.triggerSource) - level;
      for (let i = 1; i <= 512; i++) {
        let b = (i / 512 - 0.5) * period, vb = this.voltage(s,b,this.triggerSource) - level;
        if (rising ? va < 0 && vb >= 0 : va > 0 && vb <= 0) {
          let lo = a, hi = b;
          for (let j = 0; j < 24; j++) { const mid = (lo + hi) / 2, v = this.voltage(s,mid,this.triggerSource) - level; if (rising ? v < 0 : v > 0) lo = mid; else hi = mid; }
          return (lo + hi) / 2;
        }
        a = b; va = vb;
      }
      return null;
    }
    acquire(signals) {
      this.latest = signals;
      this.triggered = this.trigger(signals) !== null;
      if (this.run || this.single || !this.signals) {
        if ((this.single || this.triggerMode === 'Normal') && !this.triggered && signals[0]?.sample) return;
        this.signals = signals;
        if (this.single) { this.single = false; this.run = false; }
      }
    }
    get status() { return this.single ? 'Armed' : !this.run ? 'Stop' : this.triggered ? "Trig'd" : this.triggerMode === 'Normal' ? 'Wait' : 'Auto'; }
    reset() {
      const defaults = new DigitalOscilloscope(this.canvas);
      for (const key of EE.scopeStateKeys) this[key] = defaults[key];
      this.acquire(this.latest || this.signals);
    }
    openMenu(menu) { this.menu = menu; this.choice = null; this.entryTarget = menu === 'cursors' ? 'cursor' : null; }
    channel(ch) { if (this.menu === 'channel' && this.active === ch) this.enabled[ch] = !this.enabled[ch]; else this.enabled[ch] = true; this.active = ch; this.openMenu('channel'); }
    choose(target, values) { this.choice = { target, values, index: Math.max(0, values.indexOf(this[target])) }; this.entryTarget = 'choice'; }
    selectEntry() {
      if (!this.choice) { if (this.menu === 'cursors') this.cursorSelected = this.cursorSelected === 'X1' ? 'X2' : 'X1'; return; }
      this[this.choice.target] = this.choice.values[this.choice.index]; this.choice = null;
      this.entryTarget = this.menu === 'cursors' ? 'cursor' : null;
    }
    entryStep(direction) {
      if (this.choice) { this.choice.index = (this.choice.index + direction + this.choice.values.length) % this.choice.values.length; return; }
      if (this.entryTarget === 'cursor') {
        const index = this.cursorSelected.endsWith('2') ? 1 : 0;
        if (this.cursorSelected.startsWith('Y')) this.yCursor[index] += direction * this.voltsDiv[this.cursorSource] / 50;
        else if (this.cursorSelected === 'X1 X2') { const delta = Math.max(-this.cursor[0], Math.min(1-this.cursor[1], direction / 500)); this.cursor = this.cursor.map(x=>x+delta); }
        else this.cursor[index] = Math.max(0, Math.min(1, this.cursor[index] + direction / 500));
      }
      if (this.entryTarget === 'averageCount') this.averageCount = Math.max(2, Math.min(65536, this.averageCount * 2 ** direction));
    }
    softkey(index) {
      this.choice = null;
      const ch = this.active;
      if (this.menu === 'channel') {
        if (index === 0) this.coupling[ch] = this.coupling[ch] === 'DC' ? 'AC' : this.coupling[ch] === 'AC' ? 'GND' : 'DC';
        if (index === 1) this.invert[ch] = !this.invert[ch];
        if (index === 2) this.probe[ch] = this.probe[ch] === 1 ? 10 : 1;
        if (index === 5) this.enabled[ch] = !this.enabled[ch];
      } else if (this.menu === 'cursors') {
        if (index === 0) this.choose('cursorMode', ['Manual', 'Track Waveform']);
        if (index === 1) this.cursorSource = 1 - this.cursorSource;
        if (index === 2) this.choose('cursorSelected', ['X1', 'X2', 'Y1', 'Y2', 'X1 X2']);
        if (index === 3) this.cursorUnits = this.cursorUnits === 'Seconds' ? 'Degrees' : 'Seconds';
        if (index === 4 || index === 5) { this.cursorSelected = index === 4 ? 'X1' : 'X2'; this.entryTarget = 'cursor'; }
      } else if (this.menu === 'trigger') {
        if (index === 1) this.triggerSource = 1 - this.triggerSource;
        if (index === 2) this.triggerSlope = this.triggerSlope === 'Rising' ? 'Falling' : 'Rising';
        if (index === 3) this.triggerMode = this.triggerMode === 'Auto' ? 'Normal' : 'Auto';
        if (index === 4) this.triggerLevel = (this.signals?.[this.triggerSource]?.offset || 0) * this.probe[this.triggerSource];
      } else if (this.menu === 'measure') {
        if (index === 0) this.measureSource = 1 - this.measureSource;
        if (index === 1) this.choose('measurement', ['Pk-Pk','Frequency','Period','RMS','Mean','Phase','Delay']);
        if (index === 2) { this.measurements.push({type:this.measurement,source:this.measureSource}); this.measurements = this.measurements.slice(-4); }
        if (index === 4) this.measurements.pop();
        if (index === 5) this.measurements = [];
      } else if (this.menu === 'acquire') {
        if (index === 0) this.choose('acquisition', ['Normal','Peak Detect','Average','High Resolution']);
        if (index === 1) this.entryTarget = 'averageCount';
      }
    }
    softkeys() {
      if (this.menu === 'channel') return [['Coupling',this.coupling[this.active]],['Invert',this.invert[this.active]?'On':'Off'],['Probe',this.probe[this.active]+':1'],['Input','1 MOhm'],['', ''],['Channel',this.enabled[this.active]?'On':'Off']];
      if (this.menu === 'cursors') return [['Mode',this.cursorMode],['Source',String(this.cursorSource+1)],['Cursors',this.cursorSelected],['Units',this.cursorUnits],['X1',this.cursorPosition(0)],['X2',this.cursorPosition(1)]];
      if (this.menu === 'trigger') return [['Type','Edge'],['Source',String(this.triggerSource+1)],['Slope',this.triggerSlope],['Mode',this.triggerMode],['Level','50%'],['','']];
      if (this.menu === 'measure') return [['Source',String(this.measureSource+1)],['Type',this.measurement],['Add','Measurement'],['',''],['Clear','Last'],['Clear','All']];
      return [['Acq Mode',this.acquisition],['Averages',String(this.averageCount)],['',''],['',''],['',''],['','']];
    }
    cursorPosition(index) {
      const time = (this.cursor[index] - .5) * 10 * this.timeDiv + this.timeOffset, source = this.signals?.[this.cursorSource];
      if (this.cursorUnits === 'Seconds') return EE.formatTime(time);
      return source?.vpp > .001 && !source.multiTone ? (360 * source.frequency * time).toFixed(2) + '°' : '--';
    }
    voltage(signal, time, ch) { return this.coupling[ch] === 'GND' ? 0 : (signal.sample(time) - (this.coupling[ch] === 'AC' ? signal.offset : 0)) * this.probe[ch] * (this.invert[ch] ? -1 : 1); }
    measurementValue(type, ch) {
      const s = this.signals?.[ch]; if (!s || !this.enabled[ch] || this.coupling[ch] === 'GND') return '--';
      if (type === 'Pk-Pk') return (s.vpp*this.probe[ch]).toFixed(2)+' V';
      if (type === 'Mean') return (this.coupling[ch] === 'AC' ? 0 : s.offset*this.probe[ch]*(this.invert[ch]?-1:1)).toFixed(3)+' V';
      if (type === 'RMS') return ((this.coupling[ch] === 'AC' ? s.rms : s.totalRms)*this.probe[ch]).toFixed(3)+' V';
      if (s.vpp < .001 || s.multiTone) return '--';
      if (type === 'Frequency') return s.frequency>=1000?(s.frequency/1000).toFixed(3)+' kHz':s.frequency.toFixed(1)+' Hz';
      if (type === 'Period') return EE.formatTime(1/s.frequency);
      const phase = this.phaseDifference();
      return phase === null ? '--' : type === 'Phase' ? phase.toFixed(2)+'°' : EE.formatTime(-phase/(360*s.frequency));
    }
    autoScale() {
      if (!this.signals) return;
      this.signals.forEach((s, ch) => { const i = volts.findIndex(v => v >= s.vpp * this.probe[ch] / 6); this.scale[ch] = i < 0 ? volts.length - 1 : i; });
      const source = this.signals.find(s=>s.vpp>.001) || this.signals[0], wanted = 0.2 / source.frequency;
      this.timeIndex = times.reduce((best, value, i) => Math.abs(Math.log(value / wanted)) < Math.abs(Math.log(times[best] / wanted)) ? i : best, 0);
      this.offset = this.signals.map((s,ch)=>(this.coupling[ch]==='DC'?-s.offset*this.probe[ch]*(this.invert[ch]?-1:1)/this.voltsDiv[ch]:0)||0); this.timeOffset = 0;
      this.triggerSource=Math.max(0,this.signals.findIndex(s=>s.vpp>.001));this.triggerLevel=this.coupling[this.triggerSource]==='DC'?source.offset*this.probe[this.triggerSource]:0;
      this.triggered=this.trigger()!==null;
    }
    graticule() { return { x: 19, y: 18, w: (this.canvas.clientWidth || this.fallbackSize?.width || 0) - 31, h: (this.canvas.clientHeight || this.fallbackSize?.height || 0) - 42 }; }
    cursorVoltages() {
      if(this.cursorMode!=='Track Waveform'||!this.signals)return this.yCursor;
      const s=this.signals[this.cursorSource],triggerTime=this.trigger()??0;
      return this.cursor.map(x=>this.voltage(s,(x-.5)*10*this.timeDiv+this.timeOffset+triggerTime,this.cursorSource));
    }
    cursorReading() { const dt = (this.cursor[1] - this.cursor[0]) * 10 * this.timeDiv, source=this.signals?.[this.cursorSource],y=this.cursorVoltages(); return { dt, dy:y[1]-y[0], phase: source?.vpp>.001 && !source.multiTone ? -source.frequency * dt * 360 : null }; }
    phaseDifference() { if (!this.signals || this.signals.some((s,ch) => s.vpp < 1e-7 || s.multiTone || !this.enabled[ch] || this.coupling[ch] === 'GND') || Math.abs(this.signals[0].frequency-this.signals[1].frequency)>1e-6) return null; let phi = (this.signals[1].phase - this.signals[0].phase) * 180 / Math.PI + (this.invert[1]?180:0)-(this.invert[0]?180:0); while (phi > 180) phi -= 360; while (phi < -180) phi += 360; return phi; }
    draw(timestamp) {
      const c = this.canvas, ctx = this.ctx, dpr = globalThis.devicePixelRatio || 1;
      const w = c.clientWidth || this.fallbackSize?.width, h = c.clientHeight || this.fallbackSize?.height; if (!w || !h) return;
      if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = '#0b1519'; ctx.fillRect(0, 0, w, h);
      const g = this.graticule();
      ctx.strokeStyle = '#435056'; ctx.lineWidth = 0.65; ctx.beginPath();
      for (let i = 0; i <= 10; i++) { const x = g.x + g.w * i / 10; ctx.moveTo(x, g.y); ctx.lineTo(x, g.y + g.h); }
      for (let j = 0; j <= 8; j++) { const y = g.y + g.h * j / 8; ctx.moveTo(g.x, y); ctx.lineTo(g.x + g.w, y); } ctx.stroke();
      ctx.strokeStyle = '#97a5a6'; ctx.beginPath();
      for (let i = 0; i <= 50; i++) { const x = g.x + g.w * i / 50; ctx.moveTo(x, g.y + g.h / 2 - 2); ctx.lineTo(x, g.y + g.h / 2 + 2); }
      for (let j = 0; j <= 40; j++) { const y = g.y + g.h * j / 40; ctx.moveTo(g.x + g.w / 2 - 2, y); ctx.lineTo(g.x + g.w / 2 + 2, y); } ctx.stroke();
      if (this.signals) {
        const source = this.signals[this.triggerSource];
        const triggerTime = this.trigger() ?? 0;
        ctx.save(); ctx.beginPath(); ctx.rect(g.x, g.y, g.w, g.h); ctx.clip();
        this.signals.forEach((s, ch) => {
          if (!this.enabled[ch]) return;
          ctx.strokeStyle = ch === 0 ? '#f4d85a' : '#87d69c'; ctx.lineWidth = 1.65; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 4; ctx.beginPath();
          for (let x = 0; x <= g.w; x++) {
            const time = (x / g.w - 0.5) * 10 * this.timeDiv + this.timeOffset + triggerTime;
            const interval = 10*this.timeDiv/g.w;
            let voltage = this.voltage(s, time, ch);
            if(this.acquisition==='High Resolution') {
              voltage=0;for(let i=0;i<8;i++)voltage+=this.voltage(s,time+(i/8-.5)*interval,ch)/8;
            }
            const y = g.y + g.h / 2 - (voltage / this.voltsDiv[ch] + this.offset[ch]) * g.h / 8;
            if (x === 0) ctx.moveTo(g.x, y); else ctx.lineTo(g.x + x, y);
            if(this.acquisition==='Peak Detect') {
              let low=voltage,high=voltage;
              for(let i=0;i<8;i++){const v=this.voltage(s,time+(i/8-.5)*interval,ch);low=Math.min(low,v);high=Math.max(high,v);}
              const py=v=>g.y+g.h/2-(v/this.voltsDiv[ch]+this.offset[ch])*g.h/8;
              ctx.moveTo(g.x+x,py(low));ctx.lineTo(g.x+x,py(high));ctx.moveTo(g.x+x,y);
            }
          }
          ctx.stroke();
        }); ctx.restore();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#e4b16e'; ctx.beginPath(); ctx.moveTo(g.x + g.w / 2 - 4, 6); ctx.lineTo(g.x + g.w / 2 + 4, 6); ctx.lineTo(g.x + g.w / 2, 13); ctx.fill();
        ctx.font = '9px monospace'; ctx.fillStyle = '#94a9aa';
        const aliased = source.frequency * 10 * this.timeDiv > g.w / 2;
        const translate = EE.i18n?.t || (text => text);
        ctx.fillText(aliased ? translate('UNDERSAMPLED · reduce TIME/DIV') : this.status + '  T→ ' + formatTime(this.timeOffset), 8, h - 8);
      }
      if (this.cursors) {
        ctx.setLineDash([4, 3]); this.cursor.forEach((p, i) => { const x = g.x + p * g.w; ctx.strokeStyle = '#e4b16e'; ctx.beginPath(); ctx.moveTo(x, g.y); ctx.lineTo(x, g.y + g.h); ctx.stroke(); ctx.fillStyle = '#e4b16e'; ctx.font = '10px monospace'; ctx.fillText('X' + (i + 1), x + 3, g.y + 12); }); ctx.setLineDash([]);
        if (this.cursorSelected.startsWith('Y')||this.cursorMode==='Track Waveform') this.cursorVoltages().forEach((voltage, i) => { const y=g.y+g.h/2-(voltage/this.voltsDiv[this.cursorSource]+this.offset[this.cursorSource])*g.h/8;ctx.strokeStyle='#e4b16e';ctx.setLineDash(i?[8,4]:[3,3]);ctx.beginPath();ctx.moveTo(g.x,y);ctx.lineTo(g.x+g.w,y);ctx.stroke();ctx.setLineDash([]); });
      }
      if (!this.lastMeasure) this.lastMeasure = timestamp;
      this.frames++;
      if (timestamp - this.lastMeasure > 1000) { this.fps = Math.round(this.frames * 1000 / (timestamp - this.lastMeasure)); this.frames = 0; this.lastMeasure = timestamp; }
      this.lastFrame = timestamp;
    }
  }
  const scopeStateKeys = ['scale','timeIndex','offset','timeOffset','active','run','single','cursors','cursor','triggerLevel','coupling','termination','enabled','menu','entryTarget','choice','triggerSource','triggerSlope','triggerMode','acquisition','averageCount','cursorMode','cursorSource','cursorSelected','cursorUnits','yCursor','invert','probe','measurement','measureSource','measurements'];
  Object.assign(EE, { DigitalOscilloscope, scopeVolts: volts, scopeTimes: times, scopeStateKeys, formatVolts, formatTime });
})();
