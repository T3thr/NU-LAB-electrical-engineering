# เอกสารมาตรฐานระบบการออกแบบหน้าปฏิบัติการ (Lab Design System)
## ภาควิชาวิศวกรรมไฟฟ้าและคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ มหาวิทยาลัยนเรศวร
### โครงสร้างและแบบแผนแม่บทสำหรับพัฒนาเว็บปฏิบัติการวิศวกรรมไฟฟ้า (Labs 01 ถึง 09)

---

### 1. ปรัชญาและแนวคิดการออกแบบ (Core Philosophy)

ระบบการออกแบบหน้าเว็บปฏิบัติการวิศวกรรมไฟฟ้ายึดหลัก **"Textbook Academic Quality · Symmetrical & Distraction-Free"** (สไตล์ตำราวิชาการระดับสากล มีความสมมาตร ไร้สิ่งรบกวนสายตา):
1. **โทนสีสบายตาแบบกระดาษวิชาการ (Academic Paper Palette):** ใช้พื้นหลังสีกระดาษถนอมสายตา ตัดด้วยเส้นหมึกแท้และฟอนต์มาตรฐานวิศวกรรมไทย
2. **ความสมมาตรและสมดุลสายตา (Symmetry & Visual Balance):** ปราศจากองค์ประกอบรกตาหรือข้อความลอยที่ไม่สัมพันธ์กับเนื้อหา องค์ประกอบหัวเรื่องต้องจัดวางตรงกึ่งกลางระนาบอย่างแท้จริง
3. **การจัดแนวที่ประณีต (Pixel-Perfect Alignment):** ตัวเลขหัวข้อวงกลม ต้องอยู่ในระนาบกึ่งกลางร่วมกับตัวอักษรหัวเรื่องหลักเสมอ ไม่ตกขอบหรือเบ้ลง
4. **ความสะอาดของภาษาและสัญลักษณ์ (Clean Technical Typography):**
   - **ห้ามใช้อีโมจิ (Emoji) และเครื่องหมาย Em Dash / En Dash ในเนื้อหาและการตกแต่งทุกกรณีโดยเด็ดขาด** (ใช้เฉพาะเครื่องหมายวรรคตอนและสัญลักษณ์มาตรฐาน เช่น `:`, plain hyphen `-`, bullet `·`, ลูกศรทิศทาง `▲`, `▼`, `↗`)
   - **ห้ามใช้สัญลักษณ์แปลกปลอม** เช่น เครื่องหมายมาตรา Section Sign หรือลูกศรสีฉูดฉาด
   - **ปฏิบัติตามกฎเหล็ก Zero-Dollar-Sign Policy อย่างเคร่งครัด 100%**
5. **สูตรคณิตศาสตร์ที่มนุษย์อ่านง่ายสบายตา (Human-Readable Pure CSS Math):** จัดเรียงสมการ ตัวแปร เศษส่วน และเครื่องหมายทางคณิตศาสตร์ให้เสมือนตำราจริง อ่านลื่นไหล โหลดทันที ไม่พึ่งพาไลบรารีภายนอก
6. **อินเตอร์แอ็กทีฟแบบไม่บังเนื้อหา (Interactive Unobtrusive Dock & ScrollSpy):** แถบนำทางด่วนลอยตัวต้องสามารถหุบเก็บได้ พร้อมระบบ ScrollSpy ไฮไลต์หัวข้อปัจจุบันแบบ Dynamic ช่วยให้ผู้ใช้ทราบตำแหน่งการอ่านได้ตลอดเวลา

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
  --font-serif-math: "Times New Roman", Times, Georgia, serif;
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

<!-- ═══════════ 3. Floating Navigation Dock (หุบ/ขยายได้ พร้อม ScrollSpy) ═══════════ -->
<aside class="float-nav-dock" id="float-nav-dock" aria-label="แถบนำทางด่วน">
  <!-- กล่องแสดงรายการลิงก์เมื่อขยาย -->
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

  <!-- ปุ่มแคปซูลมินิมอลเมื่อหุบแถบ (แสดงชื่อหัวข้อปัจจุบันแบบ Dynamic) -->
  <button type="button" class="fnd-trigger-btn" id="fnd-btn-expand" title="เปิดแถบนำทางด่วน" aria-label="เปิดแถบนำทางด่วน">
    <span class="fnd-trigger-text">นำทางด่วน</span>
    <span class="fnd-current-topic" id="fnd-current-topic"></span>
    <span class="fnd-trigger-arrow">▲</span>
  </button>
</aside>

<a class="top-link" href="#" title="กลับขึ้นบนสุด">&#8593;</a>

<!-- ═══════════ 4. Page Main Container ═══════════ -->
<div class="page">
  <!-- ส่วนเนื้อหาตามลำดับมาตรฐานวิชาการ -->
</div>

<!-- ═══════════ 5. สคริปต์ควบคุม Lightbox, Floating Dock และ ScrollSpy ═══════════ -->
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
  if (!dock) return;

  const setCollapsed = (collapsed) => {
    dock.classList.toggle('collapsed', collapsed);
    try {
      localStorage.setItem('lab_nav_dock_collapsed', collapsed ? 'true' : 'false');
    } catch(e) {}
  };

  try {
    if (localStorage.getItem('lab_nav_dock_collapsed') === 'true') {
      dock.classList.add('collapsed');
    }
  } catch(e) {}

  if (btnCollapse) {
    btnCollapse.addEventListener('click', (e) => { e.preventDefault(); setCollapsed(true); });
  }
  if (btnExpand) {
    btnExpand.addEventListener('click', (e) => { e.preventDefault(); setCollapsed(false); });
  }

  // Dynamic ScrollSpy Section Highlight
  const navLinks = Array.from(dock.querySelectorAll('.fnd-links a[href^="#"]'));
  const currentTopicEl = document.getElementById('fnd-current-topic');

  const targets = navLinks.map(link => {
    const id = link.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    return el ? { link, el } : null;
  }).filter(Boolean);

  function updateActive() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const offset = 180;
    let current = null;

    for (let i = 0; i < targets.length; i++) {
      const top = targets[i].el.getBoundingClientRect().top + scrollY;
      if (scrollY + offset >= top) {
        current = targets[i];
      }
    }

    targets.forEach(t => {
      if (current && t === current) {
        t.link.classList.add('active');
        t.link.setAttribute('aria-current', 'true');
      } else {
        t.link.classList.remove('active');
        t.link.removeAttribute('aria-current');
      }
    });

    if (currentTopicEl) {
      currentTopicEl.textContent = current ? ' : ' + current.link.textContent.trim() : '';
    }
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', updateActive, { passive: true });
  updateActive();
})();
</script>
</body>
</html>
```

---

### 4. สไตล์แถบนำทางด่วนและระบบ ScrollSpy (Dock CSS & Interaction)

```css
/* ═══════════ Floating Navigation Dock (Collapsible & ScrollSpy) ═══════════ */
.float-nav-dock {
  position: fixed;
  left: 20px;
  bottom: 20px;
  z-index: 999;
}

.fnd-panel {
  background: rgba(255, 253, 247, 0.94);
  border: 1.5px solid var(--ink);
  border-radius: 12px;
  padding: 10px 14px 12px;
  box-shadow: 0 8px 24px rgba(40, 32, 10, 0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 480px;
}

.fnd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--rule);
  padding-bottom: 6px;
}

.fnd-title {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--accent2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.fnd-close-btn {
  background: var(--paper2);
  border: 1px solid var(--rule);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--ink-soft);
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.fnd-close-btn:hover {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}

.fnd-links {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.fnd-btn {
  padding: 5px 10px;
  border-radius: 6px;
  border: 1.5px solid var(--ink);
  background: #FFFFFF;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  font-size: 0.80rem;
  font-weight: 700;
  color: var(--ink);
  text-decoration: none;
  transition: all 0.15s ease;
  line-height: 1.3;
}

.fnd-btn:hover {
  background: var(--ink);
  color: var(--paper);
}

/* Active Highlight เมื่อ Scroll มาถึงหัวข้อ */
.fnd-btn.active {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
  box-shadow: 0 2px 8px rgba(26, 22, 18, 0.28);
  position: relative;
}

.fnd-btn.active::after {
  content: "";
  position: absolute;
  bottom: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
}

.fnd-btn-vlab {
  background: var(--accent);
  color: #FFFFFF;
  border-color: var(--accent);
}

.fnd-btn-vlab:hover {
  background: var(--accent-hover, #1D4ED8);
  color: #FFFFFF;
}

/* ปุ่มแคปซูลเมื่อหุบ */
.fnd-trigger-btn {
  display: none;
  align-items: center;
  gap: 6px;
  background: rgba(255, 253, 247, 0.94);
  border: 1.5px solid var(--ink);
  border-radius: 999px;
  padding: 7px 14px;
  box-shadow: 0 4px 14px rgba(40, 32, 10, 0.14);
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--ink);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.15s ease;
  font-family: inherit;
}

.fnd-trigger-btn:hover {
  background: var(--ink);
  color: var(--paper);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(40, 32, 10, 0.22);
}

.fnd-trigger-arrow {
  font-size: 0.72rem;
  line-height: 1;
}

.fnd-current-topic {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--accent);
}

.fnd-trigger-btn:hover .fnd-current-topic {
  color: #93C5FD;
}

/* ควบคุมการสลับโหมดหุบ/เปิด */
.float-nav-dock.collapsed .fnd-panel {
  display: none;
}

.float-nav-dock.collapsed .fnd-trigger-btn {
  display: inline-flex;
}
```

---

### 5. มาตรฐานส่วนหัวบทเรียน (Symmetrical Central Lab Header)

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

```css
header.lab-header {
  text-align: center;
  margin-bottom: 32px;
}

.lab-pill-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 14px;
}

.lab-pill {
  display: inline-block;
  background: var(--ink);
  color: var(--paper);
  border: 1.5px solid var(--ink);
  border-radius: 999px;
  padding: 3px 20px;
  font-size: 0.88rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  font-family: monospace, sans-serif;
}

h1.book-title {
  font-size: 2.15rem;
  line-height: 1.35;
  margin: 8px auto 12px;
  font-weight: 800;
  color: var(--ink);
  text-align: center;
  max-width: 900px;
}

.subtitle {
  color: var(--ink-soft);
  font-size: 1.02rem;
  margin: 0 auto 20px;
  line-height: 1.7;
  text-align: center;
  max-width: 840px;
}

.lab-header-rule {
  border: none;
  border-bottom: 3px double var(--ink);
  width: 100%;
  margin: 22px auto 0;
}
```

**กฎข้อห้าม (Strict Prohibitions):**
- ห้ามใส่ข้อความ "ภาควิชาวิศวกรรมไฟฟ้า..." หรือ "รหัสวิชา EE LAB 1" ในส่วนนี้ เพราะมีอยู่ใน Sticky Header ด้านบนแล้ว
- Pill ต้องมีเฉพาะรหัสแล็บ เช่น `LAB 01`, `LAB 07` เท่านั้น ห้ามใส่ข้อความยาวรุงรัง

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
**กฎเหล็ก:** ห้ามใช้สัญลักษณ์มาตรา Section Sign, ลูกศรหลากสี หรือสัญลักษณ์ตกแต่งแปลกปลอมนำหน้า `<h3>`:

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

### 7. ระบบการจัดวางสูตรและสมการคณิตศาสตร์ที่มนุษย์อ่านง่าย (Human-Readable Pure CSS Math System)

เพื่อแก้ปัญหาความช้าและข้อผิดพลาดในการเรนเดอร์ของ KaTeX/MathJax รวมถึงป้องกันปัญหาตัวหนังสือแตกบน Antigravity IDE และอุปกรณ์พกพา ทุกบทปฏิบัติการต้องจัดวางสมการคณิตศาสตร์ด้วย **Pure CSS Math Architecture** ดังนี้:

#### 7.1 หัวใจสำคัญของระบบคณิตศาสตร์สไตล์ Lab 7
1. **ตัวแปรคณิตศาสตร์ใช้ Serif Italic (`.var`):** ใช้ฟอนต์ `"Times New Roman", Times, serif` ตัวเอียง หนาปานกลาง เพื่อแยกตัวแปรทางฟิสิกส์ออกจากข้อความบรรยายภาษาไทยอย่างชัดเจน
2. **เศษส่วนแท้สองชั้น (`.frac`, `.num`, `.denom`):** ใช้ Flexbox เรียงตัวเศษและตัวส่วนในแนวตั้ง พร้อมเส้นคั่นเศษส่วนความหนา 1.6px ที่ปรับตามสีของข้อความ (`currentColor`) รองรับเศษส่วนซ้อนกันได้หลายชั้น
3. **เครื่องหมายรากที่สองสมบูรณ์แบบ (`.sqrt`, `.sqrt-sym`, `.sqrt-radicand`):** เชื่อมสัญลักษณ์ราก `&radic;` เข้ากับเส้นปีกกาด้านบน (Vinculum Overline) คลุมตัวเลขหรือนิพจน์ภายในทั้งหมดอย่างเป็นระเบียบ
4. **ระยะเว้นวรรคตัวดำเนินการ (`.sym`):** เว้นระยะห่างซ้าย-ขวา 4px รอบเครื่องหมายคูณ `&times;`, บวก `+`, ลบ `-`, เท่ากับ `=`, ประมาณ `&approx;` ทำให้อ่านสบายตา ไม่เบียดอัดแน่น
5. **การแทนค่าแบบมีลำดับขั้น (Step-by-Step Substitution):** แสดงสูตรสัญลักษณ์หลักก่อน ตามด้วยการแทนค่าตัวเลข แสดงผลลัพธ์เศษส่วน และลงท้ายด้วยคำตอบสุดท้ายพร้อมหน่วยทางไฟฟ้า

#### 7.2 ชุด CSS มาตรฐานสำหรับระบบสมการ

```css
/* ═══════════ กล่องสูตรคณิตศาสตร์และเศษส่วน ═══════════ */
.formula {
  background: #FFFFFF;
  border: 1.5px solid var(--rule);
  border-radius: 8px;
  padding: 18px 24px;
  margin: 20px 0;
  text-align: center;
  font-size: 1.15rem;
  overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* กล่องสมการหลักสำคัญ (Governing Key Equation) */
.formula.big {
  font-size: 1.25rem;
  border-width: 2px;
  border-color: var(--ink);
  background: #FFFDF9;
}

/* สไตล์เศษส่วนแบบแท้ (Pure CSS Fraction) */
.frac {
  display: inline-flex;
  flex-direction: column;
  vertical-align: middle;
  text-align: center;
  padding: 0 4px;
  line-height: 1.15;
  font-size: 0.95em;
}

.frac .num {
  border-bottom: 1.6px solid currentColor;
  padding-bottom: 3px;
  display: block;
}

.frac .denom {
  padding-top: 3px;
  display: block;
}

/* เครื่องหมายสแควร์รูทพร้อมเส้นคลุม (Square Root with Vinculum) */
.sqrt {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.sqrt-sym {
  font-size: 1.25em;
  line-height: 1;
  margin-right: 1px;
}

.sqrt-radicand {
  border-top: 1.6px solid currentColor;
  padding-top: 2px;
  display: inline-block;
}

/* ตัวแปรคณิตศาสตร์และฟิสิกส์ */
.var {
  font-style: italic;
  font-weight: 600;
  font-family: "Times New Roman", Times, Georgia, serif;
}

/* เว้นวรรคตัวดำเนินการทางคณิตศาสตร์ */
.sym {
  margin: 0 4px;
}
```

#### 7.3 ตัวอย่างแม่แบบสมการที่นำไปคัดลอกใช้ได้ทันที

**ก. สมการบรรทัดเดียวทั่วไป (Inline / Single-line Equation):**
```html
<div class="formula">
  <span class="var">v<sub>s</sub></span>(<span class="var">t</span>) = <span class="var">A</span> cos(<span class="var">&omega;t</span>)
</div>
```

**ข. สมการเศษส่วน (Fraction Equation):**
```html
<div class="formula">
  <span class="var">Z<sub>C</sub></span> = 
  <span class="frac">
    <span class="num">1</span>
    <span class="denom"><span class="var">j&omega;C</span></span>
  </span>
  = -<span class="var">j</span>
  <span class="frac">
    <span class="num">1</span>
    <span class="denom"><span class="var">&omega;C</span></span>
  </span>
</div>
```

**ค. สมการรากที่สอง (Square Root & Vinculum):**
```html
<div class="formula big">
  <b>แอมพลิจูดค่ายอดของแรงดันตกคร่อมตัวเก็บประจุ (สมการที่ 5):</b><br><br>
  <span class="var">A<sub>c</sub></span> = 
  <span class="frac">
    <span class="num"><span class="var">A</span></span>
    <span class="denom">
      <span class="sqrt">
        <span class="sqrt-sym">&radic;</span>
        <span class="sqrt-radicand">1 + (<span class="var">&omega;RC</span>)<sup>2</sup></span>
      </span>
    </span>
  </span>
</div>
```

**ง. การแสดงขั้นตอนการคำนวณและการแทนค่าตัวเลข (Step-by-step Substitution):**
```html
<div class="formula">
  <span class="var">C<sub>eq</sub></span> = 
  <span class="frac">
    <span class="num">1.0 <span class="sym">&times;</span> 2.2</span>
    <span class="denom">1.0 + 2.2</span>
  </span>
  =
  <span class="frac">
    <span class="num">2.2</span>
    <span class="denom">3.2</span>
  </span>
  = 0.6875 &mu;F <span class="sym">&approx;</span> 0.688 &mu;F
</div>
```

**จ. สมการเศษส่วนซ้อนหลายชั้น (Nested Complex Fractions):**
```html
<div class="formula big">
  <span class="var">V<sub>c</sub></span>(<span class="var">j&omega;</span>) = 
  <span class="frac">
    <span class="num"><span class="var">Z<sub>C</sub></span></span>
    <span class="denom"><span class="var">R</span> + <span class="var">Z<sub>C</sub></span></span>
  </span>
  <span class="sym">&times;</span> <span class="var">V<sub>s</sub></span>(<span class="var">j&omega;</span>)
  =
  <span class="frac">
    <span class="num">
      <span class="frac"><span class="num">1</span><span class="denom"><span class="var">j&omega;C</span></span></span>
    </span>
    <span class="denom">
      <span class="var">R</span> + <span class="frac"><span class="num">1</span><span class="denom"><span class="var">j&omega;C</span></span></span>
    </span>
  </span>
  <span class="sym">&times;</span> <span class="var">V<sub>s</sub></span>(<span class="var">j&omega;</span>)
  =
  <span class="frac">
    <span class="num">1</span>
    <span class="denom">1 + <span class="var">j&omega;RC</span></span>
  </span>
  <span class="sym">&times;</span> <span class="var">V<sub>s</sub></span>(<span class="var">j&omega;</span>)
</div>
```

#### 7.4 ตารางสัญลักษณ์ Unicode และหน่วยวัดทางไฟฟ้ามาตรฐาน

| ปริมาณทางไฟฟ้า / สัญลักษณ์ | รหัส HTML Entity | อักขระ Unicode | ตัวอย่างการใช้งาน |
| :--- | :--- | :---: | :--- |
| เครื่องหมายคูณ | `&times;` | `×` | `2 <span class="sym">&times;</span> &pi;` |
| เครื่องหมายหาร | `&divide;` | `÷` | `10 <span class="sym">&divide;</span> 2` |
| เครื่องหมายบวก-ลบ | `&plusmn;` | `±` | `5.00 <span class="sym">&plusmn;</span> 0.05 V` |
| เครื่องหมายรากที่สอง | `&radic;` | `√` | `<span class="sqrt-sym">&radic;</span>` |
| เครื่องหมายประมาณ | `&approx;` | `≈` | `<span class="sym">&approx;</span> 159.15 Hz` |
| ความถี่เชิงมุม (Omega เล็ก) | `&omega;` | `ω` | `<span class="var">&omega;</span> = 2&pi;f` |
| พาย (Pi) | `&pi;` | `π` | `2&pi;` |
| มุมเฟส (Phi) | `&phi;` | `φ` | `<span class="var">&phi;</span> = -arctan(...)` |
| องศา | `&deg;` | `°` | `-52.3&deg;` |
| ความต้านทาน โอห์ม | `&Omega;` | `Ω` | `100 &Omega;` หรือ `1 k&Omega;` |
| ตัวเก็บประจุ ไมโครฟารัด | `&mu;F` | `μF` | `1.0 &mu;F` |
| เวลา ไมโครวินาที | `&mu;s` | `μs` | `436 &mu;s` |
| ความถี่ เฮิร์ตซ์ | plain text | `Hz`, `kHz` | `300 Hz`, `5 kHz` |
| แรงดันไฟฟ้า ยอดถึงยอด | `V<sub>p-p</sub>` | `V_p-p` | `10.0 V<sub>p-p</sub>` |

---

### 8. มาตรฐานการแสดงตารางบันทึกผลและผลการคำนวณ (Data Tables)

```html
<div class="table-wrap">
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
</div>
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
สำหรับพิมพ์ข้อความสรุปฉบับกระชับ ให้นักศึกษาสามารถนำไปคัดลอกลงเล่มรายงานการทดลองได้อย่างถูกต้อง:
```html
<div class="prose-submission-box">
  <div class="ps-header">
    <span class="ps-badge">คำตอบสำหรับบันทึกลงสมุดแล็บ</span>
    <span class="ps-title">บทอภิปรายผลเชิงความเรียง (ฉบับกระชับสำหรับคัดลอกลงเล่มรายงาน)</span>
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
| 4 | ตรวจสอบว่าไม่มีสัญลักษณ์มาตรา Section Sign หน้า `<h3>` หรือหัวข้อย่อยใด ๆ ในเอกสาร | บังคับ |
| 5 | แถบนำทางลอยตัว `.float-nav-dock` มีปุ่ม `✕ หุบแถบ` และย่อเป็นแคปซูล `นำทางด่วน ▲` ได้ | บังคับ |
| 6 | ติดตั้งระบบ Dynamic ScrollSpy ไฮไลต์ `.fnd-btn.active` และแสดงชื่อหัวข้อปัจจุบัน | บังคับ |
| 7 | ปราศจากอีโมจิ (Emoji) และเครื่องหมาย Em Dash / En Dash ทุกกรณี 100% | บังคับ |
| 8 | สูตรคณิตศาสตร์ปราศจากเครื่องหมายดอลลาร์ไซน์ 100% และจัดรูปด้วย Pure CSS Math (`.frac`, `.sqrt`, `.var`) | บังคับ |
| 9 | รองรับ Lightbox เมื่อคลิกภาพถ่ายผลการทดลอง | บังคับ |
| 10 | ทดสอบ Responsive บนหน้าจอมือถือ (360px - 768px) และจอคอมพิวเตอร์ (1200px+) | บังคับ |
