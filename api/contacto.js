'use strict';

const { validateSubmission, buildEmail } = require('./_lib/validate');

const MIN_FILL_MS = 2000;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_TRACKED_IPS = 1000;
const GENERIC_ERROR = 'No pudimos enviar el mensaje. Probá de nuevo o escribinos por WhatsApp.';

const hits = new Map(); // Límite básico por IP; se reinicia con cada instancia serverless.

function isRateLimited(ip) {
  const now = Date.now();
  if (hits.size > MAX_TRACKED_IPS) hits.clear();
  const recent = (hits.get(ip) || []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

function isSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

function readBody(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  return body && typeof body === 'object' ? body : {};
}

async function sendEmail({ subject, html }, replyTo) {
  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO || !CONTACT_FROM) {
    console.error('Faltan variables de entorno: RESEND_API_KEY, CONTACT_TO o CONTACT_FROM');
    return { ok: false, status: 500, error: 'El envío no está disponible por ahora. Escribinos por WhatsApp.' };
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: CONTACT_FROM, to: [CONTACT_TO], reply_to: replyTo, subject, html }),
  });
  if (!response.ok) {
    console.error('Resend respondió', response.status, await response.text());
    return { ok: false, status: 502, error: GENERIC_ERROR };
  }
  return { ok: true };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const reply = (status, payload) => res.status(status).json(payload);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return reply(405, { error: 'Método no permitido.' });
  }
  if (!isSameOrigin(req)) return reply(403, { error: 'Origen no permitido.' });

  const body = readBody(req);
  if (body.website) return reply(200, { ok: true }); // campo trampa: los bots lo completan
  if (!(Number(body.t) >= MIN_FILL_MS)) return reply(400, { error: 'Esperá unos segundos y volvé a intentar.' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'desconocida';
  if (isRateLimited(ip)) return reply(429, { error: 'Demasiados intentos. Probá de nuevo más tarde.' });

  const result = validateSubmission(body);
  if (!result.ok) return reply(400, { error: result.error });

  try {
    const sent = await sendEmail(buildEmail(result.data), result.data.email);
    return sent.ok ? reply(200, { ok: true }) : reply(sent.status, { error: sent.error });
  } catch (error) {
    console.error('Error al enviar', error);
    return reply(502, { error: GENERIC_ERROR });
  }
};
