# เอกสารมาตรฐานระบบการออกแบบหน้าปฏิบัติการ (Lab Design System)
## ภาควิชาวิศวกรรมไฟฟ้าและคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ มหาวิทยาลัยนเรศวร
### โครงสร้างและแบบแผนแม่บทสำหรับพัฒนาเว็บปฏิบัติการวิศวกรรมไฟฟ้า (Labs 01 ถึง 09)

---

### 1. ปรัชญาและแนวคิดการออกแบบ (Core Philosophy)

ระบบการออกแบบหน้าเว็บปฏิบัติการวิศวกรรมไฟฟ้ายึดหลัก **"Textbook Academic Quality · Symmetrical & Distraction-Free"** (สไตล์ตำราวิชาการระดับสากล มีความสมมาตร ไร้สิ่งรบกวนสายตา):
1. **โทนสีสบายตาแบบกระดาษวิชาการ (Academic Paper Palette):** ใช้พื้นหลังสีกระดาษถนอมสายตา ตัดด้วยเส้นหมึกแท้และฟอนต์มาตรฐานวิศวกรรมไทย
2. **ความสมมาตรและสมดุลสายตา (Symmetry & Visual Balance):** ปราศจากองค์ประกอบรกตาหรือข้อความลอยที่ไม่สัมพันธ์กับเนื้อหา องค์ประกอบหัวเรื่องต้องจัดวางตรงกึ่งกลางระนาบอย่างแท้จริง
3. **การจัดแนวที่ประณีต (Pixel-Perfect Alignment):** ตัวเลขหัวข้อวงกลม ต้องอยู่ในระนาบกึ่งกลางร่วมกับตัวอักษรหัวเรื่องหลักเสมอ ไม่ตกขอบหรือเบ้ลง
4. **ความสะอาดของภาษาและสัญลักษณ์ (Clean Technical Typography):** ปราศจากสัญลักษณ์แปลกปลอม เช่น เครื่องหมายหัวข้อมาตรากฎหมาย (§), ไม่มีอีโมจิ, และปฏิบัติตามกฎ ZERO-DOLLAR-SIGN อย่างเคร่งครัด
5. **ไม่บังเนื้อหา (Unobtrusive Floating Elements):** แถบนำทางด่วนและ Header ต้องมีระบบ หุบ/ขยาย (Collapsible) ได้ เพื่อคืนพื้นที่หน้าจอสูงสุดสำหรับการศึกษาและอ่านวงจร

---

### 2. ชุดตัวแปรกำหนดค่าสีและมิติ (Design Tokens)

```css
:root {
  /* โทนสีกระดาษและหมึกพิมพ์ */
  --paper: #FBF8F1;       /* พื้นหลังกระดาษหลัก ถนอมสายตา */
  --paper2: #F5F0E4;      /* พื้นหลังกระดาษรอง / กล่องไฮไลต์ */
  --ink: #22292F;         /* สีหมึกพิมพ์หลัก คมชัด อ่านง่าย */
  --ink-soft: #4B5563;    /* สีหมึกรอง คำอธิบายประกอบ */
  --rule: #D8CFBC;        /* เส้นคั่นตารางและขอบกรอบ */

  /* สีประจำหมวดวิชาการและเน้นความสำคัญ */
  --accent: #1E40AF;       /* น้ำเงินวิศวกรรม (Engineering Blue) สำหรับลิงก์และหัวข้อย่อย */
  --accent-hover: #1D4ED8; /* น้ำเงินเข้มเมื่อเลื่อนเมาส์ผ่าน */
  --accent2: #B45309;      /* ส้มอิฐวิชาการ สำหรับตัวเลขและข้อสังเกต */
  --navy: #0F172A;         /* น้ำเงินเข้มระดับสถาบัน */

  /* สีสถานะทางวิศวกรรม */
  --green: #047857;        /* เขียวมาตรฐาน / ยืนยันผล / ผ่านเกณฑ์ */
  --green-bg: #ECFDF5;     /* พื้นหลังสีเขียวอ่อน */
  --red: #B91C1C;          /* แดงเตือนภัย / จุดผิดพลาดจากการวัด */
  --red-bg: #FEF2F2;       /* พื้นหลังสีแดงอ่อน */
  --purple: #6D28D9;       /* ม่วงสัญลักษณ์การคำนวณเชิงทฤษฎี */
  --blue-bg: #EFF6FF;      /* พื้นหลังไฮไลต์สัญญาณ */

  /* แบบอักษรหลัก */
  --font-sans: "IBM Plex Sans Thai", "Sarabun", "Thonburi", -apple-system, sans-serif;
  --font-mono: "SF Mono", "Consolas", "Courier New", monospace;

  /* มิติกรอบ */
  --page-max-width: 1120px;
}
```

---

### 3. โครงสร้างแม่แบบพื้นฐานของหน้าแล็บ (HTML Page Shell)

ทุกบทปฏิบัติการตั้งแต่ Lab 01 ถึง Lab 09 ต้องใช้โครงสร้างแท็กมาตรฐานเดียวกัน ดังนี้:

```html
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="data:,">
<title>ปฏิบัติการที่ X: [ชื่อบทปฏิบัติการภาษาไทย] · ปฏิบัติการวิศวกรรมไฟฟ้า 1</title>

<!-- เชื่อมโยงสไตล์ชีตและคอมโพเนนต์ส่วนกลาง -->
<link rel="stylesheet" href="../../assets/css/site-header.css">
<script src="../../assets/js/site-header.js"></script>

<style>
/* CSS ประจำหน้าตามมาตรฐาน Design System */
</style>
</head>
<body>

<!-- ═══════════ 1. Unified Standardized Sticky Header ═══════════ -->
<site-header data-page="lab-0X" data-base="../../"></site-header>

<!-- ═══════════ 2. Modal Lightbox สำหรับขยายภาพถ่ายผลการทดลอง ═══════════ -->
<div id="lb" onclick="this.classList.remove('on')">
  <span class="x">&times;</span>
  <img id="lb-img" src="" alt="ภาพขยายขนาดเต็ม">
</div>

<!-- ═══════════ 3. Floating Navigation Dock (หุบ/ขยายได้) ═══════════ -->
<aside class="float-nav-dock" id="float-nav-dock" aria-label="แถบนำทางด่วน">
  <div class="fnd-panel" id="fnd-panel">
    <div class="fnd-header">
      <span class="fnd-title">นำทางด่วน (Quick Nav)</span>
      <button type="button" class="fnd-close-btn" id="fnd-btn-collapse" title="หุบแถบนำทาง">
        ✕ หุบแถบ
      </button>
    </div>
    <div class="fnd-links">
      <a class="fnd-btn" href="#sec-intro">อุปกรณ์</a>
      <a class="fnd-btn" href="#sec-theory">ทฤษฎี</a>
      <a class="fnd-btn" href="#sec-part1">ตอนที่ X.1</a>
      <a class="fnd-btn" href="#sec-part2">ตอนที่ X.2</a>
      <a class="fnd-btn fnd-btn-vlab" href="../../virtual-lab/index.html" target="_blank">Virtual Lab ↗</a>
    </div>
  </div>

  <button type="button" class="fnd-trigger-btn" id="fnd-btn-expand" title="เปิดสารบัญนำทางด่วน">
    <span class="fnd-trigger-text">🧭 นำทางด่วน</span>
    <span class="fnd-trigger-arrow">▲</span>
  </button>
</aside>

<a class="top-link" href="#" title="กลับขึ้นบนสุด">&#8593;</a>

<!-- ═══════════ 4. Page Main Container ═══════════ -->
<div class="page">
  <!-- ส่วนเนื้อหาตามลำดับมาตรฐานวิชาการ -->
</div>

<!-- ═══════════ 5. สคริปต์ควบคุม Lightbox และ Floating Dock ═══════════ -->
<script>
function openLb(src) {
  var lb = document.getElementById('lb');
  var img = document.getElementById('lb-img');
  img.src = src;
  lb.classList.add('on');
}

(function() {
  const dock = document.getElementById('float-nav-dock');
  const btnCollapse = document.getElementById('fnd-btn-collapse');
  const btnExpand = document.getElementById('fnd-btn-expand');
  if (!dock || !btnCollapse || !btnExpand) return;

  const setCollapsed = (collapsed) => {
    dock.classList.toggle('collapsed', collapsed);
    localStorage.setItem('lab_nav_dock_collapsed', collapsed ? 'true' : 'false');
  };

  if (localStorage.getItem('lab_nav_dock_collapsed') === 'true') {
    dock.classList.add('collapsed');
  }

  btnCollapse.addEventListener('click', (e) => { e.preventDefault(); setCollapsed(true); });
  btnExpand.addEventListener('click', (e) => { e.preventDefault(); setCollapsed(false); });
})();
</script>
</body>
</html>
```

---

### 4. มาตรฐานส่วนหัวบทเรียน (Symmetrical Central Lab Header)

ส่วนหัวของหน้าต้องสมมาตร สะอาดตา และไม่อัดแน่นด้วยข้อความซ้ำซ้อนกับ Sticky Header:

```html
<header class="lab-header">
  <div class="lab-pill-wrap">
    <span class="lab-pill">LAB 0X</span>
  </div>
  <h1 class="book-title">ปฏิบัติการที่ X: [ชื่อบทปฏิบัติการภาษาไทยฉบับเต็ม]</h1>
  <p class="subtitle">[สรุปสังเขปสาระสำคัญ ขั้นตอนการทดลอง การวัด และการวิเคราะห์ผล]</p>
  <div class="lab-header-rule"></div>
</header>
```

**กฎข้อห้าม (Strict Prohibitions):**
- ห้ามใส่ข้อความ "ภาควิชาวิศวกรรมไฟฟ้า..." หรือ "รหัสวิชา EE LAB 1" ในส่วนนี้ เพราะมีอยู่ใน Sticky Header ด้านบนแล้ว
- Pill ต้องมีเฉพาะรหัสแล็บ เช่น `LAB 01`, `LAB 07` เท่านั้น ห้ามใส่ข้อความยาวรุงรัง

---

### 5. มาตรฐานกล่องสรุปภาพรวมและสารบัญ (Overview Box & Table of Contents)

#### ก. กล่องสรุปสาระสำคัญ (Laboratory Overview Box)
```html
<div class="summary-box">
  <p><b>วัตถุประสงค์หลักของการทดลอง:</b> [ข้อความระบุเป้าหมายการทดลองเชิงทฤษฎีและปฏิบัติการ]</p>
  <p><b>ขอบเขตเนื้อหาตามคู่มือ:</b> [ระบุหน้าในเล่มคู่มือ เช่น หน้า 20 ถึง 28 พร้อมจำนวนตอนการทดลอง]</p>
</div>
```

#### ข. สารบัญหัวข้อ (Table of Contents)
```html
<nav class="toc">
  <div class="toc-head">สารบัญเนื้อหาการทดลอง (TABLE OF CONTENTS)</div>
  <a href="#sec-intro"><span class="no">1.</span> วัตถุประสงค์และรายการอุปกรณ์การทดลอง (หน้า XX)</a>
  <a href="#sec-theory"><span class="no">2.</span> ทฤษฎีและสมการพื้นฐานวงจร (หน้า XX – XX)</a>
  <a href="#sec-part1"><span class="no">3.</span> การทดลองตอนที่ X.1: [ชื่อตอน] (หน้า XX – XX)</a>
  <a href="#sec-part2"><span class="no">4.</span> การทดลองตอนที่ X.2: [ชื่อตอน] (หน้า XX – XX)</a>
  <a href="#sec-analysis"><span class="no">5.</span> การวิเคราะห์ผลและตอบคำถามท้ายการทดลอง</a>
</nav>
```

---

### 6. มาตรฐานหัวข้อหลักและหัวข้อย่อย (Headings & Typography)

#### ก. หัวข้อตอนหลัก (Section Headings)
ตัวเลขวงกลมและตัวอักษรหัวเรื่องต้องใช้ `align-items: center;` เสมอ เพื่อให้อยู่ในระนาบสมมาตรสมบูรณ์:

```css
.sec-head {
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 2.5px solid var(--ink);
  padding-bottom: 12px;
  margin-bottom: 24px;
}

.sec-no {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--paper);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  font-weight: 800;
  line-height: 1;
}

h2 {
  font-size: 1.45rem;
  margin: 0;
  font-weight: 800;
  line-height: 1.35;
  color: var(--ink);
}
```

```html
<div class="sec-head">
  <div class="sec-no">4</div>
  <h2>การทดลองตอนที่ 7.1: ผลของค่าความจุ C ต่อขนาดและเฟสของแรงดัน</h2>
</div>
```

#### ข. หัวข้อย่อย (Subsection Headings - H3 & H4)
**กฎเหล็ก:** ห้ามใช้สัญลักษณ์มาตรา (`§`), ลูกศรหลากสี หรือสัญลักษณ์แปลกปลอมนำหน้า `<h3>`:

```css
h3 {
  font-size: 1.18rem;
  margin: 32px 0 12px;
  font-weight: 800;
  color: var(--accent);
}

h4 {
  font-size: 1.05rem;
  margin: 22px 0 10px;
  font-weight: 800;
  color: var(--ink);
}
```

```html
<h3>การคำนวณทางทฤษฎี</h3>
<p>...</p>

<h3>สาเหตุทางเทคนิคในห้องปฏิบัติการ</h3>
<p>...</p>
```

---

### 7. มาตรฐานการแสดงสูตรและสมการคณิตศาสตร์ (Strict Zero-Dollar Policy)

**ห้ามใช้เครื่องหมาย Dollar Sign หรือ KaTeX/LaTeX โดยเด็ดขาด** ให้ใช้ Unicode และกล่องสูตรตามมาตรฐาน:

```html
<div class="formula">
  C_eq = (1.0 &times; 2.2) / (1.0 + 2.2) = 2.2 / 3.2 = 0.6875 &mu;F &approx; 0.688 &mu;F
</div>
```

หรือกรณีสมการเศษส่วนหลายชั้น:
```html
<div class="formula">
  A_c (คำนวณ) = 5 / &radic;(1 + (&omega;RC)<sup>2</sup>) = 3.055 V (V_p-p &approx; 6.11 V)
</div>
```

**ตารางสัญลักษณ์ Unicode บังคับใช้:**
- เครื่องหมายคูณ: `&times;` หรือ `×`
- เครื่องหมายหาร: `&divide;` หรือ `÷`
- เครื่องหมายบวก-ลบ: `&plusmn;` หรือ `±`
- เครื่องหมายรากที่สอง: `&radic;` หรือ `√`
- เครื่องหมายประมาณ: `&approx;` หรือ `≈`
- ตัวห้อยและตัวยก: ใช้แท็ก HTML `<sub>...</sub>` และ `<sup>...</sup>` หรือ Unicode `₀ ₁ ₂ ₃` / `⁰ ¹ ² ³`
- สัญลักษณ์หน่วย: `&Omega;` (Ω), `k&Omega;` (kΩ), `&mu;F` (μF), `&mu;s` (μs), `&pi;` (π)

---

### 8. มาตรฐานการแสดงตารางบันทึกผลและผลการคำนวณ (Data Tables)

```html
<table class="data-table">
  <thead>
    <tr>
      <th style="width: 80px;">จุดวัด</th>
      <th>ปริมาณทางไฟฟ้า</th>
      <th style="width: 140px;">ค่าคำนวณ (Theory)</th>
      <th style="width: 140px;">ค่าวัดจริง (Measured)</th>
      <th style="width: 120px;">ความคลาดเคลื่อน (%)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>จุดที่ 1</td>
      <td>แรงดันตกคร่อมตัวต้านทาน V_R</td>
      <td>3.535 V</td>
      <td>3.520 V</td>
      <td><span class="badge-val pass">-0.42%</span></td>
    </tr>
  </tbody>
</table>
```

---

### 9. มาตรฐานการแสดงภาพถ่ายหน้าจอเครื่องมือและการวิเคราะห์ผล (Result Card)

สำหรับภาพถ่ายออสซิลโลสโคป มัลติมิเตอร์ หรือวงจรจริง ให้จัดวางในโครงสร้าง Split Card (ภาพอยู่ซ้าย/บน ตารางวิเคราะห์ค่าอยู่ขวา/ล่าง):

```html
<div class="result-card">
  <div class="result-card-header">
    <div class="result-card-title">รูปที่ 7.1: สัญญาณแรงดันรูปคลื่นไซน์ CH1 และ CH2 ที่ความถี่ 300 Hz</div>
    <span class="chip" style="border-color:var(--accent); color:var(--accent);">RESULT 01 · หน้า 61</span>
  </div>

  <div class="result-card-grid">
    <!-- คอลัมน์สื่อภาพถ่าย -->
    <div class="result-card-media">
      <img src="result/01_fig7_8_c1uf_300hz.jpg" alt="รูปคลื่นสัญญาณออสซิลโลสโคป" onclick="openLb(this.src)">
      <div class="media-hint">คลิกที่ภาพเพื่อขยายขนาดเต็ม (High-Resolution Zoom)</div>
    </div>

    <!-- คอลัมน์ตารางวิเคราะห์พารามิเตอร์ 7 ค่ามาตรฐาน -->
    <div class="result-card-body">
      <div class="table-wrap">
        <table class="field-table">
          <thead>
            <tr>
              <th style="width: 32px;">ลำดับ</th>
              <th>พารามิเตอร์ที่อ่านได้จากหน้าจอ</th>
              <th style="width: 110px;">ค่าที่อ่านได้</th>
              <th>ตำแหน่งอ้างอิงบนหน้าจอ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="f-no">1</td>
              <td class="f-name">แรงดันยอดถึงยอด CH1 (V_p-p1)</td>
              <td><span class="f-val">10.1 V</span></td>
              <td class="f-src">กล่อง Measurement แถวที่ 1</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-calc">
        <b>สรุปผลการวิเคราะห์เปรียบเทียบ:</b> สัญญาณ CH2 มีขนาดลดลงเหลือ 6.11 V และมีมุมเฟสล้าหลัง 52.3&deg; สอดคล้องกับทฤษฎีวงจร RC
      </div>
    </div>
  </div>
</div>
```

---

### 10. กล่องอภิปรายผลและความปลอดภัย (Discussion & Warning Callouts)

#### ก. กล่องส่งงานข้อเขียน (Prose Submission Box)
```html
<div class="prose-submission-box">
  <div class="ps-header">
    <span class="ps-badge">คำตอบสำหรับบันทึกลงสมุดแล็บ</span>
    <span class="ps-title">ข้อความอภิปรายผลการทดลองฉบับทางการ</span>
  </div>
  <div class="ps-text">
    จากการทดลองตอนที่ X พบว่า... สอดคล้องกับระเบียบวิธีคำนวณทางทฤษฎี โดยมีเปอร์เซ็นต์ความคลาดเคลื่อนเพียง 1.2% ซึ่งอยู่ในเกณฑ์ยอมรับได้ของความคลาดเคลื่อนของอุปกรณ์วัด
  </div>
</div>
```

#### ข. กล่องแจ้งเตือนความปลอดภัย (Safety & Equipment Alert)
```html
<div class="alert-box danger">
  <div class="alert-title">ข้อควรระวังเรื่องการต่อสายกราวด์ของโพรบ</div>
  <p>คลิปกราวด์ของโพรบออสซิลโลสโคปทั้ง 2 ช่องต่อถึงกันภายในผ่านขั้วต่อ BNC หากคีบคลิปกราวด์ไว้ที่จุดศักย์ไฟฟ้าต่างกัน จะก่อให้เกิดการลัดวงจร (Short Circuit) ผ่านตัวเครื่องทันที</p>
</div>
```

---

### 11. สรุป Checklist การส่งมอบหน้าแล็บใหม่ให้ได้มาตรฐานเดียวกัน

| ลำดับการตรวจสอบ | รายการที่ต้องปฏิบัติตามมาตรฐาน | สถานะ |
| :---: | :--- | :---: |
| 1 | ติดตั้ง `<site-header data-page="lab-0X" data-base="../../">` บนสุดของ body | บังคับ |
| 2 | นำคำว่า "ภาควิชา..." และ "รหัสวิชา..." ออกจากส่วนหัวกลาง คงไว้เฉพาะ pill `LAB 0X` กึ่งกลาง | บังคับ |
| 3 | ตรวจสอบตัวเลขวงกลม `.sec-no` ให้อยู่กึ่งกลางระนาบเดียวกับข้อความหัวข้อ `h2` อย่างแท้จริง | บังคับ |
| 4 | ตรวจสอบว่าไม่มีสัญลักษณ์มาตรา `§` หน้า `<h3>` หรือหัวข้อย่อยใด ๆ ในเอกสาร | บังคับ |
| 5 | แถบนำทางลอยตัว `.float-nav-dock` มีปุ่ม `✕ หุบแถบ` และย่อเป็นแคปซูล `🧭 นำทางด่วน ▲` ได้ | บังคับ |
| 6 | สูตรคณิตศาสตร์ปราศจากเครื่องหมายดอลลาร์ไซน์ 100% และใช้ Unicode ครบถ้วน | บังคับ |
| 7 | รองรับ Lightbox เมื่อคลิกภาพถ่ายผลการทดลอง | บังคับ |
| 8 | ทดสอบ Responsive บนหน้าจอมือถือ (360px - 768px) และจอคอมพิวเตอร์ (1200px+) | บังคับ |
