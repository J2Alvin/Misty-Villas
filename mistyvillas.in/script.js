// Misty Villas - renders the page from data.json so rates and photos
// can be edited from the CMS without touching code.

const RUPEE = '₹';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function formatPrice(n) {
  return RUPEE + Number(n).toLocaleString('en-IN');
}

// ---------- Lightbox ----------
const lightbox = document.getElementById('lightbox');
const lbImage = document.getElementById('lb-image');
const lbCaption = document.getElementById('lb-caption');
let lbPhotos = [];
let lbIndex = 0;

function openLightbox(photos, index) {
  lbPhotos = photos;
  showLightbox(index);
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
}

function showLightbox(index) {
  lbIndex = (index + lbPhotos.length) % lbPhotos.length;
  const p = lbPhotos[lbIndex];
  lbImage.src = p.image;
  lbImage.alt = p.alt || '';
  lbCaption.textContent = p.alt || '';
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = '';
}

lightbox.querySelector('.lb-close').addEventListener('click', closeLightbox);
lightbox.querySelector('.lb-prev').addEventListener('click', () => showLightbox(lbIndex - 1));
lightbox.querySelector('.lb-next').addEventListener('click', () => showLightbox(lbIndex + 1));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') showLightbox(lbIndex + 1);
  if (e.key === 'ArrowLeft') showLightbox(lbIndex - 1);
});

let lbTouchX = null;
lbImage.addEventListener('touchstart', (e) => { lbTouchX = e.touches[0].clientX; }, { passive: true });
lbImage.addEventListener('touchend', (e) => {
  if (lbTouchX === null) return;
  const diff = e.changedTouches[0].clientX - lbTouchX;
  if (Math.abs(diff) > 50) showLightbox(lbIndex + (diff < 0 ? 1 : -1));
  lbTouchX = null;
}, { passive: true });

// ---------- Carousel ----------
function buildCarousel(photos, defaultAlt) {
  const wrap = el('div', 'carousel');
  const track = el('div', 'carousel-track');
  const all = photos.map(p => ({ image: p.image, alt: p.alt || defaultAlt }));

  all.forEach((p, i) => {
    const slide = el('div', 'slide');
    const img = document.createElement('img');
    img.src = p.image;
    img.alt = p.alt;
    img.width = 1200;
    img.height = 900;
    if (i > 0) img.loading = 'lazy';
    img.addEventListener('click', () => openLightbox(all, i));
    slide.appendChild(img);
    track.appendChild(slide);
  });

  const prev = el('button', 'car-btn car-prev', '❮');
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Previous photo');
  const next = el('button', 'car-btn car-next', '❯');
  next.type = 'button';
  next.setAttribute('aria-label', 'Next photo');
  const count = el('span', 'car-count', `1 / ${all.length}`);

  const step = (dir) => track.scrollBy({ left: dir * track.clientWidth, behavior: 'smooth' });
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  track.addEventListener('scroll', () => {
    const i = Math.round(track.scrollLeft / track.clientWidth) + 1;
    count.textContent = `${Math.min(i, all.length)} / ${all.length}`;
  }, { passive: true });

  wrap.append(track, prev, next, count);
  return wrap;
}

// ---------- Sections ----------
function renderExperiences(list) {
  const grid = document.getElementById('experiences-grid');
  list.forEach(item => {
    const card = el('article', 'card');
    card.appendChild(buildCarousel(item.photos || [], item.title));
    const body = el('div', 'card-body');
    body.append(el('h3', '', item.title), el('p', 'card-text', item.text));
    card.appendChild(body);
    grid.appendChild(card);
  });
}

function renderRooms(rooms, site) {
  const grid = document.getElementById('rooms-grid');
  const extra = site.extra_person_charge;
  rooms.forEach(room => {
    const card = el('article', 'card');
    card.appendChild(buildCarousel(room.photos || [], `${room.name} - ${formatPrice(room.price)} per night`));

    const body = el('div', 'card-body');
    body.appendChild(el('h3', '', room.name));

    const ul = el('ul', 'features');
    (room.features || []).forEach(f => ul.appendChild(el('li', '', f)));
    body.appendChild(ul);

    const info = el('div', 'price-info');
    const line = el('div', 'price-line');
    if (room.old_price) line.appendChild(el('s', 'old-price', formatPrice(room.old_price)));
    line.appendChild(el('span', 'current-price', formatPrice(room.price)));
    line.appendChild(el('span', 'per-day', ' /day'));
    info.appendChild(line);

    let paxText = `Maximum ${room.max_guests} guests`;
    if (extra) paxText += ` + ${formatPrice(extra)} per extra person`;
    info.appendChild(el('p', 'pax', paxText));
    body.appendChild(info);

    const cta = el('a', 'btn room-cta', 'Enquire on WhatsApp');
    const msg = `Hi Misty Villas, I'd like to enquire about the ${room.name}. Dates: `;
    cta.href = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(msg)}`;
    cta.target = '_blank';
    cta.rel = 'noopener';
    body.appendChild(cta);

    card.appendChild(body);
    grid.appendChild(card);
  });
}

function applySite(site) {
  const wa = `https://wa.me/${site.whatsapp}`;
  const setHref = (id, href) => { const n = document.getElementById(id); if (n) n.href = href; };
  const setText = (id, text) => { const n = document.getElementById(id); if (n && text) n.textContent = text; };

  setText('hero-tagline', site.tagline);
  setText('contact-phone1', site.phone_primary_display);
  setText('contact-person', site.contact_person);
  setText('contact-instagram-handle', site.instagram_handle);

  if (site.phone_secondary_display) setText('contact-phone2', site.phone_secondary_display);
  else document.getElementById('contact-phone2-wrap').hidden = true;

  ['hero-whatsapp', 'contact-whatsapp', 'bar-whatsapp'].forEach(id => setHref(id, wa));
  ['contact-call', 'bar-call'].forEach(id => setHref(id, `tel:${site.phone_primary}`));
  setHref('contact-instagram', site.instagram_url);

  if (site.hero_image) document.getElementById('hero-image').src = site.hero_image;

  if (site.notice) {
    const n = document.getElementById('notice');
    n.textContent = site.notice;
    n.hidden = false;
  }
}

document.getElementById('year').textContent = new Date().getFullYear();

fetch('data.json', { cache: 'no-cache' })
  .then(r => { if (!r.ok) throw new Error('data.json ' + r.status); return r.json(); })
  .then(data => {
    applySite(data.site || {});
    renderExperiences(data.experiences || []);
    renderRooms(data.rooms || [], data.site || {});
  })
  .catch(err => {
    console.error(err);
    const grid = document.getElementById('rooms-grid');
    grid.appendChild(el('p', 'card-text', 'Please call (+91) 70128 90166 for rooms and rates.'));
  });
