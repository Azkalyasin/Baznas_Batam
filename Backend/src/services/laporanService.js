import Penerimaan from '../models/penerimaanModel.js';
import Distribusi from '../models/distribusiModel.js';
import Muzakki from '../models/muzakkiModel.js';
import Mustahiq from '../models/mustahiqModel.js';
import { Op } from 'sequelize';
import db from '../config/database.js';
import { Asnaf, NamaProgram, SubProgram, ProgramKegiatan, NamaEntitas, JenisZis, Zis, Infak } from '../models/ref/index.js';

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

const getDistribusiByProgram = async (query) => {
  const { start_date, end_date, jenis_zis } = query;
  const where = { status: 'diterima' };
  
  if (start_date && end_date) {
    where.tanggal = { [Op.between]: [start_date, end_date] };
  } else if (start_date) {
    where.tanggal = { [Op.gte]: start_date };
  } else if (end_date) {
    where.tanggal = { [Op.lte]: end_date };
  }

  // Filter for Zakat only if requested
  if (jenis_zis === 'Zakat') {
    where[Op.or] = [{ infak_id: null }, { infak_id: 0 }];
  } else if (jenis_zis === 'Infak') {
    where.infak_id = { [Op.gt]: 0 };
  }

  return await Distribusi.findAll({
    where,
    include: [
      { model: NamaProgram },
      { model: SubProgram },
      { model: ProgramKegiatan }
    ],
    order: [
      ['nama_program_id', 'ASC'],
      ['sub_program_id', 'ASC'],
      ['program_kegiatan_id', 'ASC'],
      ['tanggal', 'ASC']
    ]
  });
};

const getDistribusiByAsnaf = async (query) => {
  const { start_date, end_date, jenis_zis } = query;
  const where = { status: 'diterima' };
  
  if (start_date && end_date) {
    where.tanggal = { [Op.between]: [start_date, end_date] };
  } else if (start_date) {
    where.tanggal = { [Op.gte]: start_date };
  } else if (end_date) {
    where.tanggal = { [Op.lte]: end_date };
  }

  // Filter for Zakat only if requested
  if (jenis_zis === 'Zakat') {
    where[Op.or] = [{ infak_id: null }, { infak_id: 0 }];
  } else if (jenis_zis === 'Infak') {
    where.infak_id = { [Op.gt]: 0 };
  }

  return await Distribusi.findAll({
    where,
    include: [
      { model: Asnaf, as: 'asnaf' }
    ],
    order: [
      ['asnaf_id', 'ASC'],
      ['tanggal', 'ASC']
    ]
  });
};

const getDistribusiHarian = async (query) => {
  const { start_date, end_date, jenis_zis } = query;
  const where = { status: 'diterima' };
  
  if (start_date && end_date) {
    where.tanggal = { [Op.between]: [start_date, end_date] };
  } else if (start_date) {
    where.tanggal = { [Op.gte]: start_date };
  } else if (end_date) {
    where.tanggal = { [Op.lte]: end_date };
  }

  // Filter for Zakat only if requested
  if (jenis_zis === 'Zakat') {
    where[Op.or] = [{ infak_id: null }, { infak_id: 0 }];
  } else if (jenis_zis === 'Infak') {
    where.infak_id = { [Op.gt]: 0 };
  }

  return await Distribusi.findAll({
    where,
    include: [
      { model: NamaEntitas }
    ],
    order: [['tanggal', 'ASC']]
  });
};



const getPerubahanDana = async (query) => {
  let { bulan, tahun } = query;
  tahun = parseInt(tahun) || new Date().getFullYear();
  
  const bulanList = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  if (!bulan) {
    bulan = bulanList[new Date().getMonth()];
  } else {
    const b = bulan.toLowerCase();
    const idx = bulanList.findIndex(m => m.toLowerCase() === b);
    if (idx !== -1) bulan = bulanList[idx];
  }

  const bulanIdx = bulanList.indexOf(bulan) + 1;

  console.log(`[getPerubahanDana] Params: bulan=${bulan}, tahun=${tahun}, bulanIdx=${bulanIdx}`);

  const fetchYearData = async (targetTahun) => {
    const zakatIn = await Penerimaan.findAll({
      attributes: ['jenis_muzakki_id', [db.fn('SUM', db.col('jumlah')), 'total']],
      where: { tahun: targetTahun, bulan, zis_id: 9 },
      group: ['jenis_muzakki_id']
    });

    const zakatOut = await Distribusi.findAll({
      attributes: ['asnaf_id', [db.fn('SUM', db.col('jumlah')), 'total']],
      where: { tahun: targetTahun, bulan, status: 'diterima', jenis_zis_distribusi_id: 8 },
      group: ['asnaf_id']
    });

    const infakIn = await Penerimaan.findAll({
      attributes: ['jenis_muzakki_id', [db.fn('SUM', db.col('jumlah')), 'total']],
      where: { tahun: targetTahun, bulan, zis_id: 10 },
      group: ['jenis_muzakki_id']
    });

    const infakOut = await Distribusi.findAll({
      attributes: ['jenis_zis_distribusi_id', [db.fn('SUM', db.col('jumlah')), 'total']],
      where: {
        tahun: targetTahun, bulan, status: 'diterima',
        jenis_zis_distribusi_id: { [Op.in]: [9, 10] }
      },
      group: ['jenis_zis_distribusi_id']
    });

    const saldoAwalZakatRes = await db.query(`
      SELECT 
        (SELECT IFNULL(SUM(jumlah), 0) FROM penerimaan WHERE zis_id = 9 AND (tahun < :targetTahun OR (tahun = :targetTahun AND FIELD(bulan, 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember') < :bulanIdx))) as in_all,
        (SELECT IFNULL(SUM(jumlah), 0) FROM distribusi WHERE jenis_zis_distribusi_id = 8 AND status = 'diterima' AND (tahun < :targetTahun OR (tahun = :targetTahun AND FIELD(bulan, 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember') < :bulanIdx))) as out_all
    `, { replacements: { targetTahun, bulanIdx }, type: db.QueryTypes.SELECT });
    const saldo_awal_zakat = (saldoAwalZakatRes[0].in_all || 0) - (saldoAwalZakatRes[0].out_all || 0);

    const saldoAwalInfakRes = await db.query(`
      SELECT 
        (SELECT IFNULL(SUM(jumlah), 0) FROM penerimaan WHERE zis_id = 10 AND (tahun < :targetTahun OR (tahun = :targetTahun AND FIELD(bulan, 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember') < :bulanIdx))) as in_all,
        (SELECT IFNULL(SUM(jumlah), 0) FROM distribusi WHERE jenis_zis_distribusi_id IN (9, 10) AND status = 'diterima' AND (tahun < :targetTahun OR (tahun = :targetTahun AND FIELD(bulan, 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember') < :bulanIdx))) as out_all
    `, { replacements: { targetTahun, bulanIdx }, type: db.QueryTypes.SELECT });
    const saldo_awal_infak = (saldoAwalInfakRes[0].in_all || 0) - (saldoAwalInfakRes[0].out_all || 0);

    const mapPenerimaan = (arr) => ({
      entitas: arr.find(i => i.jenis_muzakki_id === 2)?.get('total') || 0,
      individual: arr.find(i => i.jenis_muzakki_id === 1)?.get('total') || 0,
      lainnya: arr.filter(i => ![1, 2].includes(i.jenis_muzakki_id)).reduce((s, i) => s + parseFloat(i.get('total') || 0), 0)
    });

    const mappedZakatIn = mapPenerimaan(zakatIn);
    const totalZakatIn = parseFloat(mappedZakatIn.entitas) + parseFloat(mappedZakatIn.individual) + parseFloat(mappedZakatIn.lainnya);

    // Amil Zakat = 12.5% dari total penerimaan zakat (1/8 dari 8 asnaf)
    const mappedZakatOut = {
      amil: totalZakatIn * 0.125,
      fakir: zakatOut.find(i => i.asnaf_id === 1)?.get('total') || 0,
      miskin: zakatOut.find(i => i.asnaf_id === 2)?.get('total') || 0,
      riqob: zakatOut.find(i => i.asnaf_id === 5)?.get('total') || 0,
      gharimin: zakatOut.find(i => i.asnaf_id === 6)?.get('total') || 0,
      muallaf: zakatOut.find(i => i.asnaf_id === 4)?.get('total') || 0,
      fisabilillah: zakatOut.find(i => i.asnaf_id === 7)?.get('total') || 0,
      ibnu_sabil: zakatOut.find(i => i.asnaf_id === 8)?.get('total') || 0,
      lainnya: zakatOut.filter(i => ![1,2,3,4,5,6,7,8].includes(i.asnaf_id)).reduce((s, i) => s + parseFloat(i.get('total') || 0), 0)
    };

    const totalZakatOut = Object.values(mappedZakatOut).reduce((s, v) => s + parseFloat(v || 0), 0);
    const surplusZakat = totalZakatIn - totalZakatOut;

    const mappedInfakIn = {
      terikat: infakIn.find(i => i.jenis_muzakki_id === 2)?.get('total') || 0,
      tidak_terikat: infakIn.find(i => i.jenis_muzakki_id === 1)?.get('total') || 0,
      bagi_hasil: 0, dampak: 0, hasil: 0,
      lainnya: infakIn.filter(i => ![1, 2].includes(i.jenis_muzakki_id)).reduce((s, i) => s + parseFloat(i.get('total') || 0), 0)
    };

    const totalInfakIn = Object.values(mappedInfakIn).reduce((s, v) => s + parseFloat(v || 0), 0);

    // Raw terikat penyaluran from DB
    const rawTerikat = parseFloat(infakOut.find(i => i.jenis_zis_distribusi_id === 9)?.get('total') || 0);
    const rawTidakTerikat = parseFloat(infakOut.find(i => i.jenis_zis_distribusi_id === 10)?.get('total') || 0);

    // 5201: Amil-Infak = 20% dari penyaluran infak terikat
    const amil_infak = rawTerikat * 0.20;
    // 5202: Amil-Sedekah = 20% dari total penerimaan infak/sedekah
    const amil_sedekah = totalInfakIn * 0.20;

    const mappedInfakOut = {
      amil_infak,
      amil_sedekah,
      terikat: rawTerikat,
      tidak_terikat: rawTidakTerikat,
      alokasi: parseFloat(infakOut.find(i => i.jenis_zis_distribusi_id === 12)?.get('total') || 0),
      lainnya: infakOut.filter(i => ![9, 10, 11, 12].includes(i.jenis_zis_distribusi_id)).reduce((s, i) => s + parseFloat(i.get('total') || 0), 0)
    };

    const totalInfakOut = Object.values(mappedInfakOut).reduce((s, v) => s + parseFloat(v || 0), 0);
    const surplusInfak = totalInfakIn - totalInfakOut;

    // === DANA AMIL ===
    // 4301: Bagian dari Zakat = 12.5% × total penerimaan zakat
    const amil_dari_zakat = totalZakatIn * 0.125;
    // 4302: Bagian dari Infak = 5201 (amil_infak) + 5202 (amil_sedekah) dari infak penyaluran
    const amil_dari_infak = amil_infak + amil_sedekah;

    const amil_penerimaan = {
      bagian_dari_zakat: amil_dari_zakat,  // 4301
      bagian_dari_infak: amil_dari_infak,  // 4302 = 5201 + 5202
      infak_sedekah: 0,                    // 4303
      bagi_hasil: 0,                       // 4304
      lainnya: 0                           // 4399
    };
    const total_amil_penerimaan = amil_dari_zakat + amil_dari_infak;

    // Penyaluran Amil: data akan dari tabel baru, sementara semua 0
    const amil_penyaluran = {
      belanja_pegawai:      0,  // 5301
      belanja_kegiatan:     0,  // 5302
      perjalanan_dinas:     0,  // 5303
      belanja_administrasi: 0,  // 5304
      beban_pengadaan:      0,  // 5305
      beban_penyusutan:     0,  // 5306
      jasa_pihak_ketiga:    0,  // 5307
      operasional_upz:      0,  // 5308
      lainnya:              0   // 5399
    };
    const total_amil_penyaluran = 0;

    // Saldo awal amil = total amil sebelum tahun ini
    const saldoAwalAmilRes = await db.query(`
      SELECT
        (SELECT IFNULL(SUM(jumlah), 0) FROM distribusi WHERE asnaf_id = 3 AND status = 'diterima' AND tahun < :targetTahun) as out_all
    `, { replacements: { targetTahun }, type: db.QueryTypes.SELECT });
    // Saldo awal amil = akumulasi penerimaan amil - pengeluaran amil sebelumnya
    // simplified as 0 in first year (no prior data), else compute from raw SQL
    const saldo_awal_amil = 0; // conservative default; balance carried from prior years

    const surplus_amil = total_amil_penerimaan - total_amil_penyaluran;

    return {
      zakat: {
        penerimaan: mappedZakatIn, penyaluran: mappedZakatOut,
        total_penerimaan: totalZakatIn, total_penyaluran: totalZakatOut,
        surplus: surplusZakat, saldo_awal: saldo_awal_zakat, saldo_akhir: saldo_awal_zakat + surplusZakat
      },
      infak: {
        penerimaan: mappedInfakIn, penyaluran: mappedInfakOut,
        total_penerimaan: totalInfakIn, total_penyaluran: totalInfakOut,
        surplus: surplusInfak, saldo_awal: saldo_awal_infak, saldo_akhir: saldo_awal_infak + surplusInfak
      },
      amil: {
        penerimaan: amil_penerimaan, penyaluran: amil_penyaluran,
        total_penerimaan: total_amil_penerimaan, total_penyaluran: total_amil_penyaluran,
        surplus: surplus_amil, saldo_awal: saldo_awal_amil, saldo_akhir: saldo_awal_amil + surplus_amil
      }
    };
  };

  const currentYear = await fetchYearData(tahun);
  const prevYear = await fetchYearData(tahun - 1);

  return {
    periode: `${bulan} ${tahun}`,
    current: currentYear,
    previous: prevYear,
    labels: { tahun_current: tahun, tahun_previous: tahun - 1 }
  };
};


export default {
  getArusKas,
  getNeraca,
  getRekapTahunan,
  getRawDataForExport,
  getDistribusiByProgram,
  getDistribusiByAsnaf,
  getDistribusiHarian,
  getPerubahanDana
};
