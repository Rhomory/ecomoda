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
