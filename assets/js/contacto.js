/* ============================================
   Contacto — validación del formulario
   ============================================ */
(function () {
  'use strict';

  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!form) return;

  function setError(field, msg) {
    const small = field.parentElement.querySelector('.error');
    if (small) small.textContent = msg || '';
    field.style.borderColor = msg ? '#c0392b' : '';
  }

  function validateField(field) {
    if (!field.checkValidity()) {
      let msg = 'Campo requerido';
      if (field.type === 'email' && field.value) msg = 'Email no válido';
      else if (field.minLength > 0 && field.value.length < field.minLength) msg = `Mínimo ${field.minLength} caracteres`;
      setError(field, msg);
      return false;
    }
    setError(field, '');
    return true;
  }

  form.querySelectorAll('input[required], select[required], textarea[required]').forEach(f => {
    f.addEventListener('blur', () => validateField(f));
    f.addEventListener('input', () => { if (f.parentElement.querySelector('.error').textContent) validateField(f); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('input[required], select[required], textarea[required]').forEach(f => {
      if (!validateField(f)) ok = false;
    });
    if (!ok) return;

    // Simulación de envío
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Enviando...';

    setTimeout(() => {
      form.reset();
      btn.innerHTML = original;
      btn.disabled = false;
      if (window.lucide) lucide.createIcons();
      success?.classList.add('show');
      setTimeout(() => success?.classList.remove('show'), 5000);
    }, 900);
  });
})();
