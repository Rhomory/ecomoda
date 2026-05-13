/* ============================================
   EcoModa — niubiz.js
   Integración con backend serverless (/api/*)
   que llama a las APIs de Niubiz (sandbox).

   Flujo:
   1) GET /api/security        → Access Token (Bearer)
   2) POST /api/session        → Session Token (con monto)
   3) Abre modal de pago (simula Checkout JS de Niubiz)
   4) Simula autorización local (en producción se llamaría a /api/authorization)
   5) Redirige a gracias.html
   ============================================ */
(function () {
  'use strict';

  const modal = document.getElementById('niubiz-modal');
  const body = document.getElementById('nb-body');
  const closeBtn = document.getElementById('nb-close');
  if (!modal || !body) return;

  // Detecta si /api existe (Vercel/Netlify) o si corre como HTML estático
  let BACKEND_DISPONIBLE = null;
  async function detectBackend() {
    if (BACKEND_DISPONIBLE !== null) return BACKEND_DISPONIBLE;
    try {
      const r = await fetch('/api/security', { method: 'GET' });
      BACKEND_DISPONIBLE = r.ok || r.status < 500;
    } catch {
      BACKEND_DISPONIBLE = false;
    }
    return BACKEND_DISPONIBLE;
  }

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
  }
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  }
  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  function setStatus(text) {
    const s = document.getElementById('nb-status');
    if (s) s.textContent = text;
  }
  function showLoading(initialStatus) {
    body.innerHTML = `
      <div class="nb-loading">
        <div class="nb-spinner"></div>
        <p>Estableciendo conexión segura...</p>
        <small id="nb-status">${initialStatus}</small>
      </div>`;
  }

  /* -------- Paso 1: Access Token (Security API) -------- */
  async function obtenerAccessToken() {
    setStatus('Solicitando access token a Niubiz...');
    if (await detectBackend()) {
      const r = await fetch('/api/security');
      if (!r.ok) throw new Error('No se pudo obtener token de seguridad');
      const data = await r.json();
      console.log('[Niubiz] Access Token recibido:', data);
      return data.accessToken || data.token;
    }
    // Modo simulado (sin backend)
    console.log('[Niubiz · simulado] GET https://apitestenv.vnforapps.com/api.security/v1/security');
    await wait(700);
    return 'eyJraWQiOiJUVjJ4...SIMULADO-ACCESS-TOKEN...rR8w';
  }

  /* -------- Paso 2: Session Token (Ecommerce API) -------- */
  async function obtenerSessionToken(accessToken, amount) {
    setStatus('Creando token de sesión para el pago...');
    const merchantId = '456879852';
    const channel = 'web';

    if (await detectBackend()) {
      const r = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, amount, channel })
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error || 'No se pudo crear sesión de pago');
      }
      const data = await r.json();
      console.log('[Niubiz] Session Token recibido:', data);
      return { sessionToken: data.sessionKey || data.sessionToken, merchantId };
    }
    // Simulado
    console.log(`[Niubiz · simulado] POST https://apisandbox.vnforappstest.com/api.ecommerce/v2/ecommerce/token/session/${merchantId}`);
    console.log('  body:', { amount, channel, antifraud: { merchantDefineData: { MDD4: 'pe@pe.com' } } });
    await wait(800);
    return {
      sessionToken: 'sk_' + Math.random().toString(36).slice(2, 10) + 'SIMULADO',
      merchantId
    };
  }

  /* -------- Paso 3: Mostrar form de tarjeta (simula Checkout JS) -------- */
  function mostrarFormTarjeta(sessionToken, amount, comprador) {
    const fmt = window.EcoModa.fmt;
    body.innerHTML = `
      <div class="nb-form">
        <div class="nb-amount">
          <div>
            <span>Monto a pagar</span>
            <strong>${fmt(amount)}</strong>
          </div>
          <div style="text-align:right">
            <span>Comercio</span>
            <strong style="font-size:13px; font-family:var(--font-texto)">EcoModa S.A.</strong>
          </div>
        </div>

        <div class="nb-field">
          <label>Número de tarjeta</label>
          <input type="text" id="nb-card" placeholder="4551 7281 9181 6275" maxlength="19" inputmode="numeric" autocomplete="cc-number">
        </div>
        <div class="nb-field">
          <label>Nombre en la tarjeta</label>
          <input type="text" id="nb-name" placeholder="NOMBRE APELLIDO" value="${((comprador?.nombre || '') + ' ' + (comprador?.apellido || '')).trim()}" autocomplete="cc-name">
        </div>
        <div class="nb-row">
          <div class="nb-field">
            <label>Vencimiento</label>
            <input type="text" id="nb-exp" placeholder="MM/AA" maxlength="5" inputmode="numeric" autocomplete="cc-exp">
          </div>
          <div class="nb-field">
            <label>CVV</label>
            <input type="text" id="nb-cvv" placeholder="123" maxlength="4" inputmode="numeric" autocomplete="cc-csc">
          </div>
        </div>

        <button class="nb-btn" id="nb-pay-btn">
          <i class="icon" data-lucide="lock"></i>
          Pagar ${fmt(amount)}
        </button>
        <div class="nb-secure">
          <i class="icon" data-lucide="shield-check"></i>
          Procesado de forma segura · Session: ${String(sessionToken).slice(0, 10)}...
        </div>
        <div id="nb-err"></div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();

    // Máscaras suaves
    const card = document.getElementById('nb-card');
    card.addEventListener('input', (e) => {
      const v = e.target.value.replace(/\D/g, '').slice(0, 16);
      e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
    });
    const exp = document.getElementById('nb-exp');
    exp.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
      e.target.value = v;
    });
    const cvv = document.getElementById('nb-cvv');
    cvv.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, ''); });

    document.getElementById('nb-pay-btn').addEventListener('click', () => {
      procesarPago({ sessionToken, amount, comprador });
    });
  }

  /* -------- Paso 4: Autorización (simulada) -------- */
  async function procesarPago({ sessionToken, amount, comprador }) {
    const cardVal = document.getElementById('nb-card').value.replace(/\s/g, '');
    const cvvVal = document.getElementById('nb-cvv').value;
    const expVal = document.getElementById('nb-exp').value;
    const errEl = document.getElementById('nb-err');
    errEl.innerHTML = '';

    if (cardVal.length < 13 || cvvVal.length < 3 || !expVal.includes('/')) {
      errEl.innerHTML = '<div class="nb-error">Revisa los datos de la tarjeta.</div>';
      return;
    }

    body.innerHTML = `
      <div class="nb-procesando">
        <div class="nb-spinner"></div>
        <p>Procesando pago...</p>
        <small>Comunicando con el banco emisor</small>
      </div>`;

    console.log('[Niubiz · simulado] Autorización con session token:', sessionToken);
    console.log('  Tarjeta: ****' + cardVal.slice(-4));

    await wait(1500);

    // Lógica de prueba: tarjetas que terminan en 1111 se rechazan
    const aprobado = !cardVal.endsWith('1111');

    if (!aprobado) {
      body.innerHTML = `
        <div class="nb-procesando" style="text-align:center">
          <div style="font-size:48px; color:#c44545">✕</div>
          <p style="color:#c44545">Pago rechazado</p>
          <small>La transacción no pudo completarse. Intenta con otra tarjeta.</small>
          <button class="nb-btn" id="nb-retry" style="margin-top:20px">Reintentar</button>
        </div>`;
      document.getElementById('nb-retry').addEventListener('click', () => {
        mostrarFormTarjeta(sessionToken, amount, comprador);
      });
      return;
    }

    // Aprobado
    const transactionId = 'TXN-' + Date.now();
    const orden = JSON.parse(sessionStorage.getItem('ecomoda-orden') || '{}');
    orden.transactionId = transactionId;
    orden.tarjetaUlt4 = cardVal.slice(-4);
    orden.marca = detectarMarca(cardVal);
    orden.autorizado = true;
    sessionStorage.setItem('ecomoda-orden', JSON.stringify(orden));

    console.log('[Niubiz · simulado] Transacción autorizada:', transactionId);

    body.innerHTML = `
      <div class="nb-procesando" style="text-align:center">
        <div style="font-size:48px; color:#2E7D32">✓</div>
        <p>¡Pago aprobado!</p>
        <small>Transaction ID: ${transactionId}</small>
      </div>`;

    await wait(1200);
    // Limpiar carrito
    window.EcoModa.saveCart([]);
    window.location.href = 'gracias.html';
  }

  function detectarMarca(num) {
    if (/^4/.test(num)) return 'Visa';
    if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return 'Mastercard';
    if (/^3[47]/.test(num)) return 'American Express';
    return 'Tarjeta';
  }

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

  /* -------- Entry point público -------- */
  async function iniciarPago({ amount, comprador }) {
    openModal();
    showLoading('Solicitando access token...');
    try {
      const accessToken = await obtenerAccessToken();
      const { sessionToken } = await obtenerSessionToken(accessToken, amount);
      await wait(400);
      mostrarFormTarjeta(sessionToken, amount, comprador);
    } catch (err) {
      console.error('[Niubiz] Error:', err);
      body.innerHTML = `
        <div class="nb-procesando">
          <p style="color:#c44545">No pudimos iniciar el pago</p>
          <small>${err.message || 'Error desconocido'}</small>
          <button class="nb-btn" onclick="document.getElementById('niubiz-modal').classList.remove('open')" style="margin-top:20px">Cerrar</button>
        </div>`;
    }
  }

  window.EcoNiubiz = { iniciarPago };
})();
