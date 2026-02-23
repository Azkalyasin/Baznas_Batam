import Mustahiq from '../models/mustahiqModel.js';
import Distribusi from '../models/distribusiModel.js';
import { Op } from 'sequelize';

// --- Auto-generate no_reg_bpp: BPP-YYYYMM-NNNNN ---
const generateNoRegBpp = async () => {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prefix = `BPP${yearMonth}`;

  const lastRecord = await Mustahiq.findOne({
    where: { no_reg_bpp: { [Op.like]: `${prefix}%` } },
    order: [['no_reg_bpp', 'DESC']]
  });

  let sequence = 1;
  if (lastRecord) {
    const lastSeq = parseInt(lastRecord.no_reg_bpp.slice(prefix.length), 10);
    if (!isNaN(lastSeq)) sequence = lastSeq + 1;
  }

  return `${prefix}${String(sequence).padStart(3, '0')}`;
};

// --- GET /api/mustahiq (list + filter + search + pagination) ---
const getAll = async (query) => {
  const { q, asnaf, kategori, jenis_program, status, kelurahan, kecamatan, page = 1, limit = 10 } = query;
  const offset = (page - 1) * limit;

  const where = {};
  if (asnaf) where.asnaf = asnaf;
  if (kategori) where.kategori_mustahiq = kategori;
  if (jenis_program) where.jenis_program = jenis_program;
  if (status) where.status = status;
  if (kelurahan) where.kelurahan = kelurahan;
  if (kecamatan) where.kecamatan = kecamatan;

  if (q) {
    where[Op.or] = [
      { nama: { [Op.like]: `%${q}%` } },
      { nik: { [Op.like]: `%${q}%` } },
      { nrm: { [Op.like]: `%${q}%` } },
      { no_reg_bpp: { [Op.like]: `%${q}%` } }
    ];
  }

  const { rows, count } = await Mustahiq.findAndCountAll({
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [['createdAt', 'DESC']]
  });

  return {
    data: rows,
    total: count,
    page: Number(page),
    totalPages: Math.ceil(count / limit)
  };
};

// --- GET /api/mustahiq/:id ---
const getById = async (id) => {
  const mustahiq = await Mustahiq.findByPk(id);
  if (!mustahiq) throw Object.assign(new Error('Mustahiq tidak ditemukan.'), { status: 404 });
  return mustahiq;
};

// --- GET /api/mustahiq/:id/riwayat ---
const getRiwayat = async (id, query) => {
  const { tahun, bulan, page = 1, limit = 10 } = query;
  const offset = (page - 1) * limit;

  const mustahiq = await Mustahiq.findByPk(id);
  if (!mustahiq) throw Object.assign(new Error('Mustahiq tidak ditemukan.'), { status: 404 });

  const whereDistribusi = { mustahiq_id: id };
  if (tahun) whereDistribusi.tahun = tahun;
  if (bulan) whereDistribusi.bulan = bulan;

  const { rows, count } = await Distribusi.findAndCountAll({
    where: whereDistribusi,
    limit: Number(limit),
    offset: Number(offset),
    order: [['tanggal', 'DESC']]
  });

  return {
    mustahiq,
    total_penerimaan_count: mustahiq.total_penerimaan_count,
    total_penerimaan_amount: mustahiq.total_penerimaan_amount,
    last_received_date: mustahiq.last_received_date,
    riwayat: {
      data: rows,
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit)
    }
  };
};

// --- POST /api/mustahiq ---
const create = async (body, userId) => {
  // Cek duplikat NRM
  const existingNrm = await Mustahiq.findOne({ where: { nrm: body.nrm } });
  if (existingNrm) throw Object.assign(new Error('NRM sudah digunakan.'), { status: 409 });

  // Cek duplikat NIK (jika diisi)
  if (body.nik) {
    const existingNik = await Mustahiq.findOne({ where: { nik: body.nik } });
    if (existingNik) throw Object.assign(new Error('NIK sudah digunakan.'), { status: 409 });
  }

  const no_reg_bpp = await generateNoRegBpp();

  const mustahiq = await Mustahiq.create({
    ...body,
    no_reg_bpp,
    registered_by: userId
  });

  return mustahiq;
};

// --- PUT /api/mustahiq/:id ---
const update = async (id, updateData) => {
  const mustahiq = await Mustahiq.findByPk(id);
  if (!mustahiq) throw Object.assign(new Error('Mustahiq tidak ditemukan.'), { status: 404 });

  // Cek duplikat NRM jika berubah
  if (updateData.nrm && updateData.nrm !== mustahiq.nrm) {
    const conflict = await Mustahiq.findOne({ where: { nrm: updateData.nrm } });
    if (conflict) throw Object.assign(new Error('NRM sudah digunakan.'), { status: 409 });
  }

  // Cek duplikat NIK jika berubah
  if (updateData.nik && updateData.nik !== mustahiq.nik) {
    const conflict = await Mustahiq.findOne({ where: { nik: updateData.nik } });
    if (conflict) throw Object.assign(new Error('NIK sudah digunakan.'), { status: 409 });
  }

  await mustahiq.update(updateData);
  return mustahiq;
};

// --- PUT /api/mustahiq/:id/status ---
const updateStatus = async (id, status) => {
  const mustahiq = await Mustahiq.findByPk(id);
  if (!mustahiq) throw Object.assign(new Error('Mustahiq tidak ditemukan.'), { status: 404 });

  await mustahiq.update({ status });
  return mustahiq;
};

// --- DELETE /api/mustahiq/:id ---
const destroy = async (id) => {
  const mustahiq = await Mustahiq.findByPk(id);
  if (!mustahiq) throw Object.assign(new Error('Mustahiq tidak ditemukan.'), { status: 404 });

  // Cek apakah punya distribusi terkait
  const distribusiCount = await Distribusi.count({ where: { mustahiq_id: id } });
  if (distribusiCount > 0) {
    throw Object.assign(
      new Error(`Tidak bisa menghapus mustahiq yang memiliki ${distribusiCount} data distribusi.`),
      { status: 400 }
    );
  }

  await mustahiq.destroy();
};

// --- GET /api/laporan/mustahiq/export ---
const getExportData = async (query) => {
  const { asnaf, status, kecamatan } = query;
  const where = {};
  if (asnaf) where.asnaf = asnaf;
  if (status) where.status = status;
  if (kecamatan) where.kecamatan = kecamatan;

  return Mustahiq.findAll({
    where,
    order: [['nama', 'ASC']]
  });
};

export default {
  getAll,
  getById,
  getRiwayat,
  create,
  update,
  updateStatus,
  destroy,
  getExportData
};
