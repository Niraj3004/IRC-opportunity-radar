import { Request, Response } from 'express';
import * as trackerService from '../services/tracker.service';
import { sendResponse } from '../utils/response';

export const updateTracker = async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;
    const application = await trackerService.updateApplicationStatus(req.user!.id, req.params.opportunityId as string, status, notes);
    sendResponse(res, 200, application, 'Tracker updated successfully');
  } catch (error: any) {
    sendResponse(res, 500, null, error.message);
  }
};

export const getTrackedApplications = async (req: Request, res: Response) => {
  try {
    const applications = await trackerService.getUserApplications(req.user!.id);
    sendResponse(res, 200, applications, 'Tracked applications fetched successfully');
  } catch (error: any) {
    sendResponse(res, 500, null, error.message);
  }
};
