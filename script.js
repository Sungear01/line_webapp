/*
 * เพิ่มฟีเจอร์: Experts Grid + Expert Detail + Quiz
 * รวมกับสคริปต์เดิม (เมนู, smooth-scroll, contact form)
 */

// ====== เมนูมือถือ + Smooth scroll + ฟอร์ม (เดิม) ======
document.addEventListener('DOMContentLoaded', function () {
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');

  navToggle.addEventListener('click', function () {
    nav.classList.toggle('open');
    navToggle.classList.toggle('open');
  });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();

    // ✅ เปลี่ยน hash เสมอ เพื่อให้ router สลับหน้าได้
    location.hash = href;

    // สกรอลล์ถ้ามี element เป้าหมาย
    const id = href.substring(1);
    const target = document.getElementById(id);
    if (target) {
      const headerH = document.querySelector('.site-header').offsetHeight;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      alert('ขอบคุณสำหรับข้อความของคุณ! เราจะติดต่อกลับโดยเร็วที่สุด');
      contactForm.reset();
    });
  }

  // ====== สร้างรายการแพทย์ ======
  buildExpertsGrid();
  routeByHash();        // initial route
  window.addEventListener('hashchange', routeByHash);

  // ====== สร้างแบบทดสอบ ======
  buildQuiz();
});

// ====== ข้อมูลแพทย์ (อัปเดตชื่อจริง + ใช้ไฟล์รูปที่อัปโหลด) ======
const EXPERTS = [
  {
    id: 'sutthi-psy',
    name: 'นพ. สุทธิ ศฤงคไพบูลย์',
    role: 'จิตแพทย์ผู้ใหญ่',
    phone: '02-111-1001',
    email: 'sutthi@mindcare.example',
    photo: '5930a5fa-49bc-4ae2-9763-284a4c80c631.png',
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
    photo: 'e5039522-2df6-42b5-8d23-c5ceb3eb95ae.png',
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
    photo: 'ef199eb3-0f60-4d2d-ae5a-71d802cbe06a.png',
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
    photo: '498dcf61-2887-4516-a0db-1110c9f8e837.png',
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
    photo: '0a607545-4f88-4f17-b909-7dc163622d80.png',
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


// helper: สร้างรูปโปรไฟล์ SVG พร้อมตัวอักษรย่อ
function svgAvatar(color, initials){
  const svg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
      <defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
        <stop offset='0%' stop-color='${color}'/><stop offset='100%' stop-color='#ffffff33'/>
      </linearGradient></defs>
      <rect width='200' height='200' rx='24' fill='url(#g)'/>
      <circle cx='100' cy='80' r='40' fill='#ffffffcc'/>
      <rect x='40' y='120' width='120' height='50' rx='25' fill='#ffffffcc'/>
      <text x='100' y='98' font-size='42' text-anchor='middle' fill='#134b5b' font-family='Sarabun, sans-serif' font-weight='700'>${initials}</text>
    </svg>`
  );
  return `data:image/svg+xml;charset=utf-8,${svg}`;
}

// วาดกริดแพทย์
function buildExpertsGrid(){
  const grid = document.getElementById('expertsGrid');
  if(!grid) return;
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

  grid.querySelectorAll('.expert-card').forEach(card=>{
    card.addEventListener('click',()=>{
      const id = card.getAttribute('data-id');
      location.hash = `#expert-detail/${id}`;
    });
  });
}

// เรนเดอร์หน้าโปรไฟล์แพทย์
function renderExpertDetail(id){
  const secGrid = document.getElementById('experts');
  const secDetail = document.getElementById('expert-detail');
  if(!secGrid || !secDetail) return;

  const doc = EXPERTS.find(d=>d.id===id);
  if(!doc){
    secDetail.querySelector('#expertProfile').innerHTML = `<p>ไม่พบข้อมูลแพทย์</p>`;
  } else {
    secDetail.querySelector('#expertProfile').innerHTML = `
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

  // แสดง/ซ่อนส่วนที่เกี่ยวข้อง
  secGrid.classList.add('hidden');
  secDetail.classList.remove('hidden');
}

// simple hash router
function routeByHash(){
  const hash = location.hash || '#home';
  const match = hash.match(/^#expert-detail\/(.+)$/);
  const secGrid = document.getElementById('experts');
  const secDetail = document.getElementById('expert-detail');

  if (match){
    renderExpertDetail(match[1]);
    return;
  }
  // กลับไปกริดแพทย์เมื่อไม่อยู่ที่โปรไฟล์
  if (secGrid && secDetail){
    secGrid.classList.remove('hidden');
    secDetail.classList.add('hidden');
  }
}

// ====== แบบทดสอบสั้น 9 ข้อ (0–3) ======
function buildQuiz(){
  const form = document.getElementById('quizForm');
  if(!form) return;

  const QUESTIONS = [
    'รู้สึกเบื่อ/ไม่สนใจสิ่งที่เคยชอบ',
    'รู้สึกเศร้า/หดหู่/สิ้นหวัง',
    'นอนยาก/นอนมากไป',
    'อ่อนเพลีย/พลังงานน้อย',
    'เบื่ออาหารหรือกินมากไป',
    'รู้สึกแย่กับตนเอง/ล้มเหลว',
    'ไม่มีสมาธิ',
    'เคลื่อนไหวช้าลง/กระสับกระส่าย',
    'คิดอยากตายหรือทำร้ายตนเอง'
  ];

  form.innerHTML = QUESTIONS.map((q, i)=>`
    <div class="quiz-item">
      <h4>${i+1}. ${q}</h4>
      <div class="quiz-options">
        ${[0,1,2,3].map(v => `
          <label>
            <input type="radio" name="q${i}" value="${v}" required>
            ${['ไม่เลย','บางวัน','บ่อยครั้ง','แทบทุกวัน'][v]}
          </label>
        `).join('')}
      </div>
    </div>
  `).join('') + `
    <button class="cta-button quiz-submit" type="submit">ดูผลลัพธ์</button>
  `;

  form.addEventListener('submit', e=>{
    e.preventDefault();
    const data = new FormData(form);
    let score = 0;
    for (let i=0;i<QUESTIONS.length;i++){
      score += Number(data.get(`q${i}`) || 0);
    }
    showQuizResult(score);
  });
}

function showQuizResult(score){
  const box = document.getElementById('quizResult');
  let level, advice, color='#e8f6f7', text='#0e5766';
  if (score<=4){ level='ต่ำมาก'; advice='เฝ้าสังเกตอารมณ์ตนเองต่อเนื่อง';}
  else if (score<=9){ level='ต่ำ'; advice='ดูแลตนเอง พักผ่อน ออกกำลัง หากไม่ดีขึ้นควรปรึกษาผู้เชี่ยวชาญ';}
  else if (score<=14){ level='ปานกลาง'; advice='แนะนำให้พบผู้เชี่ยวชาญเพื่อประเมินเพิ่มเติม'; color='#fff3cd'; text='#7a5a00';}
  else if (score<=19){ level='ค่อนข้างสูง'; advice='ควรนัดหมายพบแพทย์/นักจิตวิทยาเร็วที่สุด'; color='#ffe3e3'; text='#7a0b0b';}
  else { level='สูงมาก'; advice='กรุณาติดต่อสายด่วน/ไปโรงพยาบาลทันที หากมีความคิดทำร้ายตนเอง'; color='#ffd7d7'; text='#6a0000';}

  box.innerHTML = `
    <div style="background:${color};border-radius:12px;padding:1rem">
      <p><strong>คะแนนรวม:</strong> ${score} จาก 27</p>
      <p><span class="badge" style="background:#134b5b;color:#fff">${level}</span></p>
      <p style="color:${text}">${advice}</p>
      <p style="font-size:.9rem;opacity:.8">* แบบทดสอบนี้ไม่ใช่การวินิจฉัยทางการแพทย์</p>
      <p><a class="ghost-button" href="#experts">ค้นหาแพทย์ผู้เชี่ยวชาญ</a></p>
    </div>
  `;
}
