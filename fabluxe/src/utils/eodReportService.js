import { getVisitorsByDate } from './visitorService';
import { exportToPDF } from './exportService';
import { EOD_CONFIG } from '../config/eodConfig';
import { format } from 'date-fns';

// ─── Generate today's EOD data ────────────────────────────────────────────────
export async function getEODData(date = new Date()) {
  const visitors = await getVisitorsByDate(date);

  const statusCount = {};
  const sourceCount = {};
  const purposeCount = {};

  visitors.forEach(v => {
    statusCount[v.status] = (statusCount[v.status] || 0) + 1;
    if (v.source) sourceCount[v.source] = (sourceCount[v.source] || 0) + 1;
    if (v.purpose) purposeCount[v.purpose] = (purposeCount[v.purpose] || 0) + 1;
  });

  const total = visitors.length;
  const converted = statusCount['Converted'] || 0;
  const followUp = (statusCount['Follow Up'] || 0) + (statusCount['New'] || 0);
  const notInterested = statusCount['Not Interested'] || 0;
  const convRate = total ? Math.round((converted / total) * 100) : 0;

  const topSource = Object.entries(sourceCount).sort((a, b) => b[1] - a[1])[0];
  const topPurpose = Object.entries(purposeCount).sort((a, b) => b[1] - a[1])[0];

  return {
    date, visitors, total, converted, followUp, notInterested,
    convRate, sourceCount, purposeCount, topSource, topPurpose,
  };
}

// ─── WhatsApp message (plain text, works on all phones) ──────────────────────
export function formatWhatsAppMessage(data) {
  const dateStr = format(data.date, 'EEEE, dd MMMM yyyy');
  const timeStr = format(new Date(), 'hh:mm a');

  const srcLines = Object.entries(data.sourceCount)
    .sort((a, b) => b[1] - a[1])
    .map(([s, c]) => `  • ${s}: ${c}`)
    .join('\n');

  const purposeLines = Object.entries(data.purposeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([p, c]) => `  • ${p}: ${c}`)
    .join('\n');

  const visitorLines = data.visitors.slice(0, 5).map((v, i) =>
    `  ${i + 1}. ${v.name} — ${v.purpose || '—'} (${v.status})`
  ).join('\n');

  return `
━━━━━━━━━━━━━━━━━━━━━━
✨ *FABLUXE* — EOD REPORT
━━━━━━━━━━━━━━━━━━━━━━
📅 *${dateStr}*
🕐 Generated at ${timeStr}

━━━━━━━━━━━━━━━━━━━━━━
📊 *TODAY'S SUMMARY*
━━━━━━━━━━━━━━━━━━━━━━
👥 Total Visitors  : *${data.total}*
✅ Converted       : *${data.converted}*
⏰ Pending Follow-Up: *${data.followUp}*
❌ Not Interested  : *${data.notInterested}*
📈 Conversion Rate : *${data.convRate}%*

━━━━━━━━━━━━━━━━━━━━━━
📍 *VISITOR SOURCES*
━━━━━━━━━━━━━━━━━━━━━━
${srcLines || '  No data'}

━━━━━━━━━━━━━━━━━━━━━━
🏠 *TOP INTERESTS*
━━━━━━━━━━━━━━━━━━━━━━
${purposeLines || '  No data'}

━━━━━━━━━━━━━━━━━━━━━━
👤 *TODAY'S VISITORS*
━━━━━━━━━━━━━━━━━━━━━━
${visitorLines || '  No visitors today'}${data.total > 5 ? `\n  ... and ${data.total - 5} more` : ''}

━━━━━━━━━━━━━━━━━━━━━━
_FABLUXE Interior Home Solutions_
_Visitor Management System_
`.trim();
}

// ─── Send via Twilio WhatsApp API ─────────────────────────────────────────────
export async function sendWhatsAppReport(message, recipients = EOD_CONFIG.recipients) {
  const { accountSid, authToken, fromNumber } = EOD_CONFIG.twilio;

  if (!accountSid || accountSid === 'YOUR_TWILIO_ACCOUNT_SID') {
    throw new Error('Twilio credentials not configured. Please update src/config/eodConfig.js');
  }

  if (!recipients || recipients.length === 0) {
    throw new Error('No recipients configured. Please add phone numbers in src/config/eodConfig.js');
  }

  const credentials = btoa(`${accountSid}:${authToken}`);
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const results = await Promise.allSettled(
    recipients.map(async (recipient) => {
      const body = new URLSearchParams({
        From: fromNumber,
        To: recipient.number,
        Body: message,
      });

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(`Failed to send to ${recipient.name}: ${err.message}`);
      }
      return await res.json();
    })
  );

  const failed = results.filter(r => r.status === 'rejected');
  if (failed.length > 0) {
    throw new Error(failed.map(f => f.reason.message).join('\n'));
  }

  return results.map(r => r.value);
}

// ─── Generate & send full EOD (WhatsApp + PDF) ────────────────────────────────
export async function sendEODReport(date = new Date()) {
  const data = await getEODData(date);
  const message = formatWhatsAppMessage(data);
  await sendWhatsAppReport(message);
  await exportToPDF(data.visitors, `EOD Report — ${format(date, 'dd MMM yyyy')}`);
  return { message, data };
}
