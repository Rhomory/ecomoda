/* ============================================
   EcoModa — main.js
   Funciones comunes a todas las páginas
   ============================================ */

(function () {
  'use strict';

  /* ---------- Iconos Lucide ---------- */
  function renderIcons() {
    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    }
  }
  renderIcons();

  /* ---------- Año dinámico ---------- */
  document.querySelectorAll('#year').forEach(el => el.textContent = new Date().getFullYear());

  /* ---------- Sombra del header al scrollear ---------- */
  const header = document.querySelector('.header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Menú hamburguesa ---------- */
  const nav = document.getElementById('nav');
  const overlay = document.getElementById('menu-overlay');

  function openMenu() {
    nav?.classList.add('open');
    overlay?.classList.add('open');
    document.body.classList.add('menu-open');
  }
  function closeMenu() {
    nav?.classList.remove('open');
    overlay?.classList.remove('open');
    document.body.classList.remove('menu-open');
  }
  function toggleMenu() {
    if (nav?.classList.contains('open')) closeMenu();
    else openMenu();
  }

  document.addEventListener('click', (e) => {
    const tg = e.target.closest('#menu-toggle');
    if (tg) {
      e.preventDefault();
      toggleMenu();
    }
  });

  overlay?.addEventListener('click', closeMenu);
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) closeMenu();
  });

  /* =====================================================
     Carrito (localStorage) + formato de moneda
     ===================================================== */
  const STORAGE_KEY = 'ecomoda-cart';
  const CURRENCY = 'PEN';

  function fmt(amount) {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: CURRENCY,
      minimumFractionDigits: 2
    }).format(amount);
  }

  function parsePrice(str) {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    const clean = String(str).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
    const n = parseFloat(clean);
    return isNaN(n) ? 0 : n;
  }

  function getCart() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }
  function saveCart(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    updateBadge();
    renderCartDrawer();
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: items }));
  }
  function updateBadge() {
    const count = getCart().reduce((sum, p) => sum + (p.qty || 1), 0);
    document.querySelectorAll('#cart-count').forEach(el => el.textContent = count);
  }
  function addToCart(item) {
    const cart = getCart();
    const key = item.id + '|' + (item.talla || '') + '|' + (item.color || '');
    const existing = cart.find(p => (p.id + '|' + (p.talla || '') + '|' + (p.color || '')) === key);
    if (existing) existing.qty += item.qty || 1;
    else cart.push({
      ...item,
      qty: item.qty || 1,
      priceNum: item.priceNum ?? parsePrice(item.price)
    });
    saveCart(cart);
    showToast(`${item.name} añadido al carrito`);
    window.EcoTrack?.addToCart(item);
    openCartDrawer();
  }
  function removeFromCart(idx) {
    const cart = getCart();
    const removed = cart[idx];
    cart.splice(idx, 1);
    saveCart(cart);
    if (removed) window.EcoTrack?.removeFromCart(removed);
  }
  function updateQty(idx, delta) {
    const cart = getCart();
    if (!cart[idx]) return;
    cart[idx].qty = Math.max(1, (cart[idx].qty || 1) + delta);
    saveCart(cart);
  }
  function cartTotals() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, p) => sum + (p.priceNum || 0) * (p.qty || 1), 0);
    const envio = subtotal > 0 && subtotal < 200 ? 15 : 0;
    const total = subtotal + envio;
    return { subtotal, envio, total };
  }

  window.EcoModa = {
    getCart, addToCart, removeFromCart, updateQty,
    saveCart, cartTotals, fmt, parsePrice
  };

  /* =====================================================
     Cart drawer (acordeón lateral) — inyectado en todas las páginas
     ===================================================== */
  function buildDrawerMarkup() {
    if (document.getElementById('cart-drawer')) return;
    const drawer = document.createElement('aside');
    drawer.id = 'cart-drawer';
    drawer.className = 'cart-drawer';
    drawer.innerHTML = `
      <div class="cart-drawer-head">
        <h3><i class="icon" data-lucide="shopping-bag"></i> Mi carrito</h3>
        <button class="cart-close" id="cart-close" aria-label="Cerrar"><i class="icon" data-lucide="x"></i></button>
      </div>
      <div class="cart-items" id="cart-items"></div>
      <div class="cart-drawer-foot" id="cart-foot"></div>
    `;
    const ovl = document.createElement('div');
    ovl.id = 'cart-overlay';
    ovl.className = 'cart-overlay';
    document.body.appendChild(drawer);
    document.body.appendChild(ovl);
  }

  function openCartDrawer() {
    document.getElementById('cart-drawer')?.classList.add('open');
    document.getElementById('cart-overlay')?.classList.add('open');
    document.body.classList.add('menu-open');
    renderCartDrawer();
  }
  function closeCartDrawer() {
    document.getElementById('cart-drawer')?.classList.remove('open');
    document.getElementById('cart-overlay')?.classList.remove('open');
    document.body.classList.remove('menu-open');
  }

  function renderCartDrawer() {
    const itemsEl = document.getElementById('cart-items');
    const footEl = document.getElementById('cart-foot');
    if (!itemsEl || !footEl) return;
    const cart = getCart();

    if (cart.length === 0) {
      itemsEl.innerHTML = `
        <div class="cart-empty">
          <i class="icon-lg" data-lucide="shopping-bag"></i>
          <h4>Tu carrito está vacío</h4>
          <p>Descubre nuestra colección consciente.</p>
          <a href="tienda.html" class="btn btn-primary" style="margin-top:12px">Ir a la tienda</a>
        </div>`;
      footEl.innerHTML = '';
      renderIcons();
      return;
    }

    itemsEl.innerHTML = cart.map((it, i) => `
      <div class="cart-item">
        <div class="cart-item-img"><img src="${it.img || 'assets/img/placeholder.svg'}" alt=""></div>
        <div class="cart-item-info">
          <strong>${it.name}</strong>
          <span class="meta">${it.talla ? 'Talla: ' + it.talla : ''}${it.color ? ' · ' + it.color : ''}</span>
          <span class="price">${fmt(it.priceNum || 0)}</span>
          <div class="cart-item-qty">
            <button data-act="dec" data-idx="${i}" aria-label="Restar">−</button>
            <span>${it.qty}</span>
            <button data-act="inc" data-idx="${i}" aria-label="Sumar">+</button>
          </div>
        </div>
        <button class="cart-item-rm" data-act="rm" data-idx="${i}" aria-label="Eliminar"><i class="icon" data-lucide="trash-2"></i></button>
      </div>
    `).join('');

    const { subtotal, envio, total } = cartTotals();
    footEl.innerHTML = `
      <div class="cart-totals"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
      <div class="cart-totals"><span>Envío</span><span>${envio === 0 ? 'Gratis' : fmt(envio)}</span></div>
      <div class="cart-totals grand"><span>Total</span><strong>${fmt(total)}</strong></div>
      <div class="cart-drawer-actions">
        <a href="carrito.html" class="btn btn-outline">Ver carrito</a>
        <a href="checkout.html" class="btn btn-gold">Ir a pagar</a>
      </div>
    `;
    renderIcons();
  }

  // Eventos del drawer (delegados)
  document.addEventListener('click', (e) => {
    if (e.target.closest('.cart-btn')) {
      e.preventDefault();
      openCartDrawer();
      return;
    }
    if (e.target.closest('#cart-close') || e.target.closest('#cart-overlay')) {
      closeCartDrawer();
      return;
    }
    const act = e.target.closest('[data-act]');
    if (act && act.closest('#cart-drawer')) {
      const idx = parseInt(act.dataset.idx, 10);
      const action = act.dataset.act;
      if (action === 'inc') updateQty(idx, +1);
      else if (action === 'dec') updateQty(idx, -1);
      else if (action === 'rm') removeFromCart(idx);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCartDrawer();
  });

  buildDrawerMarkup();
  updateBadge();
  renderCartDrawer();

  // Sincronización entre pestañas
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) { updateBadge(); renderCartDrawer(); }
  });

  /* =====================================================
     Toast pequeño
     ===================================================== */
  function showToast(msg) {
    let t = document.getElementById('eco-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'eco-toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.innerHTML = `<i class="icon" data-lucide="check-circle"></i> ${msg}`;
    renderIcons();
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.remove('show'), 2200);
  }
  window.EcoModa.showToast = showToast;

  /* ---------- Newsletter ---------- */
  const newsletter = document.getElementById('newsletter');
  if (newsletter) {
    newsletter.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletter.querySelector('input[type="email"]');
      if (!input.value) return;
      const btn = newsletter.querySelector('button');
      const original = btn.innerHTML;
      btn.innerHTML = '✓ Suscrito';
      input.value = '';
      setTimeout(() => { btn.innerHTML = original; renderIcons(); }, 2500);
    });
  }

  /* ---------- Card-add (botón + en cards estáticos) ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.card-add');
    if (!btn) return;
    e.preventDefault();
    const card = btn.closest('.card-producto');
    if (!card) return;
    const name = card.querySelector('.card-name')?.textContent.trim() || 'Producto';
    const priceTxt = card.querySelector('.card-price')?.textContent.trim() || '';
    const img = card.querySelector('.card-img img')?.getAttribute('src') || '';
    addToCart({
      id: name.replace(/\s+/g, '-').toLowerCase(),
      name,
      price: priceTxt,
      priceNum: parsePrice(priceTxt),
      img
    });
  });

  /* =====================================================
     Animaciones de entrada (AOS-like)
     ===================================================== */
  let animObserver = null;

  function applyDelay(el) {
    const delay = el.dataset.animDelay;
    if (delay) el.style.setProperty('--anim-delay', delay + 'ms');
  }

  function initAnimObserver() {
    if (!('IntersectionObserver' in window)) return null;
    return new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          animObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  }

  function observeAnimatables(nodeList) {
    if (!nodeList || !nodeList.length) return;
    if (!animObserver) {
      nodeList.forEach(el => el.classList.add('is-visible'));
      return;
    }
    nodeList.forEach(el => {
      applyDelay(el);
      animObserver.observe(el);
    });
  }

  animObserver = initAnimObserver();
  observeAnimatables(document.querySelectorAll('[data-anim]'));

  window.EcoModaAnim = { observe: observeAnimatables };

})();
