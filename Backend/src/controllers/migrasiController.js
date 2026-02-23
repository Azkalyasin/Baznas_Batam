import migrasiService from '../services/migrasiService.js';

const getTemplate = async (req, res, next) => {
  try {
    const { jenis } = req.params;
    const allowedTypes = ['mustahiq', 'muzakki', 'penerimaan', 'distribusi'];
    
    if (!allowedTypes.includes(jenis)) {
      return res.status(400).json({ success: false, message: 'Jenis migrasi tidak valid.' });
    }

    // Role-based check (Logic can also be moved to middleware)
    const { role } = req.user;
    if (jenis === 'mustahiq' && !['pelayanan', 'superadmin'].includes(role)) {
      return res.status(403).json({ success: false, message: 'Akses ditolak untuk jenis migrasi ini.' });
    }
    if (['muzakki', 'penerimaan', 'distribusi'].includes(jenis) && !['keuangan', 'pendistribusian', 'superadmin'].includes(role)) {
      return res.status(403).json({ success: false, message: 'Akses ditolak untuk jenis migrasi ini.' });
    }

    await migrasiService.generateTemplate(res, jenis);
  } catch (error) {
    next(error);
  }
};

const preview = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File Excel harus diunggah.' });
    }
    const { jenis } = req.body;
    const results = await migrasiService.previewExcel(req.file.buffer, jenis);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

const doImport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File Excel harus diunggah.' });
    }
    const { jenis } = req.body;
    const result = await migrasiService.importExcel(req.file.buffer, jenis, req.user.id);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getLogs = async (req, res, next) => {
  try {
    const logs = await migrasiService.getLogs(req.query);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

export default {
  getTemplate,
  preview,
  doImport,
  getLogs
};
