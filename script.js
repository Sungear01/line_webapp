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
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      navToggle.classList.toggle('open');
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();

      // เปลี่ยน hash เสมอ เพื่อให้ router ทำงาน
      location.hash = href;

      // smooth-scroll ถ้ามี element เป้าหมาย
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

// ---------------------- Quiz ----------------------
function buildQuiz() {
  const form = document.getElementById('quizForm');
  if (!form) return;

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

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    let score = 0;
    for (let i = 0; i < QUESTIONS.length; i++) {
      score += Number(data.get(`q${i}`) || 0);
    }
    showQuizResult(score);
  });
}

function showQuizResult(score) {
  const box = document.getElementById('quizResult');
  if (!box) return;

  let level, advice, color = '#e8f6f7', text = '#0e5766';
  if (score <= 4) { level = 'ต่ำมาก'; advice = 'เฝ้าสังเกตอารมณ์ตนเองต่อเนื่อง'; }
  else if (score <= 9) { level = 'ต่ำ'; advice = 'ดูแลตนเอง พักผ่อน ออกกำลัง หากไม่ดีขึ้นควรปรึกษาผู้เชี่ยวชาญ'; }
  else if (score <= 14) { level = 'ปานกลาง'; advice = 'แนะนำให้พบผู้เชี่ยวชาญเพื่อประเมินเพิ่มเติม'; color = '#fff3cd'; text = '#7a5a00'; }
  else if (score <= 19) { level = 'ค่อนข้างสูง'; advice = 'ควรนัดหมายพบแพทย์/นักจิตวิทยาเร็วที่สุด'; color = '#ffe3e3'; text = '#7a0b0b'; }
  else { level = 'สูงมาก'; advice = 'กรุณาติดต่อสายด่วน/ไปโรงพยาบาลทันที หากมีความคิดทำร้ายตนเอง'; color = '#ffd7d7'; text = '#6a0000'; }

  box.innerHTML = `
    <div style="background:${color};border-radius:12px;padding:1rem">
      <p><strong>คะแนนรวม:</strong> ${score} จาก 27</p>
      <p><span class="badge" style="background:#134b5b;color:#fff">${level}</span></p>
      <p style="color:${text}">${advice}</p>
      <p style="font-size:.9rem;opacity:.8">* แบบทดสอบนี้ไม่ใช่การวินิจฉัยทางการแพทย์</p>
      <p><a class="ghost-button" href="#hospitals">หาโรงพยาบาลใกล้ฉัน</a></p>
    </div>
  `;
}

// ---------------------- Hospital Finder (Leaflet) ----------------------
let map;
let userLocation = null;

// ข้อมูลตัวอย่าง (แก้ชื่อให้ถูก: บำรุงราษฎร์)
const sampleHospitals = [
  {
    name: "โรงพยาบาลศิริราช",
    lat: 13.7589, lng: 100.4894,
    address: "2 ถนนวังหลัง เขตบางกอกน้อย กรุงเทพฯ",
    phone: "02-419-7000", type: "โรงพยาบาลรัฐ"
  },
  {
    name: "โรงพยาบาลจุฬาลงกรณ์",
    lat: 13.7372, lng: 100.5326,
    address: "1873 ถนนพระราม 4 ปทุมวัน กรุงเทพฯ",
    phone: "02-256-4000", type: "โรงพยาบาลรัฐ"
  },
  {
    name: "โรงพยาบาลรามาธิบดี",
    lat: 13.7594, lng: 100.5252,
    address: "270 ถนนราชวิถี เขตราชเทวี กรุงเทพฯ",
    phone: "02-201-1000", type: "โรงพยาบาลรัฐ"
  },
  {
    name: "โรงพยาบาลสมิติเวช",
    lat: 13.7245, lng: 100.5668,
    address: "133 ถนนสุขุมวิท 49 เขตวัฒนา กรุงเทพฯ",
    phone: "02-022-2222", type: "โรงพยาบาลเอกชน"
  },
  {
    name: "โรงพยาบาลกรุงเทพ",
    lat: 13.7373, lng: 100.5445,
    address: "2 ซอยศูนย์วิจัย ถนนเพชรบุรีตัดใหม่ ห้วยขวาง กรุงเทพฯ",
    phone: "1719", type: "โรงพยาบาลเอกชน"
  },
  {
    name: "โรงพยาบาลบำรุงราษฎร์",
    lat: 13.7442, lng: 100.5565,
    address: "33 ถนนสุขุมวิท เขตวัฒนา กรุงเทพฯ",
    phone: "1378", type: "โรงพยาบาลเอกชน"
  }
];

function setupHospitalFinder() {
  const hospitalsSection = document.getElementById('hospitals');
  const mapBox = document.getElementById('hospitalMap');
  const btn = document.getElementById('findLocationBtn');
  const radiusInput = document.getElementById('searchRadius');

  if (!hospitalsSection || !mapBox) return;

  // สร้างแผนที่เมื่อส่วน hospitals โผล่บนหน้าจอ (ช่วยประหยัด)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !map) {
        setTimeout(initMap, 80);
      }
    });
  });
  observer.observe(hospitalsSection);

  if (btn) btn.addEventListener('click', findUserLocation);

  if (radiusInput) {
    let t;
    radiusInput.addEventListener('input', () => {
      // debounce 250ms
      clearTimeout(t);
      t = setTimeout(() => {
        if (userLocation) findNearbyHospitals();
      }, 250);
    });
    radiusInput.addEventListener('change', () => {
      if (userLocation) findNearbyHospitals();
    });
  }
}

function initMap() {
  // ต้องมี Leaflet CSS/JS โหลดไว้ในหน้า HTML
  // <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  // <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  map = L.map('hospitalMap').setView([13.7563, 100.5018], 11);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // หมุดตัวอย่าง
  sampleHospitals.forEach(h => {
    L.marker([h.lat, h.lng]).addTo(map).bindPopup(`
      <strong>${h.name}</strong><br>
      ${h.address}<br>
      โทร: ${h.phone}<br>
      ประเภท: ${h.type}
    `);
  });
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
            Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
            Math.sin(dLng/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function findUserLocation() {
  const btn = document.getElementById('findLocationBtn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'กำลังค้นหา...';
  }

  if (!navigator.geolocation) {
    showError('เบราว์เซอร์นี้ไม่รองรับการหาตำแหน่ง');
    if (btn) { btn.disabled = false; btn.textContent = 'ค้นหาตำแหน่งปัจจุบัน'; }
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };

      if (map) {
        map.setView([userLocation.lat, userLocation.lng], 13);
        L.marker([userLocation.lat, userLocation.lng], {
          icon: L.icon({
            iconUrl: 'data:image/svg+xml;base64,' + btoa(`
              <svg width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12.5" cy="12.5" r="8" fill="#ff4444" stroke="white" stroke-width="3"/>
                <circle cx="12.5" cy="12.5" r="3" fill="white"/>
              </svg>
            `),
            iconSize: [25, 25],
            iconAnchor: [12.5, 12.5]
          })
        }).addTo(map).bindPopup('ตำแหน่งปัจจุบันของคุณ');
      }

      findNearbyHospitals();

      if (btn) { btn.disabled = false; btn.textContent = 'ค้นหาตำแหน่งปัจจุบัน'; }
    },
    err => {
      const code = err && err.code;
      let msg = 'ไม่สามารถหาตำแหน่งได้';
      if (code === err.PERMISSION_DENIED) msg = 'การเข้าถึงตำแหน่งถูกปฏิเสธ กรุณาอนุญาตการเข้าถึงตำแหน่ง';
      else if (code === err.POSITION_UNAVAILABLE) msg = 'ข้อมูลตำแหน่งไม่พร้อมใช้งาน';
      else if (code === err.TIMEOUT) msg = 'การค้นหาตำแหน่งใช้เวลานานเกินไป';
      showError(msg);
      if (btn) { btn.disabled = false; btn.textContent = 'ค้นหาตำแหน่งปัจจุบัน'; }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

function findNearbyHospitals() {
  if (!userLocation) return;
  const radiusEl = document.getElementById('searchRadius');
  const radius = radiusEl ? parseInt(radiusEl.value, 10) : 10;

  const nearby = sampleHospitals
    .map(h => ({ ...h, distance: calculateDistance(userLocation.lat, userLocation.lng, h.lat, h.lng) }))
    .filter(h => h.distance <= radius)
    .sort((a, b) => a.distance - b.distance);

  displayHospitals(nearby);
}

function displayHospitals(hospitals) {
  const results = document.getElementById('hospitalResults');
  if (!results) return;

  if (!hospitals.length) {
    results.innerHTML = `
      <div class="loading-spinner">
        ไม่พบโรงพยาบาลในรัศมีที่กำหนด กรุณาขยายรัศมีการค้นหา
      </div>
    `;
    return;
  }

  results.innerHTML = hospitals.map(h => `
    <div class="hospital-item" onclick="window.focusHospital(${h.lat}, ${h.lng})">
      <div class="hospital-name">${h.name}</div>
      <div class="hospital-distance">${h.distance.toFixed(1)} กม. จากคุณ</div>
      <div class="hospital-address">${h.address}</div>
      <div class="hospital-actions">
        <button class="hospital-action" onclick="event.stopPropagation(); window.callHospital('${h.phone}')">
          โทร ${h.phone}
        </button>
        <button class="hospital-action secondary" onclick="event.stopPropagation(); window.openMaps(${h.lat}, ${h.lng}, '${h.name.replace(/'/g, "\\'")}')">
          นำทาง
        </button>
      </div>
    </div>
  `).join('');
}

function showError(message) {
  const results = document.getElementById('hospitalResults');
  if (results) {
    results.innerHTML = `<div class="error-message">${message}</div>`;
  } else {
    alert(message);
  }
}

// ฟังก์ชันที่เรียกจาก HTML ต้องอยู่บน window
window.focusHospital = function(lat, lng) {
  if (map) map.setView([lat, lng], 15);
};

window.callHospital = function(phone) {
  // โทรตรง: ทำงานบนมือถือ/เบราว์เซอร์ที่รองรับ
  window.location.href = `tel:${phone}`;
};

window.openMaps = function(lat, lng, name) {
  // ใช้พิกัดเป็นหลัก + ใส่ query ชื่อสถานที่เพื่ออ่านง่าย
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving&query=${encodeURIComponent(name)}`;
  window.open(url, '_blank');
};

// ---------------------- (Optional) Avatar helper ถ้าจำเป็น ----------------------
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
// แสดงค่า radius แบบสด
const radius = document.getElementById('searchRadius');
const radiusLabel = document.getElementById('radiusLabel');
if (radius && radiusLabel) {
  const sync = () => radiusLabel.textContent = `รัศมีค้นหา: ${radius.value} กม.`;
  radius.addEventListener('input', sync);
  sync();
}
//เพิ่มลูกเล่นเล็กๆ (JS – bounce ตอนคลิก)
document.querySelectorAll('.help-card').forEach(card=>{
  card.addEventListener('click', ()=>{
    card.style.transform = "scale(0.95)";
    setTimeout(()=> card.style.transform = "", 150);
  });
});

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

