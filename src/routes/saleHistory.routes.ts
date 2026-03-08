import { Router } from 'express';
import { create, getAll, getById, getByTransactionId, update, remove } from '../controllers/saleHistory.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createSaleSchema, getSalesQuerySchema, updateSaleSchema } from '../validations/saleHistory.validation';

const router = Router();

router.use(protect);

router.get('/', validate(getSalesQuerySchema), getAll);
router.get('/transaction/:txnId', getByTransactionId);
router.get('/:id', getById);
router.post('/', validate(createSaleSchema), create);
router.put('/:id', validate(updateSaleSchema), update);
router.delete('/:id', remove);

export default router;
