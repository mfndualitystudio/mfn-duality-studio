'use strict';

const TIPOS = Object.freeze(['contacto', 'espera']);
const PROYECTOS = Object.freeze(['Página web', 'Landing page', 'Software a medida', 'Otro']);
const APPS = Object.freeze(['Gestión inmobiliaria', 'Gestión de negocios', 'Ambas']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HTML_ESCAPES = Object.freeze({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' });

const fail = (error) => ({ ok: false, error });

/** Escapa texto para insertarlo de forma segura en HTML. */
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/** Texto de una sola línea, recortado, sin saltos (evita inyección en asuntos). */
function clean(value, max) {
  return String(value ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
}

/**
 * Valida y normaliza un envío de formulario.
 * @param {Record<string, unknown>} body
 * @returns {{ok: true, data: object} | {ok: false, error: string}}
 */
function validateSubmission(body) {
  const tipo = clean(body.tipo, 20);
  const email = clean(body.email, 120);
  if (!TIPOS.includes(tipo)) return fail('Solicitud inválida.');
  if (!EMAIL_RE.test(email)) return fail('Ingresá un email válido.');

  if (tipo === 'contacto') {
    const nombre = clean(body.nombre, 80);
    const proyecto = clean(body.proyecto, 40);
    const mensaje = String(body.mensaje ?? '').trim().slice(0, 2000);
    if (nombre.length < 2) return fail('Ingresá tu nombre.');
    if (!PROYECTOS.includes(proyecto)) return fail('Elegí qué necesitás.');
    if (mensaje.length < 10) return fail('Contanos un poco más sobre tu proyecto.');
    return { ok: true, data: { tipo, email, nombre, proyecto, mensaje } };
  }

  const app = clean(body.app, 40);
  if (!APPS.includes(app)) return fail('Elegí una aplicación.');
  return { ok: true, data: { tipo, email, app } };
}

/** Arma asunto y cuerpo HTML del correo a partir de datos ya validados. */
function buildEmail(data) {
  const rows = data.tipo === 'contacto'
    ? [['Nombre', data.nombre], ['Email', data.email], ['Proyecto', data.proyecto], ['Mensaje', data.mensaje]]
    : [['Email', data.email], ['Aplicación', data.app]];
  const subject = data.tipo === 'contacto' ? `Nueva consulta de ${data.nombre}` : 'Nueva anotación en lista de espera';
  const html = `<table cellpadding="8" style="font-family:Arial,sans-serif;font-size:14px">${rows
    .map(([label, value]) => `<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value).replace(/\n/g, '<br>')}</td></tr>`)
    .join('')}</table>`;
  return { subject, html };
}

module.exports = { validateSubmission, buildEmail, escapeHtml };
