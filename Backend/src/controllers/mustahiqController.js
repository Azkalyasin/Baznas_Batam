import mustahiqService from '../services/mustahiqService.js';
import ExcelJS from 'exceljs';

const getAll = async (req, res, next) => {
  try {
    const data = await mustahiqService.getAll(req.query);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const data = await mustahiqService.getById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.status === 404) return res.status(404).json({ success: false, message: error.message });
    next(error);
  }
};

const getRiwayat = async (req, res, next) => {
  try {
    const data = await mustahiqService.getRiwayat(req.params.id, req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.status === 404) return res.status(404).json({ success: false, message: error.message });
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const data = await mustahiqService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data, message: 'Mustahiq berhasil didaftarkan.' });
  } catch (error) {
    if (error.status === 409) return res.status(409).json({ success: false, message: error.message });
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const data = await mustahiqService.update(req.params.id, req.body);
    res.status(200).json({ success: true, data, message: 'Mustahiq berhasil diperbarui.' });
  } catch (error) {
    if (error.status === 404) return res.status(404).json({ success: false, message: error.message });
    if (error.status === 409) return res.status(409).json({ success: false, message: error.message });
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const data = await mustahiqService.updateStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, data, message: `Status mustahiq diubah menjadi '${req.body.status}'.` });
  } catch (error) {
    if (error.status === 404) return res.status(404).json({ success: false, message: error.message });
    next(error);
  }
};

const destroy = async (req, res, next) => {
  try {
    await mustahiqService.destroy(req.params.id);
    res.status(200).json({ success: true, message: 'Mustahiq berhasil dihapus.' });
  } catch (error) {
    if (error.status === 404 || error.status === 400) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const exportExcel = async (req, res, next) => {
  try {
    const rows = await mustahiqService.getExportData(req.query);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Data Mustahiq');

    sheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'No Reg BPP', key: 'no_reg_bpp', width: 15 },
      { header: 'NRM', key: 'nrm', width: 15 },
      { header: 'NIK', key: 'nik', width: 20 },
      { header: 'Nama', key: 'nama', width: 30 },
      { header: 'No HP', key: 'no_hp', width: 15 },
      { header: 'Alamat', key: 'alamat', width: 30 },
      { header: 'Kelurahan', key: 'kelurahan', width: 20 },
      { header: 'Kecamatan', key: 'kecamatan', width: 20 },
      { header: 'Kategori', key: 'kategori_mustahiq', width: 12 },
      { header: 'Jenis Program', key: 'jenis_program', width: 35 },
      { header: 'Asnaf', key: 'asnaf', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Total Penerimaan', key: 'total_penerimaan_count', width: 18 },
      { header: 'Total Amount', key: 'total_penerimaan_amount', width: 18 },
      { header: 'Keterangan', key: 'keterangan', width: 25 }
    ];

    // Style header row
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' }
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    rows.forEach((row, index) => {
      sheet.addRow({ no: index + 1, ...row.toJSON() });
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `mustahiq_export_${timestamp}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

export default {
  getAll,
  getById,
  getRiwayat,
  create,
  update,
  updateStatus,
  destroy,
  exportExcel
};
