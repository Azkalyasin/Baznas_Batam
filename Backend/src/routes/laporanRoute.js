import express from 'express';
import mustahiqController from '../controllers/mustahiqController.js';
import validate from '../middlewares/validateMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import { queryExportSchema } from '../validations/mustahiqValidation.js';

const router = express.Router();

// Semua route laporan wajib terautentikasi
router.use(authMiddleware);

// Export mustahiq ke Excel (pelayanan, superadmin)
router.get('/mustahiq/export',
  roleMiddleware(['pelayanan', 'superadmin']),
  validate(queryExportSchema, 'query'),
  mustahiqController.exportExcel
);

export default router;
