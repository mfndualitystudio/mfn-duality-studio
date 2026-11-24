import { $, $$ } from './dom.js';

const ENDPOINT = '/api/contacto';
const FIELDS = 'input[name]:not([name="website"]), select[name], textarea[name]';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const MESSAGES = Object.freeze({
  required: 'Completá este campo para continuar.',
  choose: 'Elegí una opción de la lista.',
  email: 'Revisá el email: tiene que verse como nombre@correo.com.',
  min: (n) => `Escribí al menos ${n} caracteres.`,
  sending: 'Enviando…',
  failed: 'No pudimos enviarlo. Probá de nuevo o escribinos por WhatsApp.',
});

/** sessionStorage puede estar bloqueado (modo privado, políticas del navegador). */
const storage = (() => {
  try {
    sessionStorage.setItem('__mfn', '1');
    sessionStorage.removeItem('__mfn');
    return sessionStorage;
  } catch {
    return null;
  }
})();

/** @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} field */
function getError(field) {
  const value = field.value.trim();
  if (field.required && !value) return field.tagName === 'SELECT' ? MESSAGES.choose : MESSAGES.required;
  if (field.type === 'email' && value && !EMAIL_RE.test(value)) return MESSAGES.email;
  const min = Number(field.dataset.min);
  if (min && value && value.length < min) return MESSAGES.min(min);
  return '';
}

function setError(field, message) {
  const box = field.closest('.field');
  let error = box.querySelector('.field__error');
  if (field.dataset.baseDescribedby === undefined) {
    field.dataset.baseDescribedby = field.getAttribute('aria-describedby') || '';
  }
  const base = field.dataset.baseDescribedby;
  field.setAttribute('aria-invalid', String(Boolean(message)));

  if (!message) {
    error?.remove();
    if (base) field.setAttribute('aria-describedby', base); else field.removeAttribute('aria-describedby');
    return;
  }
  if (!error) {
    error = document.createElement('p');
    error.className = 'field__error';
    error.id = `${field.id}-error`;
    box.append(error);
  }
  error.textContent = message;
  field.setAttribute('aria-describedby', [base, error.id].filter(Boolean).join(' '));
}

/** Valida todos los campos y enfoca el primero con error. */
function validate(form) {
  let firstInvalid = null;
  for (const field of $$(FIELDS, form)) {
    const message = getError(field);
    setError(field, message);
    if (message && !firstInvalid) firstInvalid = field;
  }
  firstInvalid?.focus();
  return !firstInvalid;
}

function setStatus(status, state, text) {
  status.dataset.state = state;
  status.textContent = text;
}

async function send(form, openedAt) {
  const payload = { ...Object.fromEntries(new FormData(form)), tipo: form.dataset.tipo, t: Date.now() - openedAt };
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error || MESSAGES.failed), { userFacing: Boolean(data.error) });
}

/** Contador de caracteres y borrador guardado en la sesión. */
function enhanceTextarea(form) {
  const draftKey = `mfn:draft:${form.dataset.tipo}`;
  for (const counter of $$('[data-counter-for]', form)) {
    const field = document.getElementById(counter.dataset.counterFor);
    if (!field) continue;
    if (field.hasAttribute('data-draft') && storage) field.value = storage.getItem(draftKey) || '';
    const update = () => { counter.textContent = `${field.value.length} / ${field.maxLength}`; };
    field.addEventListener('input', () => {
      update();
      if (field.hasAttribute('data-draft')) storage?.setItem(draftKey, field.value);
    });
    update();
  }
  return () => storage?.removeItem(draftKey);
}

function setupForm(form) {
  const status = $('.form__status', form);
  const button = $('button[type="submit"]', form);
  const openedAt = Date.now();
  const clearDraft = enhanceTextarea(form);

  form.addEventListener('input', (event) => {
    if (event.target.getAttribute?.('aria-invalid') === 'true') setError(event.target, getError(event.target));
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus(status, '', '');
    if (!validate(form)) return;

    const label = button.textContent;
    button.disabled = true;
    button.textContent = MESSAGES.sending;
    form.setAttribute('aria-busy', 'true');
    try {
      await send(form, openedAt);
      form.reset();
      clearDraft();
      $$('[data-counter-for]', form).forEach((counter) => { counter.textContent = `0 / ${document.getElementById(counter.dataset.counterFor).maxLength}`; });
      setStatus(status, 'ok', form.dataset.ok || 'Listo, ¡gracias!');
      status.focus();
    } catch (error) {
      setStatus(status, 'error', error.userFacing ? error.message : MESSAGES.failed);
      status.focus();
    } finally {
      button.disabled = false;
      button.textContent = label;
      form.removeAttribute('aria-busy');
    }
  });
}

/** Formularios con [data-form]: validación accesible y envío a /api/contacto. */
export function initForms() {
  $$('form[data-form]').forEach(setupForm);
}
