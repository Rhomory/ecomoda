/* ============================================
   EcoModa — analytics.js
   Google Analytics 4 + banner de cookies
   ============================================ */
(function () {
  'use strict';

  const GA_ID = 'G-SBKPNMP04E';
  const CONSENT_KEY = 'ecomoda-consent';

  // Init dataLayer y stub de gtag (siempre disponible, aunque GA todavía no cargue)
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());

  // Consent Mode v2 — denegado por defecto hasta que el usuario acepte
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });

  gtag('config', GA_ID, {
    page_title: document.title,
    page_path: location.pathname,
    currency: 'PEN'
  });

  // Cargar gtag.js
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  /* -------- Helper público para emitir eventos -------- */
  window.EcoTrack = {
    event(name, params) {
      try { gtag('event', name, params || {}); } catch (e) {}
    },
    viewItem(item) {
      gtag('event', 'view_item', {
        currency: 'PEN',
        value: item.priceNum || 0,
        items: [{
          item_id: String(item.id),
          item_name: item.name,
          item_category: item.cat || '',
          price: item.priceNum || 0,
          quantity: 1
        }]
      });
    },
    addToCart(item) {
      gtag('event', 'add_to_cart', {
        currency: 'PEN',
        value: (item.priceNum || 0) * (item.qty || 1),
        items: [{
          item_id: String(item.id),
          item_name: item.name,
          item_variant: [item.talla, item.color].filter(Boolean).join(' / '),
          price: item.priceNum || 0,
          quantity: item.qty || 1
        }]
      });
    },
    removeFromCart(item) {
      gtag('event', 'remove_from_cart', {
        currency: 'PEN',
        value: (item.priceNum || 0) * (item.qty || 1),
        items: [{
          item_id: String(item.id),
          item_name: item.name,
          price: item.priceNum || 0,
          quantity: item.qty || 1
        }]
      });
    },
    viewCart(cart, total) {
      gtag('event', 'view_cart', {
        currency: 'PEN',
        value: total,
        items: cart.map(it => ({
          item_id: String(it.id),
          item_name: it.name,
          price: it.priceNum || 0,
          quantity: it.qty || 1
        }))
      });
    },
    beginCheckout(cart, total) {
      gtag('event', 'begin_checkout', {
        currency: 'PEN',
        value: total,
        items: cart.map(it => ({
          item_id: String(it.id),
          item_name: it.name,
          price: it.priceNum || 0,
          quantity: it.qty || 1
        }))
      });
    },
    purchase(orden) {
      gtag('event', 'purchase', {
        transaction_id: orden.transactionId,
        currency: 'PEN',
        value: orden.total,
        shipping: 0,
        tax: +(orden.total * 0.18).toFixed(2),
        items: (orden.items || []).map(it => ({
          item_id: String(it.id),
          item_name: it.name,
          item_variant: [it.talla, it.color].filter(Boolean).join(' / '),
          price: it.priceNum || 0,
          quantity: it.qty || 1
        }))
      });
    }
  };

  /* -------- Banner de cookies -------- */
  function getConsent() {
    try { return JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null'); }
    catch { return null; }
  }
  function setConsent(value) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ value, ts: Date.now() }));
    if (value === 'accept') {
      gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted'
      });
    } else {
      gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
  }

  function buildBanner() {
    if (document.getElementById('cookie-banner')) return;
    const div = document.createElement('div');
    div.id = 'cookie-banner';
    div.className = 'cookie-banner';
    div.innerHTML = `
      <div class="cookie-banner-inner">
        <div class="cookie-text">
          <strong>🍪 Esta web usa cookies</strong>
          <p>Usamos cookies para mejorar tu experiencia y entender cómo usas el sitio. Podés aceptar o rechazar el seguimiento analítico.</p>
        </div>
        <div class="cookie-actions">
          <button class="cookie-btn cookie-reject" id="cookie-reject">Rechazar</button>
          <button class="cookie-btn cookie-accept" id="cookie-accept">Aceptar</button>
        </div>
      </div>`;
    document.body.appendChild(div);

    requestAnimationFrame(() => div.classList.add('show'));

    document.getElementById('cookie-accept').addEventListener('click', () => {
      setConsent('accept');
      div.classList.remove('show');
      setTimeout(() => div.remove(), 300);
    });
    document.getElementById('cookie-reject').addEventListener('click', () => {
      setConsent('reject');
      div.classList.remove('show');
      setTimeout(() => div.remove(), 300);
    });
  }

  // Aplicar consentimiento previo o mostrar banner
  const prev = getConsent();
  if (prev && prev.value) {
    setConsent(prev.value);
  } else {
    document.addEventListener('DOMContentLoaded', buildBanner);
    if (document.readyState !== 'loading') buildBanner();
  }
})();
