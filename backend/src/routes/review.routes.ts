import { Router } from 'express';
import { getPending, reviewAction } from '../controllers/review.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validateZod.middleware';
import { getPendingQuerySchema, reviewActionSchema } from '../validations/review.validation';
import { Roles } from '../constants/role.constant';

const router = Router();

router.use(authenticate);
router.use(authorize(Roles.CURATOR, Roles.ADMIN, Roles.SUPER_ADMIN));

router.get('/', validate(getPendingQuerySchema), getPending);
router.patch('/:id', validate(reviewActionSchema), reviewAction);

export default router;
