// ─── EOD REPORT CONFIGURATION ────────────────────────────────────────────────
// Fill in your WhatsApp / Twilio details here before using EOD reports.

export const EOD_CONFIG = {
  // ── Twilio WhatsApp API ──────────────────────────────────────────────────
  // Sign up at https://www.twilio.com → WhatsApp → Sandbox (free) or Business
  twilio: {
    accountSid:   'YOUR_TWILIO_ACCOUNT_SID',      // starts with AC...
    authToken:    'YOUR_TWILIO_AUTH_TOKEN',
    fromNumber:   'whatsapp:+14155238886',         // Twilio sandbox number
    // For production WhatsApp Business: 'whatsapp:+91XXXXXXXXXX'
  },

  // ── Recipients ────────────────────────────────────────────────────────────
  // Add all numbers that should receive the EOD report (WhatsApp format)
  recipients: [
    // { name: 'Owner', number: 'whatsapp:+91XXXXXXXXXX' },
    // { name: 'Manager', number: 'whatsapp:+91XXXXXXXXXX' },
  ],

  // ── Schedule ──────────────────────────────────────────────────────────────
  scheduleTime: { hour: 19, minute: 0 },   // 7:00 PM daily

  // ── Showroom Info ─────────────────────────────────────────────────────────
  showroomName: 'FABLUXE Interior Home Solutions',
  showroomPhone: '+91 XXXXX XXXXX',
  showroomAddress: 'Your showroom address here',
};
