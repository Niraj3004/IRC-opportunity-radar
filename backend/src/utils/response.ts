import { Response } from 'express';
import { StatusCodes } from '../constants/statusCodes';
import { Messages } from '../constants/messages';

export const sendResponse = (
  res: Response,
  statusCode: number = StatusCodes.OK,
  data: any = null,
  message: string = Messages.SUCCESS
) => {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
  });
};
