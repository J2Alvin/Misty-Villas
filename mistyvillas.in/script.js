// Misty Villas - progressive enhancement only.
// All content (rooms, rates, photos, FAQ) is already in the HTML, so search engines
// and AI crawlers can read it. This script adds swipe/arrow carousels and the photo viewer.

(function () {
  // ---------- Lightbox ----------
  const lightbox = document.getElementById('lightbox');
  const lbImage = document.getElementById('lb-image');
  const lbCaption = document.getElementById('lb-caption');
  let lbPhotos = [];
  let lbIndex = 0;

  function showLightbox(index) {
    lbIndex = (index + lbPhotos.length) % lbPhotos.length;
    const p = lbPhotos[lbIndex];
    lbImage.src = p.src;
    lbImage.alt = p.alt || '';
    lbCaption.textContent = p.alt || '';
  }
  function openLightbox(photos, index) {
    lbPhotos = photos;
    showLightbox(index);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  if (lightbox) {
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
    let touchX = null;
    lbImage.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    lbImage.addEventListener('touchend', (e) => {
      if (touchX === null) return;
      const diff = e.changedTouches[0].clientX - touchX;
      if (Math.abs(diff) > 50) showLightbox(lbIndex + (diff < 0 ? 1 : -1));
      touchX = null;
    }, { passive: true });
  }

  // ---------- Carousels ----------
  const AUTO_MS = 3000;      // a new photo every 3 seconds
  const STAGGER_MS = 800;    // offset between neighbouring boxes
  const SLIDE_MS = 900;      // how long the slide transition takes (higher = slower)
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let autoIndex = 0;
  // Slower, eased slide than the browser's built-in smooth scroll.
  const animateTo = (track, target) => {
    if (reduceMotion) { track.scrollLeft = target; return; }
    cancelAnimationFrame(track._anim);
    const from = track.scrollLeft, dist = target - from;
    if (Math.abs(dist) < 1) return;
    const t0 = performance.now();
    track.style.scrollSnapType = 'none';
    const tick = (now) => {
      const t = Math.min((now - t0) / SLIDE_MS, 1);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // ease in-out
      track.scrollLeft = from + dist * e;
      if (t < 1) track._anim = requestAnimationFrame(tick);
      else track.style.scrollSnapType = '';
    };
    track._anim = requestAnimationFrame(tick);
  };
  const stopAnim = (track) => { cancelAnimationFrame(track._anim); track.style.scrollSnapType = ''; };

  document.querySelectorAll('.carousel').forEach((carousel) => {
    const track = carousel.querySelector('.carousel-track');
    const imgs = Array.from(track.querySelectorAll('img'));
    if (!imgs.length) return;
    const photos = imgs.map((img) => ({ src: img.currentSrc || img.src, alt: img.alt }));

    imgs.forEach((img, i) => {
      img.addEventListener('click', () => lightbox && openLightbox(photos, i));
    });

    if (imgs.length < 2) return;

    const mkBtn = (cls, label, text) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'car-btn ' + cls;
      b.setAttribute('aria-label', label);
      b.textContent = text;
      return b;
    };
    const prev = mkBtn('car-prev', 'Previous photo', '❮');
    const next = mkBtn('car-next', 'Next photo', '❯');
    const count = document.createElement('span');
    count.className = 'car-count';
    count.textContent = '1 / ' + imgs.length;

    const step = (dir) => {
      const max = track.scrollWidth - track.clientWidth;
      const cur = Math.round(track.scrollLeft / track.clientWidth) * track.clientWidth;
      animateTo(track, Math.max(0, Math.min(max, cur + dir * track.clientWidth)));
    };
    track.addEventListener('touchstart', () => stopAnim(track), { passive: true });
    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    track.addEventListener('scroll', () => {
      const i = Math.round(track.scrollLeft / track.clientWidth) + 1;
      count.textContent = Math.min(i, imgs.length) + ' / ' + imgs.length;
    }, { passive: true });

    carousel.append(prev, next, count);

    // Auto-advance every AUTO_MS, with each box starting 0.7s after the previous one
    // so they never all change together. Pauses on hover/touch, when off-screen,
    // when the tab is hidden or the photo viewer is open. Skipped for reduced motion.
    if (reduceMotion) return;
    const slot = autoIndex++;
    const offset = (slot * STAGGER_MS) % AUTO_MS;
    let timer = null, delayTimer = null, visible = false, hovering = false, touching = false;

    const advance = () => {
      if (lightbox && !lightbox.hidden) return;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      const cur = Math.round(track.scrollLeft / track.clientWidth) * track.clientWidth;
      animateTo(track, atEnd ? 0 : cur + track.clientWidth);
    };
    const stop = () => { clearTimeout(delayTimer); clearInterval(timer); timer = delayTimer = null; };
    const start = () => {
      if (timer || delayTimer || !visible || hovering || touching || document.hidden) return;
      delayTimer = setTimeout(() => {
        delayTimer = null;
        advance();
        timer = setInterval(advance, AUTO_MS);
      }, offset);
    };

    carousel.addEventListener('mouseenter', () => { hovering = true; stop(); });
    carousel.addEventListener('mouseleave', () => { hovering = false; start(); });
    carousel.addEventListener('touchstart', () => { touching = true; stop(); }, { passive: true });
    carousel.addEventListener('touchend', () => { setTimeout(() => { touching = false; start(); }, 4000); }, { passive: true });
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        visible ? start() : stop();
      }, { threshold: 0.4 }).observe(carousel);
    } else { visible = true; start(); }
  });
})();
