import distribusiService from '../services/distribusiService.js';
import PDFDocument from 'pdfkit';

const getAll = async (req, res, next) => {
  try {
    const data = await distribusiService.getAll(req.query);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const data = await distribusiService.getById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const data = await distribusiService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data, message: 'Data distribusi berhasil disimpan.' });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const data = await distribusiService.update(req.params.id, req.body);
    res.status(200).json({ success: true, data, message: 'Data distribusi berhasil diperbarui.' });
  } catch (error) {
    next(error);
  }
};

const destroy = async (req, res, next) => {
  try {
    await distribusiService.destroy(req.params.id);
    res.status(200).json({ success: true, message: 'Data distribusi berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};

const rekapHarian = async (req, res, next) => {
  try {
    const data = await distribusiService.rekapHarian(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const rekapBulanan = async (req, res, next) => {
  try {
    const data = await distribusiService.rekapBulanan(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const rekapTahunan = async (req, res, next) => {
  try {
    const data = await distribusiService.rekapTahunan(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const cetakBuktiPenyaluran = async (req, res, next) => {
  try {
    const distribusi = await distribusiService.getById(req.params.id);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `bukti_penyaluran_${distribusi.id}_${timestamp}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // --- Header ---
    doc.fontSize(16).font('Helvetica-Bold')
      .text('BAZNAS KOTA BATAM', { align: 'center' });
    doc.fontSize(10).font('Helvetica')
      .text('Badan Amil Zakat Nasional Kota Batam', { align: 'center' });
    doc.moveDown(0.5);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold')
      .text('BUKTI PENYALURAN / DISTRIBUSI', { align: 'center' });
    doc.moveDown(1);

    // --- Detail Mustahiq ---
    doc.fontSize(11).font('Helvetica-Bold').text('Data Mustahiq');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');

    const leftCol = 50;
    const rightCol = 200;
    let y = doc.y;

    const addRow = (label, value) => {
      doc.text(label, leftCol, y, { width: 145 });
      doc.text(`: ${value || '-'}`, rightCol, y);
      y += 18;
    };

    addRow('No Reg BPP', distribusi.no_reg_bpp);
    addRow('NRM', distribusi.nrm);
    addRow('NIK', distribusi.nik);
    addRow('Nama', distribusi.nama_mustahik);
    addRow('No HP', distribusi.no_hp);
    addRow('Alamat', distribusi.alamat);
    addRow('Kelurahan', distribusi.kelurahan);
    addRow('Kecamatan', distribusi.kecamatan);
    addRow('Asnaf', distribusi.asnaf);

    doc.y = y;
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // --- Detail Program ---
    doc.fontSize(11).font('Helvetica-Bold').text('Detail Penyaluran');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    y = doc.y;

    addRow('No. Distribusi', `DST-${String(distribusi.id).padStart(6, '0')}`);
    addRow('Tanggal', distribusi.tanggal);
    addRow('Program', distribusi.nama_program);
    addRow('Kegiatan', distribusi.program_kegiatan);
    addRow('Sub Program', distribusi.nama_sub_program);
    addRow('Frekuensi', distribusi.frekuensi_bantuan);

    doc.y = y;
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // --- Rincian Dana ---
    doc.fontSize(11).font('Helvetica-Bold').text('Rincian Bantuan');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    y = doc.y;

    const formatCurrency = (val) => {
      const num = parseFloat(val) || 0;
      return `Rp ${num.toLocaleString('id-ID', { minimumFractionDigits: 2 })}`;
    };

    addRow('Jumlah', formatCurrency(distribusi.jumlah));
    addRow('Quantity', distribusi.quantity);
    addRow('Via', distribusi.via);
    addRow('No Rekening', distribusi.no_rekening);
    addRow('Jenis ZIS', distribusi.jenis_zis);

    doc.y = y;
    if (distribusi.keterangan) {
      addRow('Keterangan', distribusi.keterangan);
      doc.y = y;
    }

    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // --- Tanda tangan ---
    const signY = doc.y;
    doc.text('Petugas,', leftCol, signY);
    doc.text('Penerima / Mustahiq,', 400, signY);

    doc.text('(_______________)', leftCol, signY + 60);
    doc.text('(_______________)', 400, signY + 60);

    // Footer
    doc.fontSize(8).font('Helvetica')
      .text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 50, 760, { align: 'center' });

    doc.end();
  } catch (error) {
    next(error);
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
  cetakBuktiPenyaluran
};
