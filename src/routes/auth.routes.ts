import { Router } from 'express';
import {
    register,
    login,
    refreshToken,
    getMe,
    logout,
} from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
} from '../validations/auth.validation';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
