import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { utils, write } from 'xlsx';
import { format } from 'date-fns';

function formatDate(ts) {
  if (!ts) return '';
  const d = ts?.toDate?.() || new Date(ts);
  return format(d, 'dd MMM yyyy, hh:mm a');
}

// ─── Excel Export ────────────────────────────────────────────────────────────

export async function exportToExcel(visitors, rangeLabel = '') {
  const rows = visitors.map((v, i) => ({
    '#': i + 1,
    'Visitor Name': v.name || '',
    'Phone': v.phone || '',
    'Email': v.email || '',
    'Purpose': v.purpose || '',
    'Source': v.source || '',
    'Status': v.status || '',
    'Notes': v.notes || '',
    'Added By': v.addedBy || '',
    'Visit Date': formatDate(v.createdAt),
    'Follow Up Note': v.followUpNote || '',
  }));

  const ws = utils.json_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 4 }, { wch: 22 }, { wch: 16 }, { wch: 24 },
    { wch: 20 }, { wch: 18 }, { wch: 16 }, { wch: 30 },
    { wch: 16 }, { wch: 22 }, { wch: 24 },
  ];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Visitors');

  // Summary sheet
  const statusCounts = {};
  const sourceCounts = {};
  visitors.forEach(v => {
    statusCounts[v.status] = (statusCounts[v.status] || 0) + 1;
    if (v.source) sourceCounts[v.source] = (sourceCounts[v.source] || 0) + 1;
  });

  const summaryRows = [
    { 'Metric': 'Total Visitors', 'Value': visitors.length },
    { 'Metric': 'Converted', 'Value': statusCounts['Converted'] || 0 },
    { 'Metric': 'Follow Up', 'Value': statusCounts['Follow Up'] || 0 },
    { 'Metric': 'New', 'Value': statusCounts['New'] || 0 },
    { 'Metric': 'Not Interested', 'Value': statusCounts['Not Interested'] || 0 },
    { 'Metric': '', 'Value': '' },
    { 'Metric': 'TOP SOURCES', 'Value': '' },
    ...Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([s, c]) => ({ 'Metric': s, 'Value': c })),
  ];

  const ws2 = utils.json_to_sheet(summaryRows);
  ws2['!cols'] = [{ wch: 22 }, { wch: 12 }];
  utils.book_append_sheet(wb, ws2, 'Summary');

  const wbout = write(wb, { type: 'base64', bookType: 'xlsx' });
  const fileName = `FABLUXE_Visitors_${format(new Date(), 'dd-MMM-yyyy')}.xlsx`;
  const fileUri = FileSystem.documentDirectory + fileName;

  await FileSystem.writeAsStringAsync(fileUri, wbout, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    dialogTitle: 'Save or Share Excel Report',
    UTI: 'com.microsoft.excel.xlsx',
  });
}

// ─── PDF Export ──────────────────────────────────────────────────────────────

export async function exportToPDF(visitors, rangeLabel = '') {
  const statusCounts = {};
  const sourceCounts = {};
  const purposeCounts = {};
  visitors.forEach(v => {
    statusCounts[v.status] = (statusCounts[v.status] || 0) + 1;
    if (v.source) sourceCounts[v.source] = (sourceCounts[v.source] || 0) + 1;
    if (v.purpose) purposeCounts[v.purpose] = (purposeCounts[v.purpose] || 0) + 1;
  });

  const total = visitors.length;
  const converted = statusCounts['Converted'] || 0;
  const convRate = total ? Math.round((converted / total) * 100) : 0;
  const today = format(new Date(), 'dd MMMM yyyy');

  const sourceRows = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([s, c]) => `<tr><td>${s}</td><td>${c}</td><td>${Math.round((c / total) * 100)}%</td></tr>`)
    .join('');

  const purposeRows = Object.entries(purposeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([p, c]) => `<tr><td>${p}</td><td>${c}</td><td>${Math.round((c / total) * 100)}%</td></tr>`)
    .join('');

  const visitorRows = visitors.slice(0, 100).map((v, i) => `
    <tr class="${i % 2 === 0 ? 'even' : ''}">
      <td>${i + 1}</td>
      <td>${v.name || ''}</td>
      <td>${v.phone || ''}</td>
      <td>${v.purpose || ''}</td>
      <td>${v.source || ''}</td>
      <td><span class="status status-${(v.status || '').toLowerCase().replace(' ', '-')}">${v.status || ''}</span></td>
      <td>${formatDate(v.createdAt)}</td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; color: #1A1A2E; background: #fff; }

  .cover {
    background: #1A1A2E;
    color: #fff;
    padding: 40px;
    text-align: center;
  }
  .brand { font-size: 42px; font-weight: 900; letter-spacing: 8px; color: #C9A84C; }
  .tagline { font-size: 14px; letter-spacing: 3px; color: #F0D080; margin-top: 6px; }
  .report-title { font-size: 20px; margin-top: 20px; font-weight: 600; }
  .report-date { font-size: 13px; color: #aaa; margin-top: 6px; }

  .section { padding: 24px 32px; }
  .section-title {
    font-size: 16px; font-weight: 700; color: #1A1A2E;
    border-bottom: 2px solid #C9A84C; padding-bottom: 8px; margin-bottom: 16px;
  }

  .stats-grid { display: flex; gap: 16px; margin-bottom: 24px; }
  .stat-box {
    flex: 1; background: #F8F5F0; border-radius: 10px;
    padding: 16px; text-align: center; border-top: 3px solid #C9A84C;
  }
  .stat-value { font-size: 36px; font-weight: 900; color: #1A1A2E; }
  .stat-label { font-size: 12px; color: #6B6B8A; margin-top: 4px; }

  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th {
    background: #1A1A2E; color: #C9A84C;
    padding: 10px 8px; text-align: left; font-weight: 700;
  }
  td { padding: 8px; border-bottom: 1px solid #E0D9CE; }
  tr.even td { background: #F8F5F0; }

  .status {
    padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 700;
  }
  .status-new { background: #DDEEFF; color: #1A60A8; }
  .status-follow-up { background: #FFF0E0; color: #C05000; }
  .status-converted { background: #E0F4E8; color: #206830; }
  .status-not-interested { background: #F0F0F0; color: #888; }

  .footer {
    background: #1A1A2E; color: #aaa; text-align: center;
    padding: 16px; font-size: 11px; margin-top: 24px;
  }
  .footer span { color: #C9A84C; font-weight: 700; }

  @media print { body { -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>

<div class="cover">
  <div class="brand">FABLUXE</div>
  <div class="tagline">INTERIOR HOME SOLUTIONS</div>
  <div class="report-title">Visitor Management Report</div>
  <div class="report-date">${rangeLabel} &nbsp;·&nbsp; Generated: ${today}</div>
</div>

<div class="section">
  <div class="section-title">Summary</div>
  <div class="stats-grid">
    <div class="stat-box">
      <div class="stat-value">${total}</div>
      <div class="stat-label">Total Visitors</div>
    </div>
    <div class="stat-box" style="border-top-color:#388E3C">
      <div class="stat-value" style="color:#388E3C">${converted}</div>
      <div class="stat-label">Converted</div>
    </div>
    <div class="stat-box" style="border-top-color:#4A90D9">
      <div class="stat-value" style="color:#4A90D9">${convRate}%</div>
      <div class="stat-label">Conversion Rate</div>
    </div>
    <div class="stat-box" style="border-top-color:#E07B39">
      <div class="stat-value" style="color:#E07B39">${(statusCounts['Follow Up'] || 0) + (statusCounts['New'] || 0)}</div>
      <div class="stat-label">Pending Follow-Up</div>
    </div>
  </div>
</div>

${sourceRows ? `
<div class="section">
  <div class="section-title">Visitor Sources</div>
  <table>
    <tr><th>Source</th><th>Count</th><th>Share</th></tr>
    ${sourceRows}
  </table>
</div>` : ''}

${purposeRows ? `
<div class="section">
  <div class="section-title">Visit Interests</div>
  <table>
    <tr><th>Purpose</th><th>Count</th><th>Share</th></tr>
    ${purposeRows}
  </table>
</div>` : ''}

<div class="section">
  <div class="section-title">Visitor Log ${visitors.length > 100 ? '(Showing latest 100)' : ''}</div>
  <table>
    <tr>
      <th>#</th><th>Name</th><th>Phone</th><th>Purpose</th>
      <th>Source</th><th>Status</th><th>Visit Date</th>
    </tr>
    ${visitorRows}
  </table>
</div>

<div class="footer">
  <span>FABLUXE</span> Interior Home Solutions &nbsp;·&nbsp;
  Visitor Management System &nbsp;·&nbsp; ${today}
</div>

</body>
</html>`;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const fileName = `FABLUXE_Report_${format(new Date(), 'dd-MMM-yyyy')}.pdf`;
  const destUri = FileSystem.documentDirectory + fileName;
  await FileSystem.moveAsync({ from: uri, to: destUri });

  await Sharing.shareAsync(destUri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Save or Share PDF Report',
    UTI: 'com.adobe.pdf',
  });
}
