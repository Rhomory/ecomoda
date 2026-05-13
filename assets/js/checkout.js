/* ============================================
   Checkout — renderiza resumen y dispara Niubiz
   ============================================ */
(function () {
  'use strict';
  if (!window.EcoModa) return;

  const itemsEl = document.getElementById('resumen-items');
  const totEl = document.getElementById('resumen-tot');
  const btnPagar = document.getElementById('btn-pagar');
  const form = document.getElementById('form-comprador');

  function renderResumen() {
    const cart = window.EcoModa.getCart();
    const fmt = window.EcoModa.fmt;

    if (cart.length === 0) {
      itemsEl.innerHTML = `<p style="color: var(--texto-suave); font-size:13px">Tu carrito está vacío. <a href="tienda.html" style="color: var(--dorado); font-weight:600">Ir a la tienda</a>.</p>`;
      totEl.innerHTML = '';
      if (btnPagar) btnPagar.disabled = true;
      return;
    }

    itemsEl.innerHTML = cart.map(it => `
      <div class="resumen-item">
        <div class="img">
          <img src="${it.img || ''}" alt="">
          <span class="q">${it.qty}</span>
        </div>
        <div>
          <strong>${it.name}</strong>
          <span class="meta">${it.talla ? 'T: ' + it.talla : ''}${it.color ? ' · ' + it.color : ''}</span>
        </div>
        <span class="price">${fmt(it.priceNum * it.qty)}</span>
      </div>
    `).join('');

    const { subtotal, envio, total } = window.EcoModa.cartTotals();
    totEl.innerHTML = `
      <div class="row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
      <div class="row"><span>Envío</span><span>${envio === 0 ? 'Gratis' : fmt(envio)}</span></div>
      <div class="row"><span>IGV (incluido)</span><span>${fmt(total * 0.18)}</span></div>
      <div class="row tot"><span>Total a pagar</span><strong>${fmt(total)}</strong></div>
    `;
    if (btnPagar) btnPagar.disabled = false;
  }

  // Selección visual de método
  document.querySelectorAll('.pago-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      if (opt.classList.contains('disabled')) return;
      document.querySelectorAll('.pago-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
    });
  });

  // Click "Pagar ahora"
  btnPagar?.addEventListener('click', async () => {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const cart = window.EcoModa.getCart();
    if (cart.length === 0) return;

    const { total } = window.EcoModa.cartTotals();
    const data = new FormData(form);
    const comprador = Object.fromEntries(data.entries());

    // Guardar para gracias.html
    sessionStorage.setItem('ecomoda-orden', JSON.stringify({
      items: cart,
      total,
      comprador,
      fecha: new Date().toISOString()
    }));

    // Disparar flujo Niubiz
    if (window.EcoNiubiz) {
      window.EcoNiubiz.iniciarPago({ amount: total, comprador });
    }
  });

  document.addEventListener('cart:updated', renderResumen);
  renderResumen();

  // GA4: begin_checkout al cargar
  const cartInicial = window.EcoModa.getCart();
  if (cartInicial.length > 0) {
    const { total } = window.EcoModa.cartTotals();
    window.EcoTrack?.beginCheckout(cartInicial, total);
  }
})();
