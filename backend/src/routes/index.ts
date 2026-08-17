import { Router } from 'express';
import authRoutes from './auth.routes';
import agentRoutes from './agent.routes';
import opportunityRoutes from './opportunity.routes';
import bookmarkRoutes from './bookmark.routes';
import trackerRoutes from './tracker.routes';
import reviewRoutes from './review.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/agent', agentRoutes);
router.use('/opportunities', opportunityRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/tracker', trackerRoutes);
router.use('/review', reviewRoutes);
router.use('/notifications', notificationRoutes);

export default router;
