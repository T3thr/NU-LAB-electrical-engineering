/* Front-panel legends stay in the instrument's original language in either course language. */
(() => {
  const el = id => document.getElementById(id);
  const button = (id, label, title = label, cls = '') => `<button id="${id}" class="${cls}" title="${title}" aria-label="${title}">${label}</button>`;
  const knob = (id, label, small = false) => `<div class="panel-knob"><span>${label}</span>${button(id, '', label, 'knob' + (small ? ' small' : ''))}</div>`;
  const jack = (terminal, label, color = '') => `<label><button class="jack ${color}" data-terminal="${terminal}" aria-label="${label}" title="${terminal}"></button><span>${label}</span></label>`;
  class InstrumentPanels {
    static mount() {
      el('generator').dataset.noI18n = '';
      el('generator').innerHTML = `<div class="instrument-brand"><strong class="hp-brand">hp <span>HEWLETT<br>PACKARD</span></strong><span>33120A <small>15 MHz FUNCTION / ARBITRARY WAVEFORM GENERATOR</small></span></div>
        <div class="generator-face"><div class="vfd"><div class="gen-flags">${['SINE','SQUARE','TRI','HIGH Z','ADDR','ERROR','SHIFT','RMT'].map(x=>`<span data-flag="${x}">${x}</span>`).join('')}</div><output id="gen-frequency" aria-live="polite"></output><div class="generator-level"><span id="gen-level"></span><span id="gen-offset-reading"></span></div></div>${knob('generator-knob','MODIFY')}</div>
        <div class="generator-keys"><div><div class="panel-legend">FUNCTION / MODULATION</div><div class="generator-keypad">
        ${[['1','sine','~','SINE'],['2','square','&#8851;','SQUARE'],['3','triangle','&#8896;','TRI']].map(([n,w,s,l])=>`<button data-wave="${w}" data-gen-digit="${n}" title="${l} / numeric ${n}"><sup>${n}</sup><b>${s}</b><small>${l}</small></button>`).join('')}
        ${[['4','Ramp'],['5','Noise'],['-','Arb']].map(([n,l])=>`<button data-gen-digit="${n}" data-entry-only title="${l} waveform outside this lab; numeric ${n}"><sup>${n==='-'?'±':n}</sup>${l}</button>`).join('')}
        ${[['6','frequency','Freq',''],['7','vpp','Ampl',''],['8','offset','Offset','% Duty']].map(([n,key,l,shift])=>`<button id="${key==='frequency'?'gen-freq':key==='vpp'?'gen-amplitude':'gen-offset'}" data-gen-key="${key}" data-gen-digit="${n}" title="${l}${shift?' / Shift: '+shift:''}"><sup>${n}</sup>${shift?'<small class="shift-legend">'+shift+'</small>':''}${l}</button>`).join('')}
        <button data-gen-digit="9" data-entry-only title="Numeric 9; burst trigger outside this lab"><sup>9</sup>Single</button><button data-gen-digit="0" data-entry-only title="Numeric 0; recall outside this lab"><sup>0</sup>Recall</button><button data-gen-key="number" data-gen-digit="." id="gen-number" title="Enter Number / Shift: Cancel"><small class="shift-legend">Cancel</small>Enter<br>Number</button></div></div>
        <div class="generator-navigation"><button id="gen-enter" data-gen-key="enter" title="Enter / Shift: Menu On/Off"><small class="shift-legend">Menu On/Off</small>Enter</button><button id="gen-shift" data-gen-key="shift">Shift</button>${[['up','&#8593;','MHz / Vpp'],['down','&#8595;','kHz / Vrms'],['right','&#8594;','Hz / V'],['left','&#8592;','Back Space']].map(([k,s,l])=>`<button id="gen-${k}" data-gen-key="${k}" title="${k} / numeric units: ${l}">${s}<small>${l}</small></button>`).join('')}</div></div>
        <div class="generator-bottom">${button('gen-output','OUTPUT','Generator output enable')}<span id="gen-load-label"></span><div class="terminal-row">${jack('gen.sync','SYNC','bnc')}${jack('gen.gnd','GND','black')}${jack('gen.out','OUTPUT','bnc')}</div></div>`;
      const scope = document.querySelector('.instrument.scope'); scope.dataset.noI18n = '';
      scope.innerHTML = `<div class="instrument-brand"><strong><span class="scope-logo">&#8767;</span> KEYSIGHT</strong><span>InfiniiVision <small>DSO-X 2002A · 70 MHz · 2 GSa/s</small></span></div>
        <div class="scope-front"><div class="scope-screen-side"><div class="scope-bezel"><div class="scope-status"><span class="ch1" id="scope-scale-1"></span><span class="ch2" id="scope-scale-2"></span><span id="scope-time"></span></div><div class="scope-acq-status"><span id="scope-acquisition"></span><span id="scope-trigger-status"></span><span id="scope-delay"></span></div><div class="scope-display"><canvas id="scope-canvas" tabindex="0" aria-label="Oscilloscope waveform display"></canvas><aside class="measurements"><div class="measure-header">MEASURE</div><div id="scope-measure-list"></div><div class="scope-choice" id="scope-choice" hidden></div></aside></div><div class="cursor-readout" id="cursor-reading"></div><div class="scope-menu-title" id="scope-menu-title"></div><div class="scope-soft-labels">${Array.from({length:6},(_,i)=>`<div id="scope-soft-label-${i}"></div>`).join('')}</div></div><div class="scope-softkeys" role="group" aria-label="Display softkeys">${Array.from({length:6},(_,i)=>button('scope-softkey-'+i,'','Softkey '+(i+1))).join('')}</div></div>
        <div class="scope-control-side"><div class="scope-top-controls"><div class="scope-entry-control">${knob('scope-entry','Entry / Select',true)}<small>Push to Select</small></div><div class="scope-actions">${button('scope-run','Run / Stop')}${button('scope-single','Single')}${button('scope-default','Default Setup')}${button('scope-auto','Auto scale')}</div></div>
        <div class="scope-control-group"><span class="panel-legend">HORIZONTAL</span><div class="horizontal-knobs">${knob('knob-time','TIME / DIV')}${knob('scope-horizontal-position','Position',true)}</div><output id="time-value"></output></div>
        <div class="scope-shortcuts">${button('scope-meas','Meas')}${button('scope-cursors','Cursors')}${button('scope-acquire','Acquire')}</div>
        <div class="scope-control-group"><span class="panel-legend">TRIGGER</span><div class="scope-trigger-controls">${knob('scope-trigger-level','Level',true)}<div>${button('scope-trigger','Mode / Coupling')}${button('scope-slope','Slope')}</div></div></div>
        <div class="scope-control-group"><span class="panel-legend">VERTICAL</span><div class="scope-vertical-controls">${[0,1].map(ch=>`<div class="vertical-channel">${knob('knob-ch'+(ch+1),'V / DIV')}${button('scope-channel-'+(ch+1),String(ch+1),'Channel '+(ch+1),'channel-key ch'+(ch+1))}<output id="scale-value-${ch+1}"></output>${knob('scope-position-'+(ch+1),'Position',true)}</div>`).join('')}</div></div></div></div>
        <div class="scope-terminal-strip"><div class="probe-comp"><span>PROBE COMP</span><small>1 kHz · 3 Vp-p</small><div class="terminal-row">${jack('scope.comp','Signal','yellow')}${jack('scope.compGround','Earth','black')}</div></div><div class="probe-pairs">${[1,2].map(ch=>`<div><span class="ch${ch}">CHANNEL ${ch} · 1 MOhm</span><div class="terminal-row">${jack('scope.ch'+ch,'TIP','bnc '+(ch===1?'yellow':'green'))}${jack('scope.g'+ch,'GROUND','black')}</div></div>`).join('')}</div></div>`;
    }
    constructor(model, scope, update, refresh, audio) {
      this.model = model; this.scope = scope;
      const generator = () => model.generator;
      const genAction = action => { action(generator()); update(); audio.play('detent'); };
      const scopeAction = action => { action(); scope.acquire(model.signals); refresh(); audio.play('detent'); };
      el('generator').addEventListener('click', event => {
        const key = event.target.closest('[data-gen-key],[data-wave],[data-gen-digit]'); if (!key) return;
        genAction(g => {
          if (g.entry !== null && key.dataset.genDigit !== undefined && !g.shift) g.key(key.dataset.genDigit);
          else if (key.dataset.genKey) g.key(key.dataset.genKey);
          else if (key.dataset.wave) { g.waveform = key.dataset.wave; g.set('frequency',g.frequency);g.menu=null;g.shift=false; }
        });
      });
      el('gen-output').onclick = () => genAction(g => { g.enabled = !g.enabled; });
      EE.bindKnob(el('generator-knob'), d => genAction(g => g.turn(d)));
      el('generator').addEventListener('keydown', event => {
        const g = generator();
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        const key = /^[0-9.\-]$/.test(event.key) && g.entry !== null ? event.key : {ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',Backspace:'left'}[event.key];
        if (event.target.id === 'generator-knob' && key && g.entry === null) { event.stopPropagation(); return; }
        if (key) { event.preventDefault(); event.stopPropagation(); genAction(g=>g.key(key)); }
        else if (event.key === 'Enter' && g.entry !== null) { event.preventDefault(); event.stopPropagation(); genAction(g=>g.key('enter')); }
        else if (event.key !== 'Escape' && g.entry !== null) event.stopPropagation();
      });
      for (const kind of ['ch1','ch2','time']) EE.bindKnob(el('knob-'+kind), d=>scopeAction(()=>scope.step(kind,d)));
      for (let ch=0;ch<2;ch++) {
        el('scope-channel-'+(ch+1)).onclick=()=>scopeAction(()=>scope.channel(ch));
        EE.bindKnob(el('scope-position-'+(ch+1)),d=>scopeAction(()=>{scope.offset[ch]+=d*.1;}));
      }
      EE.bindKnob(el('scope-horizontal-position'),d=>scopeAction(()=>{scope.timeOffset+=d*scope.timeDiv/10;}));
      EE.bindKnob(el('scope-trigger-level'),d=>scopeAction(()=>{scope.triggerLevel+=d*scope.voltsDiv[scope.triggerSource]/10;}));
      EE.bindKnob(el('scope-entry'),d=>scopeAction(()=>scope.entryStep(d)),{push:()=>scopeAction(()=>scope.selectEntry())});
      for(let i=0;i<6;i++) el('scope-softkey-'+i).onclick=()=>scopeAction(()=>scope.softkey(i));
      for(const [id,menu] of [['scope-meas','measure'],['scope-trigger','trigger'],['scope-acquire','acquire']]) el(id).onclick=()=>scopeAction(()=>scope.openMenu(menu));
      el('scope-cursors').onclick=()=>scopeAction(()=>{scope.cursors=!scope.cursors;scope.openMenu('cursors');});
      el('scope-slope').onclick=()=>scopeAction(()=>{scope.triggerSlope=scope.triggerSlope==='Rising'?'Falling':'Rising';scope.openMenu('trigger');});
      el('scope-run').onclick=()=>scopeAction(()=>{scope.single=false;scope.run=!scope.run;});
      el('scope-single').onclick=()=>scopeAction(()=>{scope.run=false;scope.single=true;});
      el('scope-auto').onclick=()=>scopeAction(()=>{scope.run=true;scope.single=false;scope.triggerMode='Auto';scope.enabled=[true,true];scope.acquire(model.signals);scope.autoScale();});
      el('scope-default').onclick=()=>scopeAction(()=>scope.reset());
      document.querySelector('.instrument.scope').addEventListener('keydown',e=>{if(e.key.startsWith('Arrow'))e.stopPropagation();});
      new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(width!==this.generatorWidth){this.generatorWidth=width;this.renderGenerator();}}).observe(el('gen-frequency'));
    }
    renderGenerator() {
      const g=this.model.generator, display=g.display(), output=el('gen-frequency');
      output.replaceChildren();
      [...display.text].forEach((char,i)=>{const span=document.createElement('span');span.textContent=char;span.classList.toggle('selected-digit',i===display.digit);output.append(span);});
      const unit=document.createElement('small');unit.textContent=display.unit;output.append(unit);
      output.classList.toggle('menu-reading',!!g.menu||!!g.error);output.setAttribute('aria-label',display.text+' '+display.unit);
      output.style.fontSize='';
      const width=output.clientWidth,needed=[...output.children].reduce((sum,node)=>sum+node.scrollWidth,5);
      if(width&&needed>width)output.style.fontSize=Math.max(10,parseFloat(getComputedStyle(output).fontSize)*width/needed)+'px';
      el('gen-level').textContent=g.vpp.toFixed(3)+' Vpp';el('gen-offset-reading').textContent=(g.offset>=0?'+':'')+g.offset.toFixed(3)+' VDC';
      el('gen-load-label').textContent=g.load==='Hi-Z'?'HIGH Z':'50 OHM';
      const flags={SINE:g.waveform==='sine',SQUARE:g.waveform==='square',TRI:g.waveform==='triangle','HIGH Z':g.load==='Hi-Z',SHIFT:g.shift,ERROR:!!g.error};
      document.querySelectorAll('[data-flag]').forEach(n=>n.classList.toggle('lit',!!flags[n.dataset.flag]));
      el('generator-knob').style.setProperty('--rotation',g.rotation+'deg');el('generator-knob').setAttribute('aria-valuetext',display.text+' '+display.unit);
      el('gen-output').classList.toggle('active',g.enabled);el('gen-output').setAttribute('aria-pressed',String(g.enabled));
      el('gen-shift').setAttribute('aria-pressed',String(g.shift));
      document.querySelectorAll('[data-wave]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.wave===g.waveform)));
      document.querySelectorAll('[data-entry-only]').forEach(n=>{n.disabled=g.entry===null;});
      for(const [id,p] of [['gen-freq','frequency'],['gen-amplitude','vpp'],['gen-offset','offset']]) el(id).classList.toggle('active',g.parameter===p&&!g.menu);
    }
    renderScope() {
      const s=this.scope;
      for(let ch=0;ch<2;ch++) {
        el('scope-scale-'+(ch+1)).textContent=(ch+1)+' '+EE.formatVolts(s.voltsDiv[ch])+'/';
        el('scope-scale-'+(ch+1)).style.opacity=s.enabled[ch]?'1':'.3';
        el('scale-value-'+(ch+1)).textContent=EE.formatVolts(s.voltsDiv[ch]);
        el('knob-ch'+(ch+1)).style.setProperty('--rotation',(s.scale[ch]-4)*27+'deg');
        el('scope-position-'+(ch+1)).style.setProperty('--rotation',s.offset[ch]*60+'deg');
        el('scope-channel-'+(ch+1)).setAttribute('aria-pressed',String(s.enabled[ch]));
      }
      el('scope-time').textContent=EE.formatTime(s.timeDiv)+'/';el('time-value').textContent=EE.formatTime(s.timeDiv);
      el('knob-time').style.setProperty('--rotation',(s.timeIndex-3)*35+'deg');
      el('scope-horizontal-position').style.setProperty('--rotation',s.timeOffset/s.timeDiv*30+'deg');
      el('scope-trigger-level').style.setProperty('--rotation',s.triggerLevel*30+'deg');
      el('scope-run').classList.toggle('active',s.run);el('scope-run').classList.toggle('stopped',!s.run);
      el('scope-single').classList.toggle('active',s.single);el('scope-cursors').setAttribute('aria-pressed',String(s.cursors));
      el('scope-acquisition').textContent=s.acquisition;
      el('scope-trigger-status').textContent=s.status+'  '+(s.triggerSource+1)+(s.triggerSlope==='Rising'?' ↑ ':' ↓ ')+s.triggerLevel.toFixed(2)+' V';
      el('scope-delay').textContent='D '+EE.formatTime(s.timeOffset);
      const reading=s.cursorReading();
      el('cursor-reading').textContent=s.cursors?'ΔX '+EE.formatTime(reading.dt)+'  1/ΔX '+(reading.dt?Math.abs(1/reading.dt).toFixed(1)+' Hz':'--')+'  φ '+(reading.phase===null?'--':reading.phase.toFixed(2)+'°')+'  ΔY '+reading.dy.toFixed(3)+' V':' ';
      el('scope-menu-title').textContent={channel:'Channel '+(s.active+1),cursors:'Cursors',measure:'Measurements',trigger:'Edge Trigger',acquire:'Acquisition'}[s.menu];
      s.softkeys().forEach(([label,value],i)=>{
        const node=el('scope-soft-label-'+i);node.replaceChildren();const name=document.createElement('span'),setting=document.createElement('b');name.textContent=label;setting.textContent=value;node.append(name,setting);
        const key=el('scope-softkey-'+i);key.disabled=!label||s.menu==='channel'&&i===3||s.menu==='trigger'&&i===0;key.setAttribute('aria-label','Softkey '+(i+1)+': '+label+' '+value);key.title=label+' '+value;
      });
      const choices=el('scope-choice');choices.hidden=!s.choice;choices.replaceChildren();
      if(s.choice)s.choice.values.forEach((value,i)=>{const row=document.createElement('div');row.textContent=value;row.classList.toggle('selected',i===s.choice.index);choices.append(row);});
      const list=el('scope-measure-list');list.replaceChildren();
      s.measurements.forEach(m=>{const label=document.createElement('label');label.className='ch'+(m.source+1);label.textContent=m.type+'('+ (m.source+1)+')';const output=document.createElement('output');output.textContent=s.measurementValue(m.type,m.source);const id=m.type==='Pk-Pk'?'measure-'+(m.source+1):m.type==='Frequency'&&m.source===0?'measure-f':m.type==='Phase'?'measure-phase':null;if(id&&!document.getElementById(id))output.id=id;label.append(output);list.append(label);});
    }
  }
  EE.InstrumentPanels=InstrumentPanels;
})();
