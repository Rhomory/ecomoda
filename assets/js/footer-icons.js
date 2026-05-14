/* ============================================
   Reemplazo defensivo de iconos sociales con SVG inline.
   Garantiza renderización en topbar y footer aunque Lucide
   tarde o falle.
   ============================================ */
(function () {
  'use strict';

  const SVG = {
    instagram: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>',
    facebook:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    tiktok:    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>'
  };

  function replaceSocials(scope) {
    const targets = scope.querySelectorAll('.footer-redes a [data-lucide], .topbar-right a [data-lucide], .ctc-redes a [data-lucide]');
    targets.forEach(el => {
      const name = el.getAttribute('data-lucide');
      if (SVG[name]) {
        const wrapper = document.createElement('span');
        wrapper.innerHTML = SVG[name];
        const svg = wrapper.firstChild;
        el.replaceWith(svg);
      }
    });
  }

  function run() {
    replaceSocials(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
