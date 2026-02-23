import Penerimaan from '../models/penerimaanModel.js';
import Muzakki from '../models/muzakkiModel.js';
import { Op } from 'sequelize';
import db from '../config/database.js';

// --- Helper: parse persentase_amil string ke number ---
const parsePersentase = (str) => {
  return parseFloat(str.replace('%', '')) / 100;
};

// --- GET /api/penerimaan (list + filter + search + pagination) ---
const getAll = async (query) => {
  const { q, muzakki_id, tanggal, bulan, tahun, via, metode_bayar, zis, jenis_zis, page = 1, limit = 10 } = query;
  const offset = (page - 1) * limit;

  const where = {};
  if (muzakki_id) where.muzakki_id = muzakki_id;
  if (tanggal) where.tanggal = tanggal;
  if (bulan) where.bulan = bulan;
  if (tahun) where.tahun = tahun;
  if (via) where.via = via;
  if (metode_bayar) where.metode_bayar = metode_bayar;
  if (zis) where.zis = zis;
  if (jenis_zis) where.jenis_zis = jenis_zis;

  if (q) {
    where[Op.or] = [
      { nama_muzakki: { [Op.like]: `%${q}%` } },
      { npwz: { [Op.like]: `%${q}%` } },
      { nik_muzakki: { [Op.like]: `%${q}%` } }
    ];
  }

  const { rows, count } = await Penerimaan.findAndCountAll({
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [['tanggal', 'DESC'], ['createdAt', 'DESC']]
  });

  return {
    data: rows,
    total: count,
    page: Number(page),
    totalPages: Math.ceil(count / limit)
  };
};

// --- GET /api/penerimaan/:id ---
const getById = async (id) => {
  const penerimaan = await Penerimaan.findByPk(id);
  if (!penerimaan) throw Object.assign(new Error('Data penerimaan tidak ditemukan.'), { status: 404 });
  return penerimaan;
};

// --- POST /api/penerimaan ---
// Trigger DB akan handle: denormalized fields, bulan, tahun, dan muzakki stats update
const create = async (body, userId) => {
  // Validasi muzakki_id ada dan active (sebelum mulai transaction)
  const muzakki = await Muzakki.findByPk(body.muzakki_id);
  if (!muzakki) throw Object.assign(new Error('Muzakki tidak ditemukan.'), { status: 404 });
  if (muzakki.status !== 'active') {
    throw Object.assign(new Error('Muzakki tidak aktif, transaksi ditolak.'), { status: 400 });
  }

  // Hitung dana_amil dan dana_bersih di application layer
  const persen = parsePersentase(body.persentase_amil);
  const danaAmil = parseFloat((body.jumlah * persen).toFixed(2));
  const danaBersih = parseFloat((body.jumlah - danaAmil).toFixed(2));

  const t = await db.transaction();
  try {
    const penerimaan = await Penerimaan.create({
      ...body,
      dana_amil: danaAmil,
      dana_bersih: danaBersih,
      created_by: userId
    }, { transaction: t });

    await t.commit();

    // Reload di luar transaction untuk mendapatkan data dari trigger
    await penerimaan.reload();
    return penerimaan;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// --- PUT /api/penerimaan/:id ---
const update = async (id, updateData) => {
  const penerimaan = await Penerimaan.findByPk(id);
  if (!penerimaan) throw Object.assign(new Error('Data penerimaan tidak ditemukan.'), { status: 404 });

  // Jika muzakki_id berubah, validasi muzakki baru (sebelum transaction)
  if (updateData.muzakki_id && updateData.muzakki_id !== penerimaan.muzakki_id) {
    const muzakki = await Muzakki.findByPk(updateData.muzakki_id);
    if (!muzakki) throw Object.assign(new Error('Muzakki tidak ditemukan.'), { status: 404 });
    if (muzakki.status !== 'active') {
      throw Object.assign(new Error('Muzakki tidak aktif, perubahan ditolak.'), { status: 400 });
    }
  }

  // Recalculate dana_amil/dana_bersih jika jumlah atau persentase berubah
  const jumlah = updateData.jumlah ?? penerimaan.jumlah;
  const persentaseStr = updateData.persentase_amil ?? penerimaan.persentase_amil;
  const persen = parsePersentase(persentaseStr);
  updateData.dana_amil = parseFloat((jumlah * persen).toFixed(2));
  updateData.dana_bersih = parseFloat((jumlah - updateData.dana_amil).toFixed(2));

  const t = await db.transaction();
  try {
    await penerimaan.update(updateData, { transaction: t });
    await t.commit();

    await penerimaan.reload();
    return penerimaan;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// --- DELETE /api/penerimaan/:id ---
// Trigger DB akan handle: rollback muzakki stats
const destroy = async (id) => {
  const penerimaan = await Penerimaan.findByPk(id);
  if (!penerimaan) throw Object.assign(new Error('Data penerimaan tidak ditemukan.'), { status: 404 });

  const t = await db.transaction();
  try {
    await penerimaan.destroy({ transaction: t });
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// --- GET /api/penerimaan/rekap/harian ---
const rekapHarian = async (query) => {
  const tanggal = query.tanggal || new Date().toISOString().slice(0, 10);

  const [results] = await db.query(`
    SELECT 
      zis,
      jenis_zis,
      COUNT(*) as jumlah_transaksi,
      SUM(jumlah) as total_jumlah,
      SUM(dana_amil) as total_dana_amil,
      SUM(dana_bersih) as total_dana_bersih
    FROM penerimaan
    WHERE tanggal = :tanggal
    GROUP BY zis, jenis_zis
    ORDER BY zis, jenis_zis
  `, { replacements: { tanggal } });

  const [totals] = await db.query(`
    SELECT 
      COUNT(*) as total_transaksi,
      COALESCE(SUM(jumlah), 0) as grand_total,
      COALESCE(SUM(dana_amil), 0) as total_amil,
      COALESCE(SUM(dana_bersih), 0) as total_bersih
    FROM penerimaan
    WHERE tanggal = :tanggal
  `, { replacements: { tanggal } });

  return {
    tanggal,
    ringkasan: totals[0],
    detail: results
  };
};

// --- GET /api/penerimaan/rekap/bulanan ---
const rekapBulanan = async (query) => {
  const now = new Date();
  const bulanNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const bulan = query.bulan || bulanNames[now.getMonth()];
  const tahun = query.tahun || now.getFullYear();

  const [results] = await db.query(`
    SELECT 
      zis,
      jenis_zis,
      via,
      COUNT(*) as jumlah_transaksi,
      SUM(jumlah) as total_jumlah,
      SUM(dana_amil) as total_dana_amil,
      SUM(dana_bersih) as total_dana_bersih
    FROM penerimaan
    WHERE bulan = :bulan AND tahun = :tahun
    GROUP BY zis, jenis_zis, via
    ORDER BY zis, jenis_zis, via
  `, { replacements: { bulan, tahun } });

  const [totals] = await db.query(`
    SELECT 
      COUNT(*) as total_transaksi,
      COALESCE(SUM(jumlah), 0) as grand_total,
      COALESCE(SUM(dana_amil), 0) as total_amil,
      COALESCE(SUM(dana_bersih), 0) as total_bersih
    FROM penerimaan
    WHERE bulan = :bulan AND tahun = :tahun
  `, { replacements: { bulan, tahun } });

  return {
    bulan,
    tahun,
    ringkasan: totals[0],
    detail: results
  };
};

// --- GET /api/penerimaan/rekap/tahunan ---
const rekapTahunan = async (query) => {
  const tahun = query.tahun || new Date().getFullYear();

  const [results] = await db.query(`
    SELECT 
      bulan,
      zis,
      COUNT(*) as jumlah_transaksi,
      SUM(jumlah) as total_jumlah,
      SUM(dana_amil) as total_dana_amil,
      SUM(dana_bersih) as total_dana_bersih
    FROM penerimaan
    WHERE tahun = :tahun
    GROUP BY bulan, zis
    ORDER BY 
      FIELD(bulan, 'Januari','Februari','Maret','April','Mei','Juni',
            'Juli','Agustus','September','Oktober','November','Desember'),
      zis
  `, { replacements: { tahun } });

  const [totals] = await db.query(`
    SELECT 
      COUNT(*) as total_transaksi,
      COALESCE(SUM(jumlah), 0) as grand_total,
      COALESCE(SUM(dana_amil), 0) as total_amil,
      COALESCE(SUM(dana_bersih), 0) as total_bersih
    FROM penerimaan
    WHERE tahun = :tahun
  `, { replacements: { tahun } });

  return {
    tahun,
    ringkasan: totals[0],
    detail: results
  };
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
