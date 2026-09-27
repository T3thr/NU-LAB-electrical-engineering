/* Presentation-only assistance. No electrical state is stored or changed here. */
(() => {
  if(typeof document === 'undefined') return;
  const el = id => document.getElementById(id);
  const text = (en, th) => EE.i18n.language === 'th' ? th : en;
  const descriptions = {
    'gen-freq':['Select frequency; turn MODIFY to change the highlighted digit.','เลือกความถี่ แล้วหมุน MODIFY เพื่อปรับหลักที่ขีดเส้นไว้'],
    'gen-amplitude':['Select peak-to-peak amplitude. Check HIGH Z before entering the value.','เลือกแรงดันยอดถึงยอด (Vpp) ตั้ง HIGH Z ก่อนกรอกค่า'],
    'gen-offset':['Select DC offset. Shift + Offset selects square-wave duty cycle.','เลือกแรงดัน DC ที่เลื่อนทั้งคลื่น กด Shift + Offset เพื่อปรับ duty ของคลื่นสี่เหลี่ยม'],
    'generator-knob':['Change the selected digit, or move through the open menu. Drag, scroll or use arrow keys.','ปรับหลักตัวเลขที่เลือก หรือเลื่อนรายการในเมนู ใช้ลาก หมุนล้อเมาส์ หรือปุ่มลูกศร'],
    'gen-number':['Start numeric entry; printed numbers replace the normal key functions. Shift cancels entry.','เริ่มกรอกตัวเลข ปุ่มอื่นจะใช้เลขที่พิมพ์กำกับไว้ กด Shift แล้วปุ่มนี้เพื่อยกเลิก'],
    'gen-enter':['Confirm the value. Shift + Enter opens or closes the firmware menu.','ยืนยันค่า กด Shift แล้ว Enter เพื่อเปิดหรือปิดเมนูเครื่อง'],
    'gen-shift':['Use the secondary legend on the next key, such as Menu On/Off.','เลือกหน้าที่รองที่กำกับบนปุ่มถัดไป เช่น Menu On/Off'],
    'gen-left':['Select the next digit to the left; erase a digit during numeric entry.','เลือกหลักทางซ้าย ระหว่างกรอกเลขใช้ลบเลขล่าสุด'],
    'gen-right':['Select the next digit or menu item; accept Hz or volts during numeric entry.','เลือกหลักหรือรายการถัดไป ระหว่างกรอกเลขใช้ยืนยันหน่วย Hz หรือ V'],
    'gen-up':['Increase the digit or go back one menu level; numeric entry uses MHz or Vpp.','เพิ่มค่าหลักที่เลือก หรือย้อนระดับเมนู ระหว่างกรอกเลขใช้หน่วย MHz หรือ Vpp'],
    'gen-down':['Decrease the digit or open a menu level; numeric entry uses kHz or Vrms.','ลดค่าหลักที่เลือก หรือเข้าระดับเมนู ระหว่างกรอกเลขใช้หน่วย kHz หรือ Vrms'],
    'gen-output':['Enable or disconnect the generator signal at OUTPUT.','เปิดหรือหยุดส่งสัญญาณออกที่ขั้ว OUTPUT'],
    'gen-frequency':['The selected parameter or firmware menu. The underlined digit is adjusted by MODIFY.','ค่าที่เลือกหรือเมนูเครื่อง หลักที่ขีดเส้นไว้คือหลักที่หมุน MODIFY แล้วจะเปลี่ยน'],
    'gen-level':['Displayed peak-to-peak amplitude, calibrated for the selected load.','แรงดันยอดถึงยอดที่แสดง โดยอ้างอิงโหลดที่ตั้งไว้'],
    'gen-offset-reading':['DC voltage added to the waveform. A negative value shifts it downward.','แรงดัน DC ที่บวกกับคลื่น ค่าลบเลื่อนคลื่นลง'],
    'gen-load-label':['HIGH Z is for high-impedance loads. Shift, Enter, Right x3, Down x2, Right, Enter.','HIGH Z ใช้กับโหลดอิมพีแดนซ์สูง ตั้งด้วย Shift → Enter → ขวา 3 ครั้ง → ลง 2 ครั้ง → ขวา → Enter'],
    'scope-entry':['Rotate to change a menu choice or cursor. Push to confirm a highlighted choice.','หมุนเพื่อเลื่อนตัวเลือกหรือเคอร์เซอร์ กดที่ปุ่มหมุนเพื่อยืนยันตัวเลือก'],
    'knob-time':['Time per horizontal division. A smaller value magnifies the waveform in time.','เวลาต่อช่องแนวนอน ค่าน้อยทำให้เห็นรายละเอียดคลื่นตามเวลามากขึ้น'],
    'scope-horizontal-position':['Move the visible time window relative to the trigger.','เลื่อนช่วงเวลาที่แสดงเทียบกับจุดทริกเกอร์'],
    'scope-trigger-level':['Voltage threshold where acquisition synchronizes to the chosen edge.','ระดับแรงดันที่ใช้จับขอบคลื่นให้รูปคลื่นนิ่ง'],
    'scope-trigger':['Open trigger source, slope and Auto/Normal mode controls on the six softkeys.','เปิดตัวเลือกช่องทริกเกอร์ ขอบขาขึ้น/ลง และ Auto/Normal ที่ปุ่มใต้จอ'],
    'scope-slope':['Choose rising or falling edge for the trigger.','เลือกให้จับขอบขาขึ้นหรือขาลงของคลื่น'],
    'scope-run':['Toggle live acquisition and a frozen waveform.','สลับการวัดต่อเนื่องกับการหยุดภาพคลื่น'],
    'scope-single':['Wait for a valid trigger, capture once, then stop.','รอทริกเกอร์ที่เข้าเงื่อนไข เก็บภาพครั้งเดียวแล้วหยุด'],
    'scope-auto':['Fit active signals to the screen automatically. Circuit wiring is unchanged.','ปรับสเกลให้เห็นสัญญาณบนจออัตโนมัติ ไม่เปลี่ยนสายวงจร'],
    'scope-default':['Restore scope settings only; components and wiring are preserved.','คืนค่าการตั้งค่าสโคป ไม่ลบอุปกรณ์หรือสายวงจร'],
    'scope-meas':['Choose measurement type and source, then Add with the softkeys.','เลือกชนิดค่าที่วัดและช่องสัญญาณ แล้วกด Add ที่ปุ่มใต้จอ'],
    'scope-cursors':['Place X1/X2 on corresponding waveform features to read delay and phase.','วาง X1/X2 ที่ตำแหน่งเดียวกันของแต่ละคลื่น เพื่ออ่านเวลาหน่วงและเฟส'],
    'scope-acquire':['Choose Normal, Peak Detect, Average or High Resolution acquisition.','เลือกโหมดเก็บสัญญาณ Normal, Peak Detect, Average หรือ High Resolution'],
    'scope-canvas':['Yellow is CH1; green is CH2. Each large grid square is one division.','สีเหลืองคือ CH1 สีเขียวคือ CH2 ช่องตารางใหญ่หนึ่งช่องคือ 1 division'],
    'scope-acquisition':['Current acquisition mode. It affects how nodal samples are drawn.','โหมดเก็บสัญญาณที่ใช้อยู่ กำหนดวิธีแสดงตัวอย่างสัญญาณจากวงจร'],
    'scope-trigger-status':['Trigger state, selected channel, edge direction and voltage threshold.','สถานะทริกเกอร์ ช่องที่ใช้ ทิศทางขอบคลื่น และระดับแรงดัน'],
    'scope-delay':['Horizontal delay relative to the trigger. Zero centers the trigger in time.','เวลาที่เลื่อนเทียบกับทริกเกอร์ ค่า 0 คือไม่เลื่อน'],
    'scope-time':['Time represented by one large horizontal grid division.','ช่วงเวลาต่อช่องตารางใหญ่แนวนอน'],
    'time-value':['Time represented by one large horizontal grid division.','ช่วงเวลาต่อช่องตารางใหญ่แนวนอน'],
    'cursor-reading':['Delta X is time separation. Phase = -360 × frequency × Delta X; negative means lag.','ΔX คือเวลาห่างระหว่างเคอร์เซอร์ เฟส = -360 × ความถี่ × ΔX ค่าลบหมายถึงล้าหลัง'],
    'dmm-reading':['Live meter reading in the selected function and units; it comes from the connected terminals.','ค่าที่มัลติมิเตอร์วัดจากขั้วที่ต่ออยู่ อ่านพร้อมหน่วยและโหมดที่เลือก'],
    'dmm-function':['Selected meter function: voltage, current, resistance or frequency.','โหมดวัดปัจจุบัน: แรงดัน กระแส ความต้านทาน หรือความถี่'],
    'dmm-null':['Subtract the current reading as a reference; press again to clear it.','ตั้งค่าปัจจุบันเป็นค่าชดเชยศูนย์ กดอีกครั้งเพื่อยกเลิก'],
    'rear-open':['Open the current-input fuse compartment for inspection or replacement.','เปิดช่องฟิวส์อินพุตกระแสเพื่อตรวจหรือเปลี่ยนฟิวส์'],
    'fuse-status':['Current-input fuse status. A blown fuse must be replaced before measuring current.','สถานะฟิวส์ช่องวัดกระแส ถ้าขาดต้องเปลี่ยนก่อนวัดกระแสอีกครั้ง'],
    'psu-channel':['Select which output channel the voltage knob and current limit control.','เลือกช่องเอาต์พุตที่ปุ่มแรงดันและค่าจำกัดกระแสจะปรับ'],
    'psu-knob':['Adjust the selected supply voltage in 0.1 V steps.','ปรับแรงดันช่องที่เลือก ครั้งละ 0.1 V'],
    'psu-voltage':['Requested DC voltage for the selected output.','แรงดัน DC ที่ต้องการของช่องเอาต์พุตที่เลือก'],
    'psu-limit':['Maximum current. The supply lowers its voltage when this limit is reached (CC).','กระแสสูงสุด เมื่อถึงค่านี้แหล่งจ่ายจะลดแรงดันและเข้าโหมด CC'],
    'psu-fixed':['Select the fixed output voltage for channel 3.','เลือกแรงดันคงที่ของช่อง CH3'],
    'psu-all':['Enable or disable all supply output channels together.','เปิดหรือปิดเอาต์พุตทุกช่องพร้อมกัน'],
    'breadboard':['Each A–E or F–J group of five holes is connected internally; the center gap separates them.','รู A–E และ F–J ในเลขแถวเดียวกันเชื่อมกันเป็นกลุ่มละ 5 รู ร่องกลางแยกสองฝั่ง'],
    'board-pan':['Slide the breadboard view without moving electrical connections.','เลื่อนภาพเบรดบอร์ด ไม่ได้เปลี่ยนตำแหน่งสายจริง'],
    'preset-cap':['Load a prepared capacitor value for the current experiment.','โหลดวงจรตัวอย่างด้วยค่าตัวเก็บประจุที่เลือก'],
    'wire-tool':['Connect a source terminal to a breadboard hole, or select two endpoints.','ต่อสายจากขั้วเครื่องมือไปยังรูบอร์ด หรือเลือกปลายสายสองจุด'],
    'board-zoom':['Switch the breadboard magnification for easier hole selection.','สลับการขยายเบรดบอร์ดเพื่อเลือกรูได้ง่ายขึ้น'],
    'clear-wires':['Remove all leads. Undo can restore them.','ถอดสายทั้งหมด สามารถกดย้อนกลับเพื่อคืนสายได้'],
    'response-peak':['Half of CH2 peak-to-peak voltage: the capacitor peak amplitude.','ครึ่งหนึ่งของแรงดันยอดถึงยอด CH2 คือค่ายอดแรงดันตัวเก็บประจุ'],
    'response-phase':['Phase of CH2 relative to CH1. Negative values indicate lag.','เฟส CH2 เทียบกับ CH1 ค่าลบหมายถึงล้าหลัง'],
    'response-delay':['Time separation calculated from phase and frequency.','เวลาหน่วงที่คำนวณจากเฟสและความถี่'],
    'response-plot':['RC low-pass gain versus frequency. Click to set the generator frequency.','กราฟอัตราขยายวงจร RC เทียบความถี่ คลิกเพื่อตั้งความถี่เครื่องกำเนิด'],
    'wire-from':['Starting terminal ID, such as gen.out or E12.','ชื่อขั้วเริ่มต้น เช่น gen.out หรือ E12'],
    'wire-to':['Destination terminal ID, such as A12 or scope.ch1.','ชื่อขั้วปลายทาง เช่น A12 หรือ scope.ch1'],
    'wire-color':['Lead color is visual only; it does not change the circuit.','สีสายใช้แยกสายด้วยสายตา ไม่เปลี่ยนสมบัติทางไฟฟ้า'],
    'connect-wire':['Connect the named endpoints in the actual circuit.','เชื่อมปลายสายตามชื่อที่กรอกลงในวงจรจริง'],
    'selected-lead-span':['Distance between the component leads, in 2.54 mm hole pitches.','ระยะระหว่างขาอุปกรณ์ นับเป็นช่วงรู 2.54 มม.'],
    'mission-check':['Check this step against the real circuit and your readings.','ตรวจขั้นตอนนี้จากวงจรจริงและค่าที่กรอก'],
    'mission-retry':['Restore this step’s checkpoint, keeping earlier completed steps.','คืนจุดเริ่มต้นของขั้นนี้ โดยเก็บขั้นที่ผ่านแล้ว'],
    'mission-focus':['Open the instrument or assembly area needed for this step.','เปิดเครื่องมือหรือโต๊ะประกอบที่ใช้ในขั้นนี้'],
    'context-help-toggle':['Inspect controls without changing them. Turn off to resume normal operation.','แตะส่วนที่สงสัยเพื่ออ่านคำอธิบาย โดยไม่เปลี่ยนค่า กด ? อีกครั้งเพื่อกลับไปใช้งาน'],
    'sound-toggle':['Toggle instrument and connection sounds.','เปิดหรือปิดเสียงเครื่องมือและการต่อสาย'],
    'help-open':['Open the bench reference guide.','เปิดคู่มืออ้างอิงการใช้โต๊ะทดลอง'],
    'reset-bench':['Restore the prepared RC bench. Existing undo history can recover the previous state.','คืนวงจร RC ตัวอย่าง สามารถย้อนกลับไปสถานะก่อนหน้าได้ด้วยประวัติ'],
    'scene-toggle':['Switch between the 2D bench and the standing 3D view.','สลับโต๊ะทดลอง 2D กับมุมมองยืนหน้าโต๊ะ 3D'],
    'command-undo':['Undo the last change to wiring, instruments or components.','ย้อนการเปลี่ยนสาย เครื่องมือ หรืออุปกรณ์ล่าสุด'],
    'command-redo':['Reapply the most recently undone change.','ทำการเปลี่ยนแปลงที่เพิ่งย้อนกลับซ้ำอีกครั้ง'],
    'command-log':['Review the actions taken during this session.','ดูรายการการกระทำในรอบทดลองนี้'],
    'mission-menu':['Choose a guided chapter or continue the current mission.','เลือกบททดลองแบบมีขั้นตอน หรือเล่นภารกิจเดิมต่อ']
  };
  const terminalInfo = id => {
    if(id.startsWith('gen.')) return {instrument:'generator',model:'HP 33120A',port:{out:'OUTPUT',gnd:'GND',sync:'SYNC / TTL'}[id.split('.')[1]],description:id==='gen.out'?text('Signal output with a fixed 50 ohm source resistance. Set HIGH Z for the RC lab.','ขั้วส่งสัญญาณ มีความต้านทานภายใน 50 Ω ตั้ง HIGH Z สำหรับแล็บ RC'):id==='gen.gnd'?text('Generator return, connected to earth. Use the circuit common node.','ขั้วกลับของเครื่องกำเนิด เชื่อมกับสายดิน ต่อที่จุดร่วมวงจร'):text('Logic timing output, not the adjustable analog OUTPUT.','สัญญาณลอจิกสำหรับจังหวะเวลา ไม่ใช่ OUTPUT แอนะล็อกที่ปรับแอมพลิจูดได้')};
    if(id.startsWith('scope.')) return {instrument:'scope',model:'Keysight DSO-X 2002A',port:id.includes('comp')?'PROBE COMP '+(id.endsWith('Ground')?'EARTH':'SIGNAL'):/\.g/.test(id)?'CH'+id.slice(-1)+' GROUND':'CH'+id.slice(-1)+' TIP',description:id==='scope.comp'?text('Nominal 3 Vpp, 1 kHz square-wave calibration source.','แหล่งสัญญาณสอบเทียบคลื่นสี่เหลี่ยม 1 kHz ประมาณ 3 Vpp'):id==='scope.compGround'||/\.g/.test(id)?text('Earth-referenced ground. Connecting this to a live signal node shorts it.','ขั้วกราวด์ร่วมกับสายดิน ถ้าต่อที่จุดสัญญาณจะลัดวงจร'):text('Probe tip: measures this node relative to the channel ground, with a 1 megohm input.','ปลายโพรบ วัดแรงดันจุดนี้เทียบกราวด์ช่องนั้น อินพุต 1 MΩ')};
    if(id.startsWith('dmm.')) return {instrument:'meter',model:'HP 34401A',port:{hi:'HI',lo:'LO',i:'3 A'}[id.split('.')[1]],description:id==='dmm.i'?text('Fused current input. Connect in series, never directly across a voltage source.','ขั้ววัดกระแสผ่านฟิวส์ ต้องต่ออนุกรม ห้ามคร่อมแหล่งจ่ายแรงดัน'):id==='dmm.lo'?text('Common return for voltage, resistance and current measurements.','ขั้วร่วมสำหรับการวัดแรงดัน ความต้านทาน และกระแส'):text('Voltage, resistance and frequency input; use LO as the reference.','ขั้ววัดแรงดัน ความต้านทาน และความถี่ ใช้ LO เป็นจุดอ้างอิง')};
    if(id.startsWith('psu.'))return {instrument:'supply',model:'Siglent SPD3303C',port:id==='psu.gnd'?'EARTH':'CH'+id.split('.')[1],description:text('DC supply terminal. Check channel and polarity before connecting.','ขั้วแหล่งจ่าย DC ตรวจช่องและขั้วบวก/ลบก่อนต่อสาย')};
    return null;
  };
  const softkeyHelp = {
    Coupling:['DC includes offset; AC removes it; GND displays the zero reference.','DC แสดงรวมแรงดันเยื้อง AC ตัดส่วน DC ออก GND แสดงเส้นศูนย์'],
    Invert:['Flip the displayed voltage polarity for this channel.','กลับเครื่องหมายแรงดันที่แสดงของช่องนี้'],
    Probe:['Match the display multiplier to the probe. Direct virtual leads use 1:1.','ตั้งตัวคูณการแสดงผลให้ตรงกับโพรบ สายจำลองที่ต่อโดยตรงใช้ 1:1'],
    Input:['This scope has a fixed 1 megohm input resistance.','สโคปรุ่นนี้ใช้อินพุตความต้านทานคงที่ 1 MΩ'],
    Channel:['Show or hide this channel without disconnecting its physical probe.','เปิดหรือซ่อนคลื่นช่องนี้ โดยไม่ถอดโพรบจากวงจร'],
    Source:['Choose the channel used for this measurement, cursor or trigger.','เลือกช่องสัญญาณที่ใช้ในการวัด เคอร์เซอร์ หรือทริกเกอร์เมนูนี้'],
    Cursors:['Choose X1/X2 for time or Y1/Y2 for voltage, then turn Entry to move it.','เลือก X1/X2 เพื่อวัดเวลา หรือ Y1/Y2 เพื่อวัดแรงดัน แล้วหมุน Entry เพื่อเลื่อน'],
    Units:['Show cursor positions as seconds or degrees of the source signal period.','แสดงตำแหน่งเคอร์เซอร์เป็นเวลา หรือองศาเทียบคาบสัญญาณ'],
    X1:['Select the first time cursor; turn Entry to position it.','เลือกเคอร์เซอร์เวลาตัวแรก แล้วหมุน Entry เพื่อวางตำแหน่ง'],
    X2:['Select the second time cursor; turn Entry to position it.','เลือกเคอร์เซอร์เวลาตัวที่สอง แล้วหมุน Entry เพื่อวางตำแหน่ง'],
    Slope:['Trigger on the rising or falling edge.','จับทริกเกอร์ที่ขอบขาขึ้นหรือขาลง'],
    Level:['Set the trigger level from the source signal mean voltage.','ตั้งระดับทริกเกอร์อัตโนมัติจากแรงดันเฉลี่ยของสัญญาณ'],
    Add:['Add the selected measurement type and channel to the display.','เพิ่มชนิดค่าที่วัดและช่องที่เลือกลงบนจอ'],
    Clear:['Remove the last measurement or all measurements, as labeled.','ลบค่าที่วัดล่าสุด หรือทั้งหมด ตามข้อความกำกับ'],
    'Acq Mode':['Select how samples are combined: Normal, Peak Detect, Average or High Resolution.','เลือกวิธีรวมตัวอย่างสัญญาณ Normal, Peak Detect, Average หรือ High Resolution'],
    Averages:['Turn Entry to change the averaging count. Identical steady signals remain unchanged.','หมุน Entry เพื่อปรับจำนวนครั้งเฉลี่ย สัญญาณคงที่เหมือนกันทุกครั้งจะไม่เปลี่ยนรูป']
  };
  const bar=document.querySelector('.topbar'),utilities=document.createElement('div');utilities.className='header-utilities';
  utilities.append(bar.querySelector('[data-language-toggle]'));
  const help=document.createElement('button');help.id='context-help-toggle';help.textContent='?';help.setAttribute('aria-pressed','false');utilities.append(help);bar.append(utilities);
  const icons={'mission-menu':'☷','sound-toggle':'♫','help-open':'▤','reset-bench':'↺','command-undo':'↶','command-redo':'↷','command-log':'≡','scene-toggle':'3D'};
  const labels={'mission-menu':'Missions','sound-toggle':'Sound','help-open':'Bench guide','reset-bench':'Reset bench ↺','command-undo':'Undo','command-redo':'Redo','command-log':'History','scene-toggle':'3D lab'};
  for(const[id,icon]of Object.entries(icons)){el(id).dataset.icon=icon;el(id).setAttribute('aria-label',labels[id]);}
  const guide=document.createElement('details');guide.id='quick-guide';guide.dataset.noI18n='';document.body.append(guide);
  function renderGuide(){const open=guide.open;guide.innerHTML='<summary></summary><div class="guide-content"><ol></ol><button></button></div>';guide.open=open;guide.querySelector('summary').textContent=text('Lab companion','คำแนะนำการทดลอง');const steps=[['Turn source outputs off before assembling. GEN OUT supplies the signal; black clips go to the common return.','ปิดเอาต์พุตก่อนประกอบ GEN OUT ส่งสัญญาณ ส่วนคลิปดำต่อจุดร่วมวงจร'],['Set HIGH Z on the generator, then enter frequency and amplitude. Enable OUTPUT.','ตั้ง HIGH Z ที่เครื่องกำเนิด จากนั้นตั้งความถี่และแอมพลิจูด แล้วเปิด OUTPUT'],['Use CH1 for input and CH2 for capacitor voltage. Auto scale fits the traces; Cursors measures delay.','ใช้ CH1 วัดอินพุต CH2 วัดแรงดันตัวเก็บประจุ กด Auto scale เพื่อดูคลื่น และ Cursors เพื่อวัดเวลาหน่วง']];for(const pair of steps){const li=document.createElement('li');li.textContent=text(...pair);guide.querySelector('ol').append(li);}guide.querySelector('button').textContent=text('Open bench guide','เปิดคู่มือโต๊ะทดลอง');guide.querySelector('button').onclick=()=>el('help-dialog').showModal();help.setAttribute('aria-label',text('Inspect controls','แตะดูคำอธิบาย'));}
  renderGuide();
  new ResizeObserver(entries=>document.documentElement.style.setProperty('--companion-height',entries[0].contentRect.height+'px')).observe(el('mission-panel'));
  const tip=document.createElement('aside');tip.id='context-tip';tip.hidden=true;tip.dataset.noI18n='';tip.innerHTML='<button id="context-tip-close" type="button">×</button><div id="context-tip-text" role="tooltip"><strong></strong><p></p></div><div id="context-tip-source" hidden></div>';document.body.append(tip);
  const marker=document.createElement('div');marker.id='terminal-marker';marker.hidden=true;document.body.append(marker);
  let target=null,timer,leaveTimer,inspect=false,highlighted=[],savedDescription=null,scenePoint=null,sceneHitKey='';
  function clearHighlight(){highlighted.forEach(n=>n.classList.remove('terminal-origin'));highlighted=[];marker.hidden=true;if(EE.ux)EE.ux.terminal=null;}
  function hide(){clearTimeout(timer);clearTimeout(leaveTimer);tip.hidden=true;if(target){if(savedDescription===null)target.removeAttribute('aria-describedby');else target.setAttribute('aria-describedby',savedDescription);}target=null;clearHighlight();}
  function highlight(id){clearHighlight();const info=terminalInfo(id);if(!info)return;EE.ux.terminal=id;const instrument=info.instrument==='scope'?document.querySelector('.instrument.scope'):el(info.instrument),jack=instrument?.querySelector(`[data-terminal="${id}"]`);if(!jack)return;highlighted=[instrument,jack];highlighted.forEach(n=>n.classList.add('terminal-origin'));const r=jack.getBoundingClientRect();if(r.width&&r.top>bar.getBoundingClientRect().bottom&&r.bottom<innerHeight-50&&!instrument.closest('[inert]')){marker.textContent='↓ '+info.model+' · '+info.port;marker.hidden=false;marker.style.left=Math.max(8,Math.min(innerWidth-marker.offsetWidth-8,r.left-marker.offsetWidth/2+r.width/2))+'px';marker.style.top=(r.top-marker.offsetHeight-12)+'px';}}
  function infoFor(node){
    if(node.id==='scene-canvas'&&scenePoint){const hit=EE.scene.pick(scenePoint.x,scenePoint.y);if(hit.terminal){const data=terminalInfo(hit.terminal);if(data)return {title:data.model+' · '+data.port,body:data.description,terminal:hit.terminal};}if(hit.knob)return infoFor(el(hit.knob==='generator'?'generator-knob':hit.knob==='supply'?'psu-knob':'knob-time'));if(hit.instrument)return {title:{generator:'HP 33120A',scope:'Keysight DSO-X 2002A',supply:'Siglent SPD3303C',meter:'HP 34401A'}[hit.instrument],body:text('Select this instrument to open its live front panel. Close controls returns to this view.','เลือกเครื่องนี้เพื่อเปิดแผงควบคุมจริง กดปิดแผงควบคุมเพื่อกลับมุมเดิม')};if(hit.board)return infoFor(el('breadboard'));if(hit.part)return {title:hit.part,body:text('Circuit component. Select to inspect its leads or move it.','อุปกรณ์ในวงจร เลือกเพื่อตรวจขาหรือย้ายตำแหน่ง')};return {title:text('Standing bench','มุมยืนหน้าโต๊ะ'),body:text('Drag to look; use WASD to walk. Select an instrument or terminal to work with it.','ลากเพื่อมอง ใช้ WASD เพื่อเดิน เลือกเครื่องมือหรือขั้วเพื่อลงมือทดลอง')};}
    const id=node.dataset.terminal,terminal=id&&terminalInfo(id);if(terminal)return {title:terminal.model+' · '+terminal.port,body:terminal.description,terminal:id};
    let title=node.getAttribute('aria-label')||node.getAttribute('title')||node.closest('label')?.textContent.trim()||node.textContent.trim();
    if(descriptions[node.id])return {title:title||node.id,body:text(...descriptions[node.id])};
    if(node.matches('[data-wave]'))return {title,body:text('Select the output waveform. In numeric entry, this key enters its printed digit.','เลือกรูปคลื่นเอาต์พุต ระหว่างกรอกเลขปุ่มนี้ใช้เลขที่กำกับไว้')};
    if(node.matches('[data-gen-digit]'))return {title:title||'Enter Number',body:EE.bench.model.generator.entry!==null?text('Enter digit ','กรอกเลข ')+node.dataset.genDigit:text('The printed number is used after Enter Number. The other labeled function is not simulated.','เลขที่กำกับบนปุ่มนี้ใช้หลังจากกด Enter Number ส่วนหน้าที่อื่นที่พิมพ์ไว้ยังไม่จำลอง')};
    if(node.id.startsWith('scope-softkey-')||node.id.startsWith('scope-soft-label-')){const i=Number(node.id.split('-').pop()),s=EE.bench.scope,pair=s.softkeys()[i];let body=softkeyHelp[pair[0]];if(pair[0]==='Mode')body=s.menu==='cursors'?['Manual positions cursors independently; Track Waveform reads the signal at each time cursor.','Manual วางเคอร์เซอร์อิสระ Track Waveform อ่านแรงดันบนคลื่น ณ เวลาเคอร์เซอร์']:['Auto displays even without an edge; Normal waits for a valid trigger.','Auto แสดงได้แม้ไม่มีขอบทริกเกอร์ Normal รอจนมีทริกเกอร์ที่เข้าเงื่อนไข'];if(pair[0]==='Type')body=s.menu==='trigger'?['Edge triggering synchronizes acquisition to a voltage crossing.','ทริกเกอร์แบบขอบ จับจังหวะที่แรงดันตัดผ่านระดับที่ตั้ง']:['Choose Pk-Pk, frequency, period, RMS, mean, phase or delay using Entry / Select.','หมุน Entry / Select เพื่อเลือก Vpp ความถี่ คาบ RMS ค่าเฉลี่ย เฟส หรือเวลาหน่วง'];return {title:pair.join(' · '),body:body?text(...body):text('This softkey has no assigned function in the current menu.','ปุ่มนี้ยังไม่มีหน้าที่ในเมนูปัจจุบัน')};}
    if(/^knob-ch|^scope-position-|^scope-channel-|^scope-scale-|^scale-value-/.test(node.id)){const ch=node.id.slice(-1);return {title:'CH'+ch,body:node.id.includes('position')?text('Move this trace vertically without changing measured voltage.','เลื่อนคลื่นช่องนี้ขึ้นลง ไม่ได้เปลี่ยนแรงดันที่วัด'):node.id.includes('channel')?text('Open channel settings; press again while selected to turn the trace off.','เปิดการตั้งค่าช่องนี้ กดซ้ำขณะเลือกอยู่เพื่อปิดการแสดงคลื่น'):text('Volts per vertical grid division for this channel.','แรงดันต่อช่องตารางแนวตั้งของช่องสัญญาณนี้')};}
    if(node.closest('#scope-measure-list'))return {title:title||text('Measurement','ค่าที่วัด'),body:text('Measured from the acquired signal. Pk-Pk is max minus min; RMS is effective voltage; Phase compares CH2 to CH1.','วัดจากสัญญาณที่เก็บได้ Pk-Pk คือสูงสุดลบต่ำสุด RMS คือค่าใช้งานเทียบเท่า และ Phase เทียบ CH2 กับ CH1')};
    if(node.dataset.flag)return {title:node.dataset.flag,body:node.dataset.flag==='HIGH Z'?text('Lit when output display calibration assumes a high-impedance load.','สว่างเมื่อการแสดงแรงดันอ้างอิงโหลดอิมพีแดนซ์สูง'):text('Lit when this instrument status or waveform is active. ADDR/RMT are not simulated.','สว่างเมื่อสถานะหรือรูปคลื่นนี้ทำงาน ไม่จำลองการเชื่อมต่อ ADDR/RMT')};
    if(node.dataset.mode){const modes={'DC V':['DC voltage between HI and LO.','แรงดัน DC ระหว่าง HI กับ LO'],'AC V':['True RMS AC voltage between HI and LO.','แรงดัน AC แบบ true RMS ระหว่าง HI กับ LO'],'Ω':['Resistance between HI and LO; turn external sources off first.','ความต้านทานระหว่าง HI กับ LO ปิดแหล่งจ่ายภายนอกก่อน'],'Hz':['Signal frequency at HI relative to LO.','ความถี่สัญญาณที่ HI เทียบ LO'],'DC A':['DC current through 3 A and LO. Insert the meter in series.','กระแส DC ผ่าน 3 A และ LO ต้องต่อมิเตอร์อนุกรม'],'AC A':['True RMS AC current through 3 A and LO. Insert in series.','กระแส AC true RMS ผ่าน 3 A และ LO ต้องต่ออนุกรม']};return {title:node.dataset.mode,body:text(...modes[node.dataset.mode])};}
    if(node.dataset.output!==undefined)return {title:'CH'+(Number(node.dataset.output)+1),body:text('Toggle this DC supply output.','เปิดหรือปิดเอาต์พุต DC ของช่องนี้')};
    if(/^psu-[va]-/.test(node.id))return {title:'CH'+node.id.slice(-1),body:node.id.includes('-v-')?text('Actual output voltage, which falls in current-limit mode.','แรงดันเอาต์พุตจริง ซึ่งจะลดลงเมื่ออยู่ในโหมดจำกัดกระแส'):text('Actual current drawn by the connected circuit.','กระแสจริงที่วงจรดึงจากแหล่งจ่าย')};
    if(node.id.startsWith('psu-mode')||node.id==='psu-third-status')return {title,body:text('OFF: disabled. CV: constant voltage. CC: current limit is controlling the output.','OFF: ปิดเอาต์พุต CV: คงแรงดัน CC: กำลังจำกัดกระแส')};
    if(node.matches('[data-part],.part-card select'))return {title:title||text('Component','อุปกรณ์'),body:text('Choose the part and lead spacing, then place it on two free breadboard holes.','เลือกอุปกรณ์และระยะขา แล้ววางขาลงบนรูเบรดบอร์ดที่ว่างสองรู')};
    if(id)return {title:id,body:text('Breadboard node. Leads connected here share the same electrical bus.','จุดบนเบรดบอร์ด สายที่ต่อกลุ่มรูเดียวกันเชื่อมถึงกันทางไฟฟ้า')};
    return title?{title:title.slice(0,100),body:text('Select this control to '+title.toLowerCase()+'.','เลือกส่วนนี้เพื่อ '+title)}:null;
  }
  const candidates='button,input,select,summary,canvas,output,[data-flag],.scope-soft-labels>div,.scope-status>span,.scope-acq-status>span,#gen-level,#gen-offset-reading,#gen-load-label,#dmm-function,#fuse-status,[id^="psu-mode"],#psu-third-status,.response-values strong';
  function candidate(node){return node instanceof Element?node.closest(candidates):null;}
  function place(){if(!target||tip.hidden)return;const r=target.id==='scene-canvas'&&scenePoint?{left:scenePoint.x,top:scenePoint.y,bottom:scenePoint.y,width:0}:target.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight,top=bar.getBoundingClientRect().bottom+8;let y=r.bottom+10;if(y+h>innerHeight-12)y=r.top-h-10;y=Math.max(top,Math.min(innerHeight-h-8,y));tip.style.top=y+'px';tip.style.left=Math.max(8,Math.min(innerWidth-w-12,r.left+r.width/2-w/2))+'px';}
  function show(node){const info=infoFor(node);if(!info)return;hide();target=node;savedDescription=node.getAttribute('aria-describedby');node.setAttribute('aria-describedby',[savedDescription,'context-tip-text'].filter(Boolean).join(' '));const dialog=node.closest('dialog[open]');(dialog||document.body).append(tip);tip.querySelector('strong').textContent=info.title;tip.querySelector('p').textContent=info.body;el('context-tip-close').setAttribute('aria-label',text('Close explanation','ปิดคำอธิบาย'));const source=el('context-tip-source');source.replaceChildren();source.hidden=!info.terminal;if(info.terminal){const data=terminalInfo(info.terminal),instrument=data.instrument==='scope'?document.querySelector('.instrument.scope'):el(data.instrument);const caption=document.createElement('small');caption.textContent=text('Actual instrument terminals','ตำแหน่งขั้วบนเครื่องมือ');const ports=document.createElement('div');ports.className='port-preview';instrument.querySelectorAll('.jack[data-terminal]').forEach(jack=>{const span=document.createElement('span'),ring=document.createElement('i');span.classList.toggle('current',jack.dataset.terminal===info.terminal);span.append(ring,document.createTextNode(terminalInfo(jack.dataset.terminal)?.port||jack.dataset.terminal));ports.append(span);});const locate=document.createElement('button');locate.textContent=text('Show this instrument ↗','ดูขั้วนี้บนเครื่อง ↗');locate.onclick=()=>{const id=info.terminal;hide();EE.interaction.openInstrument(data.instrument);setTimeout(()=>highlight(id),350);setTimeout(clearHighlight,3000);};source.append(caption,ports,locate);highlight(info.terminal);}tip.hidden=false;place();}
  function setInspect(value){inspect=value;document.body.classList.toggle('inspect-help',inspect);help.setAttribute('aria-pressed',String(inspect));hide();if(inspect)show(help);}
  help.onclick=()=>setInspect(!inspect);el('context-tip-close').onclick=hide;
  document.addEventListener('pointerover',event=>{if(event.pointerType==='touch'||event.buttons||tip.contains(event.target))return;const node=candidate(event.target);if(!node||node===target)return;clearTimeout(timer);clearTimeout(leaveTimer);timer=setTimeout(()=>show(node),320);});
  el('scene-canvas').addEventListener('pointermove',event=>{scenePoint={x:event.clientX,y:event.clientY};if(event.buttons||event.pointerType==='touch')return;const hit=EE.scene.pick(event.clientX,event.clientY),key=hit.terminal||hit.knob||hit.instrument||hit.part||(hit.board?'board':'camera');if(key!==sceneHitKey){sceneHitKey=key;hide();timer=setTimeout(()=>show(el('scene-canvas')),400);}});
  document.addEventListener('pointerout',event=>{if(event.target.contains?.(event.relatedTarget))return;clearTimeout(timer);if(tip.contains(event.relatedTarget))return;clearTimeout(leaveTimer);leaveTimer=setTimeout(hide,180);});
  tip.addEventListener('pointerenter',()=>clearTimeout(leaveTimer));tip.addEventListener('pointerleave',()=>{leaveTimer=setTimeout(hide,180);});
  document.addEventListener('focusin',event=>{if(tip.contains(event.target))return;const node=candidate(event.target);if(node?.matches(':focus-visible')){clearTimeout(timer);timer=setTimeout(()=>show(node),320);}});
  // Window capture precedes the bench's document-capture drag and history handlers.
  for(const type of ['pointerdown','pointerup','click','dblclick','contextmenu','wheel'])window.addEventListener(type,event=>{
    if(event.target.id==='scene-canvas')scenePoint={x:event.clientX,y:event.clientY};
    if(tip.contains(event.target)||event.target===help)return;
    if(inspect){const node=candidate(event.target);if(node&&!node.closest('.topbar,dialog')){event.preventDefault();event.stopImmediatePropagation();if(type==='pointerdown'||type==='click')show(node);return;}}
    if(type==='pointerdown')hide();
  },{capture:true,passive:false});
  window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!tip.hidden){event.stopImmediatePropagation();event.preventDefault();hide();return;}if(inspect&&!event.target.closest('.topbar,dialog')&&event.key!=='Tab'&&event.key!=='Escape'){const node=candidate(event.target);if(node){event.stopImmediatePropagation();event.preventDefault();show(node);}}},true);
  document.addEventListener('scroll',event=>{if(!tip.contains(event.target))hide();},true);
  window.addEventListener('resize',hide);window.addEventListener('languagechange',()=>{renderGuide();hide();});
  let locked=false,scroll={x:0,y:0},oldTop='';
  function syncLock(){const needed=!!document.querySelector('dialog[open]')||document.body.classList.contains('scene-mode')||document.body.classList.contains('assembly-mode');if(needed===locked)return;if(needed){scroll={x:scrollX,y:scrollY};oldTop=document.body.style.top;document.body.style.top=-scroll.y+'px';document.body.classList.add('ux-scroll-locked');locked=true;}else{document.body.classList.remove('ux-scroll-locked');document.body.style.top=oldTop;locked=false;window.scrollTo(scroll.x,scroll.y);}hide();}
  new MutationObserver(syncLock).observe(document.body,{attributes:true,attributeFilter:['open','class'],subtree:true});
  EE.ux={terminal:null,hide,inspect:()=>inspect,syncLock};syncLock();
})();
