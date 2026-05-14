/* ============================================
   Home — slider del hero
   ============================================ */
(function () {
  'use strict';

  const slider = document.getElementById('hero-slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.hero-slide');
  const dots = slider.querySelectorAll('#hero-dots button');
  const prev = document.getElementById('hero-prev');
  const next = document.getElementById('hero-next');
  if (slides.length < 2) return;

  let idx = 0;
  let timer = null;
  const INTERVAL = 6000;

  function go(n) {
    idx = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }
  function nextSlide() { go(idx + 1); }
  function prevSlide() { go(idx - 1); }

  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(nextSlide, INTERVAL);
  }
  function stopAutoplay() {
    if (timer) clearInterval(timer);
  }

  next?.addEventListener('click', () => { nextSlide(); startAutoplay(); });
  prev?.addEventListener('click', () => { prevSlide(); startAutoplay(); });
  dots.forEach((d, i) => {
    d.addEventListener('click', () => { go(i); startAutoplay(); });
  });

  // Pausar autoplay al pasar mouse o cuando la pestaña no está activa
  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  // Swipe en mobile
  let touchX = 0;
  slider.addEventListener('touchstart', (e) => {
    touchX = e.changedTouches[0].screenX;
    stopAutoplay();
  }, { passive: true });
  slider.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].screenX - touchX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) nextSlide(); else prevSlide();
    }
    startAutoplay();
  });

  startAutoplay();
})();

/* ============================================
   Testimonios — dots sincronizados con scroll
   (solo aplica en mobile, donde el grid es scroll horizontal)
   ============================================ */
(function () {
  'use strict';
  const grid = document.getElementById('testi-grid');
  const dotsWrap = document.getElementById('testi-dots');
  if (!grid || !dotsWrap) return;

  const dots = dotsWrap.querySelectorAll('button');
  const cards = grid.querySelectorAll('.testi-card');
  if (!dots.length || !cards.length) return;

  dots.forEach((d, i) => {
    d.addEventListener('click', () => {
      cards[i]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  });

  function updateActiveDot() {
    const center = grid.scrollLeft + grid.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((c, i) => {
      const cardCenter = c.offsetLeft + c.offsetWidth / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === best));
  }
  grid.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateActiveDot);
  }, { passive: true });
})();
