import Distribusi from '../models/distribusiModel.js';
import Mustahiq from '../models/mustahiqModel.js';
import { Op, Sequelize } from 'sequelize';
import db from '../config/database.js';
import AppError from '../utils/AppError.js';
import {
  Kecamatan,
  Kelurahan,
  Asnaf,
  NamaProgram,
  SubProgram,
  ProgramKegiatan,
  FrekuensiBantuan,
  ViaDistribusi,
  KategoriMustahiq,
  Infak,
  JenisZisDistribusi
} from '../models/ref/index.js';
import User from '../models/userModel.js';

// --- GET /api/distribusi (list + filter + search + pagination) ---
const getAll = async (query) => {
  const {
    q, mustahiq_id, tanggal, bulan, tahun,
    startDate, endDate, dateField = 'tanggal',
    nama_program_id, sub_program_id, program_kegiatan_id,
    asnaf_id, jenis_zis_distribusi_id, via_id, frekuensi_bantuan_id,
    status,
    page = 1, limit = 10
  } = query;

  const offset = (page - 1) * limit;
  const where = {};

  if (q) {
    where[Op.or] = [
      { nama_mustahik: { [Op.like]: `%${q}%` } },
      { nrm: { [Op.like]: `%${q}%` } },
      { nik: { [Op.like]: `%${q}%` } }
    ];
  }

  if (mustahiq_id) where.mustahiq_id = mustahiq_id;
  if (tanggal) where.tanggal = tanggal;
  
  // Date Range Filter
  if (startDate || endDate) {
    const field = (dateField === 'tgl_masuk_permohonan') ? 'tgl_masuk_permohonan' : 'tanggal';
    where[field] = {};
    if (startDate) where[field][Op.gte] = startDate;
    if (endDate) where[field][Op.lte] = endDate;
  }

  if (bulan) where.bulan = bulan;
  if (tahun) where.tahun = tahun;
  if (nama_program_id) where.nama_program_id = nama_program_id;
  if (sub_program_id) where.sub_program_id = sub_program_id;
  if (program_kegiatan_id) where.program_kegiatan_id = program_kegiatan_id;
  if (asnaf_id) where.asnaf_id = asnaf_id;
  if (jenis_zis_distribusi_id) where.jenis_zis_distribusi_id = jenis_zis_distribusi_id;
  if (via_id) where.via_id = via_id;
  if (frekuensi_bantuan_id) where.frekuensi_bantuan_id = frekuensi_bantuan_id;
  // Filter by status: 'diterima' | 'ditolak' | 'pending' (null = belum ada status)
  // Note: status is ENUM — must use Sequelize.literal for IS NULL to work reliably
  if (status === 'diterima' || status === 'ditolak') {
    where.status = status;
  } else if (status === 'pending' || status === 'null') {
    where[Op.and] = [
      ...(where[Op.and] || []),
      Sequelize.literal('`distribusi`.`status` IS NULL')
    ];
  }


  const { count, rows } = await Distribusi.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['tanggal', 'DESC'], ['id', 'DESC']],
    include: [
      { model: Mustahiq, attributes: ['id', 'nama', 'nrm'] },
      { model: NamaProgram, attributes: ['id', 'nama'] },
      { model: SubProgram, attributes: ['id', 'nama'] },
      { model: ProgramKegiatan, attributes: ['id', 'nama'] },
      { model: Asnaf, attributes: ['id', 'nama'] },
      { model: ViaDistribusi, attributes: ['id', 'nama'] },
      { model: KategoriMustahiq, attributes: ['id', 'nama'] }
    ]
  });

  return {
    rows,
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(count / limit)
  };
};

// --- GET /api/distribusi/:id ---
const getById = async (id) => {
  const distribusi = await Distribusi.findByPk(id, {
    include: [
      { model: Mustahiq },
      { model: Kecamatan },
      { model: Kelurahan },
      { model: Asnaf },
      { model: NamaProgram },
      { model: SubProgram },
      { model: ProgramKegiatan },
      { model: FrekuensiBantuan },
      { model: ViaDistribusi },
      { model: KategoriMustahiq },
      { model: Infak },
      { model: JenisZisDistribusi },
      { model: User, as: 'creator', attributes: ['id', 'nama'] }
    ]
  });
  if (!distribusi) {
    throw new AppError('Data distribusi tidak ditemukan.', 404);
  }
  return distribusi;
};

// --- POST /api/distribusi ---
const create = async (body, userId) => {
  const mustahiq = await Mustahiq.findByPk(body.mustahiq_id);
  if (!mustahiq) {
    throw new AppError('Mustahiq tidak ditemukan.', 404);
  }

  // Distribution Date Logic:
  // If status = menunggu persetujuan/menunggu, do NOT auto-fill tanggal_distribusi (must be NULL/empty).
  // Only fill tanggal_distribusi when status = diterima.
  const payload = { ...body, created_by: userId };
  if (body.status === 'menunggu' || !body.status) {
    payload.tanggal = null;
  }

  const t = await db.transaction();
  try {
    const distribusi = await Distribusi.create(payload, { transaction: t, userId });

    await t.commit();

    await distribusi.reload({
      include: [
        { model: NamaProgram, attributes: ['nama'] },
        { model: SubProgram, attributes: ['nama'] },
        { model: ProgramKegiatan, attributes: ['nama'] }
      ]
    });
    return distribusi;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// --- PUT /api/distribusi/:id ---
const update = async (id, body, userId) => {
  const distribusi = await Distribusi.findByPk(id);
  if (!distribusi) {
    throw new AppError('Data distribusi tidak ditemukan.', 404);
  }

  if (body.mustahiq_id && body.mustahiq_id !== distribusi.mustahiq_id) {
    const mustahiq = await Mustahiq.findByPk(body.mustahiq_id);
    if (!mustahiq) {
      throw new AppError('Mustahiq tidak ditemukan.', 404);
    }
  }

  // Distribution Date Logic:
  // If status = menunggu persetujuan (menunggu), do NOT auto-fill tanggal_distribusi (must be NULL/empty).
  const payload = { ...body };
  if (body.status === 'menunggu') {
    payload.tanggal = null;
  }

  const t = await db.transaction();
  try {
    await distribusi.update(payload, { transaction: t, userId });
    await t.commit();
    await distribusi.reload();
    return distribusi;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// --- DELETE /api/distribusi/:id ---
const destroy = async (id, userId) => {
  const distribusi = await Distribusi.findByPk(id);
  if (!distribusi) {
    throw Object.assign(new Error('Data distribusi tidak ditemukan.'), { status: 404 });
  }

  const t = await db.transaction();
  try {
    await distribusi.destroy({ transaction: t, userId });
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const rekapHarian = async (query) => {
  const { tanggal = new Date().toISOString().split('T')[0] } = query;

  const [results] = await db.query(`
    SELECT 
      np.nama as nama_program,
      COUNT(d.id) as count,
      SUM(d.jumlah) as total
    FROM distribusi d
    LEFT JOIN ref_nama_program np ON d.nama_program_id = np.id
    WHERE d.tanggal = :tanggal
    GROUP BY d.nama_program_id
    ORDER BY np.nama
  `, { replacements: { tanggal } });

  return results;
};

const rekapBulanan = async (query) => {
  const now = new Date();
  const bulanNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const bulan = query.bulan || bulanNames[now.getMonth()];
  const tahun = query.tahun || now.getFullYear();

  const [results] = await db.query(`
    SELECT 
      np.nama as nama_program,
      COUNT(d.id) as count,
      SUM(d.jumlah) as total
    FROM distribusi d
    LEFT JOIN ref_nama_program np ON d.nama_program_id = np.id
    WHERE d.bulan = :bulan AND d.tahun = :tahun
    GROUP BY d.nama_program_id
    ORDER BY np.nama
  `, { replacements: { bulan, tahun } });

  return results;
};

const rekapTahunan = async (query) => {
  const { tahun = new Date().getFullYear() } = query;

  const [results] = await db.query(`
    SELECT 
      bulan,
      COUNT(id) as count,
      SUM(jumlah) as total
    FROM distribusi
    WHERE tahun = :tahun
    GROUP BY bulan
    ORDER BY 
      FIELD(bulan, 'Januari','Februari','Maret','April','Mei','Juni',
            'Juli','Agustus','September','Oktober','November','Desember')
  `, { replacements: { tahun } });

  return results;
};

const getStats = async (query) => {
  const { bulan = 'all', tahun = new Date().getFullYear() } = query;

  const connection = await db.connectionManager.getConnection();

  try {
    const promiseConn = connection.promise();

    const [results] = await promiseConn.query(
      'CALL sp_distribusi_stats_by_month_year(?, ?)',
      [bulan, tahun]
    );

    const stats = Array.isArray(results) ? results : [];

    const ensureArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return [val];
    };

    return {
      by_asnaf: ensureArray(stats[0]),
      by_program: ensureArray(stats[1]),
      by_kecamatan: ensureArray(stats[2]),
      summary: (stats[3] && stats[3][0]) ? stats[3][0] : {
        total_distribusi_zis: 0,
        total_distribusi_zakat: 0,
        total_distribusi_infaq: 0
      }
    };
  } finally {
    await db.connectionManager.releaseConnection(connection);
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  destroy,
  rekapHarian,
  rekapBulanan,
  rekapTahunan,
  getStats
};

