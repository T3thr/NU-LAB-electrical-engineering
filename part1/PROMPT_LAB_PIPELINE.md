# แม่แบบคำสั่งพัฒนาระบบเว็บปฏิบัติการ (Loop Engineering Master Prompt)
## สำหรับสร้างเว็บคู่มือและจำลองผลการทดลอง: Lab 06, Lab 08 และ Lab 09

---

### โครงสร้างสภาพแวดล้อมที่จัดเตรียมไว้แล้ว (Pre-configured Workspace)

1. **เอกสารระบบการออกแบบแม่บท (Single Source of Truth):**
   - [part1/DESIGN_SYSTEM.md](file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/part1/DESIGN_SYSTEM.md)
2. **เครื่องมือและตรรกะจำลองผลการทดลอง (Virtual Lab Simulator):**
   - [virtual-lab](file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/virtual-lab)
3. **โฟลเดอร์ไฟล์ภาพคู่มือและปลายทางจัดเก็บของแต่ละบท:**
   - **Lab 06:** [part1/lab6/guide](file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/part1/lab6/guide) (หน้า 49 - 55) และ [part1/lab6/result](file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/part1/lab6/result)
   - **Lab 08:** [part1/lab8/guide](file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/part1/lab8/guide) (หน้า 74 - 88) และ [part1/lab8/result](file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/part1/lab8/result)
   - **Lab 09:** [part1/lab9/guide](file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/part1/lab9/guide) (หน้า 89 - 103) และ [part1/lab9/result](file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/part1/lab9/result)

---

### Loop Engineering Execution Framework (4 Closed Loops)

```text
[Loop 1: Ingestion & OCR] -> อ่านภาพคู่มือ guide/ ถอดตาราง สูตร ขั้นตอนทดลอง
         |
[Loop 2: Simulation & Graphics] -> จำลองรูปคลื่นออสซิลโลสโคปเสมือนจริงลง result/
         |
[Loop 3: Web Page Construction] -> ประกอบ index.html ตาม DESIGN_SYSTEM.md 100%
         |
[Loop 4: Self-Audit & Quality Gate] -> ตรวจสอบ Zero-Dollar, No Emoji, No Em-Dash, ScrollSpy
```

---

### ข้อความ Prompt ฉบับทางการ (Copy & Run)

```text
คุณคือระบบ AI วิศวกรรมผู้เชี่ยวชาญด้าน Electrical Engineering และ Front-End Web Architecture
ภารกิจของคุณคือสร้างหน้าเว็บคู่มือและวิเคราะห์ผลการทดลองฉบับสมบูรณ์สำหรับบทปฏิบัติการเป้าหมาย [ระบุ LAB 06, LAB 08 หรือ LAB 09] โดยแปลงเนื้อหาจากภาพคู่มือในโฟลเดอร์ guide/ และจำลองภาพผลการทดลองจากโมเดลเครื่องมือใน virtual-lab ให้เป็นไปตามมาตรฐานการออกแบบระดับสากลใน part1/DESIGN_SYSTEM.md อย่างเคร่งครัด 100%

ดำเนินการตามลำดับ Loop Engineering ดังนี้:

[LOOP 1: INGESTION & MANUAL PARSING]
1. ตรวจสอบไฟล์ภาพทั้งหมดในโฟลเดอร์ part1/labX/guide/ ตามดัชนี README.md
2. ถอดความเนื้อหาอย่างครบถ้วน: วัตถุประสงค์การทดลอง, รายการอุปกรณ์, ทฤษฎีและสมการคณิตศาสตร์, แผนภาพวงจร, ขั้นตอนการทดลองทีละข้อ, ตารางบันทึกผลการทดลอง, และคำถามท้ายบท

[LOOP 2: INSTRUMENT SIMULATION & GRAPHICS GENERATION]
1. เนื่องจากไม่มีภาพถ่ายผลการทดลองจริง ให้สร้างภาพจำลองหน้าจอออสซิลโลสโคปและเครื่องมือวัดเสมือนจริง โดยอิงโครงสร้างหน้าจอเครื่องมือจาก virtual-lab/js/instruments/digital-oscilloscope.js
2. บันทึกภาพผลการทดลองลงในโฟลเดอร์ part1/labX/result/ ในรูปแบบไฟล์ SVG หรือ PNG ความละเอียดสูง:
   - ออสซิลโลสโคปต้องมีพื้นหลังสีเข้ม (#080E18 หรือ #0F172A), ตารางกริดมาตรฐาน 10x8 Divisions มีจุดแบ่ง Sub-divisions (0.2 div)
   - สัญญาณช่อง 1 (CH1) ใช้เส้นสีเหลืองทอง (#F59E0B) และช่อง 2 (CH2) ใช้เส้นสีฟ้าไซแอน (#06B6D4)
   - มีกล่องแสดงค่าพารามิเตอร์บนหน้าจอ: Time/Div, Volt/Div, Vp-p, ความถี่ (Freq), และมุมเฟส (Phase)
   - แสดงรูปคลื่นตามหลักการฟิสิกส์ไฟฟ้าจริงของบทนั้นๆ (เช่น สัญญาณไซน์, สี่เหลี่ยม, สามเหลี่ยม สำหรับ Lab 6; สัญญาณเรียงกระแสครึ่งคลื่น, คลื่นเต็ม, ริปเปิล สำหรับ Lab 8; สัญญาณกลับเฟส 180 องศา, การขลิบยอดคลื่น สำหรับ Lab 9)

[LOOP 3: PAGE CONSTRUCTION (index.html)]
สร้างไฟล์ part1/labX/index.html โดยยึดโครงสร้างและ CSS จาก part1/DESIGN_SYSTEM.md:
1. Shell & Header: ติดตั้งคอมโพเนนต์ <site-header data-page="lab-0X" data-base="../../"> บนสุด
2. Symmetrical Header: กลางหน้ามี Pill แสดงรหัส "LAB 0X", ชื่อบทภาษาไทยตัวหนา, คำอธิบายย่อย, และเส้นคู่ Double Ink Rule (ห้ามใส่ข้อความชื่อภาควิชาซ้ำซ้อน)
3. Floating Navigation Dock: แถบนำทางด่วนลอยตัวมุมซ้ายล่าง มีปุ่ม "✕ หุบแถบ" ที่ย่อเป็นแคปซูลมินิมอล "นำทางด่วน : [ชื่อหัวข้อปัจจุบัน] ▲" พร้อมระบบ Dynamic ScrollSpy ไฮไลต์ปุ่ม .fnd-btn.active ตามตำแหน่งการเลื่อนหน้าจอของผู้ใช้
4. Human-Readable Pure CSS Math:
   - ห้ามใช้เครื่องหมาย Dollar Sign และห้ามใช้ KaTeX/LaTeX โดยเด็ดขาด
   - ตัวแปรคณิตศาสตร์ใช้คลาส .var (Times New Roman ตัวเอียง)
   - เศษส่วนใช้ Flexbox สองชั้นคลาส .frac, .num, .denom
   - สแควร์รูทใช้คลาส .sqrt, .sqrt-sym, .sqrt-radicand พร้อมเส้นขีดคลุมด้านบน
   - ตัวดำเนินการเว้นวรรค 4px ด้วยคลาส .sym (×, ÷, ±, √, ≈, Ω, μF, μs, π)
   - แสดงสูตรแม่บทในกล่อง .formula.big และขั้นตอนแทนค่าตัวเลขอย่างละเอียด
5. Result Cards: แสดงภาพจำลองรูปคลื่นคู่กับตารางวิเคราะห์ 7 พารามิเตอร์มาตรฐาน และรองรับ Lightbox ขยายเต็มจอเมื่อคลิก
6. Prose Submission Box: กล่องข้อเขียนสรุปผลฉบับกระชับ (.prose-submission-box) สำหรับให้นักศึกษาคัดลอกลงเล่มรายงาน
7. Safety Alert Box: กล่องเตือนภัยความปลอดภัย (.alert-box.danger) ในจุดที่เสี่ยงต่อการลัดวงจรหรืออุปกรณ์เสียหาย

[LOOP 4: QUALITY GATE & STRICT RULES AUDIT]
ก่อนส่งมอบงาน ต้องตรวจสอบความถูกต้องครบทั้ง 5 ข้อ:
1. ZERO DOLLAR SIGN: ตรวจสอบไม่ให้มีเครื่องหมายดอลลาร์ไซน์ในไฟล์ 100%
2. NO EMOJI & NO EM-DASH: ปราศจากอีโมจิและเครื่องหมายขีดผิดประเภท (ใช้เฉพาะ :, plain hyphen -, ·, ▲, ▼, ↗)
3. SYMMETRY & ALIGNMENT: ตัวเลขหัวข้อวงกลม (.sec-no) อยู่กึ่งกลางระนาบเดียวกับข้อความ h2
4. NO SECTION SIGN: ปราศจากสัญลักษณ์มาตรา Section Sign หน้าหัวข้อ
5. RESPONSIVE & LINKS: ทดสอบลิงก์ภายในและตรวจความสมบูรณ์บนจอมือถือและเดสก์ท็อป
```

---

### รายละเอียดพารามิเตอร์เฉพาะรายบท (Lab-Specific Recipes)

#### 1. สเปกสำหรับ Lab 06: การใช้งานออสซิลโลสโคปและเครื่องกำเนิดสัญญาณ
- **โฟลเดอร์คู่มือ:** [part1/lab6/guide](file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/part1/lab6/guide) (หน้า 49 - 55)
- **ภาพจำลองที่ต้องสร้างใน `part1/lab6/result/`:**
  1. `01_sec6_1_fig6_1_sine_1khz.svg`: สัญญาณคลื่นไซน์ 1 kHz, 5 Vp-p (Volt/Div: 1 V, Time/Div: 0.2 ms)
  2. `02_sec6_1_fig6_2_square_1khz.svg`: สัญญาณคลื่นสี่เหลี่ยม 1 kHz, 5 Vp-p สำหรับการทดสอบ Probe Calibration
  3. `03_sec6_1_fig6_3_triangle_1khz.svg`: สัญญาณคลื่นสามเหลี่ยม 1 kHz, 5 Vp-p
  4. `04_sec6_2_voltage_comparison.svg`: การวัดแรงดัน Vp-p เปรียบเทียบกับค่า V_rms บนมัลติมิเตอร์ DMM
- **สมการสำคัญ:**
  - `V_rms = V_p / √2 = V_p-p / (2√2) ≈ 0.3535 × V_p-p`
  - `T = 1 / f`, `f = 1 / T`

#### 2. สเปกสำหรับ Lab 08: ไดโอดและวงจรเรียงกระแส
- **โฟลเดอร์คู่มือ:** [part1/lab8/guide](file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/part1/lab8/guide) (หน้า 74 - 88)
- **ภาพจำลองที่ต้องสร้างใน `part1/lab8/result/`:**
  1. `01_sec8_1_diode_iv_curve.svg`: กราฟคุณลักษณะ I-V แสดงแรงดันคัตอิน V_gamma = 0.7 V ของ Si และ 0.3 V ของ Ge
  2. `02_sec8_2_fig8_10_half_wave.svg`: วงจรเรียงกระแสครึ่งคลื่น (CH1: Sine 10 Vp-p, CH2: Half-wave rectified ยอดตัด 0.7 V)
  3. `03_sec8_3_fig8_11_half_wave_c_filter.svg`: ครึ่งคลื่นต่อตัวเก็บประจุกรองสัญญาณ แสดง Ripple Voltage (V_r) และความชันการคายประจุ
  4. `04_sec8_4_fig8_15_full_wave_bridge.svg`: วงจรเรียงกระแสเต็มคลื่นบริดจ์ (ความถี่ระลอกคลื่นกลายเป็น 2 เท่า = 100 Hz, ยอดตัด 2V_D = 1.4 V)
- **สมการสำคัญ:**
  - ครึ่งคลื่น: `V_dc = (V_m - V_D) / π`, `V_r(p-p) ≈ (V_m - V_D) / (f × R_L × C)`
  - เต็มคลื่นบริดจ์: `V_dc = 2(V_m - 2V_D) / π`, `V_r(p-p) ≈ (V_m - 2V_D) / (2f × R_L × C)`
  - ตัวคูณริปเปิล: `r = V_r(rms) / V_dc`

#### 3. สเปกสำหรับ Lab 09: วงจรขยายสัญญาณโดยใช้ออปแอมป์
- **โฟลเดอร์คู่มือ:** [part1/lab9/guide](file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/part1/lab9/guide) (หน้า 89 - 103)
- **ภาพจำลองที่ต้องสร้างใน `part1/lab9/result/`:**
  1. `01_sec9_1_inverting_dc.svg`: วงจรขยายกลับเฟสไฟตรง ทดสอบอัตราขยาย Av = -Rf / R1
  2. `02_sec9_2_non_inverting_dc.svg`: วงจรขยายไม่กลับเฟสไฟตรง Av = 1 + Rf / R1
  3. `03_sec9_3_voltage_follower_dc.svg`: วงจรตามแรงดัน (Unity Gain Buffer, Av = 1)
  4. `04_sec9_4_fig9_8_inverting_ac.svg`: สัญญาณไฟสลับกลับเฟส 180 องศา (CH1: ขาเข้า, CH2: ขาออกกลับทิศและขยายขนาด)
  5. `05_sec9_4_fig9_9_inverting_clipped.svg`: สัญญาณไฟสลับกรณีเกิดการขลิบยอดคลื่น (Clipping / Saturation ที่ระดับ ±V_sat)
  6. `06_sec9_5_fig9_12_non_inverting_ac.svg`: สัญญาณไฟสลับขยายแบบเฟสตรงกัน (In-phase, 0 องศา)
- **สมการสำคัญ:**
  - กลับเฟส: `v_o = -(R_f / R_1) × v_in`, `A_v = -R_f / R_1`
  - ไม่กลับเฟส: `v_o = (1 + R_f / R_1) × v_in`, `A_v = 1 + R_f / R_1`
  - วงจรตามแรงดัน: `v_o = v_in`, `A_v = 1`
  - ขอบเขตแรงดันอิ่มตัว: `-V_sat ≤ v_o ≤ +V_sat` (โดยประมาณ `V_CC - 1.5 V` ถึง `V_EE + 1.5 V`)
