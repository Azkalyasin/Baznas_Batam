import express from 'express';
import laporanController from '../controllers/laporanController.js';
import mustahiqController from '../controllers/mustahiqController.js';
import muzakkiController from '../controllers/muzakkiController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';
import { queryExportSchema as mustahiqExportSchema } from '../validations/mustahiqValidation.js';
import { queryExportSchema as muzakkiExportSchema } from '../validations/muzakkiValidation.js';

const router = express.Router();

router.use(authMiddleware);

// --- Data Mentah (Excel) ---
router.get('/penerimaan/export',
  roleMiddleware(['keuangan', 'pendistribusian', 'superadmin']),
  laporanController.exportPenerimaan
);

router.get('/distribusi/export',
  roleMiddleware(['keuangan', 'pendistribusian', 'superadmin']),
  laporanController.exportDistribusi
);

router.get('/mustahiq/export',
  roleMiddleware(['pelayanan', 'superadmin']),
  validate(mustahiqExportSchema, 'query'),
  mustahiqController.exportExcel
);

router.get('/muzakki/export',
  roleMiddleware(['keuangan', 'pendistribusian', 'superadmin']),
  validate(muzakkiExportSchema, 'query'),
  muzakkiController.exportExcel
);

// --- Laporan Keuangan (JSON & Export) ---
router.get('/arus-kas',
  roleMiddleware(['keuangan', 'pendistribusian', 'superadmin']),
  laporanController.getArusKas
);

router.get('/arus-kas/export',
  roleMiddleware(['keuangan', 'pendistribusian', 'superadmin']),
  laporanController.exportArusKasPdf
);

router.get('/neraca',
  roleMiddleware(['keuangan', 'pendistribusian', 'superadmin']),
  laporanController.getNeraca
);

router.get('/neraca/export',
  roleMiddleware(['keuangan', 'pendistribusian', 'superadmin']),
  laporanController.exportNeracaPdf
);

router.get('/rekap-tahunan/export',
  roleMiddleware(['keuangan', 'pendistribusian', 'superadmin']),
  laporanController.exportRekapTahunanPdf
);

export default router;
