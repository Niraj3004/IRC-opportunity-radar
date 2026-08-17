import { Router } from 'express';
import authRoutes from './auth.routes';
import agentRoutes from './agent.routes';
import opportunityRoutes from './opportunity.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/agent', agentRoutes);
router.use('/opportunities', opportunityRoutes);

export default router;
