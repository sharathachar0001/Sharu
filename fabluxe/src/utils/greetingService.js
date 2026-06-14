import { EOD_CONFIG } from '../config/eodConfig';
import { getGreetingSettings } from './settingsService';

// ─── Build the greeting text for a visitor ───────────────────────────────────
export function fillTemplate(message, visitor, staffName = 'our team') {
  return (message || '')
    .replace(/{name}/g, (visitor.name || 'Guest').split(' ')[0])
    .replace(/{showroom}/g, EOD_CONFIG.showroomName)
    .replace(/{staff}/g, staffName);
}

export async function buildGreeting(visitor, staffName = 'our team') {
  const settings = await getGreetingSettings();
  const message = settings.messages[settings.activeTemplate] || '';
  return fillTemplate(message, visitor, staffName);
}

// ─── Normalise a phone number into WhatsApp format ───────────────────────────
// Accepts "9876543210", "+91 98765 43210", "whatsapp:+91..." etc.
function toWhatsAppNumber(phone) {
  if (!phone) return null;
  let p = String(phone).trim();
  if (p.startsWith('whatsapp:')) return p;
  p = p.replace(/[\s\-()]/g, '');
  if (!p.startsWith('+')) {
    // Assume India if no country code (10 digits)
    p = p.length === 10 ? `+91${p}` : `+${p}`;
  }
  return `whatsapp:${p}`;
}

// ─── Send a WhatsApp greeting to a single visitor via Twilio ─────────────────
export async function sendVisitorGreeting(visitor, staffName = 'our team') {
  const { accountSid, authToken, fromNumber } = EOD_CONFIG.twilio;

  if (!accountSid || accountSid === 'YOUR_TWILIO_ACCOUNT_SID') {
    throw new Error('WhatsApp not set up yet. Add your Twilio details in src/config/eodConfig.js');
  }

  const to = toWhatsAppNumber(visitor.phone);
  if (!to) throw new Error('Visitor has no valid phone number.');

  const message = await buildGreeting(visitor, staffName);
  const credentials = btoa(`${accountSid}:${authToken}`);
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const body = new URLSearchParams({ From: fromNumber, To: to, Body: message });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to send greeting.');
  }
  return res.json();
}
