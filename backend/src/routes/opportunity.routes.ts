import { Router } from 'express';
import { getOpportunities, getOpportunityById } from '../controllers/opportunity.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validateZod.middleware';
import { getOpportunitiesSchema } from '../validations/opportunity.validation';
import { Roles } from '../constants/role.constant';

const router = Router();

// Members only access
router.use(authenticate);
router.use(authorize(Roles.MEMBER));

router.get(
  '/',
  validate(getOpportunitiesSchema),
  getOpportunities
);

router.get('/:id', getOpportunityById);

export default router;
