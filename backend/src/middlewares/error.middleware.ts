import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from '../constants/statusCodes';
import { Messages } from '../constants/messages';

export const asyncErrorHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || Messages.INTERNAL_SERVER_ERROR;
  
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
