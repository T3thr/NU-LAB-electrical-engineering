const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.EE_PLAYWRIGHT_PATH||'playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/playwright/bench-ux');fs.mkdirSync(out,{recursive:true});
const report={checks:[],errors:[],external:[],failed:[]};
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const context=await browser.newContext({viewport:{width:1512,height:1100}});await context.setOffline(true);
 const page=await context.newPage();page.setDefaultTimeout(7000);
 const observe=p=>{p.on('pageerror',e=>report.errors.push(e.message));p.on('console',e=>{if(e.type()==='error')report.errors.push(e.text());});p.on('requestfailed',r=>report.failed.push(r.url()));p.on('request',r=>{if(/^https?:/.test(r.url()))report.external.push(r.url());});};observe(page);
 const url=pathToFileURL(path.join(root,'index.html')).href;
 const test=async(name,fn)=>{try{await fn();report.checks.push({name,pass:true});console.log('PASS '+name);}catch(e){report.checks.push({name,pass:false,error:e.message});console.log('FAIL '+name+': '+e.message);await page.screenshot({path:path.join(out,'failure-'+report.checks.length+'.png')});}};
 const header=()=>page.locator('.topbar').boundingBox();
 await page.goto(url);await page.waitForFunction(()=>EE.ux);
 await test('Header geometry and action positions stay fixed across repeated language switches',async()=>{
  const initial=await header(),buttons=await page.locator('.topbar button').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return [n.id,r.x,r.y,r.width,r.height];}));
  for(let i=0;i<8;i++){await page.locator('.topbar [data-language-toggle]').click();assert.deepEqual(await header(),initial);assert.deepEqual(await page.locator('.topbar button').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return [n.id,r.x,r.y,r.width,r.height];})),buttons);}
 });
 await test('Language switching preserves the main desktop instrument layout',async()=>{
  const geometry=()=>page.locator('#workbench .instrument,.lab-heading,#mission-hero').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return [n.id,r.x,r.y,r.width,r.height];}));const before=await geometry();await page.locator('.topbar [data-language-toggle]').click();assert.deepEqual(await geometry(),before);await page.locator('.topbar [data-language-toggle]').click();
 });
 await test('Entering 3D from a scrolled page never exposes a header gap or background heading',async()=>{
  await page.evaluate(()=>scrollTo(0,440));await page.waitForTimeout(100);const y=await page.evaluate(()=>scrollY);
  for(let i=0;i<3;i++){await page.locator('#scene-toggle').click();await page.waitForTimeout(120);assert.equal((await header()).y,0);assert.equal((await page.locator('#lab-scene').boundingBox()).y,(await header()).height);assert.ok(await page.evaluate(()=>document.elementFromPoint(25,20).closest('.topbar')));await page.locator('.topbar [data-language-toggle]').click();await page.locator('#scene-exit').click();await page.waitForTimeout(120);assert.equal(await page.evaluate(()=>scrollY),y);}
 });
 await test('Modal locks background wheel and restores scroll after close and Escape',async()=>{
  await page.evaluate(()=>scrollTo(0,380));await page.waitForTimeout(80);const y=await page.evaluate(()=>scrollY);
  for(const mode of ['button','escape']){await page.locator('#help-open').click();await page.waitForTimeout(80);assert.ok(await page.evaluate(()=>document.body.classList.contains('ux-scroll-locked')));const top=await page.evaluate(()=>document.body.style.top);await page.mouse.move(8,500);await page.mouse.wheel(0,650);await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>document.body.style.top),top);if(mode==='button')await page.locator('[data-close="help-dialog"]').click();else await page.keyboard.press('Escape');await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>scrollY),y);}
 });
 await test('Nested assembly, scene and modal locks do not unlock one another',async()=>{
  await page.locator('#scene-toggle').click();await page.evaluate(()=>EE.interaction.openBoard());await page.locator('#mission-menu').click();await page.locator('#mission-map-close').click();assert.ok(await page.evaluate(()=>document.body.classList.contains('ux-scroll-locked')));await page.locator('#assembly-close').click();assert.ok(await page.evaluate(()=>document.body.classList.contains('ux-scroll-locked')));await page.locator('#scene-exit').click();assert.equal(await page.evaluate(()=>document.body.classList.contains('ux-scroll-locked')),false);
 });
 await test('Patch hover identifies the exact source, highlights the real jack and can locate it',async()=>{
  await page.locator('#patch-bay [data-terminal="gen.out"]').hover();await page.waitForTimeout(450);assert.match(await page.locator('#context-tip').innerText(),/HP 33120A/);assert.ok(await page.locator('#generator [data-terminal="gen.out"]').evaluate(n=>n.classList.contains('terminal-origin')));assert.equal(await page.locator('.port-preview .current').innerText(),'OUTPUT');await page.screenshot({path:path.join(out,'source-hover.png')});await page.locator('#context-tip-source button').click();await page.waitForTimeout(450);assert.ok(await page.locator('#scene-dock #generator').isVisible());await page.locator('#scene-exit').click();
 });
 await test('Floating mission remains reachable while scrolling 2D and through assembly/3D changes',async()=>{
  await page.evaluate(()=>EE.missions.start(0));await page.locator('#assembly-close').click();await page.locator('#scene-exit').click();const before=await page.locator('#mission-panel').boundingBox();await page.mouse.move(900,500);await page.mouse.wheel(0,500);await page.waitForTimeout(120);assert.deepEqual(await page.locator('#mission-panel').boundingBox(),before);await page.locator('#mission-collapse').click();assert.equal(await page.locator('#mission-collapse').getAttribute('aria-expanded'),'false');await page.locator('#mission-collapse').click();assert.equal(await page.locator('#mission-collapse').getAttribute('aria-expanded'),'true');await page.screenshot({path:path.join(out,'floating-mission.png')});await page.evaluate(()=>EE.missions.pause());
 });
 await test('3D terminal hover identifies the same physical source without opening a drawer',async()=>{
  await page.locator('#scene-toggle').click();await page.locator('#scene-home').click();await page.waitForTimeout(180);const point=await page.evaluate(()=>EE.scene.endpoint('gen.out'));await page.mouse.move(point.x,point.y);await page.waitForTimeout(550);assert.match(await page.locator('#context-tip').innerText(),/HP 33120A/);assert.equal(await page.evaluate(()=>EE.ux.terminal),'gen.out');assert.equal(await page.locator('#scene-dock').isVisible(),false);await page.mouse.move(25,25);await page.locator('#scene-exit').click();
 });
 await test('Desktop hover explains controls without modifying electrical state',async()=>{
  await page.evaluate(()=>EE.interaction.openInstrument('scope'));await page.waitForTimeout(400);const before=await page.evaluate(()=>JSON.stringify(EE.history.snapshot()));await page.locator('#knob-time').hover();await page.waitForTimeout(450);assert.ok((await page.locator('#context-tip p').innerText()).length>25);assert.equal(await page.evaluate(()=>JSON.stringify(EE.history.snapshot())),before);await page.screenshot({path:path.join(out,'scope-help.png')});await page.keyboard.press('Escape');assert.equal(await page.locator('#context-tip').isVisible(),false);await page.locator('#scene-exit').click();
 });
 await test('Mobile help mode intercepts taps and gestures without changing generator or wiring',async()=>{
  const mobile=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true});await mobile.setOffline(true);const p=await mobile.newPage();observe(p);await p.goto(url);await p.waitForFunction(()=>EE.ux);await p.locator('.mobile-tabs [data-view="rack"]').tap();await p.locator('#gen-output').scrollIntoViewIfNeeded();const before=await p.evaluate(()=>JSON.stringify(EE.history.snapshot()));await p.locator('#context-help-toggle').tap();await p.locator('#gen-output').tap();assert.equal(await p.evaluate(()=>JSON.stringify(EE.history.snapshot())),before);assert.ok(await p.locator('#context-tip').isVisible());assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:path.join(out,'mobile-help.png')});await p.locator('#context-help-toggle').tap();await p.locator('#gen-output').tap();assert.notEqual(await p.evaluate(()=>JSON.stringify(EE.history.snapshot())),before);
  for(const width of [320,393,768]){await p.setViewportSize({width,height:852});const rect=await p.locator('.topbar').boundingBox();for(let i=0;i<2;i++){await p.locator('.topbar [data-language-toggle]').tap();assert.deepEqual(await p.locator('.topbar').boundingBox(),rect);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}assert.ok(await p.locator('#context-help-toggle').isVisible());}
  await mobile.close();
 });
 await test('Offline console and assets remain clean',async()=>{assert.deepEqual(report.errors,[]);assert.deepEqual(report.failed,[]);assert.deepEqual(report.external,[]);});
 fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2));if(report.checks.some(c=>!c.pass))process.exitCode=1;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
