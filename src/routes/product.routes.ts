import { Router } from 'express';
import { create, getAll, getById, update, remove } from '../controllers/product.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createProductSchema, getProductsQuerySchema, updateProductSchema } from '../validations/product.validation';

const router = Router();
//router.use(protect);
router.get('/', protect, validate(getProductsQuerySchema), getAll);
router.get('/:id', protect, getById);
router.post('/', protect, validate(createProductSchema), create);
router.put('/:id', protect, validate(updateProductSchema), update);
router.delete('/:id', protect, remove);

export default router;
