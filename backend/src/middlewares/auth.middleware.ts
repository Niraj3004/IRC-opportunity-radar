import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { StatusCodes } from '../constants/statusCodes';
import { sendResponse } from '../utils/response';
import User from '../models/User';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendResponse(res, StatusCodes.UNAUTHORIZED, null, 'Authentication required');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = verifyAccessToken(token);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return sendResponse(res, StatusCodes.UNAUTHORIZED, null, 'User not found');
    }

    if (user.status === 'suspended') {
      return sendResponse(res, StatusCodes.FORBIDDEN, null, 'Account is suspended');
    }

    if (user.status === 'pending') {
       if (!req.path.includes('/me')) {
           return sendResponse(res, StatusCodes.FORBIDDEN, null, 'Account is pending admin approval');
       }
    }

    req.user = user;
    next();
  } catch (error) {
    return sendResponse(res, StatusCodes.UNAUTHORIZED, null, 'Invalid or expired token');
  }
};
