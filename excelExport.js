/**
 * utils/excelExport.js
 * Generates / updates registrations.xlsx from the JSON data store.
 * Uses the 'exceljs' package for rich formatting.
 */

const ExcelJS = require('exceljs');
const path    = require('path');

const EXCEL_FILE = path.join(__dirname, '..', 'data', 'registrations.xlsx');

/**
 * updateExcel(registrations)
 * Overwrites the Excel file with all current registrations.
 * Called automatically on every new registration.
 */
async function updateExcel(registrations) {
  const workbook  = new ExcelJS.Workbook();
  workbook.creator = 'Next-Start Up Conclave 2026';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Registrations', {
    pageSetup: { fitToPage: true, fitToWidth: 1 },
  });

  /* ── Column definitions ── */
  sheet.columns = [
    { header: 'S.No',         key: 'sno',          width: 7  },
    { header: 'Registration ID', key: 'id',         width: 18 },
    { header: 'Full Name',    key: 'name',          width: 25 },
    { header: 'Email',        key: 'email',         width: 32 },
    { header: 'College / University', key: 'college', width: 30 },
    { header: 'Year of Study', key: 'year',         width: 18 },
    { header: 'Ticket Type',  key: 'ticketLabel',   width: 35 },
    { header: 'Phone',        key: 'phone',         width: 16 },
    { header: 'Registered At', key: 'registeredAt', width: 22 },
  ];

  /* ── Style header row ── */
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: 'FFE02020' }, // red
    };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top:    { style: 'thin', color: { argb: 'FFC01010' } },
      bottom: { style: 'thin', color: { argb: 'FFC01010' } },
      left:   { style: 'thin', color: { argb: 'FFC01010' } },
      right:  { style: 'thin', color: { argb: 'FFC01010' } },
    };
  });
  headerRow.height = 28;

  /* ── Add data rows ── */
  registrations.forEach((r, idx) => {
    const row = sheet.addRow({
      sno:          idx + 1,
      id:           r.id,
      name:         r.name,
      email:        r.email,
      college:      r.college,
      year:         r.year || '—',
      ticketLabel:  r.ticketLabel || r.ticket,
      phone:        r.phone || '—',
      registeredAt: r.registeredAt
        ? new Date(r.registeredAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        : '—',
    });

    // Alternate row shading
    const bg = idx % 2 === 0 ? 'FFF5F5F5' : 'FFFFFFFF';
    row.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cell.alignment = { vertical: 'middle', wrapText: false };
      cell.border = {
        top:    { style: 'hair', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'hair', color: { argb: 'FFDDDDDD' } },
        left:   { style: 'hair', color: { argb: 'FFDDDDDD' } },
        right:  { style: 'hair', color: { argb: 'FFDDDDDD' } },
      };
    });
    row.height = 20;
  });

  /* ── Auto-filters on header ── */
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to:   { row: 1, column: sheet.columns.length },
  };

  /* ── Freeze header row ── */
  sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1, topLeftCell: 'A2' }];

  /* ── Summary sheet ── */
  const summary = workbook.addWorksheet('Summary');
  summary.columns = [
    { header: 'Metric', key: 'metric', width: 28 },
    { header: 'Value',  key: 'value',  width: 18 },
  ];

  const sHeaderRow = summary.getRow(1);
  sHeaderRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A1A' } };
    cell.font = { bold: true, color: { argb: 'FFE02020' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  sHeaderRow.height = 24;

  const byTicket = registrations.reduce((acc, r) => {
    const label = r.ticketLabel || r.ticket;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const byYear = registrations.reduce((acc, r) => {
    const yr = r.year || 'Unknown';
    acc[yr] = (acc[yr] || 0) + 1;
    return acc;
  }, {});

  summary.addRow({ metric: 'Total Registrations', value: registrations.length });
  summary.addRow({ metric: 'Last Updated', value: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) });
  summary.addRow({});
  summary.addRow({ metric: '--- By Ticket Type ---', value: '' });
  Object.entries(byTicket).forEach(([k, v]) => summary.addRow({ metric: k, value: v }));
  summary.addRow({});
  summary.addRow({ metric: '--- By Year of Study ---', value: '' });
  Object.entries(byYear).forEach(([k, v]) => summary.addRow({ metric: k, value: v }));

  await workbook.xlsx.writeFile(EXCEL_FILE);
  console.log(`[Excel] Updated → ${EXCEL_FILE} (${registrations.length} records)`);
}

module.exports = { updateExcel, EXCEL_FILE };
