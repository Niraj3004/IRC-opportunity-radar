import { Router, Request, Response } from 'express';
import { runAgentPipeline } from '../agent/pipeline';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { sendResponse } from '../utils/response';
import { Roles } from '../constants/role.constant';

const router = Router();

router.post(
  '/trigger',
  authenticate,
  authorize(Roles.ADMIN),
  async (req: Request, res: Response) => {
    try {
      // Run asynchronously in the background so we don't block the HTTP request
      runAgentPipeline().catch(err => console.error('Agent Pipeline Error:', err));
      
      sendResponse(res, 202, null, 'Agent pipeline triggered in the background');
    } catch (error: any) {
      sendResponse(res, 500, null, error.message);
    }
  }
);

export default router;
