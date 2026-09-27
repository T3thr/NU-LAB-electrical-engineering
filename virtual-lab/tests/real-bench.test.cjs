const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.EE_PLAYWRIGHT_PATH||'playwright');
const {setGenerator,highZ}=require('./front-panel-helpers.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/real-bench');
fs.mkdirSync(out,{recursive:true});
const report={checks:[],errors:[],failedRequests:[],externalRequests:[]};
const near=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const context=await browser.newContext({viewport:{width:1512,height:1100}});
 await context.addInitScript(()=>localStorage.setItem('ee-lab-language','en'));
 await context.setOffline(true);
 const page=await context.newPage();page.setDefaultTimeout(8000);
 function observe(p){p.on('pageerror',e=>report.errors.push(e.message));p.on('console',e=>{if(e.type()==='error')report.errors.push(e.text());});p.on('requestfailed',r=>report.failedRequests.push(r.url()));p.on('request',r=>{if(/^https?:/.test(r.url()))report.externalRequests.push(r.url());});}
 observe(page);
 const test=async(name,fn)=>{try{await fn();report.checks.push({name,pass:true});console.log('PASS '+name);}catch(error){report.checks.push({name,pass:false,error:error.message});console.log('FAIL '+name+': '+error.message);await page.screenshot({path:path.join(out,'failure-'+report.checks.length+'.png'),fullPage:true});}};
 await page.goto(pathToFileURL(path.join(root,'index.html')).href);await page.waitForFunction(()=>EE.bench);
 const reset=()=>page.evaluate(()=>{EE.scene.exit();EE.bench.load();});
 await test('Offline local-file boot has no generic source/scope inputs and six physical softkeys',async()=>{
  assert.equal(await page.locator('#generator input,#generator select,.scope input,.scope select').count(),0);assert.equal(await page.locator('.scope-softkeys button').count(),6);assert.equal(await page.locator('.gen-flags span').count(),8);
 });
 await test('Manual High-Z sequence exposes both menu levels and commits only on Enter',async()=>{
  await page.locator('[data-experiment="free"]').click();await page.locator('#gen-shift').click();await page.locator('#gen-enter').click();assert.equal(await page.locator('#gen-frequency').textContent(),'A: MOD MENU');
  for(let i=0;i<3;i++)await page.locator('#gen-right').click();assert.equal(await page.locator('#gen-frequency').textContent(),'D: SYS MENU');await page.locator('#gen-down').click();assert.equal(await page.locator('#gen-frequency').textContent(),'1: OUT TERM');await page.locator('#gen-down').click();assert.equal(await page.locator('#gen-frequency').textContent(),'50 OHM');await page.locator('#gen-right').click();assert.equal(await page.locator('#gen-frequency').textContent(),'HIGH Z');assert.equal(await page.evaluate(()=>EE.bench.model.generator.load),'50Ω');await page.screenshot({path:path.join(out,'high-z-menu.png'),fullPage:true});await page.locator('#gen-enter').click();assert.equal(await page.evaluate(()=>EE.bench.model.generator.load),'Hi-Z');
 });
 await test('Shared numeric keys enter frequency, amplitude and offset without changing waveform',async()=>{
  await setGenerator(page,'frequency','2','down');await setGenerator(page,'vpp','4.25');await setGenerator(page,'offset','-0.2');const state=await page.evaluate(()=>({f:EE.bench.model.generator.frequency,v:EE.bench.model.generator.vpp,o:EE.bench.model.generator.offset,w:EE.bench.model.generator.waveform}));assert.deepEqual(state,{f:2000,v:4.25,o:-.2,w:'sine'});
 });
 await test('Digit cursor plus knob edits a selected decade; keyboard numeric entry commits once',async()=>{
  await setGenerator(page,'frequency',300);await page.locator('#gen-freq').click();await page.locator('#gen-left').click();await page.locator('#generator-knob').focus();await page.keyboard.press('ArrowUp');near(await page.evaluate(()=>EE.bench.model.generator.frequency),310);await page.locator('#gen-number').click();await page.keyboard.type('1234');await page.keyboard.press('Enter');near(await page.evaluate(()=>EE.bench.model.generator.frequency),1234);
 });
 await test('Undo and redo restore committed generator values; editing keys do not pollute history',async()=>{
  await setGenerator(page,'frequency',300);const n=await page.evaluate(()=>EE.history.past.length);await setGenerator(page,'frequency',1000);assert.equal(await page.evaluate(()=>EE.history.past.length),n+1);await page.locator('#command-undo').click();near(await page.evaluate(()=>EE.bench.model.generator.frequency),300);await page.locator('#command-redo').click();near(await page.evaluate(()=>EE.bench.model.generator.frequency),1000);
 });
 await test('Scope has independent channel scale, position, horizontal position and trigger knobs',async()=>{
  await reset();const before=await page.evaluate(()=>({scale:[...EE.bench.scope.scale],offset:[...EE.bench.scope.offset]}));await page.locator('#scope-position-1').focus();await page.keyboard.press('ArrowUp');await page.locator('#knob-ch2').focus();await page.keyboard.press('ArrowDown');await page.locator('#scope-horizontal-position').focus();await page.keyboard.press('ArrowUp');await page.locator('#scope-trigger-level').focus();await page.keyboard.press('ArrowUp');const s=await page.evaluate(()=>({scale:EE.bench.scope.scale,offset:EE.bench.scope.offset,t:EE.bench.scope.timeOffset,level:EE.bench.scope.triggerLevel}));assert.equal(s.scale[0],before.scale[0]);assert.equal(s.scale[1],before.scale[1]-1);near(s.offset[0],.1);near(s.offset[1],0);assert.ok(s.t>0&&s.level>0);
 });
 await test('Cursors > X1/X2 > Entry knob measures Lab 7 delay and phase',async()=>{
  await reset();await page.locator('#scope-cursors').click();await page.locator('#scope-softkey-4').click();const target=await page.evaluate(()=>{const s=EE.bench.scope,signals=s.signals,t1=-signals[0].phase/(2*Math.PI*signals[0].frequency),t2=-signals[1].phase/(2*Math.PI*signals[1].frequency),tr=s.trigger();return [t1,t2].map(t=>(t-tr-s.timeOffset)/(10*s.timeDiv)+.5);});
  for(let i=0;i<2;i++){await page.locator('#scope-softkey-'+(4+i)).click();const old=await page.evaluate(i=>EE.bench.scope.cursor[i],i);const steps=Math.round((target[i]-old)*500);await page.locator('#scope-entry').focus();for(let j=0;j<Math.abs(steps);j++)await page.keyboard.press(steps>0?'ArrowUp':'ArrowDown');}
  const result=await page.evaluate(()=>({cursor:EE.bench.scope.cursorReading(),phase:EE.bench.scope.phaseDifference()}));near(result.cursor.dt,.0007077,.00003);near(result.cursor.phase,result.phase,3.0);assert.ok((await page.locator('#cursor-reading').textContent()).includes('ΔX'));await page.locator('.instrument.scope').screenshot({path:path.join(out,'cursor-phase.png')});
 });
 await test('Entry push selects a context-menu choice and channel softkeys affect the trace',async()=>{
  await page.locator('#scope-softkey-2').click();await page.locator('#scope-entry').focus();await page.keyboard.press('ArrowUp');await page.locator('#scope-entry').click();assert.equal(await page.evaluate(()=>EE.bench.scope.choice),null);await page.locator('#scope-channel-1').click();await page.locator('#scope-softkey-0').click();assert.equal(await page.evaluate(()=>EE.bench.scope.coupling[0]),'AC');await page.locator('#scope-softkey-0').click();assert.equal(await page.evaluate(()=>EE.bench.scope.coupling[0]),'GND');await page.locator('#scope-default').click();assert.deepEqual(await page.evaluate(()=>EE.bench.scope.coupling),['DC','DC']);
 });
 await test('Meas softkeys select, add and clear actual nodal measurements',async()=>{
  await page.locator('#scope-meas').click();await page.locator('#scope-softkey-1').click();await page.locator('#scope-entry').focus();await page.keyboard.press('ArrowUp');await page.keyboard.press('ArrowUp');await page.locator('#scope-entry').click();await page.locator('#scope-softkey-2').click();assert.ok((await page.locator('#scope-measure-list').textContent()).includes('Period(1)3.333 ms'));await page.locator('#scope-softkey-5').click();assert.equal(await page.locator('#scope-measure-list label').count(),0);
  await page.locator('#scope-default').click();await page.locator('#scope-meas').click();await page.locator('#scope-softkey-2').click();await page.locator('#scope-softkey-2').click();assert.equal(await page.locator('#measure-1').count(),1);
 });
 await test('Single remains armed without a trigger and freezes after a valid edge',async()=>{
  await reset();await page.evaluate(()=>{EE.bench.scope.triggerLevel=100;EE.bench.refreshReadings();});await page.locator('#scope-single').click();assert.equal(await page.evaluate(()=>EE.bench.scope.status),'Armed');await page.locator('#scope-trigger').click();await page.locator('#scope-softkey-4').click();assert.equal(await page.evaluate(()=>EE.bench.scope.status),'Stop');
 });
 await test('Probe Comp is wired through real patch terminals and reads 1 kHz / 3 Vpp',async()=>{
  await reset();await page.locator('[data-experiment="free"]').click();const connect=async(a,b)=>{await page.locator('#patch-bay [data-terminal="'+a+'"]').click();await page.locator('#patch-bay [data-terminal="'+b+'"]').click();};await connect('scope.ch1','scope.comp');await connect('scope.g1','scope.compGround');await page.locator('#scope-auto').click();const s=await page.evaluate(()=>({vpp:EE.bench.scope.signals[0].vpp,f:EE.bench.scope.signals[0].frequency}));near(s.vpp,3,.04);near(s.f,1000);await page.locator('.instrument.scope').screenshot({path:path.join(out,'probe-comp.png')});
 });
 await test('3D uses the live panels, keeps camera return and displays both trace colors',async()=>{
  await reset();await page.locator('#scene-enter').click();await page.waitForTimeout(300);const view=await page.evaluate(()=>EE.scene.snapshotView());await page.evaluate(()=>EE.scene.focusInstrument('scope'));await page.waitForTimeout(400);assert.ok(await page.locator('#scene-dock #scope-softkey-0').isVisible());await page.locator('.instrument.scope').screenshot({path:path.join(out,'scope-front.png'),style:'.scene-dock{bottom:20px!important;top:10px!important} .scene-dock-heading{position:static!important}'});await page.locator('#scene-close-dock').click();assert.deepEqual(await page.evaluate(()=>EE.scene.snapshotView()),view);await page.evaluate(()=>EE.scene.focusInstrument('generator'));await page.waitForTimeout(350);await setGenerator(page,'frequency',500);await page.locator('#scene-dock').screenshot({path:path.join(out,'generator-front.png')});await page.locator('#scene-close-dock').click();await page.screenshot({path:path.join(out,'standing-bench.png')});
  const pixels=await page.evaluate(()=>{const s=EE.bench.scope,d=s.ctx.getImageData(0,0,s.canvas.width,s.canvas.height).data;let yellow=0,green=0;for(let i=0;i<d.length;i+=4){if(d[i]>190&&d[i+1]>165&&d[i+2]<130)yellow++;if(d[i]>80&&d[i]<180&&d[i+1]>160&&d[i+2]>105)green++;}return {yellow,green};});assert.ok(pixels.yellow>100&&pixels.green>100);report.tracePixels=pixels;
 });
 await test('Mobile panels fit and every softkey and knob remains reachable',async()=>{
  const mobile=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true});await mobile.setOffline(true);const p=await mobile.newPage();observe(p);await p.goto(pathToFileURL(path.join(root,'index.html')).href);await p.locator('.mobile-tabs [data-view="scope"]').click();await p.locator('#scope-cursors').click();await p.locator('#scope-softkey-5').click();await p.locator('#scope-entry').click();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.locator('.instrument.scope').screenshot({path:path.join(out,'mobile-scope.png'),style:'.topbar,.mobile-tabs{visibility:hidden!important}'});await p.locator('.mobile-tabs [data-view="rack"]').click();await setGenerator(p,'frequency',500);await p.locator('#generator').screenshot({path:path.join(out,'mobile-generator.png'),style:'.topbar,.mobile-tabs{visibility:hidden!important}'});await mobile.close();
 });
 await test('No exceptions, rejected promises, failed assets or external requests',async()=>{assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedRequests,[]);assert.deepEqual(report.externalRequests,[]);});
 fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2));
 if(report.checks.some(t=>!t.pass))process.exitCode=1;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
