import { Router } from 'express';
import { toggleBookmark, getBookmarks } from '../controllers/bookmark.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { Roles } from '../constants/role.constant';

const router = Router();

router.use(authenticate);
router.use(authorize(Roles.MEMBER));

router.get('/', getBookmarks);
router.post('/:opportunityId', toggleBookmark);

export default router;
