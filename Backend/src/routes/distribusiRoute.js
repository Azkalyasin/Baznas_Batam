import express from 'express';
import distribusiController from '../controllers/distribusiController.js';
import validate from '../middlewares/validateMiddleware.js';
import { 
  createDistribusiSchema, 
  updateDistribusiSchema, 
  queryDistribusiSchema 
} from '../validations/distribusiValidation.js';
import { idParamSchema } from '../validations/shared.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Semua route butuh login
router.use(authMiddleware);

router.get('/', 
  roleMiddleware(['keuangan', 'pendistribusian', 'superadmin']),
  validate(queryDistribusiSchema, 'query'), 
  distribusiController.getAll
);

router.get('/stats', 
  roleMiddleware(['keuangan', 'pendistribusian', 'superadmin']),
  distribusiController.getStats
);

router.get('/rekap/harian', 
  roleMiddleware(['keuangan', 'pendistribusian', 'superadmin']),
  distribusiController.rekapHarian
);

router.get('/rekap/bulanan', 
  roleMiddleware(['keuangan', 'pendistribusian', 'superadmin']),
  distribusiController.rekapBulanan
);

router.get('/rekap/tahunan', 
  roleMiddleware(['keuangan', 'pendistribusian', 'superadmin']),
  distribusiController.rekapTahunan
);

router.get('/:id', 
  roleMiddleware(['keuangan', 'pendistribusian', 'superadmin']),
  validate(idParamSchema, 'params'), 
  distribusiController.getById
);

router.get('/:id/cetak', 
  roleMiddleware(['keuangan', 'pendistribusian', 'superadmin']),
  validate(idParamSchema, 'params'), 
  distribusiController.cetakBuktiPenyaluran
);

router.post('/', 
  roleMiddleware(['superadmin']), 
  validate(createDistribusiSchema), 
  distribusiController.create
);

router.put('/:id', 
  roleMiddleware(['superadmin']), 
  validate(idParamSchema, 'params'), 
  validate(updateDistribusiSchema), 
  distribusiController.update
);

router.delete('/:id', 
  roleMiddleware(['superadmin']), 
  validate(idParamSchema, 'params'), 
  distribusiController.destroy
);

export default router;
