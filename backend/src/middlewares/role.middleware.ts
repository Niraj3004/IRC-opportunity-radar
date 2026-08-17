import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from '../constants/statusCodes';
import { sendResponse } from '../utils/response';
import { RoleHierarchy } from '../constants/role.constant';

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return sendResponse(res, StatusCodes.UNAUTHORIZED, null, 'Authentication required');
    }

    const userRoleIndex = RoleHierarchy.indexOf(req.user.role);
    
    // Check if user's role is at least as high as any of the allowed roles
    const hasPermission = allowedRoles.some(role => {
      const allowedRoleIndex = RoleHierarchy.indexOf(role);
      return userRoleIndex >= allowedRoleIndex;
    });

    if (!hasPermission) {
      return sendResponse(res, StatusCodes.FORBIDDEN, null, 'Insufficient permissions');
    }

    next();
  };
};
