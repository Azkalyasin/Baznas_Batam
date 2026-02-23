import Distribusi from '../models/distribusiModel.js';
import Mustahiq from '../models/mustahiqModel.js';
import { Op } from 'sequelize';
import db from '../config/database.js';

// --- GET /api/distribusi (list + filter + search + pagination) ---
const getAll = async (query) => {
  const {
    q, mustahiq_id, tanggal, bulan, tahun,
    nama_program, program_kegiatan, nama_sub_program,
    asnaf, jenis_zis, via, frekuensi_bantuan,
    page = 1, limit = 10
  } = query;

  const offset = (page - 1) * limit;
  const where = {};

  // Search by name / nrm / nik
  if (q) {
    where[Op.or] = [
      { nama_mustahik: { [Op.like]: `%${q}%` } },
      { nrm: { [Op.like]: `%${q}%` } },
      { nik: { [Op.like]: `%${q}%` } }
    ];
  }

  // Filters
  if (mustahiq_id) where.mustahiq_id = mustahiq_id;
  if (tanggal) where.tanggal = tanggal;
  if (bulan) where.bulan = bulan;
  if (tahun) where.tahun = tahun;
  if (nama_program) where.nama_program = nama_program;
  if (program_kegiatan) where.program_kegiatan = program_kegiatan;
  if (nama_sub_program) where.nama_sub_program = nama_sub_program;
  if (asnaf) where.asnaf = asnaf;
  if (jenis_zis) where.jenis_zis = jenis_zis;
  if (via) where.via = via;
  if (frekuensi_bantuan) where.frekuensi_bantuan = frekuensi_bantuan;

  const { count, rows } = await Distribusi.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['tanggal', 'DESC'], ['id', 'DESC']]
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
  const distribusi = await Distribusi.findByPk(id);
  if (!distribusi) {
    throw Object.assign(new Error('Data distribusi tidak ditemukan.'), { status: 404 });
  }
  return distribusi;
};

// --- POST /api/distribusi ---
const create = async (body, userId) => {
  // Check if Mustahiq exists
  const mustahiq = await Mustahiq.findByPk(body.mustahiq_id);
  if (!mustahiq) {
    throw Object.assign(new Error('Mustahiq tidak ditemukan.'), { status: 404 });
  }

  const t = await db.transaction();
  try {
    // Note: Denormalized data will be filled by database triggers
    // or we can fill it here from 'mustahiq' object
    const distribusi = await Distribusi.create({
      ...body,
      no_reg_bpp: mustahiq.no_reg_bpp,
      nrm: mustahiq.nrm,
      nama_mustahik: mustahiq.nama,
      nik: mustahiq.nik,
      alamat: mustahiq.alamat,
      kelurahan: mustahiq.kelurahan,
      kecamatan: mustahiq.kecamatan,
      no_hp: mustahiq.no_hp,
      asnaf: mustahiq.asnaf,
      bulan: new Date(body.tanggal).toLocaleString('id-ID', { month: 'long' }),
      tahun: new Date(body.tanggal).getFullYear(),
      created_by: userId
    }, { transaction: t });

    await t.commit();
    return distribusi;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// --- PUT /api/distribusi/:id ---
const update = async (id, body) => {
  const distribusi = await Distribusi.findByPk(id);
  if (!distribusi) {
    throw Object.assign(new Error('Data distribusi tidak ditemukan.'), { status: 404 });
  }

  // If mustahiq_id changed
  if (body.mustahiq_id && body.mustahiq_id !== distribusi.mustahiq_id) {
    const mustahiq = await Mustahiq.findByPk(body.mustahiq_id);
    if (!mustahiq) {
      throw Object.assign(new Error('Mustahiq tidak ditemukan.'), { status: 404 });
    }
    // Update denormalized fields
    body.no_reg_bpp = mustahiq.no_reg_bpp;
    body.nrm = mustahiq.nrm;
    body.nama_mustahik = mustahiq.nama;
    body.nik = mustahiq.nik;
    body.alamat = mustahiq.alamat;
    body.kelurahan = mustahiq.kelurahan;
    body.kecamatan = mustahiq.kecamatan;
    body.no_hp = mustahiq.no_hp;
    body.asnaf = mustahiq.asnaf;
  }

  // If tanggal changed, update bulan/tahun
  if (body.tanggal) {
    body.bulan = new Date(body.tanggal).toLocaleString('id-ID', { month: 'long' });
    body.tahun = new Date(body.tanggal).getFullYear();
  }

  const t = await db.transaction();
  try {
    await distribusi.update(body, { transaction: t });
    await t.commit();
    await distribusi.reload();
    return distribusi;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// --- DELETE /api/distribusi/:id ---
const destroy = async (id) => {
  const distribusi = await Distribusi.findByPk(id);
  if (!distribusi) {
    throw Object.assign(new Error('Data distribusi tidak ditemukan.'), { status: 404 });
  }

  const t = await db.transaction();
  try {
    await distribusi.destroy({ transaction: t });
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// --- Rekap Functions ---
const rekapHarian = async (query) => {
  const { tanggal = new Date().toISOString().split('T')[0] } = query;
  return await Distribusi.findAll({
    attributes: [
      'nama_program',
      [db.fn('COUNT', db.col('id')), 'count'],
      [db.fn('SUM', db.col('jumlah')), 'total']
    ],
    where: { tanggal },
    group: ['nama_program']
  });
};

const rekapBulanan = async (query) => {
  const now = new Date();
  const { 
    bulan = now.toLocaleString('id-ID', { month: 'long' }), 
    tahun = now.getFullYear() 
  } = query;

  return await Distribusi.findAll({
    attributes: [
      'nama_program',
      [db.fn('COUNT', db.col('id')), 'count'],
      [db.fn('SUM', db.col('jumlah')), 'total']
    ],
    where: { bulan, tahun },
    group: ['nama_program']
  });
};

const rekapTahunan = async (query) => {
  const { tahun = new Date().getFullYear() } = query;

  return await Distribusi.findAll({
    attributes: [
      'bulan',
      [db.fn('COUNT', db.col('id')), 'count'],
      [db.fn('SUM', db.col('jumlah')), 'total']
    ],
    where: { tahun },
    group: ['bulan'],
    order: [
      [db.literal("CASE bulan " +
        "WHEN 'Januari' THEN 1 WHEN 'Februari' THEN 2 WHEN 'Maret' THEN 3 " +
        "WHEN 'April' THEN 4 WHEN 'Mei' THEN 5 WHEN 'Juni' THEN 6 " +
        "WHEN 'Juli' THEN 7 WHEN 'Agustus' THEN 8 WHEN 'September' THEN 9 " +
        "WHEN 'Oktober' THEN 10 WHEN 'November' THEN 11 WHEN 'Desember' THEN 12 END"), 'ASC']
    ]
  });
};

export default {
  getAll,
  getById,
  create,
  update,
  destroy,
  rekapHarian,
  rekapBulanan,
  rekapTahunan
};
