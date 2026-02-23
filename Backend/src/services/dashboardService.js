import Penerimaan from '../models/penerimaanModel.js';
import Distribusi from '../models/distribusiModel.js';
import { Op } from 'sequelize';
import db from '../config/database.js';

const getDashboardInfo = async (query) => {
  const now = new Date();
  const tahun = parseInt(query.tahun) || now.getFullYear();
  const bulan = query.bulan; // Opsional: 'Januari', 'Februari', dll
  const tanggal = query.tanggal; // Opsional: '2026-02-23'

  const wherePenerimaan = { tahun };
  const whereDistribusi = { tahun };

  if (bulan) {
    wherePenerimaan.bulan = bulan;
    whereDistribusi.bulan = bulan;
  }
  if (tanggal) {
    wherePenerimaan.tanggal = tanggal;
    whereDistribusi.tanggal = tanggal;
  }

  // 1. Ringkasan Keuangan
  const [penerimaanStats, distribusiStats] = await Promise.all([
    Penerimaan.findAll({
      attributes: [
        'jenis_zis',
        [db.fn('SUM', db.col('jumlah')), 'total']
      ],
      where: wherePenerimaan,
      group: ['jenis_zis']
    }),
    Distribusi.findAll({
      attributes: [
        [db.fn('SUM', db.col('jumlah')), 'total']
      ],
      where: whereDistribusi
    })
  ]);

  let total_zakat = 0;
  let total_infaq = 0;
  let total_pemasukan = 0;

  penerimaanStats.forEach(item => {
    const val = parseFloat(item.get('total')) || 0;
    if (item.jenis_zis === 'Zakat') total_zakat += val;
    else if (item.jenis_zis === 'Infak Terikat' || item.jenis_zis === 'Infak Tidak Terikat' || item.jenis_zis === 'Sedekah') {
       total_infaq += val;
    }
    total_pemasukan += val;
  });

  const total_pengeluaran = parseFloat(distribusiStats[0]?.get('total')) || 0;
  
  // Logic Dana Amil: Biasanya 12.5% dari Zakat/Infaq sesuai regulasi, atau sesuai field jika ada.
  // Di sini kita asumsikan 12.5% untuk dana amil jika tidak ada field eksplisit.
  const total_dana_amil = total_zakat * 0.125; 
  const total_dana_bersih = total_pemasukan - total_dana_amil;
  const saldo_bersih = total_dana_bersih - total_pengeluaran;

  // 2. Grafik Bulanan (Jika filter bukan harian)
  let grafik_penerimaan_bulanan = [];
  let grafik_distribusi_bulanan = [];
  
  if (!tanggal) {
    [grafik_penerimaan_bulanan, grafik_distribusi_bulanan] = await Promise.all([
      Penerimaan.findAll({
        attributes: [
          'bulan',
          [db.fn('SUM', db.col('jumlah')), 'total']
        ],
        where: { tahun },
        group: ['bulan'],
        order: [[db.literal("FIELD(bulan, 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember')"), 'ASC']]
      }),
      Distribusi.findAll({
        attributes: [
          'bulan',
          [db.fn('SUM', db.col('jumlah')), 'total']
        ],
        where: { tahun },
        group: ['bulan'],
        order: [[db.literal("FIELD(bulan, 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember')"), 'ASC']]
      })
    ]);
  }

  // 3. Status Harian (Opsional - Jika dalam satu bulan atau satu tanggal)
  // Logic harian bisa ditambahkan di sini jika dibutuhkan UI

  // 4. Breakdown
  const [breakdown_zis, breakdown_program, breakdown_asnaf, breakdown_upz, breakdown_channel] = await Promise.all([
    Penerimaan.findAll({
      attributes: ['jenis_zis', [db.fn('COUNT', db.col('id')), 'count'], [db.fn('SUM', db.col('jumlah')), 'total']],
      where: wherePenerimaan, group: ['jenis_zis']
    }),
    Distribusi.findAll({
      attributes: ['nama_program', [db.fn('COUNT', db.col('id')), 'count'], [db.fn('SUM', db.col('jumlah')), 'total']],
      where: whereDistribusi, group: ['nama_program']
    }),
    Distribusi.findAll({
      attributes: ['asnaf', [db.fn('COUNT', db.col('id')), 'count'], [db.fn('SUM', db.col('jumlah')), 'total']],
      where: whereDistribusi, group: ['asnaf']
    }),
    Penerimaan.findAll({
      attributes: ['jenis_upz', [db.fn('COUNT', db.col('id')), 'count'], [db.fn('SUM', db.col('jumlah')), 'total']],
      where: wherePenerimaan, group: ['jenis_upz']
    }),
    Penerimaan.findAll({
      attributes: ['via', [db.fn('COUNT', db.col('id')), 'count'], [db.fn('SUM', db.col('jumlah')), 'total']],
      where: wherePenerimaan, group: ['via']
    })
  ]);

  return {
    ringkasan: {
      total_pemasukan,
      total_zakat,
      total_infaq,
      total_dana_amil,
      total_dana_bersih,
      total_pengeluaran,
      saldo_bersih
    },
    grafik_penerimaan_bulanan,
    grafik_distribusi_bulanan,
    breakdown_zis,
    breakdown_program,
    breakdown_asnaf,
    breakdown_upz,
    breakdown_channel
  };
};

export default {
  getDashboardInfo
};
