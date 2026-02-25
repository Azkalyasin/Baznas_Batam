import ExcelJS from 'exceljs';
import { createMustahiqSchema } from '../validations/mustahiqValidation.js';
import { createMuzakkiSchema } from '../validations/muzakkiValidation.js';
import { createPenerimaanSchema } from '../validations/penerimaanValidation.js';
import { createDistribusiSchema } from '../validations/distribusiValidation.js';
import Mustahiq from '../models/mustahiqModel.js';
import Muzakki from '../models/muzakkiModel.js';
import Penerimaan from '../models/penerimaanModel.js';
import Distribusi from '../models/distribusiModel.js';
import MigrationLog from '../models/migrationLogModel.js';
import db from '../config/database.js';

const COLUMN_CONFIG = {
  mustahiq: {
    columns: [
      { header: 'NRM', key: 'nrm', width: 20 },
      { header: 'Nama', key: 'nama', width: 30 },
      { header: 'NIK', key: 'nik', width: 20 },
      { header: 'Alamat', key: 'alamat', width: 40 },
      { header: 'Kelurahan', key: 'kelurahan', width: 20 },
      { header: 'Kecamatan', key: 'kecamatan', width: 20 },
      { header: 'No HP', key: 'no_hp', width: 15 },
      { header: 'Asnaf', key: 'asnaf', width: 15 }
    ],
    schema: createMustahiqSchema,
    model: Mustahiq
  },
  muzakki: {
    columns: [
      { header: 'NPWZ', key: 'npwz', width: 20 },
      { header: 'Nama', key: 'nama', width: 30 },
      { header: 'NIK', key: 'nik', width: 20 },
      { header: 'No HP', key: 'no_hp', width: 15 },
      { header: 'Alamat', key: 'alamat', width: 40 },
      { header: 'Jenis Muzakki', key: 'jenis_muzakki', width: 20 },
      { header: 'Jenis UPZ', key: 'jenis_upz', width: 20 }
    ],
    schema: createMuzakkiSchema,
    model: Muzakki
  },
  penerimaan: {
    columns: [
      { header: 'Muzakki ID / NIK', key: 'muzakki_identifier', width: 25 },
      { header: 'Tanggal (YYYY-MM-DD)', key: 'tanggal', width: 20 },
      { header: 'Via', key: 'via', width: 15 },
      { header: 'Metode Bayar', key: 'metode_bayar', width: 20 },
      { header: 'ZIS', key: 'zis', width: 15 },
      { header: 'Jenis ZIS', key: 'jenis_zis', width: 20 },
      { header: 'Jumlah', key: 'jumlah', width: 15 },
      { header: 'Keterangan', key: 'keterangan', width: 30 }
    ],
    schema: createPenerimaanSchema,
    model: Penerimaan
  },
  distribusi: {
    columns: [
      { header: 'Mustahiq ID / NIK', key: 'mustahiq_identifier', width: 25 },
      { header: 'Tanggal (YYYY-MM-DD)', key: 'tanggal', width: 20 },
      { header: 'Jumlah', key: 'jumlah', width: 15 },
      { header: 'Program', key: 'nama_program', width: 20 },
      { header: 'Asnaf', key: 'asnaf', width: 15 },
      { header: 'Keterangan', key: 'keterangan', width: 30 }
    ],
    schema: createDistribusiSchema,
    model: Distribusi
  }
};

const generateTemplate = async (res, jenis) => {
  const config = COLUMN_CONFIG[jenis];
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(`Template ${jenis}`);

  sheet.columns = config.columns;

  sheet.getRow(1).fill = {
    type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' }
  };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="Template_Migrasi_${jenis}.xlsx"`);

  await workbook.xlsx.write(res);
  res.end();
};

const previewExcel = async (fileBuffer, jenis) => {
  const config = COLUMN_CONFIG[jenis];
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);
  const sheet = workbook.worksheets[0];

  const results = {
    total: 0,
    siap_import: 0,
    bermasalah: 0,
    preview_valid: [],
    preview_invalid: []
  };

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const rowData = {};
    config.columns.forEach((col, index) => {
      rowData[col.key] = row.getCell(index + 1).value;
    });

    const validation = config.schema.safeParse(rowData);
    
    if (validation.success) {
      results.siap_import++;
      if (results.preview_valid.length < 10) {
        results.preview_valid.push({ row: rowNumber, data: validation.data });
      }
    } else {
      results.bermasalah++;
      results.preview_invalid.push({
        row: rowNumber,
        data: rowData,
        errors: validation.error.format()
      });
    }
    results.total++;
  });

  return results;
};

const importExcel = async (fileBuffer, jenis, userId) => {
  const config = COLUMN_CONFIG[jenis];
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);
  const sheet = workbook.worksheets[0];

  const t = await db.transaction();
  const logData = {
    jenis,
    filename: 'imported_file.xlsx',
    total_rows: 0,
    success_rows: 0,
    failed_rows: 0,
    user_id: userId
  };

  try {
    const rowsToInsert = [];
    const errors = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      logData.total_rows++;

      const rowData = {};
      config.columns.forEach((col, index) => {
        rowData[col.key] = row.getCell(index + 1).value;
      });

      const validation = config.schema.safeParse(rowData);
      if (validation.success) {
        rowsToInsert.push(validation.data);
      } else {
        errors.push({ row: rowNumber, errors: validation.error.format() });
      }
    });

    // Batch insert for performance
    // Note: bulkCreate might not trigger hooks or validations, but we validated with Zod
    if (rowsToInsert.length > 0) {
      await config.model.bulkCreate(rowsToInsert, { transaction: t });
      logData.success_rows = rowsToInsert.length;
    }
    
    logData.failed_rows = errors.length;
    const log = await MigrationLog.create(logData, { transaction: t });

    await t.commit();
    return { 
      success: true, 
      berhasil: logData.success_rows, 
      gagal: logData.failed_rows, 
      detail_gagal: errors 
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const getLogs = async (query) => {
  const where = {};
  if (query.jenis) where.jenis = query.jenis;
  if (query.user_id) where.user_id = query.user_id;
  if (query.tanggal) {
    where.created_at = {
      [db.Sequelize.Op.gte]: new Date(query.tanggal),
      [db.Sequelize.Op.lt]: new Date(new Date(query.tanggal).getTime() + 24 * 60 * 60 * 1000)
    };
  }

  const limit = parseInt(query.limit) || 10;
  const offset = (parseInt(query.page) - 1) * limit || 0;

  return await MigrationLog.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });
};

export default {
  generateTemplate,
  previewExcel,
  importExcel,
  getLogs
};
