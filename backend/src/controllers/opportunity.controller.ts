import { Request, Response } from 'express';
import * as opportunityService from '../services/opportunity.service';
import { sendResponse } from '../utils/response';

export const getOpportunities = async (req: Request, res: Response) => {
  const data = await opportunityService.getPublishedOpportunities(req.query);
  sendResponse(res, 200, data, 'Opportunities fetched successfully');
};

export const getOpportunityById = async (req: Request, res: Response) => {
  try {
    const opp = await opportunityService.getOpportunityById(req.params.id as string);
    sendResponse(res, 200, opp, 'Opportunity fetched successfully');
  } catch (error: any) {
    sendResponse(res, 404, null, error.message);
  }
};
