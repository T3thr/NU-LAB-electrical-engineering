/**
 * NU Electrical Engineering Laboratory Portal
 * Reusable Standardized Header & Navigation Web Component (<site-header>)
 * Provides unified sticky header, responsive navbar, standardized breadcrumb,
 * collapsible reading mode, and mobile drawer across all laboratory pages (Portal, Part 1, Part 2, Labs 1-9).
 */

(function() {
  // Master Catalog of Laboratories (Part 1: Circuits & Measurement)
  const LAB_CATALOG = [
    { id: 'lab-01', num: '01', title: 'แหล่งจ่ายไฟตรง และ มัลติมิเตอร์', en: 'DC Power Supply & Multimeter', path: 'part1/lab1/index.html', ready: false },
    { id: 'lab-02', num: '02', title: 'กฎของโอห์ม วงจรอนุกรม ขนาน ผสม', en: "Ohm's Law & Divider", path: 'part1/lab2/index.html', ready: false },
    { id: 'lab-03', num: '03', title: 'การวิเคราะห์วงจร 1: KCL และ KVL', en: 'Resistive Network: KCL/KVL', path: 'part1/lab3/index.html', ready: false },
    { id: 'lab-04', num: '04', title: 'การวิเคราะห์วงจร 2: ทับซ้อน และ เทวินิน', en: 'Superposition & Thevenin', path: 'part1/lab4/index.html', ready: false },
    { id: 'lab-05', num: '05', title: 'กำลังไฟฟ้าตรง และ ถ่ายโอนกำลังสูงสุด', en: 'Maximum Power Transfer', path: 'part1/lab5/index.html', ready: false },
    { id: 'lab-06', num: '06', title: 'ออสซิลโลสโคป และ กำเนิดสัญญาณ', en: 'Oscilloscope & Generator', path: 'part1/lab6/index.html', ready: false },
    { id: 'lab-07', num: '07', title: 'ผลตอบสนองต่อไฟสลับในวงจร RC', en: 'AC Response in RC Circuit', path: 'part1/lab7/index.html', ready: true },
    { id: 'lab-08', num: '08', title: 'ไดโอด แอลอีดี และ วงจรเรียงกระแส', en: 'Diode, LED & Rectifiers', path: 'part1/lab8/index.html', ready: false },
    { id: 'lab-09', num: '09', title: 'ออปแอมป์ วงจรขยาย และ บัฟเฟอร์', en: 'Op-Amp Circuits', path: 'part1/lab9/index.html', ready: false }
  ];

  class SiteHeader extends HTMLElement {
    connectedCallback() {
      const page = this.getAttribute('data-page') || 'portal';
      const base = this.getAttribute('data-base') || './';
      const customTitle = this.getAttribute('data-breadcrumb-label') || '';
      const noBreadcrumb = this.getAttribute('data-no-breadcrumb') === 'true';

      this.render(page, base, customTitle, noBreadcrumb);
      this.attachEvents();
    }

    // Generate Standardized Breadcrumb Items Array
    getBreadcrumbs(page, base, customTitle) {
      const homeItem = { label: 'หน้าแรก', url: `${base}index.html` };

      if (page === 'portal') {
        return [
          { label: 'ระบบสื่อการสอนและห้องปฏิบัติการวิศวกรรมไฟฟ้า (Portal)', url: null, isCurrent: true }
        ];
      }

      if (page === 'part1') {
        return [
          homeItem,
          { label: customTitle || 'ปฏิบัติการวิศวกรรมไฟฟ้า 1 (Part 1: Circuits & Measurement)', url: null, isCurrent: true }
        ];
      }

      if (page === 'part2') {
        return [
          homeItem,
          { label: customTitle || 'ปฏิบัติการวิศวกรรมไฟฟ้า 2 (Part 2: Power & Machinery)', url: null, isCurrent: true }
        ];
      }

      // Check if page matches any Lab
      const normalizedPage = page.replace('lab', 'lab-0').replace('lab-00', 'lab-0');
      const labMatch = LAB_CATALOG.find(l => l.id === page || l.id === normalizedPage || page === 'lab' + parseInt(l.num, 10));

      if (labMatch) {
        return [
          homeItem,
          { label: 'ปฏิบัติการวิศวกรรมไฟฟ้า 1', url: `${base}part1/index.html` },
          { label: customTitle || `ปฏิบัติการที่ ${parseInt(labMatch.num, 10)} (${labMatch.title})`, url: null, isCurrent: true }
        ];
      }

      // Default fallback
      return [
        homeItem,
        { label: customTitle || page, url: null, isCurrent: true }
      ];
    }

    render(page, base, customTitle, noBreadcrumb) {
      const breadcrumbs = this.getBreadcrumbs(page, base, customTitle);
      const isPart1Active = page === 'part1' || page.startsWith('lab');
      const isPart2Active = page === 'part2';
      const currentLab = LAB_CATALOG.find(l => l.id === page || page === 'lab' + parseInt(l.num, 10));
      const currentLabelText = breadcrumbs[breadcrumbs.length - 1]?.label || '';

      // Build Desktop Dropdown Lab Items
      const dropdownItemsHtml = LAB_CATALOG.map(lab => {
        const isActive = (currentLab && currentLab.num === lab.num);
        const tagHtml = lab.ready 
          ? '<span class="lab-tag tag-ready">พร้อมใช้งาน</span>' 
          : '<span class="lab-tag tag-coming">กำลังจัดทำ</span>';
        const href = lab.ready ? `${base}${lab.path}` : `${base}part1/index.html#sec-labs`;
        return `
          <a href="${href}" class="dropdown-item ${isActive ? 'active' : ''}">
            <span><strong>Lab ${lab.num}:</strong> ${lab.title}</span>
            ${tagHtml}
          </a>
        `;
      }).join('');

      // Build Mobile Accordion Lab Items
      const mobileAccordionHtml = LAB_CATALOG.map(lab => {
        const isActive = (currentLab && currentLab.num === lab.num);
        const href = lab.ready ? `${base}${lab.path}` : `${base}part1/index.html#sec-labs`;
        const tagText = lab.ready ? '(พร้อมใช้งาน)' : '(กำลังจัดทำ)';
        return `
          <a href="${href}" class="mobile-lab-item ${isActive ? 'active' : ''}">
            <span><strong>Lab ${lab.num}:</strong> ${lab.title}</span>
            <small style="color:${lab.ready ? 'var(--green)' : 'var(--ink-soft)'}; font-weight:700;">${tagText}</small>
          </a>
        `;
      }).join('');

      // Build Breadcrumb HTML
      const breadcrumbsHtml = breadcrumbs.map(item => {
        if (item.isCurrent) {
          return `<li><span class="current">${item.label}</span></li>`;
        }
        return `<li><a href="${item.url}">${item.label}</a><span class="sep">›</span></li>`;
      }).join('');

      this.innerHTML = `
        <header class="site-header" id="site-header">
          <!-- Main Sticky Header Bar -->
          <div class="site-header-main">
            <!-- Brand Link -->
            <a href="${base}index.html" class="nav-brand" title="กลับสู่หน้าหลักห้องปฏิบัติการ">
              <span class="brand-icon-box" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12h3l2-6 4 12 4-12 3 6h4"></path>
                  <circle cx="21" cy="12" r="1.5" fill="currentColor"></circle>
                </svg>
              </span>
              <span class="brand-badge">EE LAB</span>
              <span class="brand-title">วิศวกรรมไฟฟ้า ม.นเรศวร</span>
              <span class="brand-sub">· Laboratory Portal</span>
            </a>

            <!-- Mini indicator shown when header is in Collapsed Mode -->
            <div class="collapsed-indicator" title="${currentLabelText}">
              <span class="ci-pill">หน้าปัจจุบัน</span>
              <span>${currentLabelText}</span>
            </div>

            <!-- Desktop Navigation Menu -->
            <nav class="site-navbar-nav" aria-label="Main Navigation">
              <ul class="site-navbar-nav">
                <li class="nav-item">
                  <a href="${base}index.html" class="nav-link ${page === 'portal' ? 'active' : ''}">
                    หน้าหลัก
                  </a>
                </li>

                <!-- Dropdown for Part 1 (Labs 01-09) -->
                <li class="nav-item dropdown-parent" id="part1-dropdown-parent">
                  <button type="button" class="nav-link dropdown-toggle-btn ${isPart1Active ? 'active' : ''}" id="part1-dropdown-btn" aria-expanded="false" aria-haspopup="true">
                    ปฏิบัติการ 1 (Circuits) ▾
                  </button>
                  <div class="dropdown-menu" id="part1-dropdown-menu">
                    <div class="dropdown-header">9 บทเรียนปฏิบัติการวิศวกรรมไฟฟ้า 1</div>
                    <a href="${base}part1/index.html" class="dropdown-item" style="font-weight:700; color:var(--accent);">
                      <span>สารบัญรวมคู่มือและเอกสารการทดลอง Part 1</span>
                      <span class="lab-tag tag-ready">ดูภาพรวม</span>
                    </a>
                    <div style="border-top: 1px dashed var(--rule, #D8CFBC); margin: 4px 0;"></div>
                    ${dropdownItemsHtml}
                    <div class="dropdown-footer">
                      <a href="${base}part1/index.html">
                        <span>→ สารบัญรวมคู่มือและเอกสารการทดลอง Part 1</span>
                      </a>
                    </div>
                  </div>
                </li>

                <!-- Part 2 Navigation Link -->
                <li class="nav-item">
                  <a href="${base}part2/index.html" class="nav-link ${isPart2Active ? 'active' : ''}">
                    ปฏิบัติการ 2 (Machines)
                  </a>
                </li>

                <!-- Virtual Lab Button Link -->
                <li class="nav-item">
                  <a href="${base}virtual-lab/index.html" class="nav-link nav-link-vlab" target="_blank" title="เปิดห้องปฏิบัติการเสมือนจริงในแท็บใหม่">
                    Virtual Lab ↗
                  </a>
                </li>
              </ul>
            </nav>

            <!-- Header Actions: Collapse Button & Mobile Toggle -->
            <div class="site-header-actions">
              <button type="button" class="btn-nav-action btn-nav-collapse" id="btn-toggle-collapse" aria-label="หุบหรือขยายแถบนำทาง" title="หุบหรือขยายแถบนำทางเพื่อเพิ่มพื้นที่อ่าน">
                <span class="icon-state">▲</span>
                <span class="btn-label">หุบแถบ</span>
              </button>

              <button type="button" class="btn-nav-action nav-mobile-toggle" id="btn-toggle-mobile" aria-label="เปิดเมนูนำทาง" aria-expanded="false">
                ☰
              </button>
            </div>
          </div>

          <!-- Sub-Bar: Standardized Breadcrumb & Reading Context -->
          ${noBreadcrumb ? '' : `
          <div class="site-header-sub">
            <div class="site-header-sub-inner">
              <ul class="site-breadcrumb" aria-label="Breadcrumb">
                ${breadcrumbsHtml}
              </ul>
              <div class="site-header-sub-extra">
                ${currentLab ? `<span class="sub-pill">LAB ${currentLab.num}</span>` : ''}
                <span class="sub-pill">NU EE DEPT</span>
              </div>
            </div>
          </div>
          `}

          <!-- Mobile Slide Drawer -->
          <div class="mobile-nav-drawer" id="mobile-nav-drawer">
            <div class="mobile-nav-group">
              <div class="mobile-nav-title">เมนูนำทางหลัก</div>
              <a href="${base}index.html" class="mobile-nav-link ${page === 'portal' ? 'active' : ''}">หน้าหลัก (Portal)</a>
              <a href="${base}part1/index.html" class="mobile-nav-link ${page === 'part1' ? 'active' : ''}">ปฏิบัติการ 1 (วงจรและเครื่องมือวัด)</a>
              <a href="${base}part2/index.html" class="mobile-nav-link ${page === 'part2' ? 'active' : ''}">ปฏิบัติการ 2 (เครื่องจักรกลและหม้อแปลง)</a>
              <a href="${base}virtual-lab/index.html" class="mobile-nav-link mobile-nav-link-vlab" target="_blank">เปิด Virtual Lab (โต๊ะทดลองเสมือนจริง) ↗</a>
            </div>

            <div class="mobile-nav-group">
              <div class="mobile-accordion open" id="mobile-lab-accordion">
                <div class="mobile-accordion-header" id="mobile-accordion-toggle">
                  <span>คู่มือปฏิบัติการที่ 1 ถึง 9 (Part 1)</span>
                  <span class="acc-icon">▼</span>
                </div>
                <div class="mobile-accordion-content">
                  ${mobileAccordionHtml}
                </div>
              </div>
            </div>
          </div>
        </header>
      `;
    }

    attachEvents() {
      const headerEl = this.querySelector('#site-header');
      const collapseBtn = this.querySelector('#btn-toggle-collapse');
      const mobileBtn = this.querySelector('#btn-toggle-mobile');
      const drawer = this.querySelector('#mobile-nav-drawer');
      const accordion = this.querySelector('#mobile-lab-accordion');
      const accordionToggle = this.querySelector('#mobile-accordion-toggle');

      if (!headerEl || !collapseBtn) return;

      // Handle Collapse / Expand Toggle
      const updateCollapseButtonUI = (isCollapsed) => {
        const icon = collapseBtn.querySelector('.icon-state');
        const label = collapseBtn.querySelector('.btn-label');
        if (icon) icon.textContent = isCollapsed ? '▼' : '▲';
        if (label) label.textContent = isCollapsed ? 'ขยายแถบ' : 'หุบแถบ';
        collapseBtn.setAttribute('title', isCollapsed ? 'ขยายแถบนำทางเต็มรูปแบบ' : 'หุบแถบนำทางเพื่อเพิ่มพื้นที่อ่าน');
      };

      // Check stored preference
      const savedCollapsed = localStorage.getItem('ee_lab_header_collapsed') === 'true';
      if (savedCollapsed) {
        headerEl.classList.add('is-collapsed');
        updateCollapseButtonUI(true);
      }

      collapseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const nowCollapsed = headerEl.classList.toggle('is-collapsed');
        updateCollapseButtonUI(nowCollapsed);
        localStorage.setItem('ee_lab_header_collapsed', nowCollapsed ? 'true' : 'false');
      });

      // Handle Dropdown Click Toggle (Desktop)
      const dropdownParent = this.querySelector('#part1-dropdown-parent');
      const dropdownBtn = this.querySelector('#part1-dropdown-btn');
      if (dropdownParent && dropdownBtn) {
        dropdownBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const isOpen = dropdownParent.classList.toggle('show');
          dropdownBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        document.addEventListener('click', (e) => {
          if (!dropdownParent.contains(e.target)) {
            dropdownParent.classList.remove('show');
            dropdownBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }

      // Handle Mobile Drawer Toggle
      if (mobileBtn && drawer) {
        mobileBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = drawer.classList.toggle('open');
          mobileBtn.textContent = isOpen ? '✕' : '☰';
          mobileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close drawer when clicking outside
        document.addEventListener('click', (e) => {
          if (drawer.classList.contains('open') && !drawer.contains(e.target) && e.target !== mobileBtn) {
            drawer.classList.remove('open');
            mobileBtn.textContent = '☰';
            mobileBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }

      // Handle Mobile Accordion
      if (accordion && accordionToggle) {
        accordionToggle.addEventListener('click', () => {
          accordion.classList.toggle('open');
        });
      }
    }
  }

  if (!customElements.get('site-header')) {
    customElements.define('site-header', SiteHeader);
  }
})();
