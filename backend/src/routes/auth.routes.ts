import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validateZod.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authLimiter, apiLimiter } from '../middlewares/rateLimit.middleware';
import * as schemas from '../validations/auth.validation';

const router = Router();

router.post('/register', authLimiter, validate(schemas.registerSchema), authController.register);
router.post('/login', authLimiter, validate(schemas.loginSchema), authController.login);
router.post('/verify-email', authLimiter, validate(schemas.verifyEmailSchema), authController.verifyEmail);
router.post('/forgot', authLimiter, validate(schemas.forgotPasswordSchema), authController.forgotPassword);
router.post('/reset', authLimiter, validate(schemas.resetPasswordSchema), authController.resetPassword);
router.post('/refresh', apiLimiter, validate(schemas.refreshSchema), authController.refresh);

router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.patch('/profile', authenticate, validate(schemas.updateProfileSchema), authController.updateProfile);

export default router;
