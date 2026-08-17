import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';
import { sendResponse } from '../utils/response';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await notificationService.getUserNotifications(req.user!.id, page, limit);
    sendResponse(res, 200, data, 'Notifications fetched successfully');
  } catch (error: any) {
    sendResponse(res, 500, null, error.message);
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notif = await notificationService.markAsRead(req.user!.id, req.params.id as string);
    sendResponse(res, 200, notif, 'Notification marked as read');
  } catch (error: any) {
    sendResponse(res, 404, null, error.message);
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    await notificationService.markAllAsRead(req.user!.id);
    sendResponse(res, 200, null, 'All notifications marked as read');
  } catch (error: any) {
    sendResponse(res, 500, null, error.message);
  }
};
