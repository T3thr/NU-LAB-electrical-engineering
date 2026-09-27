/* 24 September: previous-view memory, bounded character movement and adjustable lead pitch. */
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {pathToFileURL}=require('node:url');const {chromium}=require(process.env.EE_PLAYWRIGHT_PATH||'playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),out=path.resolve(__dirname,'../output/upgrade-2026-09-24');fs.mkdirSync(out,{recursive:true});
 const report={checks:[],errors:[],failedRequests:[],externalRequests:[]};let page;
 try{
 const context=await browser.newContext({viewport:{width:1512,height:1100}});page=await context.newPage();
 page.on('pageerror',e=>report.errors.push(e.stack));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});page.on('requestfailed',r=>report.failedRequests.push(r.url()));page.on('request',r=>{if(/^https?:/.test(r.url()))report.externalRequests.push(r.url());});
 const url=pathToFileURL(path.resolve(__dirname,'../index.html')).href;await page.goto(url);await page.waitForFunction(()=>!!EE.interaction);
 const test=async(name,fn)=>{await fn();assert.deepEqual(report.errors,[]);report.checks.push(name);console.log('PASS '+name);};
 const view=()=>page.evaluate(()=>EE.scene.snapshotView()),settle=()=>page.waitForTimeout(400);
 await page.locator('#scene-enter').click();await settle();
 await test('Walking translates a character at fixed eye height without editing the circuit',async()=>{
   const before=await page.evaluate(()=>({player:{...EE.scene.player},wires:JSON.stringify(EE.bench.model.wires)}));await page.locator('#scene-canvas').focus();await page.keyboard.down('w');await page.waitForTimeout(200);await page.keyboard.up('w');await settle();
   const now=await page.evaluate(()=>({player:EE.scene.player,eye:EE.scene.renderer.eye,wires:JSON.stringify(EE.bench.model.wires)}));assert.ok(now.player.z<before.player.z);assert.ok(Math.abs(now.eye[1]-1.65)<1e-8);assert.equal(now.wires,before.wires);
 });
 await test('Scope close restores the exact original view, including switching instruments and Escape from an input',async()=>{
   await page.evaluate(()=>{EE.scene.move(.2,-.15);EE.scene.camera.yaw=.13;EE.scene.clamp();});const before=await view();
   await page.locator('[data-scene-focus="scope"]').click();await settle();assert.equal(await page.evaluate(()=>EE.scene.navigation),'inspect');
   await page.locator('.scene-instrument-tabs button').nth(2).click();await settle();await page.locator('#gen-freq').focus();await page.keyboard.press('Escape');assert.deepEqual(await view(),before);
   await page.locator('[data-scene-focus="scope"]').click();await page.locator('#scene-close-dock').click();await settle();assert.deepEqual(await view(),before);
   await page.screenshot({path:path.join(out,'returned-standing-view.png')});
 });
 await test('Closing during a focus animation cannot leave a later camera jump',async()=>{
   const before=await view();await page.evaluate(()=>{EE.scene.focusInstrument('scope');EE.scene.tick(.08);EE.scene.closeDock();});await settle();assert.deepEqual(await view(),before);
 });
 await test('Inspection, assembly and arrangement preserve their own return view',async()=>{
   const before=await view();await page.locator('#scene-overhead').click();const overhead=await view();assert.equal(overhead.navigation,'inspect');await page.keyboard.press('4');await settle();await page.locator('#scene-close-dock').click();assert.deepEqual(await view(),overhead);
   await page.locator('#scene-return-view').click();assert.deepEqual(await view(),before);await page.locator('[data-scene-focus="board"]').click();await page.locator('#assembly-close').click();assert.deepEqual(await view(),before);
   await page.locator('#scene-arrange').click();await page.keyboard.press('Escape');assert.deepEqual(await view(),before);
 });
 await test('A reload during instrument inspection restores the saved walking view, not the zoomed-in camera',async()=>{
   const before=await view();await page.keyboard.press('4');await settle();await page.evaluate(()=>EE.scene.save());await page.reload();await page.waitForFunction(()=>EE.scene.active);assert.deepEqual(await view(),before);assert.equal(await page.locator('#scene-dock').isVisible(),false);
 });
 await test('Walking stops at all four aisle edges, keeps constant height and normalizes diagonal speed',async()=>{
   const result=await page.evaluate(()=>{const s=EE.scene;s.pose(s.homePose);const walk=(x,z)=>{s.keys=new Set([x,z].filter(Boolean));for(let i=0;i<1200;i++)s.tick(1/60);s.keys.clear();return {...s.player};};const front=walk('w'),left=walk('a'),back=walk('s'),right=walk('d');s.pose(s.homePose);s.keys.add('w');s.tick(.04);const straight=2.9-s.player.z;s.pose(s.homePose);s.keys.add('w');s.keys.add('d');s.tick(.04);const diagonal=Math.hypot(s.player.x,2.9-s.player.z);s.keys.clear();return{front,left,back,right,straight,diagonal,bounds:s.walkBounds};});
   assert.equal(result.front.z,result.bounds.minZ);assert.equal(result.left.x,result.bounds.minX);assert.equal(result.back.z,result.bounds.maxZ);assert.equal(result.right.x,result.bounds.maxX);assert.ok(Math.abs(result.straight-result.diagonal)<1e-9);
   await page.locator('#scene-home').click();await settle();const before=await page.evaluate(()=>({...EE.scene.player}));await page.mouse.move(755,300);await page.mouse.down();await page.mouse.move(815,315,{steps:6});await page.mouse.up();await page.mouse.wheel(0,-150);await settle();assert.deepEqual(await page.evaluate(()=>EE.scene.player),before);assert.ok(Math.abs(await page.evaluate(()=>EE.scene.renderer.eye[1])-1.65)<1e-8);
 });
 await page.locator('#scene-exit').click();await page.locator('[data-experiment="free"]').click();await page.locator('#assembly-open').click();
 const drag=async(index,pin)=>{const tile=page.locator('[data-part="'+index+'"]');await tile.scrollIntoViewIfNeeded();const r=await tile.boundingBox(),p=await page.evaluate(id=>EE.bench.board.position(id),pin);await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.mouse.move(p.x,p.y,{steps:8});};
 await test('Tray spacing is explicit in pitches and millimeters; drag uses the chosen real pins',async()=>{
   assert.match(await page.locator('.lead-spacing output').first().innerText(),/10.16 mm/);await page.locator('#lead-span-0').selectOption('6');await drag(0,'E10');assert.equal(await page.evaluate(()=>EE.interaction.preview.b),'E16');await page.screenshot({path:path.join(out,'adjustable-lead-preview.png')});await page.mouse.up();assert.equal(await page.evaluate(()=>EE.bench.model.parts[0].b),'E16');
 });
 await test('Resize preserves the first lead, changes the real netlist and supports Undo/Redo',async()=>{
   await page.locator('#selected-lead-span').fill('4');await page.locator('#part-resize').click();assert.deepEqual(await page.evaluate(()=>EE.bench.model.parts.map(p=>[p.a,p.b])),[['E10','E14']]);await page.locator('#command-undo').click();assert.equal(await page.evaluate(()=>EE.bench.model.parts[0].b),'E16');await page.locator('#command-redo').click();assert.equal(await page.evaluate(()=>EE.bench.model.parts[0].b),'E14');
 });
 await test('Bracket adjustment and rotation update the snapped preview before committing',async()=>{
   await drag(1,'B24');assert.equal(await page.evaluate(()=>EE.interaction.preview.b),'B26');await page.keyboard.press('BracketRight');assert.equal(await page.evaluate(()=>EE.interaction.preview.b),'B27');await page.keyboard.press('r');assert.equal(await page.evaluate(()=>EE.interaction.preview.b),'E24');await page.mouse.up();assert.equal(await page.evaluate(()=>EE.bench.model.parts[1].b),'E24');
   await page.locator('#lead-span-0').selectOption('24');const n=await page.evaluate(()=>EE.bench.model.parts.length);await drag(0,'A60');assert.equal(await page.evaluate(()=>EE.interaction.preview.valid),false);await page.mouse.up();assert.equal(await page.evaluate(()=>EE.bench.model.parts.length),n);await page.screenshot({path:path.join(out,'spacing-workshop.png')});
 });
 await test('English toggle translates new controls without changing component geometry',async()=>{const before=await page.evaluate(()=>JSON.stringify(EE.bench.model.parts));await page.locator('.topbar [data-language-toggle]').click();assert.match(await page.locator('.lead-spacing').first().innerText(),/Lead spacing/);assert.equal(await page.evaluate(()=>JSON.stringify(EE.bench.model.parts)),before);});
 const mobileContext=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true});const mobile=await mobileContext.newPage();mobile.on('pageerror',e=>report.errors.push(e.message));await mobile.goto(url);await mobile.locator('#assembly-open').click();
 await test('Mobile spacing controls fit and changing them affects the same placement engine',async()=>{await mobile.locator('#lead-span-3').selectOption('3');assert.equal(await mobile.evaluate(()=>EE.interaction.candidate({type:'C',value:2.2e-6},'A10').b),'A13');assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await mobile.screenshot({path:path.join(out,'mobile-spacing.png')});});
 await mobileContext.close();assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedRequests,[]);assert.deepEqual(report.externalRequests,[]);fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2));console.log(report.checks.length+' navigation/spacing scenarios passed.');
 }catch(error){if(page)await page.screenshot({path:path.join(out,'failure.png')});throw error;}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
const {setGenerator,highZ}=require('./front-panel-helpers.cjs');
