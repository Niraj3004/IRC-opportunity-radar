import { Request, Response } from 'express';
import * as ics from 'ics';
import Opportunity from '../models/Opportunity';
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
export const generateCalendar = async (req: Request, res: Response) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) throw new Error('Opportunity not found');
    
    if (!opp.deadline) throw new Error('Opportunity has no deadline');

    const deadline = new Date(opp.deadline);
    const event = {
      start: [deadline.getFullYear(), deadline.getMonth() + 1, deadline.getDate()] as [number, number, number],
      duration: { hours: 24 },
      title: `Deadline: ${opp.title}`,
      description: `Apply here: ${opp.url}`,
      url: opp.url,
    };

    ics.createEvent(event, (error, value) => {
      if (error) {
        return res.status(500).json({ success: false, message: 'Failed to generate calendar' });
      }

      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', `attachment; filename=deadline-${opp._id}.ics`);
      return res.status(200).send(value);
    });
  } catch (error: any) {
    sendResponse(res, 404, null, error.message);
  }
};
