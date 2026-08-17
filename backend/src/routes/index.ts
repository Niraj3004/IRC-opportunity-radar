import { Router } from 'express';
import authRoutes from './auth.routes';
import agentRoutes from './agent.routes';
import opportunityRoutes from './opportunity.routes';
import bookmarkRoutes from './bookmark.routes';
import trackerRoutes from './tracker.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/agent', agentRoutes);
router.use('/opportunities', opportunityRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/tracker', trackerRoutes);

export default router;
