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
import { Op } from 'sequelize';
import {
  Kecamatan,
  Kelurahan,
  Asnaf,
  NamaProgram,
  SubProgram,
  ProgramKegiatan,
  ViaDistribusi,
  ViaPenerimaan,
  MetodeBayar,
  Zis,
  JenisZis,
  JenisZisDistribusi,
  KategoriMustahiq,
  FrekuensiBantuan,
  JenisMuzakki,
  JenisUpz
} from '../models/ref/index.js';

// ============================================================
// HELPER: Levenshtein distance (jarak edit antar 2 string)
// ============================================================
const levenshtein = (a, b) => {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
};

// ============================================================
// HELPER: Buat lookup map { namaLowercase -> id } dari tabel ref
// Juga simpan entries untuk keperluan fuzzy search
// ============================================================
const buildLookupMap = async (model, nameField = 'nama') => {
  const rows = await model.findAll({ attributes: ['id', nameField] });
  const map   = {};   // exact match map
  const list  = [];   // untuk fuzzy search
  for (const row of rows) {
    const key = (row[nameField] || '').toString().toLowerCase().trim();
    map[key]  = row.id;
    list.push({ key, id: row.id, original: row[nameField] });
  }
  return { map, list };
};

// ============================================================
// HELPER: Cari ID dari lookup map dengan toleransi typo
// 1. Exact match dulu
// 2. Jika tidak ada, coba fuzzy (Levenshtein ≤ MAX_DIST)
// Kembalikan { id, matched, suggestion } 
// ============================================================
const MAX_DIST = 2; // toleransi maksimal 2 karakter berbeda

const fuzzyFind = ({ map, list }, inputRaw) => {
  if (!inputRaw) return { id: null, matched: false, suggestion: null };
  const input = inputRaw.toString().toLowerCase().trim();

  // 1. Exact match
  if (map[input] !== undefined) {
    return { id: map[input], matched: true, suggestion: null };
  }

  // 2. Fuzzy match
  let bestDist = Infinity;
  let bestEntry = null;
  for (const entry of list) {
    const dist = levenshtein(input, entry.key);
    if (dist < bestDist) {
      bestDist = dist;
      bestEntry = entry;
    }
  }

  if (bestEntry && bestDist <= MAX_DIST) {
    return { id: bestEntry.id, matched: true, suggestion: bestEntry.original };
  }

  // Tidak ditemukan — kembalikan daftar opsi valid
  const validOptions = list.map(e => e.original).join(', ');
  return { id: null, matched: false, suggestion: `Nilai valid: ${validOptions}` };
};

// ============================================================
// EXCEL COLUMN CONFIG  (header yang tampil di template Excel)
// ============================================================
const COLUMN_CONFIG = {
  mustahiq: {
    columns: [
      { header: 'NRM',       key: 'nrm',       width: 20 },
      { header: 'Nama',      key: 'nama',       width: 30 },
      { header: 'NIK',       key: 'nik',        width: 20 },
      { header: 'Alamat',    key: 'alamat',     width: 40 },
      { header: 'Kelurahan', key: 'kelurahan',  width: 20, note: 'Nama kelurahan' },
      { header: 'Kecamatan', key: 'kecamatan',  width: 20, note: 'Nama kecamatan' },
      { header: 'No HP',     key: 'no_hp',      width: 15 },
      { header: 'Asnaf',     key: 'asnaf',      width: 15, note: 'Nama asnaf (Fakir, Miskin, dst)' }
    ],
    schema: createMustahiqSchema,
    model: Mustahiq
  },
  muzakki: {
    columns: [
      { header: 'NPWZ',          key: 'npwz',        width: 20 },
      { header: 'Nama',          key: 'nama',         width: 30 },
      { header: 'NIK',           key: 'nik',          width: 20 },
      { header: 'No HP',         key: 'no_hp',        width: 15 },
      { header: 'Alamat',        key: 'alamat',       width: 40 },
      { header: 'Kelurahan',     key: 'kelurahan',    width: 20, note: 'Nama kelurahan' },
      { header: 'Kecamatan',     key: 'kecamatan',    width: 20, note: 'Nama kecamatan' },
      { header: 'Jenis Muzakki', key: 'jenis_muzakki', width: 20, note: 'Nama jenis muzakki' },
      { header: 'Jenis UPZ',     key: 'jenis_upz',    width: 20, note: 'Nama jenis UPZ' }
    ],
    schema: createMuzakkiSchema,
    model: Muzakki
  },
  penerimaan: {
    columns: [
      { header: 'Muzakki ID / NIK',   key: 'muzakki_identifier', width: 25, note: 'ID atau NIK Muzakki' },
      { header: 'Tanggal (YYYY-MM-DD)', key: 'tanggal',           width: 20 },
      { header: 'Via',                key: 'via',                 width: 20, note: 'Contoh: Transfer, Tunai, Online' },
      { header: 'Metode Bayar',       key: 'metode_bayar',        width: 20, note: 'Contoh: BNI, BRI, Mandiri' },
      { header: 'ZIS',                key: 'zis',                 width: 15, note: 'Contoh: Zakat, Infaq, Sedekah' },
      { header: 'Jenis ZIS',          key: 'jenis_zis',           width: 20, note: 'Contoh: Zakat Fitrah, Zakat Maal' },
      { header: 'Jumlah',             key: 'jumlah',              width: 15 },
      { header: 'Keterangan',         key: 'keterangan',          width: 30 }
    ],
    schema: createPenerimaanSchema,
    model: Penerimaan
  },
  distribusi: {
    columns: [
      { header: 'Mustahiq ID / NIK',   key: 'mustahiq_identifier', width: 25, note: 'ID atau NIK Mustahiq' },
      { header: 'Tanggal (YYYY-MM-DD)', key: 'tanggal',             width: 20 },
      { header: 'Jumlah',              key: 'jumlah',               width: 15 },
      { header: 'Program',             key: 'nama_program',         width: 25, note: 'Nama program (ref_nama_program)' },
      { header: 'Sub Program',         key: 'sub_program',          width: 25, note: 'Nama sub program' },
      { header: 'Program Kegiatan',    key: 'program_kegiatan',     width: 25, note: 'Nama kegiatan' },
      { header: 'Via',                 key: 'via',                  width: 20, note: 'Contoh: Transfer Bank, Tunai' },
      { header: 'Kategori Mustahiq',   key: 'kategori_mustahiq',    width: 20, note: 'Nama kategori mustahiq' },
      { header: 'Jenis ZIS Distribusi',key: 'jenis_zis_distribusi', width: 20, note: 'Nama jenis ZIS distribusi' },
      { header: 'Frekuensi Bantuan',   key: 'frekuensi_bantuan',    width: 20, note: 'Contoh: Bulanan, Tahunan' },
      { header: 'Keterangan',          key: 'keterangan',           width: 30 }
    ],
    schema: createDistribusiSchema,
    model: Distribusi
  }
};


// ============================================================
// RESOLVER: Konversi data Excel (nama) → data DB (ID)
// Menggunakan fuzzyFind agar toleran terhadap typo
// Kembalikan fungsi resolver(rowData) → { ...resolved, _fuzzyWarnings }
// ============================================================
const buildResolvers = async (jenis) => {
  if (jenis === 'mustahiq') {
    const [kelLookup, kecLookup, asnafLookup] = await Promise.all([
      buildLookupMap(Kelurahan),
      buildLookupMap(Kecamatan),
      buildLookupMap(Asnaf)
    ]);
    return (rowData) => {
      const resolved = { ...rowData };
      const warnings = [];
      if (resolved.kelurahan !== undefined) {
        const r = fuzzyFind(kelLookup, resolved.kelurahan);
        resolved.kelurahan_id = r.id;
        if (r.matched && r.suggestion) warnings.push(`Kelurahan: "${resolved.kelurahan}" → dikoreksi ke "${r.suggestion}"`);
        if (!r.matched) warnings.push(`Kelurahan: "${resolved.kelurahan}" tidak ditemukan. ${r.suggestion}`);
        delete resolved.kelurahan;
      }
      if (resolved.kecamatan !== undefined) {
        const r = fuzzyFind(kecLookup, resolved.kecamatan);
        resolved.kecamatan_id = r.id;
        if (r.matched && r.suggestion) warnings.push(`Kecamatan: "${resolved.kecamatan}" → dikoreksi ke "${r.suggestion}"`);
        if (!r.matched) warnings.push(`Kecamatan: "${resolved.kecamatan}" tidak ditemukan. ${r.suggestion}`);
        delete resolved.kecamatan;
      }
      if (resolved.asnaf !== undefined) {
        const r = fuzzyFind(asnafLookup, resolved.asnaf);
        resolved.asnaf_id = r.id;
        if (r.matched && r.suggestion) warnings.push(`Asnaf: "${resolved.asnaf}" → dikoreksi ke "${r.suggestion}"`);
        if (!r.matched) warnings.push(`Asnaf: "${resolved.asnaf}" tidak ditemukan. ${r.suggestion}`);
        delete resolved.asnaf;
      }
      if (warnings.length) resolved._fuzzyWarnings = warnings;
      return resolved;
    };
  }

  if (jenis === 'muzakki') {
    const [jmLookup, upzLookup, kelLookup, kecLookup] = await Promise.all([
      buildLookupMap(JenisMuzakki),
      buildLookupMap(JenisUpz),
      buildLookupMap(Kelurahan),
      buildLookupMap(Kecamatan)
    ]);
    return (rowData) => {
      const resolved = { ...rowData };
      const warnings = [];
      if (resolved.jenis_muzakki !== undefined) {
        const r = fuzzyFind(jmLookup, resolved.jenis_muzakki);
        resolved.jenis_muzakki_id = r.id;
        if (r.matched && r.suggestion) warnings.push(`Jenis Muzakki: "${resolved.jenis_muzakki}" → dikoreksi ke "${r.suggestion}"`);
        if (!r.matched) warnings.push(`Jenis Muzakki: "${resolved.jenis_muzakki}" tidak ditemukan. ${r.suggestion}`);
        delete resolved.jenis_muzakki;
      }
      if (resolved.jenis_upz !== undefined) {
        const r = fuzzyFind(upzLookup, resolved.jenis_upz);
        resolved.jenis_upz_id = r.id;
        if (r.matched && r.suggestion) warnings.push(`Jenis UPZ: "${resolved.jenis_upz}" → dikoreksi ke "${r.suggestion}"`);
        if (!r.matched) warnings.push(`Jenis UPZ: "${resolved.jenis_upz}" tidak ditemukan. ${r.suggestion}`);
        delete resolved.jenis_upz;
      }
      if (resolved.kelurahan !== undefined) {
        const r = fuzzyFind(kelLookup, resolved.kelurahan);
        resolved.kelurahan_id = r.id;
        if (r.matched && r.suggestion) warnings.push(`Kelurahan: "${resolved.kelurahan}" → dikoreksi ke "${r.suggestion}"`);
        if (!r.matched) warnings.push(`Kelurahan: "${resolved.kelurahan}" tidak ditemukan. ${r.suggestion}`);
        delete resolved.kelurahan;
      }
      if (resolved.kecamatan !== undefined) {
        const r = fuzzyFind(kecLookup, resolved.kecamatan);
        resolved.kecamatan_id = r.id;
        if (r.matched && r.suggestion) warnings.push(`Kecamatan: "${resolved.kecamatan}" → dikoreksi ke "${r.suggestion}"`);
        if (!r.matched) warnings.push(`Kecamatan: "${resolved.kecamatan}" tidak ditemukan. ${r.suggestion}`);
        delete resolved.kecamatan;
      }
      if (warnings.length) resolved._fuzzyWarnings = warnings;
      return resolved;
    };
  }

  if (jenis === 'penerimaan') {
    const [viaLookup, metodeLookup, zisLookup, jenisZisLookup] = await Promise.all([
      buildLookupMap(ViaPenerimaan),
      buildLookupMap(MetodeBayar),
      buildLookupMap(Zis),
      buildLookupMap(JenisZis)
    ]);
    return (rowData) => {
      const resolved = { ...rowData };
      const warnings = [];
      if (resolved.via !== undefined) {
        const r = fuzzyFind(viaLookup, resolved.via);
        resolved.via_id = r.id;
        if (r.matched && r.suggestion) warnings.push(`Via: "${resolved.via}" → dikoreksi ke "${r.suggestion}"`);
        if (!r.matched) warnings.push(`Via: "${resolved.via}" tidak ditemukan. ${r.suggestion}`);
        delete resolved.via;
      }
      if (resolved.metode_bayar !== undefined) {
        const r = fuzzyFind(metodeLookup, resolved.metode_bayar);
        resolved.metode_bayar_id = r.id;
        if (r.matched && r.suggestion) warnings.push(`Metode Bayar: "${resolved.metode_bayar}" → dikoreksi ke "${r.suggestion}"`);
        if (!r.matched) warnings.push(`Metode Bayar: "${resolved.metode_bayar}" tidak ditemukan. ${r.suggestion}`);
        delete resolved.metode_bayar;
      }
      if (resolved.zis !== undefined) {
        const r = fuzzyFind(zisLookup, resolved.zis);
        resolved.zis_id = r.id;
        if (r.matched && r.suggestion) warnings.push(`ZIS: "${resolved.zis}" → dikoreksi ke "${r.suggestion}"`);
        if (!r.matched) warnings.push(`ZIS: "${resolved.zis}" tidak ditemukan. ${r.suggestion}`);
        delete resolved.zis;
      }
      if (resolved.jenis_zis !== undefined) {
        const r = fuzzyFind(jenisZisLookup, resolved.jenis_zis);
        resolved.jenis_zis_id = r.id;
        if (r.matched && r.suggestion) warnings.push(`Jenis ZIS: "${resolved.jenis_zis}" → dikoreksi ke "${r.suggestion}"`);
        if (!r.matched) warnings.push(`Jenis ZIS: "${resolved.jenis_zis}" tidak ditemukan. ${r.suggestion}`);
        delete resolved.jenis_zis;
      }
      if (warnings.length) resolved._fuzzyWarnings = warnings;
      return resolved;
    };
  }

  if (jenis === 'distribusi') {
    const [
      npLookup, spLookup, pkLookup, viaLookup,
      kmLookup, jzdLookup, fbLookup
    ] = await Promise.all([
      buildLookupMap(NamaProgram),
      buildLookupMap(SubProgram),
      buildLookupMap(ProgramKegiatan),
      buildLookupMap(ViaDistribusi),
      buildLookupMap(KategoriMustahiq),
      buildLookupMap(JenisZisDistribusi),
      buildLookupMap(FrekuensiBantuan)
    ]);
    return (rowData) => {
      const resolved = { ...rowData };
      const warnings = [];
      const resolve = (lookup, field, idField, label) => {
        if (resolved[field] !== undefined) {
          const r = fuzzyFind(lookup, resolved[field]);
          resolved[idField] = r.id;
          if (r.matched && r.suggestion) warnings.push(`${label}: "${resolved[field]}" → dikoreksi ke "${r.suggestion}"`);
          if (!r.matched) warnings.push(`${label}: "${resolved[field]}" tidak ditemukan. ${r.suggestion}`);
          delete resolved[field];
        }
      };
      resolve(npLookup,  'nama_program',        'nama_program_id',        'Program');
      resolve(spLookup,  'sub_program',          'sub_program_id',         'Sub Program');
      resolve(pkLookup,  'program_kegiatan',     'program_kegiatan_id',    'Program Kegiatan');
      resolve(viaLookup, 'via',                  'via_id',                 'Via');
      resolve(kmLookup,  'kategori_mustahiq',    'kategori_mustahiq_id',   'Kategori Mustahiq');
      resolve(jzdLookup, 'jenis_zis_distribusi', 'jenis_zis_distribusi_id','Jenis ZIS');
      resolve(fbLookup,  'frekuensi_bantuan',    'frekuensi_bantuan_id',   'Frekuensi Bantuan');
      if (warnings.length) resolved._fuzzyWarnings = warnings;
      return resolved;
    };
  }

  return (rowData) => rowData;
};


// ============================================================
// GENERATE TEMPLATE
// ============================================================
const generateTemplate = async (res, jenis) => {
  const config = COLUMN_CONFIG[jenis];
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(`Template ${jenis}`);

  sheet.columns = config.columns;

  // Style header biru
  sheet.getRow(1).fill = {
    type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' }
  };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Baris petunjuk (baris 2) berwarna kuning
  const guideRow = sheet.addRow(
    config.columns.reduce((acc, col) => {
      acc[col.key] = col.note ? `(${col.note})` : '';
      return acc;
    }, {})
  );
  guideRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
  guideRow.font  = { italic: true, color: { argb: 'FF7F6000' } };

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="Template_Migrasi_${jenis}.xlsx"`);

  await workbook.xlsx.write(res);
  res.end();
};

// ============================================================
// PREVIEW EXCEL (validasi tanpa simpan)
// ============================================================
const previewExcel = async (fileBuffer, jenis) => {
  const config = COLUMN_CONFIG[jenis];
  const resolver = await buildResolvers(jenis);

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
    if (rowNumber === 1) return; // skip header
    if (rowNumber === 2) {       // skip baris petunjuk kuning jika ada
      const firstCell = row.getCell(1).value;
      if (typeof firstCell === 'string' && firstCell.startsWith('(')) return;
    }

    const rowData = {};
    config.columns.forEach((col, index) => {
      const cellVal = row.getCell(index + 1).value;
      rowData[col.key] = cellVal !== null && cellVal !== undefined ? String(cellVal).trim() : null;
    });

    const resolved = resolver(rowData);
    const fuzzyWarnings = resolved._fuzzyWarnings || [];
    delete resolved._fuzzyWarnings;

    const validation = config.schema.safeParse(resolved);

    if (validation.success) {
      results.siap_import++;
      if (results.preview_valid.length < 10) {
        results.preview_valid.push({
          row: rowNumber,
          data: validation.data,
          ...(fuzzyWarnings.length && { koreksi_otomatis: fuzzyWarnings })
        });
      }
    } else {
      results.bermasalah++;
      results.preview_invalid.push({
        row: rowNumber,
        data: rowData,
        errors: validation.error.format(),
        ...(fuzzyWarnings.length && { koreksi_otomatis: fuzzyWarnings })
      });
    }
    results.total++;
  });

  return results;
};

// ============================================================
// IMPORT EXCEL (simpan ke DB)
// ============================================================
const importExcel = async (fileBuffer, jenis, userId) => {
  const config = COLUMN_CONFIG[jenis];
  const resolver = await buildResolvers(jenis);

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
      if (rowNumber === 1) return; // skip header
      if (rowNumber === 2) {       // skip baris petunjuk kuning jika ada
        const firstCell = row.getCell(1).value;
        if (typeof firstCell === 'string' && firstCell.startsWith('(')) return;
      }

      logData.total_rows++;

      const rowData = {};
      config.columns.forEach((col, index) => {
        const cellVal = row.getCell(index + 1).value;
        rowData[col.key] = cellVal !== null && cellVal !== undefined ? String(cellVal).trim() : null;
      });

      // Konversi nama → ID
      const resolved = resolver(rowData);
      
      const validation = config.schema.safeParse(resolved);
      if (validation.success) {
        const dataToInsert = validation.data;
        dataToInsert.registered_by = userId; // Ganti created_by dengan registered_by untuk Mustahiq & Muzakki
        if (jenis === 'penerimaan' || jenis === 'distribusi') {
          dataToInsert.created_by = userId;
        }
        rowsToInsert.push(dataToInsert);
      } else {
        errors.push({ row: rowNumber, data: rowData, errors: validation.error.format() });
      }
    });

    if (rowsToInsert.length > 0) {
      await config.model.bulkCreate(rowsToInsert, { transaction: t });
      logData.success_rows = rowsToInsert.length;
    }

    logData.failed_rows = errors.length;
    await MigrationLog.create(logData, { transaction: t });

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

// ============================================================
// GET LOGS
// ============================================================
const getLogs = async (query) => {
  const where = {};
  if (query.jenis)   where.jenis   = query.jenis;
  if (query.user_id) where.user_id = query.user_id;
  if (query.tanggal) {
    where.created_at = {
      [Op.gte]: new Date(query.tanggal),
      [Op.lt]:  new Date(new Date(query.tanggal).getTime() + 24 * 60 * 60 * 1000)
    };
  }

  const limit  = parseInt(query.limit) || 10;
  const offset = (parseInt(query.page) - 1) * limit || 0;

  return await MigrationLog.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });
};

export default { generateTemplate, previewExcel, importExcel, getLogs };
