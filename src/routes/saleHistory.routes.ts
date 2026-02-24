import { Router } from 'express';
import { create, getAll, getById, getByTransactionId } from '../controllers/saleHistory.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createSaleSchema, getSalesQuerySchema } from '../validations/saleHistory.validation';

const router = Router();

router.use(protect);

router.get('/', validate(getSalesQuerySchema), getAll);
router.get('/transaction/:txnId', getByTransactionId);
router.get('/:id', getById);
router.post('/', validate(createSaleSchema), create);

export default router;
