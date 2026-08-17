import { Router } from 'express';
import { updateTracker, getTrackedApplications } from '../controllers/tracker.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validateZod.middleware';
import { updateTrackerSchema } from '../validations/tracker.validation';
import { Roles } from '../constants/role.constant';

const router = Router();

router.use(authenticate);
router.use(authorize(Roles.MEMBER));

router.get('/', getTrackedApplications);
router.patch('/:opportunityId', validate(updateTrackerSchema), updateTracker);

export default router;
