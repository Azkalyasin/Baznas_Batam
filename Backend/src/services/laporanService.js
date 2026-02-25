import Penerimaan from '../models/penerimaanModel.js';
import Distribusi from '../models/distribusiModel.js';
import Muzakki from '../models/muzakkiModel.js';
import Mustahiq from '../models/mustahiqModel.js';
import { Op } from 'sequelize';
import db from '../config/database.js';

const getArusKas = async (query) => {
  const tahun = parseInt(query.tahun) || new Date().getFullYear();
  const bulan = query.bulan || new Date().toLocaleString('id-ID', { month: 'long' });

  const bulanList = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const bulanIndex = bulanList.indexOf(bulan);
  
  const saldoAwalRes = await db.query(`
    SELECT 
      (SELECT IFNULL(SUM(jumlah), 0) FROM penerimaan WHERE tahun < :tahun OR (tahun = :tahun AND FIELD(bulan, 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember') < :bulanIdx)) as total_masuk,
      (SELECT IFNULL(SUM(jumlah), 0) FROM distribusi WHERE tahun < :tahun OR (tahun = :tahun AND FIELD(bulan, 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember') < :bulanIdx)) as total_keluar
  `, {
    replacements: { tahun, bulanIdx: bulanIndex + 1 },
    type: db.QueryTypes.SELECT
  });

  const saldo_awal = (saldoAwalRes[0].total_masuk * 0.875) - saldoAwalRes[0].total_keluar; // 0.875 karena Zakat dikurangi 12.5% amil (asumsi sederhana)

  const penerimaan = await Penerimaan.findAll({
    attributes: [
      'jenis_zis',
      'via',
      [db.fn('SUM', db.col('jumlah')), 'total']
    ],
    where: { tahun, bulan },
    group: ['jenis_zis', 'via']
  });

  let total_zakat = 0;
  let total_infaq = 0;
  let total_masuk = 0;
  const breakdown_per_jenis_zis = {};
  const breakdown_per_channel = {};

  penerimaan.forEach(item => {
    const val = parseFloat(item.get('total')) || 0;
    const type = item.jenis_zis;
    const channel = item.via;

    if (type === 'Zakat') total_zakat += val;
    else total_infaq += val;

    total_masuk += val;
    breakdown_per_jenis_zis[type] = (breakdown_per_jenis_zis[type] || 0) + val;
    breakdown_per_channel[channel] = (breakdown_per_channel[channel] || 0) + val;
  });

  const total_dana_amil = total_zakat * 0.125;

  const distribusi = await Distribusi.findAll({
    attributes: [
      'nama_program',
      'asnaf',
      [db.fn('SUM', db.col('jumlah')), 'total']
    ],
    where: { tahun, bulan },
    group: ['nama_program', 'asnaf']
  });

  let total_keluar = 0;
  const breakdown_per_program = {};
  const breakdown_per_asnaf = {};

  distribusi.forEach(item => {
    const val = parseFloat(item.get('total')) || 0;
    total_keluar += val;
    breakdown_per_program[item.nama_program] = (breakdown_per_program[item.nama_program] || 0) + val;
    breakdown_per_asnaf[item.asnaf] = (breakdown_per_asnaf[item.asnaf] || 0) + val;
  });

  const saldo_akhir = saldo_awal + (total_masuk - total_dana_amil) - total_keluar;

  return {
    periode: `${bulan} ${tahun}`,
    saldo_awal,
    arus_kas_masuk: {
      total_zakat,
      total_infaq,
      total_dana_amil,
      breakdown_per_jenis_zis,
      breakdown_per_channel,
      total_masuk
    },
    arus_kas_keluar: {
      total_distribusi: total_keluar,
      breakdown_per_program,
      breakdown_per_asnaf,
      total_keluar
    },
    saldo_akhir,
    dana_bersih_tersedia: saldo_akhir 
  };
};

const getNeraca = async (query) => {
  const tahun = parseInt(query.tahun) || new Date().getFullYear();
  const bulan = query.bulan || new Date().toLocaleString('id-ID', { month: 'long' });
  const stats = await db.query(`
    SELECT 
      (SELECT IFNULL(SUM(jumlah), 0) FROM penerimaan WHERE tahun < :tahun OR (tahun = :tahun AND FIELD(bulan, 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember') <= :bulanIdx)) as total_masuk,
      (SELECT IFNULL(SUM(jumlah), 0) FROM distribusi WHERE tahun < :tahun OR (tahun = :tahun AND FIELD(bulan, 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember') <= :bulanIdx)) as total_keluar,
      (SELECT IFNULL(SUM(jumlah), 0) FROM penerimaan WHERE jenis_zis = 'Zakat' AND (tahun < :tahun OR (tahun = :tahun AND FIELD(bulan, 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember') <= :bulanIdx))) as total_zakat_in,
      (SELECT IFNULL(SUM(jumlah), 0) FROM distribusi WHERE asnaf IN ('Fakir', 'Miskin', 'Amil', 'Muallaf', 'Gharimin', 'Ibnu Sabil', 'Fisabillillah', 'Riqob') AND (tahun < :tahun OR (tahun = :tahun AND FIELD(bulan, 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember') <= :bulanIdx))) as total_dist_out
  `, {
    replacements: { tahun, bulanIdx: 12 }, 
    type: db.QueryTypes.SELECT
  });

  const { total_masuk, total_keluar, total_zakat_in } = stats[0];
  const dana_amil = total_zakat_in * 0.125;
  const dana_zakat = (total_zakat_in * 0.875) - (total_keluar * 0.7); 
  const dana_infaq = (total_masuk - total_zakat_in) - (total_keluar * 0.3); 

  const total_aktiva = (total_masuk - total_keluar);

  return {
    periode: `${bulan} ${tahun}`,
    aktiva: {
      kas_dan_setara_kas: total_aktiva,
      total_aktiva
    },
    pasiva: {
      dana_zakat,
      dana_infaq,
      dana_amil,
      total_pasiva: dana_zakat + dana_infaq + dana_amil
    },
    selisih: total_aktiva - (dana_zakat + dana_infaq + dana_amil)
  };
};

const getRawDataForExport = async (type, query) => {
  const { tahun, bulan, tanggal } = query;
  const where = {};
  if (tahun) where.tahun = tahun;
  if (bulan) where.bulan = bulan;
  if (tanggal) where.tanggal = tanggal;

  if (type === 'penerimaan') return await Penerimaan.findAll({ where, include: [Muzakki] });
  if (type === 'distribusi') return await Distribusi.findAll({ where, include: [Mustahiq] });
  if (type === 'mustahiq') return await Mustahiq.findAll({ where: query.status ? { status: query.status } : {} });
  if (type === 'muzakki') return await Muzakki.findAll({ where: query.status ? { status: query.status } : {} });
  
  return [];
};

const getRekapTahunan = async (query) => {
  const tahun = parseInt(query.tahun) || new Date().getFullYear();

  const [penerimaan, distribusi] = await Promise.all([
    Penerimaan.findAll({
      attributes: [
        'bulan',
        [db.fn('SUM', db.col('jumlah')), 'total']
      ],
      where: { tahun },
      group: ['bulan']
    }),
    Distribusi.findAll({
      attributes: [
        'bulan',
        [db.fn('SUM', db.col('jumlah')), 'total']
      ],
      where: { tahun },
      group: ['bulan']
    })
  ]);

  return { tahun, penerimaan, distribusi };
};

export default {
  getArusKas,
  getNeraca,
  getRekapTahunan,
  getRawDataForExport
};
