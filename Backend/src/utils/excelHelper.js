import ExcelJS from 'exceljs';

/**
 * Shared helper untuk export data ke Excel.
 * Menghindari duplikasi logic di mustahiqController dan muzakkiController.
 *
 * @param {import('express').Response} res - Express response object
 * @param {Object} options
 * @param {string} options.sheetName - Nama worksheet
 * @param {Array} options.columns - ExcelJS column definitions
 * @param {Array} options.rows - Array of Sequelize model instances
 * @param {string} options.filename - Nama file output (tanpa .xlsx)
 * @param {number} options.totalAvailable - Total data yang tersedia
 * @param {number} options.exported - Jumlah data yang diekspor
 * @param {boolean} options.isTruncated - Apakah data terpotong
 */
const exportToExcel = async (res, { sheetName, columns, rows, filename, totalAvailable, exported, isTruncated }) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = [
    { header: 'No', key: 'no', width: 5 },
    ...columns
  ];

  // Style header row
  sheet.getRow(1).fill = {
    type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' }
  };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  rows.forEach((row, index) => {
    sheet.addRow({ no: index + 1, ...row.toJSON() });
  });

  // Info row jika data terpotong
  if (isTruncated) {
    sheet.addRow({});
    const infoRow = sheet.addRow({});
    infoRow.getCell(2).value = `⚠ Data terpotong: menampilkan ${exported} dari ${totalAvailable} total data.`;
    infoRow.getCell(2).font = { italic: true, color: { argb: 'FFFF0000' } };
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const fullFilename = `${filename}_${timestamp}.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${fullFilename}"`);

  await workbook.xlsx.write(res);
  res.end();
};

export default exportToExcel;
