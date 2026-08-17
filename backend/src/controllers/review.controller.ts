import { Request, Response } from 'express';
import * as reviewService from '../services/review.service';
import { sendResponse } from '../utils/response';

export const getPending = async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query as any;
    const data = await reviewService.getPendingOpportunities(page, limit);
    sendResponse(res, 200, data, 'Pending opportunities fetched');
  } catch (error: any) {
    sendResponse(res, 500, null, error.message);
  }
};

export const reviewAction = async (req: Request, res: Response) => {
  try {
    const { action, reason, fields } = req.body;
    const opp = await reviewService.reviewOpportunity(
      req.params.id as string,
      req.user!.id,
      action,
      reason,
      fields
    );
    sendResponse(res, 200, opp, `Opportunity ${action}d successfully`);
  } catch (error: any) {
    sendResponse(res, 400, null, error.message);
  }
};
