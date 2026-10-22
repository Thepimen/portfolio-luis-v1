/* ==========================================================================
   contact.js — real-time visual validation, character counter, Ctrl+Enter
   submit, FormSubmit AJAX integration with local fallback, and copy-email.
   ========================================================================== */
(function () {
  'use strict';
  const LLP = window.LLP;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validateField(key, input) {
    const val = (input.value || '').trim();
    if (key === 'name') {
      if (!val) return { ok: false, msg: 'requerido (mín. 2 caracteres)' };
      if (val.length < 2) return { ok: false, msg: `faltan ${2 - val.length} caracteres` };
      return { ok: true, msg: '✓ nombre válido' };
    }
    if (key === 'email') {
      if (!val) return { ok: false, msg: 'requerido (ej. nombre@dominio.com)' };
      if (!EMAIL_RE.test(val)) return { ok: false, msg: 'formato de email no válido' };
      return { ok: true, msg: '✓ sintaxis RFC válida' };
    }
    if (key === 'subject') {
      if (!val) return { ok: false, msg: 'selecciona un motivo de contacto' };
      return { ok: true, msg: '✓ asunto asignado' };
    }
    if (key === 'message') {
      if (!val) return { ok: false, msg: 'requerido (mín. 20 caracteres)' };
      if (val.length < 20) return { ok: false, msg: `añade ${20 - val.length} caracteres más` };
      return { ok: true, msg: `✓ ${val.length} bytes listos` };
    }
    return { ok: true, msg: '' };
  }

  LLP.initContact = function () {
    LLP.$$('[data-copy-email]').forEach((btn) => {
      btn.addEventListener('click', () => LLP.copyEmail());
    });

    const form = LLP.$('#contact-form');
    if (!form) return;

    const stateEl = LLP.$('#form-state');
    const logEl = LLP.$('#form-log');
    const counterEl = LLP.$('#msg-counter');
    const submitBtn = LLP.$('#form-submit');

    const fields = {
      name: LLP.$('#f-name'),
      email: LLP.$('#f-email'),
      subject: LLP.$('#f-subject'),
      message: LLP.$('#f-message')
    };

    const touched = { name: false, email: false, subject: false, message: false };

    function renderField(key, force = false) {
      const input = fields[key];
      const wrap = input.closest('.field');
      const msgEl = LLP.$('.field-msg', wrap);
      const res = validateField(key, input);
      if (!touched[key] && !force) return res.ok;

      wrap.classList.toggle('is-valid', res.ok);
      wrap.classList.toggle('is-invalid', !res.ok);
      input.setAttribute('aria-invalid', String(!res.ok));
      if (msgEl) msgEl.textContent = res.msg;
      return res.ok;
    }

    function updateStatus() {
      const msgLen = (fields.message.value || '').length;
      if (counterEl) counterEl.textContent = `${msgLen} / 1000`;

      const results = Object.keys(fields).map((k) => validateField(k, fields[k]).ok);
      const validCount = results.filter(Boolean).length;
      const allValid = validCount === results.length;

      if (stateEl) {
        stateEl.textContent = allValid ? 'ready · 4/4 OK' : `validating · ${validCount}/4`;
        stateEl.classList.toggle('is-ready', allValid);
      }
      if (logEl && !form.dataset.busy) {
        logEl.textContent = allValid
          ? '$ payload valid · ready to POST /api/message'
          : `$ validating schema (${validCount}/4 fields passed)…`;
      }
      return allValid;
    }

    Object.entries(fields).forEach(([key, input]) => {
      const evType = input.tagName === 'SELECT' ? 'change' : 'input';
      input.addEventListener(evType, () => {
        touched[key] = true;
        renderField(key, true);
        updateStatus();
      });
      input.addEventListener('blur', () => {
        if (input.value.trim().length > 0) {
          touched[key] = true;
          renderField(key, true);
          updateStatus();
        }
      });
    });

    // Ctrl+Enter / Cmd+Enter inside form submits
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        form.requestSubmit();
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let allOk = true;
      Object.keys(fields).forEach((k) => {
        touched[k] = true;
        if (!renderField(k, true)) allOk = false;
      });
      if (!allOk) {
        if (logEl) logEl.textContent = '✗ error: revisa los campos marcados en rojo antes de enviar.';
        LLP.toast('Revisa los campos pendientes del formulario');
        const firstInvalid = LLP.$('.field.is-invalid input, .field.is-invalid select, .field.is-invalid textarea', form);
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const honey = form.querySelector('input[name="_honey"]');
      if (honey && honey.value) return;

      form.dataset.busy = 'true';
      submitBtn.disabled = true;
      if (stateEl) stateEl.textContent = 'sending…';
      if (logEl) logEl.textContent = '$ POST https://formsubmit.co/ajax/luislazaropimentel@gmail.com …';

      const payload = {
        name: fields.name.value.trim(),
        email: fields.email.value.trim(),
        _subject: `[Portfolio] ${fields.subject.value} — ${fields.name.value.trim()}`,
        subject: fields.subject.value,
        message: fields.message.value.trim()
      };

      try {
        const res = await fetch('https://formsubmit.co/ajax/luislazaropimentel@gmail.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        if (stateEl) stateEl.textContent = '200 OK';
        if (logEl) logEl.textContent = `✓ HTTP 200 OK · Mensaje entregado a ${LLP.profile.email}`;
        LLP.toast('✓ Mensaje enviado correctamente');
        form.reset();
        Object.keys(touched).forEach((k) => {
          touched[k] = false;
          const wrap = fields[k].closest('.field');
          wrap.classList.remove('is-valid', 'is-invalid');
          const msgEl = LLP.$('.field-msg', wrap);
          if (msgEl) msgEl.textContent = '';
        });
        if (counterEl) counterEl.textContent = '0 / 1000';
      } catch (_) {
        // Fallback so message is never lost even offline or prior to FormSubmit activation
        if (stateEl) stateEl.textContent = 'queued · mailto';
        if (logEl) {
          logEl.textContent = `✓ Payload validado · Abriendo cliente de correo para ${LLP.profile.email}`;
        }
        const mailto = `mailto:${encodeURIComponent(LLP.profile.email)}?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent(
          `De: ${payload.name} <${payload.email}>\n\n${payload.message}`
        )}`;
        window.location.href = mailto;
        LLP.toast('✓ Mensaje preparado en tu cliente de correo');
      } finally {
        delete form.dataset.busy;
        submitBtn.disabled = false;
      }
    });
  };
})();
