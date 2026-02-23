import express from 'express';
import mustahiqController from '../controllers/mustahiqController.js';
import muzakkiController from '../controllers/muzakkiController.js';
import validate from '../middlewares/validateMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import { queryExportSchema as mustahiqExportSchema } from '../validations/mustahiqValidation.js';
import { queryExportSchema as muzakkiExportSchema } from '../validations/muzakkiValidation.js';

const router = express.Router();

// Semua route laporan wajib terautentikasi
router.use(authMiddleware);

// Export mustahiq ke Excel (pelayanan, superadmin)
router.get('/mustahiq/export',
  roleMiddleware(['pelayanan', 'superadmin']),
  validate(mustahiqExportSchema, 'query'),
  mustahiqController.exportExcel
);

// Export muzakki ke Excel (keuangan, pendistribusian, superadmin)
router.get('/muzakki/export',
  roleMiddleware(['keuangan', 'pendistribusian', 'superadmin']),
  validate(muzakkiExportSchema, 'query'),
  muzakkiController.exportExcel
);

export default router;
