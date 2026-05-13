/* ============================================
   Producto — galería, tabs, tallas, color, qty
   ============================================ */
(function () {
  'use strict';

  // GA4: view_item al cargar la página
  const initName = document.querySelector('.producto-info h1')?.textContent.trim() || 'Producto';
  const initPrice = document.querySelector('.producto-info .price')?.textContent.trim() || '';
  const initCat = document.querySelector('.producto-info .eyebrow')?.textContent.trim() || '';
  window.EcoTrack?.viewItem({
    id: 'aurora-beige',
    name: initName,
    priceNum: window.EcoModa?.parsePrice(initPrice) || 0,
    cat: initCat
  });

  // Galería: cambio de imagen al clic en thumb
  const mainImg = document.getElementById('main-img');
  document.querySelectorAll('.thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const src = thumb.dataset.img;
      if (src && mainImg) {
        mainImg.style.opacity = 0;
        setTimeout(() => {
          mainImg.src = src;
          mainImg.style.opacity = 1;
        }, 150);
      }
      document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`.tab-panel[data-panel="${target}"]`)?.classList.add('active');
    });
  });

  // Tallas
  document.querySelectorAll('.producto-info .talla').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.producto-info .talla').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
    });
  });

  // Colores
  document.querySelectorAll('.producto-info .color').forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll('.producto-info .color').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      const nameEl = document.getElementById('color-name');
      if (nameEl && c.dataset.name) nameEl.textContent = c.dataset.name;
    });
  });

  // Cantidad
  const qtyEl = document.getElementById('qty');
  let qty = 1;
  document.getElementById('qty-minus')?.addEventListener('click', () => {
    if (qty > 1) { qty--; qtyEl.textContent = qty; }
  });
  document.getElementById('qty-plus')?.addEventListener('click', () => {
    qty++; qtyEl.textContent = qty;
  });

  // Añadir al carrito
  document.getElementById('add-cart')?.addEventListener('click', () => {
    if (!window.EcoModa) return;
    const name = document.querySelector('.producto-info h1')?.textContent.trim() || 'Producto';
    const priceTxt = document.querySelector('.producto-info .price')?.textContent.trim() || '';
    const talla = document.querySelector('.producto-info .talla.active')?.textContent.trim() || '';
    const color = document.querySelector('.producto-info .color.active')?.dataset.name || '';
    const img = document.getElementById('main-img')?.getAttribute('src') || '';
    window.EcoModa.addToCart({
      id: 'aurora-beige',
      name,
      price: priceTxt,
      priceNum: window.EcoModa.parsePrice(priceTxt),
      talla,
      color,
      img,
      qty
    });
    const btn = document.getElementById('add-cart');
    const original = btn.innerHTML;
    btn.innerHTML = '✓ Añadido al carrito';
    setTimeout(() => { btn.innerHTML = original; if (window.lucide) lucide.createIcons(); }, 1500);
  });

})();
