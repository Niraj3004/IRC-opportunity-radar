import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { StatusCodes } from '../constants/statusCodes';
import { sendResponse } from '../utils/response';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendResponse(res, StatusCodes.UNAUTHORIZED, null, 'Authentication required');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return sendResponse(res, StatusCodes.UNAUTHORIZED, null, 'Invalid or expired token');
  }
};
