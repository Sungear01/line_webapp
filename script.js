/*
 * MindCare App – Navigation + Experts + Expert Detail + Quiz + Hospital Finder
 * - รวม listener เหลือครั้งเดียว
 * - แก้ main ที่ไม่ถูกประกาศ
 * - กัน null element
 * - ปรับ Google Maps URL
 * - Hospital finder ใช้ Leaflet + ระยะ 5–50 กม.
 */

// ---------------------- Boot ----------------------
document.addEventListener('DOMContentLoaded', () => {
  // เมนู/สกรอลล์/ฟอร์ม
  setupNavigation();
  setupContactForm();

  // Experts & Quiz
  buildExpertsGrid();
  buildQuiz();

  // Router เริ่มต้น + เมื่อ hash เปลี่ยน
  routeByHash();
  window.addEventListener('hashchange', routeByHash);

  // Hospital Finder
  setupHospitalFinder();
});

// ---------------------- Navigation / Smooth scroll / Form ----------------------
function setupNavigation() {
  const nav       = document.getElementById('mainNav');
  const navToggle = document.getElementById('navToggle');
  const navClose  = nav ? nav.querySelector('.nav-close') : null;
  if (!nav || !navToggle) return;

  // สร้าง overlay ถ้ายังไม่มี
  let overlay = document.getElementById('navOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'navOverlay';
    overlay.className = 'nav-overlay';
    overlay.hidden = true;
    document.body.appendChild(overlay);
  }

  // ช่วยระบุว่าเป็นมือถือหรือไม่
  const isMobile = () => window.matchMedia('(max-width:1024px)').matches;

  // ปรับขนาด overlay ไม่ให้ทับเมนู (เมนูโผล่จาก "ขวา")
  function positionOverlayForNav() {
    if (!isMobile()) {
      overlay.style.inset = '0';             // desktop ไม่มี off-canvas
      return;
    }
    const width = Math.round(nav.getBoundingClientRect().width || 270);
    overlay.style.left   = '0';
    overlay.style.top    = '0';
    overlay.style.bottom = '0';
    overlay.style.right  = width + 'px';     // กันพื้นที่ฝั่งขวาให้เมนู
  }

  const openMenu = () => {
    nav.classList.add('open');
    navToggle.classList.add('open');
    nav.removeAttribute('aria-hidden');
    navToggle.setAttribute('aria-expanded', 'true');

    positionOverlayForNav();
    overlay.hidden = false;
    overlay.classList.add('is-open');

    if (isMobile()) document.body.classList.add('no-scroll');

    const first = nav.querySelector('a,button,[tabindex]:not([tabindex="-1"])');
    first && first.focus({ preventScroll: true });
  };

  const closeMenu = () => {
    nav.classList.remove('open');
    navToggle.classList.remove('open');
    nav.setAttribute('aria-hidden', 'true');
    navToggle.setAttribute('aria-expanded', 'false');

    overlay.classList.remove('is-open');
    overlay.hidden = true;

    document.body.classList.remove('no-scroll');
    try { navToggle.focus({ preventScroll: true }); } catch {}
  };

  // ปุ่มเปิด/ปิด
  navToggle.addEventListener('click', (e) => {
    e.preventDefault();
    nav.classList.contains('open') ? closeMenu() : openMenu();
  });

  // ปุ่มกากบาท
  if (navClose) {
    const onClose = (e) => { e.preventDefault(); e.stopPropagation(); closeMenu(); };
    navClose.addEventListener('click', onClose);
  }

  // overlay ปิดด้วย click เท่านั้น (ไม่ใช้ touchstart เพื่อกัน iOS เด้งปิดก่อน)
  overlay.addEventListener('click', (e) => { e.preventDefault(); closeMenu(); });

  // กัน event ทะลุจากเมนูไป overlay (สำคัญบน iOS)
  ['click','touchstart','touchend'].forEach(evt=>{
    nav.addEventListener(evt, (e)=> e.stopPropagation(), { passive: false });
  });

  // ปิดด้วย ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) closeMenu();
  });

  // แตะลิงก์ในเมนูแล้วปิด + smooth scroll
  nav.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();

      closeMenu();
      location.hash = href;

      const id = href.substring(1);
      const target = document.getElementById(id);
      if (target) {
        const header = document.querySelector('.site-header');
        const headerH = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerH;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // smooth-scroll สำหรับลิงก์อื่น ๆ นอกเมนู
  document.querySelectorAll('main a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();

      location.hash = href;
      const id = href.substring(1);
      const target = document.getElementById(id);
      if (target) {
        const header = document.querySelector('.site-header');
        const headerH = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerH;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // reposition overlay ถ้ามีการหมุนจอ/เปลี่ยนขนาด
  window.addEventListener('resize', () => {
    if (nav.classList.contains('open')) positionOverlayForNav();
  });
}




  

function setupContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    alert('ขอบคุณสำหรับข้อความของคุณ! เราจะติดต่อกลับโดยเร็วที่สุด');
    contactForm.reset();
  });
}



// ---------------------- Experts ----------------------
const EXPERTS = [
  {
    id: 'sutthi-psy',
    name: 'นพ. สุทธิ ศฤงคไพบูลย์',
    role: 'จิตแพทย์ผู้ใหญ่',
    phone: '02-111-1001',
    email: 'sutthi@mindcare.example',
    photo: 'dr1.png',
    education: [
      'แพทยศาสตรบัณฑิต วิทยาลัยแพทยศาสตร์พระมงกุฎเกล้า',
      'วุฒิบัตรสาขาจิตเวชศาสตร์ ศิริราชพยาบาล'
    ],
    memberships: ['สมาคมจิตแพทย์แห่งประเทศไทย'],
    publications: ['แนวทางการดูแลผู้ป่วยซึมเศร้าในผู้ใหญ่ (case/clinical focus)'],
    hours: 'จันทร์–ศุกร์ 08:00–17:00'
  },
  {
    id: 'apisamai-psy',
    name: 'พญ. อภิสมัย ศรีรังสรรค์',
    role: 'จิตแพทย์ผู้ใหญ่',
    phone: '02-111-1002',
    email: 'apisamai@mindcare.example',
    photo: 'dr2.png',
    education: [
      'แพทยศาสตรบัณฑิต มหาวิทยาลัยขอนแก่น',
      'วุฒิบัตรสาขาจิตเวชศาสตร์ ศิริราชพยาบาล'
    ],
    memberships: ['สมาคมจิตแพทย์แห่งประเทศไทย'],
    publications: ['ภาวะซึมเศร้าและสุขภาพจิตสตรี'],
    hours: 'อังคาร–เสาร์ 10:00–18:00'
  },
  {
    id: 'jitarin-psy',
    name: 'นพ. จิตริน ใจดี',
    role: 'จิตแพทย์ผู้ใหญ่',
    phone: '02-111-1003',
    email: 'jitarin@mindcare.example',
    photo: 'dr3.png',
    education: [
      'แพทยศาสตรบัณฑิต มหาวิทยาลัยสงขลานครินทร์',
      'วุฒิบัตรสาขาจิตเวชศาสตร์ สถาบันจิตเวชศาสตร์สมเด็จเจ้าพระยา'
    ],
    memberships: ['สมาคมจิตแพทย์แห่งประเทศไทย'],
    publications: ['การสื่อสารกับผู้ป่วยซึมเศร้าในคลินิกทั่วไป'],
    hours: 'พุธ–อาทิตย์ 09:00–17:00'
  },
  {
    id: 'kamonnet-psy',
    name: 'รศ.พญ. กมลเนตร วรรณเสวก',
    role: 'อาจารย์จิตเวชศาสตร์ (โรคซึมเศร้า/จิตเวชทั่วไป)',
    phone: '02-111-1004',
    email: 'kamonnet@mindcare.example',
    photo: 'dr4.png',
    education: [
      'แพทยศาสตรบัณฑิต ศิริราชพยาบาล',
      'วุฒิบัตรสาขาจิตเวชศาสตร์'
    ],
    memberships: ['ภาควิชาจิตเวชศาสตร์ คณะแพทยศาสตร์ศิริราชพยาบาล'],
    publications: ['การวินิจฉัยและการรักษาโรคกลุ่มอารมณ์'],
    hours: 'จันทร์–ศุกร์ 08:30–16:30'
  },
  {
    id: 'pornjira-psy',
    name: 'รศ.พญ. พรจิรา ปริวัชรากุล',
    role: 'ผู้เชี่ยวชาญกลุ่มโรคอารมณ์ (Mood Disorders)',
    phone: '02-111-1005',
    email: 'pornjira@mindcare.example',
    photo: 'dr5.png',
    education: [
      'แพทยศาสตรบัณฑิต',
      'วุฒิบัตรสาขาจิตเวชศาสตร์',
      'MSc Clinical Neuroscience – King’s College London'
    ],
    memberships: ['ภาควิชาจิตเวชศาสตร์ คณะแพทยศาสตร์ศิริราชพยาบาล'],
    publications: ['Psychopharmacology & Mood Disorders (clinical focus)'],
    hours: 'อังคาร–เสาร์ 08:30–16:30'
  }
];

function buildExpertsGrid() {
  const grid = document.getElementById('expertsGrid');
  if (!grid) return;
  grid.innerHTML = EXPERTS.map(doc => `
    <article class="expert-card" data-id="${doc.id}">
      <img class="expert-photo" src="${doc.photo}" alt="${doc.name}">
      <div class="expert-body">
        <div class="expert-name">${doc.name}</div>
        <div class="expert-role">${doc.role}</div>
        <div class="expert-contact">โทร ${doc.phone}</div>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.expert-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      location.hash = `#expert-detail/${id}`;
    });
  });
}

function renderExpertDetail(id) {
  const secGrid = document.getElementById('experts');
  const secDetail = document.getElementById('expert-detail');
  if (!secGrid || !secDetail) return;

  const doc = EXPERTS.find(d => d.id === id);
  const box = secDetail.querySelector('#expertProfile');
  if (!box) return;

  if (!doc) {
    box.innerHTML = `<p>ไม่พบข้อมูลแพทย์</p>`;
  } else {
    box.innerHTML = `
      <img class="profile-photo" src="${doc.photo}" alt="${doc.name}">
      <div class="profile-block">
        <h2 style="margin-top:0">${doc.name}</h2>
        <div class="badge" style="background:#e9f5f7;color:#0e5766">${doc.role}</div>
        <h3>ติดต่อ</h3>
        <p>โทร <a href="tel:${doc.phone}">${doc.phone}</a> · อีเมล <a href="mailto:${doc.email}">${doc.email}</a></p>
        <h3>การศึกษา</h3>
        <ul class="profile-list">${doc.education.map(li=>`<li>${li}</li>`).join('')}</ul>
        <h3>สมาคมวิชาชีพ</h3>
        <ul class="profile-list">${doc.memberships.map(li=>`<li>${li}</li>`).join('')}</ul>
        <h3>ผลงานตีพิมพ์/งานวิชาการ</h3>
        <ul class="profile-list">${doc.publications.map(li=>`<li>${li}</li>`).join('')}</ul>
        <h3>เวลาทำการ</h3>
        <p>${doc.hours}</p>
      </div>
    `;
  }

  secGrid.classList.add('hidden');
  secDetail.classList.remove('hidden');
}

function routeByHash() {
  const hash = location.hash || '#home';
  const match = hash.match(/^#expert-detail\/(.+)$/);
  const secGrid = document.getElementById('experts');
  const secDetail = document.getElementById('expert-detail');

  if (match) {
    renderExpertDetail(match[1]);
    return;
  }
  if (secGrid && secDetail) {
    secGrid.classList.remove('hidden');
    secDetail.classList.add('hidden');
  }
}
function openDoctor(slug) {
  window.location.href = "doctor.html?doctor=" + slug;
}



// ---------------------- Quiz ----------------------
function buildQuiz() {
  const form = document.getElementById('quizForm');
  if (!form) return;

  // กำหนด 8 คำถาม พร้อมระบุว่าแต่ละข้อโยงไปที่ประเภทใด
  const QUESTIONS = [
    { q:"รู้สึกเศร้าเกือบทุกวันในช่วง 2 สัปดาห์", type:"mdd" },
    { q:"หมดความสนใจในสิ่งที่เคยชอบทำ", type:"mdd" },
    { q:"เศร้าเรื้อรังนานต่อเนื่องเกิน 2 ปี", type:"dysthymia" },
    { q:"เคยมีช่วงคึกคักผิดปกติสลับกับซึมเศร้า", type:"bipolar" },
    { q:"อาการซึมเศร้าเกิดซ้ำตามฤดูกาล", type:"sad" },
    { q:"หลังคลอดรู้สึกเศร้าหรือกังวลมากผิดปกติ", type:"postpartum" },
    { q:"เคยได้ยินเสียง/เห็นสิ่งที่ไม่มีจริง", type:"psychotic" },
    { q:"เมื่อเศร้ามักกินมาก/นอนมากและอารมณ์ดีขึ้นชั่วคราว", type:"atypical" }
  ];

  // Map ประเภท
  const TYPES = {
    mdd: "โรคซึมเศร้าใหญ่ (MDD)",
    dysthymia: "โรคซึมเศร้าเรื้อรัง (Dysthymia)",
    bipolar: "โรคอารมณ์สองขั้ว (Bipolar)",
    sad: "โรคซึมเศร้าตามฤดูกาล (SAD)",
    postpartum: "ภาวะซึมเศร้าหลังคลอด",
    psychotic: "ซึมเศร้าที่มีอาการทางจิต",
    atypical: "ซึมเศร้าแบบไม่ปกติ (Atypical)"
  };

  // สร้างฟอร์ม
  form.innerHTML = QUESTIONS.map((item,i)=>`
    <div class="quiz-item">
      <h4>${i+1}. ${item.q}</h4>
      <div class="quiz-options">
        ${['ไม่เลย','บางครั้ง','บ่อย','เกือบทุกวัน'].map((label,v)=>`
          <label>
            <input type="radio" name="q${i}" value="${v}" required>
            ${label}
          </label>
        `).join('')}
      </div>
    </div>
  `).join('') + `<button class="cta-button quiz-submit" type="submit">ดูผลลัพธ์</button>`;

  // คำนวณผล
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const data = new FormData(form);

    // เก็บคะแนนตามประเภท
    const scores = {};
    QUESTIONS.forEach((item,i)=>{
      const val = Number(data.get(`q${i}`) || 0);
      if (!scores[item.type]) scores[item.type] = 0;
      scores[item.type] += val;
    });

    // หาประเภทที่ได้คะแนนสูงสุด
    let topType = null, topScore = -1;
    for (const [type,score] of Object.entries(scores)) {
      if (score > topScore) {
        topType = type;
        topScore = score;
      }
    }

    const maxScore = 3; // แต่ละข้อ max = 3 คะแนน
    const percent = Math.round((topScore / maxScore) * 100);

    showQuizResult(TYPES[topType], percent);
  });
}

function showQuizResult(typeName, percent){
  const box = document.getElementById('quizResult');
  box.innerHTML = `
    <div style="background:#f5faff;border-radius:12px;padding:1rem; text-align:center">
      <p><strong>ผลการประเมิน:</strong></p>
      <p>คุณมีแนวโน้มเป็น <strong>${typeName}</strong> (${percent}%)</p>
      <p><em>* ผลนี้เป็นเพียงการคัดกรองเบื้องต้น ควรปรึกษาผู้เชี่ยวชาญเพื่อวินิจฉัยที่ถูกต้อง</em></p>
      <div style="margin-top:1rem;">
        <a class="cta-button" href="#experts" 
           style="display:inline-block; padding:10px 18px; background:#0e5766; color:#fff; border-radius:8px; text-decoration:none;">
          พบแพทย์แนะนำ
        </a>
      </div>
    </div>
  `;
}



/* ====================== MindCare — Hospital Finder (JS) ====================== */
/*  คุณสมบัติ:
    - ปักหมุด รพ. ตามประเภท (ไอคอนคนละสี)
    - ค้นหาโรงพยาบาลใกล้ตำแหน่งฉัน (รัศมีปรับได้)
    - นำทางด้วย "ชื่อโรงพยาบาล" (ไม่ใช้ที่อยู่/พิกัด)
    - ซิงก์พิกัดให้ตรงกับ Google (ถ้าใส่ API และกดปุ่ม #syncBtn)
    - แคชพิกัด/Place ID ใน localStorage ตาม slug
*/

(() => {
/* ====================== CONFIG ====================== */
const GOOGLE_TEXT_SUFFIX = " กรุงเทพฯ ประเทศไทย";  // ช่วยให้ Geocoder จับใน กทม. ได้แม่นขึ้น

/* ====================== STATE ====================== */
let map, markersLayer = null, userLocation = null;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* ====================== DATA (ปรับ/เพิ่มได้) ====================== */
const hospitals = [
  // ---- รัฐ / สถาบัน ----
  { slug:"siriraj", name:"โรงพยาบาลศิริราช", address:"ถ.อิสรภาพ เขตบางกอกน้อย", phone:"02-419-7000", type:"โรงพยาบาลรัฐ",  lat:13.7589, lng:100.4894, gplace_id:null },
  { slug:"ramathibodi", name:"รพ.รามาธิบดี", address:"ถ.ราชวิถี เขตราชเทวี", phone:"02-201-1000", type:"โรงพยาบาลรัฐ",  lat:13.7594, lng:100.5252, gplace_id:null },
  { slug:"chulalongkorn", name:"รพ.จุฬาลงกรณ์ สภากาชาดไทย", address:"ถ.พระราม 4 เขตปทุมวัน", phone:"02-256-4000", type:"โรงพยาบาลรัฐ", lat:13.7372, lng:100.5326, gplace_id:null },
  { slug:"police", name:"รพ.ตำรวจ", address:"ถ.พระราม 1 เขตปทุมวัน", phone:"02-207-6000", type:"โรงพยาบาลรัฐ", gplace_id:null },
  { slug:"rajavithi", name:"รพ.ราชวิถี", address:"ถ.ราชวิถี เขตราชเทวี", phone:"02-354-8108", type:"โรงพยาบาลรัฐ", gplace_id:null },
  { slug:"vajira", name:"รพ.วชิรพยาบาล (มหาวิทยาลัยนวมินทราธิราช)", address:"ถ.สามเสน เขตดุสิต", phone:"02-244-3000", type:"โรงพยาบาลรัฐ", gplace_id:null },
  { slug:"somdetchaophraya", name:"สถาบันจิตเวชศาสตร์สมเด็จเจ้าพระยา", address:"ถ.สมเด็จเจ้าพระยา เขตคลองสาน", phone:"02-439-5593", type:"สถาบันเฉพาะทาง", gplace_id:null },
  { slug:"lerdsin", name:"รพ.เลิดสิน", address:"ถ.สาทรเหนือ เขตบางรัก", phone:"02-353-9800", type:"โรงพยาบาลรัฐ", gplace_id:null },
  { slug:"taksin", name:"รพ.ตากสิน (กทม.)", address:"ถ.สมเด็จพระเจ้าตากสิน เขตธนบุรี", phone:"02-437-0123", type:"รพ.กทม.", gplace_id:null },
  { slug:"charoenkrung", name:"รพ.เจริญกรุงประชารักษ์ (กทม.)", address:"ถ.เจริญกรุง เขตบางคอแหลม", phone:"02-289-7000", type:"รพ.กทม.", gplace_id:null },
  { slug:"sirindhorn", name:"รพ.สิรินธร (กทม.)", address:"เขตประเวศ", phone:"02-328-6900", type:"รพ.กทม.", gplace_id:null },
  { slug:"ratchaphiphat", name:"รพ.ราชพิพัฒน์ (กทม.)", address:"เขตบางแค", phone:"02-444-7000", type:"รพ.กทม.", gplace_id:null },
  { slug:"latkrabang_gov", name:"รพ.ลาดกระบัง (กทม.)", address:"เขตลาดกระบัง", phone:"02-326-9999", type:"รพ.กทม.", gplace_id:null },
  { slug:"klang_bma", name:"รพ.กลาง (กทม.)", address:"ถ.หลวง เขตป้อมปราบฯ", phone:"02-220-8000", type:"รพ.กทม.", gplace_id:null },

  // ---- เอกชน ----
  { slug:"bangkok_hospital", name:"Bangkok Hospital", address:"ซ.ศูนย์วิจัย เขตห้วยขวาง", phone:"1719", type:"เอกชน",  lat:13.7396, lng:100.5850, gplace_id:null },
  { slug:"bumrungrad", name:"บำรุงราษฎร์", address:"ถ.สุขุมวิท เขตวัฒนา", phone:"1378", type:"เอกชน",  lat:13.7442, lng:100.5565, gplace_id:null },
  { slug:"samitivej_suk", name:"สมิติเวช สุขุมวิท", address:"ซ.สุขุมวิท 49 เขตวัฒนา", phone:"02-022-2222", type:"เอกชน",  lat:13.7245, lng:100.5668, gplace_id:null },
  { slug:"vejthani", name:"เวชธานี", address:"ถ.ลาดพร้าว เขตบางกะปิ", phone:"02-734-0000", type:"เอกชน", gplace_id:null },
  { slug:"ramkhamhaeng", name:"รพ.รามคำแหง", address:"ถ.รามคำแหง บางกะปิ", phone:"02-743-9999", type:"เอกชน", gplace_id:null },
  { slug:"phyathai1", name:"พญาไท 1", address:"ถ.ศรีอยุธยา ราชเทวี", phone:"1772", type:"เอกชน", gplace_id:null },
  { slug:"phyathai2", name:"พญาไท 2", address:"ถ.พหลโยธิน พญาไท", phone:"1772", type:"เอกชน", gplace_id:null },
  { slug:"phyathai3", name:"พญาไท 3", address:"เพชรเกษม ภาษีเจริญ", phone:"1772", type:"เอกชน", gplace_id:null },
  { slug:"paolo_phahol", name:"เปาโล พหลโยธิน", address:"สะพานควาย พญาไท", phone:"02-279-7000", type:"เอกชน", gplace_id:null },
  { slug:"paolo_chokchai4", name:"เปาโล โชคชัย 4", address:"โชคชัย 4 ลาดพร้าว", phone:"02-514-4141", type:"เอกชน", gplace_id:null },
  { slug:"piyavate", name:"ปิยะเวท", address:"ถ.พระราม 9 ห้วยขวาง", phone:"02-129-9000", type:"เอกชน", gplace_id:null },
  { slug:"yanhee", name:"ยันฮี", address:"จรัญฯ 90 บางพลัด", phone:"02-879-0300", type:"เอกชน", gplace_id:null },
  { slug:"bnh", name:"BNH Hospital", address:"ซ.คอนแวนต์ เขตบางรัก", phone:"02-022-0700", type:"เอกชน", gplace_id:null },
  { slug:"saintlouis", name:"เซนต์หลุยส์", address:"ถ.สาทรใต้ เขตสาทร", phone:"02-675-5000", type:"เอกชน", gplace_id:null },
  { slug:"thonburi", name:"ธนบุรี", address:"ถ.อิสรภาพ บางกอกใหญ่", phone:"02-487-2000", type:"เอกชน", gplace_id:null },
  { slug:"kasemrad_bangkae", name:"เกษมราษฎร์ บางแค", address:"เพชรเกษม บางแค", phone:"02-804-8959", type:"เอกชน", gplace_id:null },
  { slug:"kasemrad_prachachuen", name:"เกษมราษฎร์ ประชาชื่น", address:"ประชาชื่น บางซื่อ/จตุจักร", phone:"02-910-1600", type:"เอกชน", gplace_id:null },
  { slug:"navamin1", name:"นวมินทร์ 1", address:"มีนบุรี", phone:"02-914-2111", type:"เอกชน", gplace_id:null },
  { slug:"paolohospital_nawamin", name:"เปาโล นวมินทร์", address:"บึงกุ่ม/คันนายาว", phone:"02-942-7777", type:"เอกชน", gplace_id:null },
  { slug:"bangna1", name:"บางนา 1", address:"บางนา-ตราด กม.3", phone:"02-361-1111", type:"เอกชน", gplace_id:null },
  { slug:"pramongkut", name:"รพ.พระมงกุฎเกล้า", address:"ถ.ราชวิถี ราชเทวี", phone:"02-763-9300", type:"ทหาร/รัฐ", gplace_id:null }
];

/* ====================== ICONS ====================== */
const ICONS = {
  "โรงพยาบาลรัฐ":   L.icon({ iconUrl: svgPin("#1aa6a6"), iconSize:[32,32], iconAnchor:[16,32] }),
  "รพ.กทม.":        L.icon({ iconUrl: svgPin("#0e8a8a"), iconSize:[32,32], iconAnchor:[16,32] }),
  "เอกชน":          L.icon({ iconUrl: svgPin("#2563eb"), iconSize:[32,32], iconAnchor:[16,32] }),
  "ทหาร/รัฐ":       L.icon({ iconUrl: svgPin("#0ea5e9"), iconSize:[32,32], iconAnchor:[16,32] }),
  "สถาบันเฉพาะทาง":  L.icon({ iconUrl: svgPin("#10b981"), iconSize:[32,32], iconAnchor:[16,32] }),
  "default":         L.icon({ iconUrl: svgPin("#64748b"), iconSize:[32,32], iconAnchor:[16,32] })
};
function svgPin(color){
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <defs><filter id="s" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-opacity=".25"/>
      </filter></defs>
      <path filter="url(#s)" fill="${color}" d="M16 2c6 0 10 4.4 10 10 0 7.5-8.6 15-9.6 15.8-.2.2-.6.2-.8 0C14.6 27 6 19.5 6 12 6 6.4 10 2 16 2z"/>
      <circle cx="16" cy="12.5" r="4.2" fill="#fff"/>
    </svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}

/* ====================== GOOGLE HELPERS ====================== */
let geocoder, placesSvc;
function googleReady(){
  return !!(window.google && google.maps && google.maps.places);
}
async function waitGoogle(){
  for (let i=0;i<60;i++){ // ~6s
    if (googleReady()){
      geocoder = new google.maps.Geocoder();
      placesSvc = new google.maps.places.PlacesService(document.createElement('div'));
      const badge = document.getElementById('gok-badge'); if (badge) badge.style.display='inline-block';
      return true;
    }
    await sleep(100);
  }
  return false;
}
function geocodeByText(name, address){
  return new Promise((resolve)=>{
    if (!geocoder) return resolve(null);
    geocoder.geocode({ address: `${name} ${address}${GOOGLE_TEXT_SUFFIX}` }, (results, status)=>{
      if (status === 'OK' && results?.[0]?.geometry?.location){
        const loc = results[0].geometry.location;
        resolve({ lat: loc.lat(), lng: loc.lng(), place_id: results[0].place_id || null });
      } else resolve(null);
    });
  });
}
function findPlaceIdByQuery(q){
  return new Promise((resolve)=>{
    if (!placesSvc) return resolve(null);
    const req = { query: `${q}${GOOGLE_TEXT_SUFFIX}`, fields: ['place_id','geometry','name'] };
    placesSvc.findPlaceFromQuery(req, (res, status)=>{
      if (status === google.maps.places.PlacesServiceStatus.OK && res?.[0]){
        const r = res[0];
        resolve({
          place_id: r.place_id || null,
          lat: r.geometry?.location?.lat?.(),
          lng: r.geometry?.location?.lng?.()
        });
      } else resolve(null);
    });
  });
}
function getDetailsByPlaceId(place_id){
  return new Promise((resolve)=>{
    if (!placesSvc) return resolve(null);
    placesSvc.getDetails({ placeId: place_id, fields:['geometry','name','formatted_address','formatted_phone_number'] }, (res, status)=>{
      if (status === google.maps.places.PlacesServiceStatus.OK && res?.geometry?.location){
        resolve({
          lat: res.geometry.location.lat(),
          lng: res.geometry.location.lng(),
          name: res.name, address: res.formatted_address || null,
          phone: res.formatted_phone_number || null
        });
      } else resolve(null);
    });
  });
}

/* ====================== CACHE ====================== */
function cacheLatLng(slug, lat, lng, place_id){
  try{ localStorage.setItem('geo_'+slug, JSON.stringify({lat,lng,place_id})); }catch{}
}
function readCache(slug){
  try{ return JSON.parse(localStorage.getItem('geo_'+slug)||'null'); }catch{return null;}
}
function loadCachedLatLng(){
  hospitals.forEach(h=>{
    const c = readCache(h.slug);
    if (c?.lat && c?.lng){ h.lat=c.lat; h.lng=c.lng; if (c.place_id) h.gplace_id=c.place_id; }
  });
}

/* ====================== MAP / DRAW ====================== */
function initMap(){
  map = L.map('hospitalMap').setView([13.7563, 100.5018], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution:'© OpenStreetMap contributors' }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
  drawMarkers();
}
function drawMarkers(){
  if (markersLayer){ markersLayer.clearLayers(); }
  hospitals.forEach(h=>{
    if (typeof h.lat !== 'number' || typeof h.lng !== 'number') return;
    const icon = ICONS[h.type] || ICONS.default;
    const m = L.marker([h.lat, h.lng], { icon }).addTo(markersLayer);
    const gpid = h.gplace_id ? `<br><small>Place ID: ${h.gplace_id}</small>` : '';
    m.bindPopup(`<strong>${h.name}</strong><br>${h.address}<br>โทร: <a href="tel:${h.phone}">${h.phone}</a><br>ประเภท: ${h.type}${gpid}`);
    h.__marker = m;
  });
}

/* ====================== SYNC FROM GOOGLE ====================== */
async function syncFromGoogle(){
  const ok = await waitGoogle();
  if (!ok){ alert('ยังไม่ได้ใส่ Google API Key หรือโหลดไม่สำเร็จ'); return; }

  const btn = document.getElementById('syncBtn');
  if (btn){ btn.disabled=true; btn.textContent='ซิงก์จาก Google...'; }

  for (const h of hospitals){
    try{
      // 1) ถ้ามี place_id → ใช้ Details แม่นสุด
      if (h.gplace_id){
        const det = await getDetailsByPlaceId(h.gplace_id);
        if (det?.lat && det?.lng){
          h.lat = det.lat; h.lng = det.lng;
          if (det.address) h.address = det.address;
          if (det.phone) h.phone = det.phone;
          cacheLatLng(h.slug, h.lat, h.lng, h.gplace_id);
          await sleep(250);
          continue;
        }
      }
      // 2) ค้นหา place จากชื่อ+ที่อยู่
      const found = await findPlaceIdByQuery(`${h.name} ${h.address}`);
      if (found?.lat && found?.lng){
        h.lat = found.lat; h.lng = found.lng;
        if (found.place_id) h.gplace_id = found.place_id;
        cacheLatLng(h.slug, h.lat, h.lng, h.gplace_id||null);
        await sleep(250);
        continue;
      }
      // 3) สำรองด้วย Geocoder
      const geo = await geocodeByText(h.name, h.address);
      if (geo?.lat && geo?.lng){
        h.lat = geo.lat; h.lng = geo.lng;
        if (geo.place_id) h.gplace_id = geo.place_id;
        cacheLatLng(h.slug, h.lat, h.lng, h.gplace_id||null);
      }
      await sleep(250);
    }catch(e){ /* ข้ามรายการที่ error */ }
  }

  drawMarkers();
  if (userLocation) findNearbyHospitals();
  if (btn){ btn.disabled=false; btn.textContent='ซิงก์พิกัดจาก Google'; }
}

/* ====================== NEARBY / UI ====================== */
function calculateDistance(lat1,lng1,lat2,lng2){
  const R=6371, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return 2*R*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function findNearbyHospitals(){
  if (!userLocation) return;
  const radiusEl = document.getElementById('searchRadius');
  const radius = radiusEl ? parseInt(radiusEl.value,10) : 10;

  const list = hospitals
    .filter(h=> typeof h.lat==='number' && typeof h.lng==='number')
    .map(h=> ({...h, distance: calculateDistance(userLocation.lat,userLocation.lng,h.lat,h.lng)}))
    .filter(h=> h.distance <= radius)
    .sort((a,b)=> a.distance - b.distance);

  displayHospitals(list);
}
function displayHospitals(list){
  const el = document.getElementById('hospitalResults');
  if (!el) return;

  if (!list.length){
    el.innerHTML = `<div class="loading-spinner">ไม่พบโรงพยาบาลในรัศมีที่กำหนด • ลองขยายรัศมี</div>`;
    return;
  }
  el.innerHTML = list.map(h=>`
    <div class="hospital-item" onclick="window.focusHospital('${h.slug}')">
      <div class="hospital-name">${h.name}${h.gplace_id?'<span class="badge">Google ✓</span>':''}</div>
      <div class="hospital-distance">${h.distance.toFixed(1)} กม. จากคุณ</div>
      <div class="hospital-address">${h.address}</div>
      <div class="hospital-actions">
        <button class="hospital-action" onclick="event.stopPropagation(); window.callHospital('${h.phone}')">โทร ${h.phone}</button>
        <button class="hospital-action secondary"
          onclick="event.stopPropagation(); window.openMapsByName('${h.name.replace(/'/g,"\\'")}', '${h.gplace_id||''}')">นำทาง</button>
      </div>
    </div>
  `).join('');
}

/* ====================== PUBLIC FUNCS (window) ====================== */
window.focusHospital = function(slug){
  const h = hospitals.find(x=>x.slug===slug);
  if (!h || !h.__marker) return;
  map.setView([h.lat, h.lng], 15);
  h.__marker.openPopup();
};
window.callHospital = (phone) => { window.location.href = `tel:${phone}`; };
window.openMapsByName = (name, placeId = '') => {
  const origin = (userLocation) ? `&origin=${userLocation.lat},${userLocation.lng}` : '';
  const pid = placeId ? `&destination_place_id=${encodeURIComponent(placeId)}` : '';
  const url = `https://www.google.com/maps/dir/?api=1` +
              `&destination=${encodeURIComponent(name)}` + pid + origin +
              `&travelmode=driving`;
  window.open(url, '_blank');
};

/* ====================== GEOLOCATION / BOOT ====================== */
function showError(message){
  const el = document.getElementById('hospitalResults');
  if (el) el.innerHTML = `<div class="error-message">${message}</div>`;
  else alert(message);
}
function findUserLocation(){
  const btn = document.getElementById('findLocationBtn');
  if (btn){ btn.disabled=true; btn.textContent='กำลังค้นหา...'; }

  if (!navigator.geolocation){
    showError('เบราว์เซอร์นี้ไม่รองรับการหาตำแหน่ง');
    if (btn){ btn.disabled=false; btn.textContent='ค้นหาตำแหน่งปัจจุบัน'; }
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos=>{
      userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      map.setView([userLocation.lat, userLocation.lng], 13);

      L.marker([userLocation.lat, userLocation.lng], {
        icon: L.icon({ iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
            <circle cx="13" cy="13" r="8.5" fill="#ff4444" stroke="white" stroke-width="3"/>
            <circle cx="13" cy="13" r="3.2" fill="white"/>
          </svg>`),
          iconSize:[26,26], iconAnchor:[13,13]
        })
      }).addTo(map).bindPopup('ตำแหน่งของคุณ');

      findNearbyHospitals();
      if (btn){ btn.disabled=false; btn.textContent='ค้นหาตำแหน่งปัจจุบัน'; }
    },
    err=>{
      let msg='ไม่สามารถหาตำแหน่งได้';
      if (err?.code===err.PERMISSION_DENIED) msg='การเข้าถึงตำแหน่งถูกปฏิเสธ กรุณาอนุญาต';
      else if (err?.code===err.POSITION_UNAVAILABLE) msg='ข้อมูลตำแหน่งไม่พร้อมใช้งาน';
      else if (err?.code===err.TIMEOUT) msg='ใช้เวลานานเกินไป';
      showError(msg);
      if (btn){ btn.disabled=false; btn.textContent='ค้นหาตำแหน่งปัจจุบัน'; }
    },
    { enableHighAccuracy:true, timeout:10000, maximumAge:60000 }
  );
}

/* ====================== INIT ====================== */
function setup(){
  loadCachedLatLng();
  initMap();
  drawMarkers();

  const btn = document.getElementById('findLocationBtn');
  if (btn) btn.addEventListener('click', findUserLocation);

  const r = document.getElementById('searchRadius');
  const rl = document.getElementById('radiusLabel');
  if (r && rl){
    const sync=()=> rl.textContent=`รัศมีค้นหา: ${r.value} กม.`;
    r.addEventListener('input', sync); sync();
    r.addEventListener('change', ()=> userLocation && findNearbyHospitals());
  }

  const syncBtn = document.getElementById('syncBtn');
  if (syncBtn) syncBtn.addEventListener('click', syncFromGoogle);
}

document.addEventListener('DOMContentLoaded', setup);
})();


//what
(()=> {
  const wrap   = document.querySelector('#depress .tabs');
  const tabs   = Array.from(document.querySelectorAll('#depress .tab'));
  const line   = document.querySelector('#depress .tab-underline');
  const panels = {
    about:   document.getElementById('panel-about'),
    treat:   document.getElementById('panel-treat'),
    centers: document.getElementById('panel-centers')
  };

  function moveLine(btn){
    const x = btn.offsetLeft - wrap.offsetLeft + 0; // 0 = ค่าชดเชยเพิ่มถ้าคุณเปลี่ยน padding
    line.style.width = btn.offsetWidth + 'px';
    line.style.transform = `translateY(-50%) translateX(${x}px)`;
  }

  tabs.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      tabs.forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active');
      Object.values(panels).forEach(p=>p?.classList.remove('is-active'));
      panels[btn.dataset.tab]?.classList.add('is-active');
      moveLine(btn);
    });
  });

  // เริ่มต้นให้ตรงแท็บที่ active (หรือปุ่มแรกถ้าไม่มีคลาส)
  const init = document.querySelector('#depress .tab.is-active') || tabs[0];
  if (init){ moveLine(init); }
  // เผื่อฟอนต์โหลดช้า ทำให้ความกว้างแท็บเปลี่ยน
  window.addEventListener('load', ()=> moveLine(init));
  window.addEventListener('resize', ()=> moveLine(document.querySelector('#depress .tab.is-active')||tabs[0]));
})();


