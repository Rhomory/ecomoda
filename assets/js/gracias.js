/* ============================================
   Gracias — muestra el detalle de la orden
   ============================================ */
(function () {
  'use strict';
  if (!window.EcoModa) return;

  const infoEl = document.getElementById('orden-info');
  const detEl = document.getElementById('gracias-detalle');
  const fmt = window.EcoModa.fmt;

  let orden = null;
  try {
    orden = JSON.parse(sessionStorage.getItem('ecomoda-orden') || 'null');
  } catch { orden = null; }

  if (!orden || !orden.autorizado) {
    infoEl.innerHTML = `
      <div class="item"><span>Estado</span><strong>Sin datos de orden</strong></div>`;
    detEl.innerHTML = `<p style="color: var(--azul-cielo); font-size:14px">No encontramos una orden activa. <a href="tienda.html" style="color: var(--dorado); font-weight:600">Ir a la tienda</a>.</p>`;
    return;
  }

  // GA4: purchase (solo una vez por orden)
  const trackKey = 'ecomoda-tracked-' + (orden.transactionId || '');
  if (!sessionStorage.getItem(trackKey)) {
    window.EcoTrack?.purchase(orden);
    sessionStorage.setItem(trackKey, '1');
  }

  const fecha = new Date(orden.fecha);
  const orderNum = '#EM-' + fecha.getTime().toString().slice(-8);

  infoEl.innerHTML = `
    <div class="item"><span>N° de orden</span><strong>${orderNum}</strong></div>
    <div class="item"><span>Transacción</span><strong>${orden.transactionId || '—'}</strong></div>
    <div class="item"><span>Tarjeta</span><strong>${orden.marca} •••• ${orden.tarjetaUlt4}</strong></div>
    <div class="item"><span>Total pagado</span><strong style="color: var(--dorado)">${fmt(orden.total)}</strong></div>
  `;

  const c = orden.comprador || {};
  const items = orden.items || [];

  detEl.innerHTML = `
    <h3>Detalle del pedido</h3>

    <div class="gd-section">
      <h4>PRODUCTOS</h4>
      ${items.map(it => `
        <div class="gd-item">
          <div class="img">
            <img src="${it.img || ''}" alt="">
            <span class="q">${it.qty}</span>
          </div>
          <div>
            <strong>${it.name}</strong>
            <span>${it.talla ? 'T: ' + it.talla : ''}${it.color ? ' · ' + it.color : ''}</span>
          </div>
          <span class="price">${fmt(it.priceNum * it.qty)}</span>
        </div>
      `).join('')}
      <div class="gd-tot"><strong>Total</strong><strong>${fmt(orden.total)}</strong></div>
    </div>

    <div class="gd-section">
      <h4>ENVIAR A</h4>
      <p>
        ${c.nombre || ''} ${c.apellido || ''}<br>
        ${c.direccion || ''}<br>
        ${c.ciudad || ''}, ${c.depto || ''} · CP ${c.cp || '—'}<br>
        ${c.telefono || ''}
      </p>
    </div>

    <div class="gd-section">
      <h4>CONTACTO</h4>
      <p>${c.email || ''}</p>
    </div>

    <div class="gd-section">
      <h4>FECHA</h4>
      <p>${fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })} · ${fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</p>
    </div>
  `;
})();
