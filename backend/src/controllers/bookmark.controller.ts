import { Request, Response } from 'express';
import * as bookmarkService from '../services/bookmark.service';
import { sendResponse } from '../utils/response';

export const toggleBookmark = async (req: Request, res: Response) => {
  try {
    const result = await bookmarkService.toggleBookmark(req.user!.id, req.params.opportunityId as string);
    sendResponse(res, 200, result, result.message);
  } catch (error: any) {
    sendResponse(res, 500, null, error.message);
  }
};

export const getBookmarks = async (req: Request, res: Response) => {
  try {
    const bookmarks = await bookmarkService.getUserBookmarks(req.user!.id);
    sendResponse(res, 200, bookmarks, 'Bookmarks fetched successfully');
  } catch (error: any) {
    sendResponse(res, 500, null, error.message);
  }
};
