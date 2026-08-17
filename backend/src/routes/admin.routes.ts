import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validateZod.middleware';
import { createSourceSchema, updateMemberStatusSchema } from '../validations/admin.validation';
import { Roles } from '../constants/role.constant';

const router = Router();

router.use(authenticate);

// Sources CRUD (Admin+)
router.post('/sources', authorize(Roles.ADMIN, Roles.SUPER_ADMIN), validate(createSourceSchema), adminController.createSource);
router.get('/sources', authorize(Roles.ADMIN, Roles.SUPER_ADMIN), adminController.getSources);
router.get('/sources/:id', authorize(Roles.ADMIN, Roles.SUPER_ADMIN), adminController.getSourceById);
router.patch('/sources/:id', authorize(Roles.ADMIN, Roles.SUPER_ADMIN), adminController.updateSource);
router.delete('/sources/:id', authorize(Roles.SUPER_ADMIN), adminController.deleteSource);

// Test Fetch
router.post('/sources/:id/test', authorize(Roles.ADMIN, Roles.SUPER_ADMIN), adminController.testFetchSource);

// Logs
router.get('/sources/:id/logs', authorize(Roles.ADMIN, Roles.SUPER_ADMIN), adminController.getSourceLogs);
router.get('/audit-logs', authorize(Roles.SUPER_ADMIN), adminController.getAuditLogs);

// Members
router.get('/members', authorize(Roles.ADMIN, Roles.SUPER_ADMIN), adminController.getMembers);
router.patch('/members/:id', authorize(Roles.ADMIN, Roles.SUPER_ADMIN), validate(updateMemberStatusSchema), adminController.updateMember);

// KPIs
router.get('/kpis', authorize(Roles.ADMIN, Roles.SUPER_ADMIN), adminController.getKPIs);

export default router;
