import { Router } from 'express';
import { analytics } from '../controllers/analytics.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { analyticsQuerySchema } from '../validations/analytics.validation';

const router = Router();

router.use(protect);

router.get('/', validate(analyticsQuerySchema,'query'), analytics);

export default router;

