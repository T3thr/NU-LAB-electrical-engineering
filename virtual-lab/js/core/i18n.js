/* Local Thai/English presentation layer. Never mutates solver state or input values.
   Source text is retained per DOM node so switching languages is lossless, including
   dynamically inserted worksheet, event, and accessibility content. */
(() => {
  const dictionary = {
  "Fieldwork / Electrical Engineering Lab": "Fieldwork / ห้องปฏิบัติการวิศวกรรมไฟฟ้า",
  "ELECTRICAL ENGINEERING LAB": "ห้องปฏิบัติการวิศวกรรมไฟฟ้า",
  "LOCAL BENCH": "โต๊ะทดลองออฟไลน์",
  "SESSION 07": "การทดลอง 07",
  "Sound off": "ปิดเสียง",
  "Sound on": "เปิดเสียง",
  "Bench guide": "คู่มือใช้งาน",
  "Reset bench ↺": "รีเซ็ตโต๊ะ ↺",
  "PART 01": "ภาค 01",
  "CIRCUITS & MEASUREMENT": "วงจรและการวัด",
  "AC response of a series RC circuit": "ผลตอบสนองต่อไฟสลับของวงจรอนุกรม RC",
  "LAB 07": "แล็บ 07",
  "ต่อวงจร วัดสัญญาณ และอธิบายผล · Wire the circuit. Measure the response.": "ต่อวงจร วัดสัญญาณ และอธิบายผล",
  "Open worksheet": "เปิดใบงาน",
  "Capacitance": "ค่าความจุ",
  "Frequency response": "ผลตอบสนองความถี่",
  "Series capacitors": "ตัวเก็บประจุอนุกรม",
  "Free wiring": "ต่อวงจรอิสระ",
  "INSTRUMENT RACK": "ชุดเครื่องมือวัด",
  "POWER & SOURCE": "แหล่งจ่ายไฟและสัญญาณ",
  "WORKING SURFACE": "พื้นที่ต่อวงจร",
  "OSCILLOSCOPE": "ออสซิลโลสโคป",
  "LIVE CIRCUIT": "วงจรมีไฟ",
  "CHECK CONNECTIONS": "ตรวจสอบการต่อวงจร",
  "NO AC INPUT": "ไม่มีสัญญาณ AC",
  "FREE WIRING": "ต่อวงจรอิสระ",
  "LIVE ACQUISITION": "กำลังเก็บสัญญาณ",
  "DC POWER SUPPLY": "แหล่งจ่ายไฟ DC",
  "PROGRAMMABLE LINEAR DC": "แหล่งจ่ายไฟ DC แบบเชิงเส้น",
  "CHANNEL": "ช่อง",
  "ALL ON/OFF": "เปิด/ปิดทุกช่อง",
  "SET V": "แรงดัน V",
  "LIMIT A": "จำกัดกระแส A",
  "MULTIMETER": "มัลติมิเตอร์",
  "REAR ↗": "ฝาหลัง ↗",
  "FUSE OK · 6½ DIGITS": "ฟิวส์ปกติ · 6½ หลัก",
  "FUSE OPEN": "ฟิวส์ขาด",
  "NO FUSE": "ไม่มีฟิวส์",
  "FUSE OPEN · 0.000 A": "ฟิวส์ขาด · 0.000 A",
  "OVERLOAD / RANGE": "เกินพิกัด / ย่านวัด",
  "OPEN / OVERLOAD": "วงจรเปิด / เกินพิกัด",
  "15 MHz FUNCTION GENERATOR": "เครื่องกำเนิดสัญญาณ 15 MHz",
  "SINE": "ไซน์",
  "SQUARE": "สี่เหลี่ยม",
  "TRIANGLE": "สามเหลี่ยม",
  "OUTPUT": "เอาต์พุต",
  "INPUT": "อินพุต",
  "RESPONSE": "ผลตอบสนอง",
  "RETURN": "จุดร่วม",
  "DISPLAY LOAD": "โหลดอ้างอิง",
  "FREQ / Hz": "ความถี่ / Hz",
  "AMPL / Vpp": "ขนาด / Vpp",
  "OFFSET / V": "ออฟเซ็ต / V",
  "All instruments share the connected circuit.": "เครื่องมือทุกเครื่องวัดจากวงจรที่ต่ออยู่จริง",
  "RC SERIES /": "วงจร RC อนุกรม /",
  "↗ Wire": "↗ ต่อสาย",
  "＋ Zoom": "＋ ขยาย",
  "− Zoom": "− ย่อ",
  "Unplug all": "ถอดสายทั้งหมด",
  "Board position": "เลื่อนบอร์ด",
  "830 TIE POINTS · 5-HOLE BUSES": "830 จุดเสียบ · บัสละ 5 รู",
  "Drag a jack to a pin, or select two terminals. Double-click a cable to unplug.": "ลากจากแจ็คไปยังรูเสียบ หรือเลือกขั้วสองจุด ดับเบิลคลิกที่สายเพื่อถอด",
  "COMPONENT TRAY": "ถาดอุปกรณ์",
  "SELECT PART → SELECT TWO PINS": "เลือกอุปกรณ์ → เลือกรูเสียบสองจุด",
  "Connections & component placement": "การต่อสายและวางอุปกรณ์",
  "From": "จาก",
  "To": "ไปยัง",
  "Color": "สีสาย",
  "Connect": "ต่อสาย",
  "Unplug": "ถอดสาย",
  "Flip": "กลับขั้ว",
  "Move": "ย้าย",
  "Replace": "เปลี่ยนใหม่",
  "Remove": "นำออก",
  "RESPONSE AT A GLANCE": "สรุปผลตอบสนอง",
  "LOW-PASS FILTER": "วงจรกรองความถี่ต่ำผ่าน",
  "CUSTOM TOPOLOGY": "วงจรที่ต่อเอง",
  "CAPACITOR PEAK": "แรงดันยอดที่ C",
  "PHASE LAG": "มุมเฟสล้าหลัง",
  "TIME DELAY": "เวลาหน่วง",
  "Measured values above follow the connected probes. The RC reference curve requires the standard series topology.": "ค่าด้านบนวัดจากโพรบที่ต่ออยู่ กราฟอ้างอิง RC แสดงได้เมื่อใช้วงจรอนุกรมมาตรฐาน",
  "A_c = A ÷ √(1 + (2πfRC)²) · click curve to set f": "A_c = A ÷ √(1 + (2πfRC)²) · คลิกกราฟเพื่อปรับ f",
  "Failure experiments": "ทดลองต่อวงจรผิด",
  "SAFE TO TRY": "ทดลองได้อย่างปลอดภัย",
  "Each setup makes a real wiring fault. Enable the indicated output to observe the circuit response.": "แต่ละชุดจะต่อวงจรผิดตามสถานการณ์ เปิดเอาต์พุตที่ระบุเพื่อสังเกตผลที่เกิดขึ้น",
  "Scope ground short": "กราวด์โพรบลัดวงจร",
  "DMM current short": "ต่อช่องกระแสคร่อมแหล่งจ่าย",
  "Resistor overload": "ตัวต้านทานเกินกำลัง",
  "Reverse capacitor": "ตัวเก็บประจุกลับขั้ว",
  "Supply short": "แหล่งจ่ายลัดวงจร",
  "DSOX2002A · DUAL CHANNEL": "DSOX2002A · 2 ช่องสัญญาณ",
  "MEASURE": "ค่าที่วัดได้",
  "Phase 2→1": "เฟส 2→1",
  "NORMAL": "ปกติ",
  "DC COUPLED": "คัปปลิง DC",
  "Cursors off · drag screen to position": "ปิดเคอร์เซอร์ · ลากจอเพื่อเลื่อนรูปคลื่น",
  "Auto scale": "ปรับสเกลอัตโนมัติ",
  "Run / Stop": "เดิน / หยุด",
  "Single": "เก็บครั้งเดียว",
  "Cursors": "เคอร์เซอร์",
  "ACTIVE TRACE": "ช่องที่ปรับ",
  "CH1 · source": "CH1 · แหล่งจ่าย",
  "CH2 · response": "CH2 · ผลตอบสนอง",
  "COUPLING": "คัปปลิง",
  "TRIGGER LEVEL": "ระดับทริกเกอร์",
  "CHANNEL 1": "ช่องสัญญาณ 1",
  "CHANNEL 2": "ช่องสัญญาณ 2",
  "TIP": "หัวโพรบ",
  "GROUND": "กราวด์",
  "Ground clips are connected to protective earth.": "คลิปกราวด์เชื่อมต่อกับสายดินของเครื่อง",
  "Why does the green trace lag?": "ทำไมคลื่นสีเขียวจึงมีเฟสล้าหลัง?",
  "The capacitor charges through the resistor. Increasing capacitance or frequency reduces its voltage and increases phase lag.": "ตัวเก็บประจุชาร์จผ่านตัวต้านทาน เมื่อเพิ่มค่าความจุหรือความถี่ แรงดันที่ตัวเก็บประจุจะลดลงและมีมุมเฟสล้าหลังมากขึ้น",
  "Same signal. Wrong measurement.": "คลื่นเหมือนกัน เพราะวัดผิดจุด",
  "CH2 is connected to the source, just like photo 10. Equal Vpp and φ ≈ 0° do not describe the capacitor. Move the green probe to A29.": "CH2 ต่ออยู่ที่แหล่งจ่ายเหมือนภาพที่ 10 ค่า Vpp เท่ากันและ φ ≈ 0° จึงไม่ใช่ผลตอบสนองของตัวเก็บประจุ ให้ย้ายโพรบสีเขียวไปที่ A29",
  "Using the scope": "วิธีใช้ออสซิลโลสโคป",
  "Drag or scroll a knob; Shift-click steps back. On the screen, pinch horizontally for time and vertically for voltage. Select the active trace before dragging. Double-tap for Auto scale. Enable cursors and drag X1/X2 from matching waveform features to measure Δt.": "ลากหรือหมุนล้อเมาส์บนลูกบิด กด Shift พร้อมคลิกเพื่อถอยหนึ่งขั้น บนจอให้จีบแนวนอนเพื่อปรับฐานเวลา และแนวตั้งเพื่อปรับสเกลแรงดัน เลือกช่องก่อนลากรูปคลื่น แตะสองครั้งเพื่อปรับสเกลอัตโนมัติ เปิดเคอร์เซอร์แล้วลาก X1/X2 ไปยังจุดลักษณะเดียวกันบนคลื่นเพื่อวัด Δt",
  "The display uses peak phasors. Square and triangle signals use 31 odd harmonic terms. A warning identifies timebases too wide to resolve the signal.": "จอแสดงผลคำนวณจากเฟสเซอร์ค่ายอด คลื่นสี่เหลี่ยมและสามเหลี่ยมใช้ฮาร์มอนิกคี่ 31 พจน์ ระบบจะแจ้งเตือนเมื่อฐานเวลากว้างเกินกว่าจะเห็นสัญญาณได้ชัด",
  "OFFLINE · NO EXTERNAL SERVICES": "ออฟไลน์ · ไม่ใช้บริการภายนอก",
  "LAB 7 / PART 1": "แล็บ 7 / ภาค 1",
  "Worksheet": "ใบงาน",
  "Instruments": "เครื่องมือวัด",
  "Breadboard": "เบรดบอร์ด",
  "Oscilloscope": "ออสซิลโลสโคป",
  "FIELDWORK / LAB 07 WORKSHEET": "FIELDWORK / ใบงานแล็บ 07",
  "Close ×": "ปิด ×",
  "BENCH GUIDE": "คู่มือใช้งานโต๊ะทดลอง",
  "Your first measurement": "เริ่มต้นวัดสัญญาณ",
  "The bench starts with a connected 1 kΩ / 2.2 µF RC circuit at 300 Hz.": "เมื่อเปิดหน้าเว็บ วงจร RC ค่า 1 kΩ / 2.2 µF จะต่อไว้แล้วที่ความถี่ 300 Hz",
  "CH1 measures the input. CH2 measures the voltage across the capacitor. Black clips share the return.": "CH1 วัดแรงดันอินพุต ส่วน CH2 วัดแรงดันคร่อมตัวเก็บประจุ คลิปสีดำต่อเข้าจุดร่วมเดียวกัน",
  "Choose 1.0 µF or 0.1 µF and compare amplitude and phase. Click the response curve to change frequency.": "เลือก 1.0 µF หรือ 0.1 µF แล้วเปรียบเทียบขนาดและเฟส คลิกกราฟผลตอบสนองเพื่อเปลี่ยนความถี่",
  "Select a component, then two breadboard pins; the first capacitor pin is positive. Expand Connections for exact pin entry, moving leads, and replacing parts.": "เลือกอุปกรณ์แล้วเลือกรูเสียบสองจุด ขาแรกของตัวเก็บประจุคือขั้วบวก เปิดส่วนการต่อสายเพื่อระบุชื่อรูเสียบ ย้ายสาย หรือเปลี่ยนอุปกรณ์",
  "Use Auto scale and cursors, then open the worksheet. “Set up” loads a row; “Record” copies the live acquisition.": "ใช้การปรับสเกลอัตโนมัติและเคอร์เซอร์ แล้วเปิดใบงาน ปุ่ม “จัดวงจร” จะตั้งค่าตามแถว ส่วน “บันทึกค่า” จะคัดลอกค่าที่วัดอยู่",
  "Use Escape to cancel wiring. All 830 holes are electrically modeled: A–E and F–J form separate five-hole groups, and each 50-hole power rail is continuous.": "กด Escape เพื่อยกเลิกการต่อสาย รูเสียบทั้ง 830 จุดมีการเชื่อมต่อทางไฟฟ้า กลุ่ม A–E และ F–J แยกจากกัน กลุ่มละห้ารู ส่วนรางไฟแต่ละรางมี 50 รูที่ต่อถึงกันตลอดราง",
  "Labs 1–9 can register independent configurations. Only Lab 7 curriculum materials are present here.": "ระบบรองรับการเพิ่มชุดการทดลอง 1–9 แยกจากกัน ขณะนี้มีเนื้อหาสำหรับแล็บ 7",
  "Nominal Lab 7 calculations use the voltage actually measured at CH1. The generator has a physical 50 Ω source resistance; its Hi-Z / 50 Ω selector changes the displayed-load calibration.": "การคำนวณแล็บ 7 ใช้แรงดันที่วัดได้จริงจาก CH1 เครื่องกำเนิดสัญญาณมีความต้านทานภายใน 50 Ω ตัวเลือก Hi-Z / 50 Ω ใช้ปรับการแสดงค่าตามโหลดอ้างอิง",
  "Damage follows the dossier’s instantaneous thresholds. Resistors open above 0.25 W; reversed electrolytics short above 1.5 V DC. These are teaching models, without thermal-time or nonlinear semiconductor simulation.": "ความเสียหายเกิดทันทีเมื่อเกินเกณฑ์ตามเอกสาร ตัวต้านทานจะขาดเมื่อเกิน 0.25 W และตัวเก็บประจุอิเล็กโทรไลต์ที่กลับขั้วจะลัดวงจรเมื่อเกิน 1.5 V DC แบบจำลองนี้ใช้เพื่อการเรียนรู้ ไม่ได้จำลองเวลาสะสมความร้อนหรือสารกึ่งตัวนำแบบไม่เชิงเส้น",
  "HP 34401A / REAR COMPARTMENT": "HP 34401A / ช่องฟิวส์ด้านหลัง",
  "Current-input protection": "ระบบป้องกันช่องวัดกระแส",
  "3 A · 250 V · fast-acting ceramic fuse": "ฟิวส์เซรามิกชนิดตัดเร็ว · 3 A · 250 V",
  "Remove fuse": "ถอดฟิวส์",
  "Insert new 3 A fuse": "ใส่ฟิวส์ 3 A ตัวใหม่",
  "LABORATORY RECORD · ใบบันทึกผล": "ใบบันทึกผลการทดลอง",
  "Read the trace. Explain the response.": "อ่านรูปคลื่น แล้วอธิบายผลตอบสนอง",
  "Record A_c = Pk-Pk(2) ÷ 2 and a negative phase for lag. The checker uses your measured input, ±5% R, ±10% C, and display resolution.": "บันทึก A_c = Pk-Pk(2) ÷ 2 และใช้เฟสลบเมื่อคลื่นล้าหลัง ระบบตรวจคำตอบใช้แรงดันอินพุตที่วัดได้ ความเผื่อ R ±5%, C ±10% และความละเอียดของการอ่านค่า",
  "Export CSV ↗": "ส่งออก CSV ↗",
  "Configuration": "การจัดวงจร",
  "Nominal A_c / φ": "A_c / φ ตามทฤษฎี",
  "Input Vpp": "อินพุต Vpp",
  "Actions": "การทำงาน",
  "Set up": "จัดวงจร",
  "Record": "บันทึกค่า",
  "Awaiting readings": "รอค่าที่วัดได้",
  "Check all readings": "ตรวจคำตอบทุกแถว",
  "Compare the 10 physical benchmarks": "เปรียบเทียบผลการทดลองจริง 10 ชุด",
  "These are observations, not replacement equations. High-frequency readings include departures that component tolerance alone cannot explain. Nominal predictions below use the photographed CH1 input.": "ข้อมูลนี้คือค่าที่สังเกตจากการทดลองจริง ค่าที่ความถี่สูงบางชุดต่างจากทฤษฎีเกินกว่าความเผื่อของอุปกรณ์จะอธิบายได้ ค่าทฤษฎีด้านล่างคำนวณจากอินพุต CH1 ที่อ่านจากภาพถ่าย",
  "Figure": "รูปที่",
  "CH1 Vpp": "CH1 Vpp",
  "Observed CH2": "CH2 จากภาพ",
  "Analytical CH2": "CH2 ตามทฤษฎี",
  "Interpretation": "การแปลผล",
  "CH2 across source · φ = 0°": "CH2 คร่อมแหล่งจ่าย · φ = 0°",
  "Within component / reading envelope": "อยู่ในช่วงความเผื่ออุปกรณ์และการอ่านค่า",
  "Outside component tolerance; inspect measurement": "เกินความเผื่ออุปกรณ์ ควรตรวจสอบการวัด",
  "Saved on this device when storage is available.": "บันทึกในอุปกรณ์นี้เมื่อใช้งานพื้นที่จัดเก็บได้",
  "Saved on this device.": "บันทึกในอุปกรณ์นี้แล้ว",
  "Storage unavailable. Export CSV to keep your readings.": "ใช้งานพื้นที่จัดเก็บไม่ได้ โปรดส่งออก CSV เพื่อเก็บค่าที่บันทึก",
  "Recorded the current scope acquisition. Check readings to evaluate.": "บันทึกค่าจากออสซิลโลสโคปแล้ว กดตรวจคำตอบเพื่อประเมินผล",
  "Enter all four readings before checking.": "กรอกค่าที่วัดให้ครบทั้งสี่ช่องก่อนตรวจคำตอบ",
  "Use positive input Vpp, nonnegative peak amplitude and delay.": "อินพุต Vpp ต้องเป็นบวก ส่วนแอมพลิจูดค่ายอดและเวลาหน่วงต้องไม่ติดลบ",
  "Photo 10 anomaly: CH2 measures the generator. Equal amplitudes and φ ≈ 0° do not measure C_eq. Move CH2 to the R–C junction.": "ข้อผิดพลาดเหมือนภาพที่ 10: CH2 วัดที่เครื่องกำเนิดสัญญาณ ขนาดเท่ากันและ φ ≈ 0° จึงไม่ได้วัด C_eq ให้ย้าย CH2 ไปที่จุดต่อระหว่าง R กับ C",
  "Within ±5% R / ±10% C and reading resolution. Phase and Δt agree.": "อยู่ในช่วง R ±5% / C ±10% และความละเอียดการอ่านค่า มุมเฟสสอดคล้องกับ Δt",
  "Run the scope to capture a current acquisition.": "เปิดการเก็บสัญญาณของออสซิลโลสโคปก่อนบันทึกค่า",
  "Set up this row’s capacitance and sine-wave frequency first.": "ตั้งค่าความจุและความถี่คลื่นไซน์ให้ตรงกับแถวนี้ก่อน",
  "No measurable signal. Check both probe connections and source output.": "ไม่พบสัญญาณที่วัดได้ ตรวจสอบโพรบทั้งสองช่องและเอาต์พุตแหล่งจ่าย",
  "Unknown terminal. Use A1–J63 or a listed instrument jack.": "ไม่พบขั้วนี้ ใช้ชื่อรู A1–J63 หรือแจ็คเครื่องมือจากรายการ",
  "Unknown terminal. Use a listed jack or breadboard pin A1–J63 / T+1–B-50.": "ไม่พบขั้วนี้ เลือกแจ็คจากรายการ หรือรูเบรดบอร์ด A1–J63 / T+1–B-50",
  "Turn the generator and supply outputs off before replacing the component.": "ปิดเอาต์พุตเครื่องกำเนิดสัญญาณและแหล่งจ่ายไฟก่อนเปลี่ยนอุปกรณ์",
  "Bench reset. Worksheet readings are retained.": "รีเซ็ตโต๊ะทดลองแล้ว ข้อมูลในใบงานยังอยู่",
  "Empty bench. Select a part, then two pins. Connect the source and probes using the jacks or pin entry.": "โต๊ะทดลองว่างแล้ว เลือกอุปกรณ์และรูเสียบสองจุด จากนั้นต่อแหล่งจ่ายและโพรบด้วยแจ็คหรือระบุชื่อรูเสียบ",
  "Place a capacitor on the board first.": "วางตัวเก็บประจุบนบอร์ดก่อน",
  "Components must be placed in breadboard pins.": "ต้องเสียบขาอุปกรณ์ลงในรูเบรดบอร์ด",
  "Select a different pin for the second lead.": "เลือกรูอื่นสำหรับขาที่สอง",
  "Component placed. Its leads now participate in the circuit.": "วางอุปกรณ์แล้ว ขาทั้งสองเชื่อมต่อเข้าวงจรแล้ว",
  "Ground clip is on A29. Turn the generator OUTPUT on to observe the short.": "คลิปกราวด์อยู่ที่ A29 เปิดเอาต์พุตเครื่องกำเนิดสัญญาณเพื่อดูผลของการลัดวงจร",
  "Fault wired. Enable supply CH1 to observe the response.": "ต่อวงจรผิดตามสถานการณ์แล้ว เปิดแหล่งจ่าย CH1 เพื่อสังเกตผล",
  "Switch all generator and supply outputs off before servicing.": "ปิดเอาต์พุตเครื่องกำเนิดสัญญาณและแหล่งจ่ายไฟทุกช่องก่อนเปลี่ยนฟิวส์",
  "Outputs are still enabled. Switch them off before removing the fuse.": "เอาต์พุตยังเปิดอยู่ ให้ปิดก่อนถอดฟิวส์",
  "Fuse removed. Insert a fresh 3 A / 250 V ceramic fuse.": "ถอดฟิวส์แล้ว ใส่ฟิวส์เซรามิก 3 A / 250 V ตัวใหม่",
  "Outputs must be off and the old fuse removed.": "ต้องปิดเอาต์พุตและถอดฟิวส์เก่าออกก่อน",
  "New fuse installed. Correct the current-input wiring before enabling output.": "ใส่ฟิวส์ใหม่แล้ว แก้ไขการต่อสายช่องกระแสก่อนเปิดเอาต์พุต",
  "Earth clip shorts an active node. Move the black clip to the common return.": "คลิปสายดินลัดวงจรที่จุดมีศักย์ไฟฟ้า ให้ย้ายคลิปสีดำไปยังจุดร่วมของวงจร",
  "The current shunt exceeded 3 A. Fuse open. Disconnect outputs, open the rear compartment, and replace the fuse.": "กระแสผ่านชันต์เกิน 3 A ฟิวส์ขาดแล้ว ให้ปิดเอาต์พุต เปิดช่องด้านหลัง และเปลี่ยนฟิวส์",
  "Instrument rack": "ชุดเครื่องมือวัด",
  "Breadboard work area": "พื้นที่เบรดบอร์ด",
  "Experiment": "เลือกการทดลอง",
  "Bench viewport": "เลือกส่วนของโต๊ะทดลอง",
  "Connected leads": "สายที่เชื่อมต่อ",
  "Circuit events": "เหตุการณ์ในวงจร",
  "Close worksheet": "ปิดใบงาน",
  "Adjust selected supply voltage": "ปรับแรงดันแหล่งจ่ายช่องที่เลือก",
  "Drag, scroll, or arrow keys to adjust": "ลาก หมุนล้อเมาส์ หรือกดปุ่มลูกศรเพื่อปรับ",
  "Open rear fuse compartment": "เปิดช่องฟิวส์ด้านหลัง",
  "Adjust function generator frequency": "ปรับความถี่เครื่องกำเนิดสัญญาณ",
  "Drag or scroll to change frequency": "ลากหรือหมุนล้อเมาส์เพื่อเปลี่ยนความถี่",
  "Channel 1 volts per division": "สเกลแรงดันต่อช่องของ CH1",
  "Channel 2 volts per division": "สเกลแรงดันต่อช่องของ CH2",
  "Time per division": "ฐานเวลาต่อช่อง",
  "830 tie-point breadboard. Use pin entry controls below for keyboard access.": "เบรดบอร์ด 830 จุด ใช้ช่องกรอกชื่อรูด้านล่างเพื่อต่อวงจรด้วยแป้นพิมพ์",
  "Dual channel scope. Drag to position. Scroll to change timebase, Shift-scroll changes active voltage scale. Double-click to autoscale.": "ออสซิลโลสโคปสองช่อง ลากเพื่อเลื่อนคลื่น หมุนล้อเมาส์เพื่อปรับฐานเวลา กด Shift พร้อมหมุนเพื่อปรับสเกลแรงดัน ดับเบิลคลิกเพื่อปรับสเกลอัตโนมัติ",
  "Analytical low-pass magnitude response; click to set frequency": "กราฟขนาดผลตอบสนองความถี่ต่ำผ่าน คลิกเพื่อปรับความถี่",
  "Input node A12": "จุดอินพุต A12",
  "Capacitor output node A29": "จุดวัดแรงดันตัวเก็บประจุ A29",
  "Common return A49": "จุดร่วม A49",
  "DMM input high": "ขั้ว HI ของมัลติมิเตอร์",
  "DMM input low": "ขั้ว LO ของมัลติมิเตอร์",
  "DMM current 3A fused input": "ช่องกระแสมัลติมิเตอร์ พร้อมฟิวส์ 3 A",
  "Supply earth ground": "ขั้วสายดินของแหล่งจ่าย",
  "Generator TTL sync output": "เอาต์พุตซิงก์ TTL ของเครื่องกำเนิดสัญญาณ",
  "Generator return ground": "กราวด์ร่วมของเครื่องกำเนิดสัญญาณ",
  "Generator main output 50 ohm source": "เอาต์พุตหลักเครื่องกำเนิดสัญญาณ ความต้านทานภายใน 50 Ω",
  "UNDERSAMPLED · reduce TIME/DIV": "ตัวอย่างไม่พอ · ลด TIME/DIV",
  "STOP": "หยุด",
  "Auto": "อัตโนมัติ",
  "Trig’d": "ทริกเกอร์แล้ว"
};
  let language = 'th';
  if (typeof document === 'undefined') return;
  try { const saved = localStorage.getItem('ee-lab-language'); if (saved === 'en' || saved === 'th') language = saved; } catch { /* Private/file storage can be disabled. */ }
  const textSources = new WeakMap(), attributeSources = new WeakMap();
  Object.assign(dictionary, {
    '50 V · ceramic': '50 V · เซรามิก',
    'TIME / DIV': 'เวลา / ช่อง',
    'CH1 · V/DIV': 'CH1 · V/ช่อง',
    'CH2 · V/DIV': 'CH2 · V/ช่อง',
    'INPUT 10 MΩ / 3 A FUSED': 'อินพุต 10 MΩ / ฟิวส์ 3 A',
    'An offline electrical engineering bench with connected instruments, RC circuit analysis, and a Lab 7 worksheet.': 'โต๊ะปฏิบัติการวิศวกรรมไฟฟ้าออฟไลน์ พร้อมเครื่องมือวัด วงจร RC และใบงานแล็บ 7'
  });
  const patterns = [
    [/^EXPERIMENT (.+)$/, m => 'การทดลอง ' + m[1]],
    [/^(\d+) leads · (\d+) parts$/, m => 'สาย ' + m[1] + ' เส้น · อุปกรณ์ ' + m[2] + ' ชิ้น'],
    [/^(\d+) \/ 10 configurations within tolerance$/, m => m[1] + ' / 10 ชุด อยู่ในช่วงความเผื่อ'],
    [/^Table (7\.[123]) · (.*)$/, m => 'ตารางที่ ' + m[1] + ' · ' + ({'7.1':'ผลของค่าความจุที่ 300 Hz','7.2':'ผลตอบสนองความถี่ · C = 1.0 µF','7.3':'ตัวเก็บประจุอนุกรม · C_eq = 0.6875 µF'})[m[1]]],
    [/^Recheck (.*)\.$/, m => 'ตรวจสอบ ' + ({'A_c = Vpp(2) ÷ 2':'A_c = Vpp(2) ÷ 2','phase (negative for lag)':'มุมเฟส (ใช้ค่าลบเมื่อคลื่นล้าหลัง)','Δt in ms':'Δt ในหน่วย ms','φ = −360 × f × Δt':'φ = −360 × f × Δt'})[m[1]] + ' อีกครั้ง'],
    [/^(.+) dissipated ([\d.]+) W, exceeding 0.25 W. The resistor is now open\.$/, m => m[1] + ' มีกำลังสูญเสีย ' + m[2] + ' W เกิน 0.25 W ตัวต้านทานจึงขาดเป็นวงจรเปิด'],
    [/^(.+) has ([\d.]+) V reverse DC bias. The ruptured capacitor is a 0.01 Ω short\.$/, m => m[1] + ' ได้รับแรงดัน DC กลับขั้ว ' + m[2] + ' V ตัวเก็บประจุแตกและกลายเป็นลัดวงจร 0.01 Ω'],
    [/^Supply CH(\d) entered constant-current protection at ([\d.]+) A. Remove the overload to restore CV\.$/, m => 'แหล่งจ่าย CH' + m[1] + ' เข้าสู่โหมดจำกัดกระแสที่ ' + m[2] + ' A ให้แก้ไขโหลดเกินเพื่อกลับสู่โหมด CV'],
    [/^Select two new breadboard pins for (.+)\. First pin is positive\.$/, m => 'เลือกรูเสียบใหม่สองจุดสำหรับ ' + m[1] + ' ขาแรกเป็นขั้วบวก'],
    [/^Place (.+): select the first breadboard pin(.*), then the second pin\.$/, m => 'วาง ' + m[1] + ': เลือกรูเสียบแรก' + (m[2] ? ' (ขั้วบวก)' : '') + ' แล้วเลือกรูที่สอง'],
    [/^First lead at (.+)\. Select the second breadboard pin\.$/, m => 'ขาแรกอยู่ที่ ' + m[1] + ' เลือกรูเสียบสำหรับขาที่สอง'],
    [/^(.+) selected. Choose a destination pin or jack. Escape cancels\.$/, m => 'เลือก ' + m[1] + ' แล้ว เลือกรูเสียบหรือแจ็คปลายทาง กด Escape เพื่อยกเลิก'],
    [/^Figure (.+): measured input calibrated to (.+) Vpp. Analytical CH2 remains independent of the photographed reading\.$/, m => 'รูปที่ ' + m[1] + ': ปรับอินพุตที่วัดได้เป็น ' + m[2] + ' Vpp ค่า CH2 ยังคำนวณจากสมการ ไม่ใช้ค่าจากภาพแทน'],
    [/^Supply CH(\d) (positive|negative)$/, m => 'ขั้ว' + (m[2] === 'positive' ? 'บวก' : 'ลบ') + ' ของแหล่งจ่าย CH' + m[1]],
    [/^Scope channel (\d) (probe tip|earth ground clip)$/, m => (m[2] === 'probe tip' ? 'หัวโพรบ' : 'คลิปสายดิน') + ' ออสซิลโลสโคป CH' + m[1]],
    [/^Place (.+)$/, m => 'วางอุปกรณ์ ' + m[1]],
    [/^Cable (.+) endpoint (a|b)$/, m => 'ปลายสาย ' + m[2] + ' ของสาย ' + m[1]],
    [/^Remove cable (.+) to (.+)$/, m => 'ถอดสายจาก ' + m[1] + ' ไปยัง ' + m[2]],
    [/^Table (.+) Hz (.+) µF (input|peak|dt|phase)$/, m => 'ตาราง ' + m[1] + ' Hz ' + m[2] + ' µF ' + ({input:'อินพุต Vpp',peak:'แอมพลิจูดค่ายอด',dt:'เวลาหน่วง',phase:'มุมเฟส'})[m[3]]]
  ];
  function t(source) {
    if (language === 'en') return source;
    if (dictionary[source]) return dictionary[source];
    for (const [pattern, render] of patterns) { const match = source.match(pattern); if (match) return render(match); }
    return source.replace('custom circuit', 'วงจรที่ต่อเอง').replace(' · double-click to unplug', ' · ดับเบิลคลิกเพื่อถอดสาย')
      .replace(/ · (good|burnt|ruptured|open)$/, (_, state) => ' · ' + ({good:'ปกติ',burnt:'ไหม้ขาด',ruptured:'แตก',open:'วงจรเปิด'})[state])
      .replace(/^(\d+) FPS · (RUN|STOP)$/, (_, fps, state) => fps + ' FPS · ' + (state === 'RUN' ? 'ทำงาน' : 'หยุด'));
  }
  const skip = node => node.parentElement?.closest('script, style, noscript, code, [data-no-i18n]');
  function translateText(node) {
    if (skip(node) || !node.data.trim()) return;
    const previous = textSources.get(node);
    const source = previous && node.data === previous.rendered ? previous.source : node.data;
    const trimmed = source.trim(); const rendered = source.replace(trimmed, t(trimmed));
    textSources.set(node, { source, rendered }); if (node.data !== rendered) node.data = rendered;
  }
  function translateAttributes(node) {
    if (node.closest('script, style, [data-no-i18n]')) return;
    let saved = attributeSources.get(node); if (!saved) { saved = {}; attributeSources.set(node, saved); }
    for (const attr of ['aria-label', 'title', 'placeholder']) {
      if (!node.hasAttribute(attr)) continue;
      const current = node.getAttribute(attr), previous = saved[attr];
      const source = previous && current === previous.rendered ? previous.source : current, rendered = t(source);
      saved[attr] = { source, rendered }; if (current !== rendered) node.setAttribute(attr, rendered);
    }
    // Option labels must never change the value used by instrument state machines.
    if (node.tagName === 'OPTION' && !node.hasAttribute('value')) node.setAttribute('value', node.textContent);
  }
  function translateTree(root) {
    if (root.nodeType === Node.TEXT_NODE) { translateText(root); return; }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE) translateAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) if (node.nodeType === Node.TEXT_NODE) translateText(node); else translateAttributes(node);
  }
  const config = { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'title', 'placeholder'] };
  const observer = new MutationObserver(records => {
    observer.disconnect();
    for (const record of records) {
      if (record.type === 'childList') for (const node of record.addedNodes) translateTree(node);
      else if (record.type === 'characterData') translateText(record.target);
      else translateAttributes(record.target);
    }
    observer.observe(document.documentElement, config);
  });
  function apply() {
    observer.disconnect(); translateTree(document.documentElement); document.documentElement.lang = language;
    for (const button of document.querySelectorAll('[data-language-toggle]')) {
      button.setAttribute('aria-label', language === 'th' ? 'เปลี่ยนเป็นภาษาอังกฤษ' : 'Switch to Thai');
      button.setAttribute('aria-pressed', String(language === 'th'));
      button.querySelector('[data-lang="th"]').classList.toggle('selected-language', language === 'th');
      button.querySelector('[data-lang="en"]').classList.toggle('selected-language', language === 'en');
    }
    observer.observe(document.documentElement, config);
  }
  function setLanguage(next) {
    if (!['th', 'en'].includes(next)) return;
    language = next; try { localStorage.setItem('ee-lab-language', language); } catch { /* The in-session toggle still works. */ }
    apply(); window.dispatchEvent(new CustomEvent('languagechange', { detail: { language } }));
  }
  const markup = '<span data-lang="th">ไทย</span><span aria-hidden="true"> / </span><span data-lang="en">EN</span>';
  for (const host of [document.querySelector('.topbar nav'), ...document.querySelectorAll('.dialog-header')]) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'language-toggle'; button.dataset.languageToggle = ''; button.dataset.noI18n = ''; button.innerHTML = markup;
    button.addEventListener('click', () => setLanguage(language === 'th' ? 'en' : 'th'));
    host.insertBefore(button, host.lastElementChild);
  }
  EE.i18n = { t, setLanguage, addMessages(messages) { Object.assign(dictionary, messages); apply(); }, get language() { return language; }, apply };
  apply();
})();
