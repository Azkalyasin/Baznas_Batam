import laporanService from '../services/laporanService.js';
import excelHelper from '../utils/excelHelper.js';
import PDFDocument from 'pdfkit';

const getArusKas = async (req, res, next) => {
  try {
    const data = await laporanService.getArusKas(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getNeraca = async (req, res, next) => {
  try {
    const data = await laporanService.getNeraca(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const exportPenerimaan = async (req, res, next) => {
  try {
    const data = await laporanService.getRawDataForExport('penerimaan', req.query);
    const columns = [
      { header: 'Tanggal', key: 'tanggal', width: 15 },
      { header: 'Muzakki', key: 'nama_muzakki', width: 25 },
      { header: 'Jenis ZIS', key: 'jenis_zis', width: 20 },
      { header: 'Jumlah', key: 'jumlah', width: 15 },
      { header: 'Via', key: 'via', width: 15 },
      { header: 'Keterangan', key: 'keterangan', width: 30 }
    ];
    await excelHelper(res, {
      sheetName: 'Penerimaan',
      columns,
      rows: data,
      filename: 'Laporan_Penerimaan'
    });
  } catch (error) {
    next(error);
  }
};

const exportDistribusi = async (req, res, next) => {
  try {
    const data = await laporanService.getRawDataForExport('distribusi', req.query);
    const columns = [
      { header: 'Tanggal', key: 'tanggal', width: 15 },
      { header: 'Mustahiq', key: 'nama_mustahik', width: 25 },
      { header: 'Program', key: 'nama_program', width: 20 },
      { header: 'Jumlah', key: 'jumlah', width: 15 },
      { header: 'Asnaf', key: 'asnaf', width: 15 },
      { header: 'Keterangan', key: 'keterangan', width: 30 }
    ];
    await excelHelper(res, {
      sheetName: 'Distribusi',
      columns,
      rows: data,
      filename: 'Laporan_Distribusi'
    });
  } catch (error) {
    next(error);
  }
};

// --- PDF Export Arus Kas ---
const exportArusKasPdf = async (req, res, next) => {
  try {
    const data = await laporanService.getArusKas(req.query);
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Arus_Kas_${data.periode}.pdf"`);
    doc.pipe(res);

    doc.fontSize(16).text('BAZNAS KOTA BATAM', { align: 'center' });
    doc.fontSize(14).text('LAPORAN ARUS KAS', { align: 'center' });
    doc.fontSize(10).text(`Periode: ${data.periode}`, { align: 'center' });
    doc.moveDown();

    const drawRow = (label, value, isBold = false) => {
      if (isBold) doc.font('Helvetica-Bold');
      else doc.font('Helvetica');
      
      const y = doc.y;
      doc.text(label, 50, y);
      doc.text(value, 400, y, { align: 'right', width: 100 });
      doc.moveDown(0.5);
    };

const fmt = (v) => `Rp ${parseFloat(v).toLocaleString('id-ID', { minimumFractionDigits: 2 })}`;

    drawRow('SALDO AWAL', fmt(data.saldo_awal), true);
    doc.moveDown();
    
    doc.text('ARUS KAS MASUK:', { underline: true });
    drawRow('Total Zakat', fmt(data.arus_kas_masuk.total_zakat));
    drawRow('Total Infak/Sedekah', fmt(data.arus_kas_masuk.total_infaq));
    drawRow('Porsi Amil (12.5%)', `(${fmt(data.arus_kas_masuk.total_dana_amil)})`, false);
    drawRow('TOTAL KAS MASUK BERSIH', fmt(data.arus_kas_masuk.total_masuk - data.arus_kas_masuk.total_dana_amil), true);
    doc.moveDown();

    doc.text('ARUS KAS KELUAR:', { underline: true });
    drawRow('Total Pendistribusian', fmt(data.arus_kas_keluar.total_distribusi));
    drawRow('TOTAL KAS KELUAR', fmt(data.arus_kas_keluar.total_keluar), true);
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(500, doc.y).stroke();
    doc.moveDown();
    drawRow('SALDO AKHIR', fmt(data.saldo_akhir), true);

    doc.end();
  } catch (error) {
    next(error);
  }
};

const exportNeracaPdf = async (req, res, next) => {
  try {
    const data = await laporanService.getNeraca(req.query);
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Neraca_${data.periode}.pdf"`);
    doc.pipe(res);

    doc.fontSize(16).text('BAZNAS KOTA BATAM', { align: 'center' });
    doc.fontSize(14).text('LAPORAN NERACA', { align: 'center' });
    doc.fontSize(10).text(`Periode: ${data.periode}`, { align: 'center' });
    doc.moveDown();

    const drawRow = (label, value, isBold = false) => {
      if (isBold) doc.font('Helvetica-Bold');
      else doc.font('Helvetica');
      const y = doc.y;
      doc.text(label, 50, y);
      doc.text(value, 400, y, { align: 'right', width: 100 });
      doc.moveDown(0.5);
    };

    const fmt = (v) => `Rp ${parseFloat(v).toLocaleString('id-ID', { minimumFractionDigits: 2 })}`;

    doc.text('AKTIVA (PENGGUNAAN DANA):', { underline: true, bold: true });
    drawRow('Kas dan Setara Kas', fmt(data.aktiva.kas_dan_setara_kas));
    drawRow('TOTAL AKTIVA', fmt(data.aktiva.total_aktiva), true);
    doc.moveDown();

    doc.text('PASIVA (SUMBER DANA):', { underline: true, bold: true });
    drawRow('Dana Zakat', fmt(data.pasiva.dana_zakat));
    drawRow('Dana Infaq', fmt(data.pasiva.dana_infaq));
    drawRow('Dana Amil', fmt(data.pasiva.dana_amil));
    drawRow('TOTAL PASIVA', fmt(data.pasiva.total_pasiva), true);
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(500, doc.y).stroke();
    doc.moveDown();
    drawRow('SELISIH (BALANCE)', fmt(data.selisih), true);

    doc.end();
  } catch (error) {
    next(error);
  }
};

const exportRekapTahunanPdf = async (req, res, next) => {
  try {
    const data = await laporanService.getRekapTahunan(req.query);
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Rekap_Tahunan_${data.tahun}.pdf"`);
    doc.pipe(res);

    doc.fontSize(16).text('BAZNAS KOTA BATAM', { align: 'center' });
    doc.fontSize(14).text(`REKAPITULASI PENYALURAN & PENERIMAAN TAHUN ${data.tahun}`, { align: 'center' });
    doc.moveDown();

    // Sederhananya tampilkan tabel data bulanan
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Bulan', 50, doc.y, { continued: true });
    doc.text('Penerimaan', 200, doc.y, { continued: true });
    doc.text('Penyaluran', 350, doc.y);
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(500, doc.y).stroke();
    doc.moveDown(0.5);

    const bulanList = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    doc.font('Helvetica');

    const fmt = (v) => parseFloat(v).toLocaleString('id-ID');

    bulanList.forEach(b => {
      const p = data.penerimaan.find(x => x.bulan === b)?.get('total') || 0;
      const d = data.distribusi.find(x => x.bulan === b)?.get('total') || 0;
      
      const y = doc.y;
      doc.text(b, 50, y);
      doc.text(fmt(p), 200, y);
      doc.text(fmt(d), 350, y);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};

export default {
  getArusKas,
  getNeraca,
  exportPenerimaan,
  exportDistribusi,
  exportArusKasPdf,
  exportNeracaPdf,
  exportRekapTahunanPdf
};
