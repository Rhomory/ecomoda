/* ============================================
   Tienda — render de productos + filtros
   ============================================ */
(function () {
  'use strict';

  const productos = [
    { id: 1,  name: 'Vestido Aurora',         cat: 'Mujer · Vestidos',     price: 129.90, img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600', tag: 'Nuevo', categoria: 'Vestidos',    tallas: ['XS','S','M','L'],     colores: ['Beige','Azul cielo'],     material: 'Lino' },
    { id: 2,  name: 'Camisa Linen Salvia',    cat: 'Hombre · Camisas',     price: 89.90,  img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600', tag: 'Top',   categoria: 'Camisas',     tallas: ['S','M','L','XL'],     colores: ['Dorado','Beige'],         material: 'Lino' },
    { id: 3,  name: 'Bolso Terra',            cat: 'Accesorios · Bolsos',  price: 79.90,  img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600', tag: '-20%',  categoria: 'Accesorios',  tallas: [],                     colores: ['Dorado','Crema'],         material: 'Reciclado' },
    { id: 4,  name: 'Pantalón Crudo',         cat: 'Mujer · Pantalones',   price: 109.90, img: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600', tag: 'Eco',   categoria: 'Pantalones',  tallas: ['S','M','L'],          colores: ['Beige','Crema'],          material: 'Algodón orgánico' },
    { id: 5,  name: 'Collar Dorado',          cat: 'Accesorios · Joyería', price: 49.90,  img: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600', tag: 'Hot',   categoria: 'Accesorios',  tallas: [],                     colores: ['Dorado'],                 material: 'Reciclado' },
    { id: 6,  name: 'Falda Plisada Marina',   cat: 'Mujer · Faldas',       price: 99.90,  img: 'https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=600', tag: 'Nuevo', categoria: 'Vestidos',    tallas: ['XS','S','M'],         colores: ['Azul marino','Azul cielo'], material: 'Algodón orgánico' },
    { id: 7,  name: 'Chino Bambú Beige',      cat: 'Hombre · Pantalones',  price: 119.90, img: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600', tag: 'Eco',   categoria: 'Pantalones',  tallas: ['M','L','XL'],         colores: ['Beige','Crema'],          material: 'Bambú' },
    { id: 8,  name: 'Sweater Cottagecore',    cat: 'Mujer · Sweaters',     price: 139.90, img: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600', tag: 'Top',   categoria: 'Camisas',     tallas: ['S','M','L'],          colores: ['Beige','Crema'],          material: 'Algodón orgánico' },
    { id: 9,  name: 'Sandalia Veggie',        cat: 'Calzado · Mujer',      price: 84.90,  img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600', tag: '-15%',  categoria: 'Calzado',     tallas: ['M','L'],              colores: ['Dorado','Beige'],         material: 'Reciclado' }
  ];

  const fmt = (n) => 'S/ ' + n.toFixed(2);

  /* ---------- Estado de filtros ---------- */
  const state = {
    categorias: [],
    tallas:     [],
    colores:    [],
    materiales: [],
    precioMax:  200
  };

  /* ---------- Render ---------- */
  function renderCards(list) {
    const grid = document.getElementById('productos-grid');
    if (!grid) return;
    if (list.length === 0) {
      grid.innerHTML = '<p class="empty-state">No hay productos que coincidan con los filtros. <button id="reset-empty" class="link-gold">Limpiar filtros</button></p>';
      document.getElementById('reset-empty')?.addEventListener('click', clearAll);
      return;
    }
    grid.innerHTML = list.map((p, idx) => `
      <article class="card-producto" data-anim="fade-up" data-anim-delay="${idx * 60}">
        <a href="producto.html" class="card-img" aria-label="Ver ${p.name}">
          <img src="${p.img}" alt="${p.name}" loading="lazy">
          <span class="card-tag">${p.tag}</span>
          <span class="card-fav" aria-hidden="true"><i class="icon" data-lucide="heart"></i></span>
        </a>
        <div class="card-info">
          <span class="card-cat">${p.cat}</span>
          <h3 class="card-name"><a href="producto.html">${p.name}</a></h3>
          <div class="card-foot">
            <span class="card-price">${fmt(p.price)}</span>
            <button class="card-add" aria-label="Añadir al carrito" data-id="${p.id}"><i class="icon" data-lucide="plus"></i></button>
          </div>
        </div>
      </article>
    `).join('');

    if (window.lucide) lucide.createIcons();
    attachAddListeners();
    // Re-observar para animaciones (reiniciar IO si existe)
    if (window.EcoModaAnim?.observe) window.EcoModaAnim.observe(grid.querySelectorAll('[data-anim]'));
  }

  function attachAddListeners() {
    document.querySelectorAll('.card-add').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.id;
        const prod = productos.find(p => String(p.id) === id);
        if (prod && window.EcoModa) {
          window.EcoModa.addToCart({
            id: prod.id,
            name: prod.name,
            price: fmt(prod.price),
            priceNum: prod.price,
            img: prod.img
          });
          btn.style.background = 'var(--dorado)';
          setTimeout(() => btn.style.background = '', 600);
        }
      });
    });
  }

  /* ---------- Filtrado ---------- */
  function applyFilters() {
    let list = productos.filter(p => {
      if (p.price > state.precioMax) return false;
      if (state.categorias.length && !state.categorias.includes(p.categoria)) return false;
      if (state.tallas.length && !state.tallas.some(t => p.tallas.includes(t))) return false;
      if (state.colores.length && !state.colores.some(c => p.colores.includes(c))) return false;
      if (state.materiales.length && !state.materiales.includes(p.material)) return false;
      return true;
    });
    renderCards(list);
    const count = document.getElementById('results-count');
    if (count) count.textContent = `Mostrando ${list.length} de ${productos.length} productos`;
  }

  function clearAll() {
    state.categorias = [];
    state.tallas = [];
    state.colores = [];
    state.materiales = [];
    state.precioMax = 200;
    document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(i => i.checked = false);
    document.querySelectorAll('.talla.active, .sidebar .color.active').forEach(el => el.classList.remove('active'));
    const slider = document.getElementById('price-slider');
    if (slider) {
      slider.value = 200;
      document.getElementById('price-value').textContent = 'S/ 200';
    }
    applyFilters();
  }

  /* ---------- Listeners ---------- */
  // Checkboxes (categoría y material)
  document.querySelectorAll('[data-filter-type="categoria"] input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      state.categorias = Array.from(document.querySelectorAll('[data-filter-type="categoria"] input:checked')).map(i => i.value);
      applyFilters();
    });
  });
  document.querySelectorAll('[data-filter-type="material"] input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      state.materiales = Array.from(document.querySelectorAll('[data-filter-type="material"] input:checked')).map(i => i.value);
      applyFilters();
    });
  });

  // Tallas (multi-toggle)
  document.querySelectorAll('[data-filter-type="talla"] .talla').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      state.tallas = Array.from(document.querySelectorAll('[data-filter-type="talla"] .talla.active')).map(b => b.dataset.value);
      applyFilters();
    });
  });

  // Colores (multi-toggle)
  document.querySelectorAll('[data-filter-type="color"] .color').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      state.colores = Array.from(document.querySelectorAll('[data-filter-type="color"] .color.active')).map(b => b.dataset.value);
      applyFilters();
    });
  });

  // Precio slider
  const slider = document.getElementById('price-slider');
  if (slider) {
    slider.addEventListener('input', () => {
      const v = parseInt(slider.value, 10);
      state.precioMax = v;
      document.getElementById('price-value').textContent = 'S/ ' + v;
      applyFilters();
    });
  }

  // Limpiar
  document.getElementById('clear-filters')?.addEventListener('click', clearAll);

  // Render inicial
  renderCards(productos);
})();
