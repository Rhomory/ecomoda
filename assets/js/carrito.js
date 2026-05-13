/* ============================================
   Carrito (página completa)
   ============================================ */
(function () {
  'use strict';

  const layout = document.getElementById('carrito-layout');
  const countEl = document.getElementById('carrito-count');
  if (!layout || !window.EcoModa) return;

  function render() {
    const cart = window.EcoModa.getCart();
    const fmt = window.EcoModa.fmt;

    if (cart.length === 0) {
      countEl.textContent = 'Tu carrito está vacío.';
      layout.innerHTML = `
        <div class="carrito-vacio">
          <i class="icon-lg" data-lucide="shopping-bag"></i>
          <h2>Aún no has añadido nada</h2>
          <p>Descubre prendas confeccionadas con propósito y materiales nobles.</p>
          <a href="tienda.html" class="btn btn-primary">Ir a la tienda <i class="icon" data-lucide="arrow-right"></i></a>
        </div>`;
      if (window.lucide) lucide.createIcons();
      return;
    }

    const totalItems = cart.reduce((s, p) => s + p.qty, 0);
    countEl.textContent = `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'} en tu carrito.`;

    const filas = cart.map((it, i) => `
      <div class="carrito-row" data-idx="${i}">
        <div class="carrito-prod">
          <div class="carrito-prod-img"><img src="${it.img || ''}" alt=""></div>
          <div class="carrito-prod-info">
            <strong>${it.name}</strong>
            <span class="meta">${it.talla ? 'Talla: ' + it.talla : ''}${it.color ? ' · ' + it.color : ''}</span>
            <span class="price-mob">${fmt(it.priceNum * it.qty)}</span>
          </div>
        </div>
        <div class="carrito-qty">
          <button data-act="dec" data-idx="${i}" aria-label="Restar">−</button>
          <span>${it.qty}</span>
          <button data-act="inc" data-idx="${i}" aria-label="Sumar">+</button>
        </div>
        <div class="carrito-price">${fmt(it.priceNum * it.qty)}</div>
        <button class="carrito-rm" data-act="rm" data-idx="${i}" aria-label="Eliminar"><i class="icon" data-lucide="trash-2"></i></button>
      </div>
    `).join('');

    const { subtotal, envio, total } = window.EcoModa.cartTotals();

    layout.innerHTML = `
      <div>
        <div class="carrito-lista">
          <div class="carrito-lista-head">
            <span>Producto</span>
            <span>Cantidad</span>
            <span style="text-align:right">Subtotal</span>
            <span></span>
          </div>
          ${filas}
          <div class="carrito-actions">
            <a href="tienda.html"><i class="icon" data-lucide="arrow-left"></i> Seguir comprando</a>
            <button id="vaciar-carrito"><i class="icon" data-lucide="trash-2"></i> Vaciar carrito</button>
          </div>
        </div>
      </div>
      <aside class="carrito-resumen">
        <h3>Resumen de pedido</h3>
        <div class="row"><span>Subtotal (${totalItems} items)</span><span>${fmt(subtotal)}</span></div>
        <div class="row"><span>Envío</span><span>${envio === 0 ? 'Gratis' : fmt(envio)}</span></div>
        <div class="row"><span>Descuento</span><span>—</span></div>
        <div class="row tot"><span>Total</span><strong>${fmt(total)}</strong></div>
        <a href="checkout.html" class="btn btn-gold">Proceder al pago <i class="icon" data-lucide="arrow-right"></i></a>
        <div class="cupon">
          <input type="text" placeholder="Código de descuento">
          <button>Aplicar</button>
        </div>
        <div class="seguro"><i class="icon" data-lucide="shield-check"></i> Pago 100% seguro con Niubiz</div>
      </aside>
    `;

    if (window.lucide) lucide.createIcons();
  }

  layout.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]');
    if (act) {
      const idx = parseInt(act.dataset.idx, 10);
      const a = act.dataset.act;
      if (a === 'inc') window.EcoModa.updateQty(idx, +1);
      else if (a === 'dec') window.EcoModa.updateQty(idx, -1);
      else if (a === 'rm') window.EcoModa.removeFromCart(idx);
    }
    if (e.target.closest('#vaciar-carrito')) {
      window.EcoModa.saveCart([]);
    }
  });

  document.addEventListener('cart:updated', render);
  render();

  // GA4: view_cart al cargar la página
  const cartInicial = window.EcoModa.getCart();
  if (cartInicial.length > 0) {
    const { total } = window.EcoModa.cartTotals();
    window.EcoTrack?.viewCart(cartInicial, total);
  }
})();
