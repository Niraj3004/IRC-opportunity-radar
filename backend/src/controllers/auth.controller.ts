import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendResponse } from '../utils/response';
import { StatusCodes } from '../constants/statusCodes';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    return sendResponse(res, StatusCodes.CREATED, result);
  } catch (error: any) {
    return sendResponse(res, StatusCodes.BAD_REQUEST, null, error.message);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    return sendResponse(res, StatusCodes.OK, result);
  } catch (error: any) {
    return sendResponse(res, StatusCodes.UNAUTHORIZED, null, error.message);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.verifyEmail(req.body.token);
    return sendResponse(res, StatusCodes.OK, result);
  } catch (error: any) {
    return sendResponse(res, StatusCodes.BAD_REQUEST, null, error.message);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    return sendResponse(res, StatusCodes.OK, result);
  } catch (error: any) {
    return sendResponse(res, StatusCodes.BAD_REQUEST, null, error.message);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.resetPassword(req.body);
    return sendResponse(res, StatusCodes.OK, result);
  } catch (error: any) {
    return sendResponse(res, StatusCodes.BAD_REQUEST, null, error.message);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    return sendResponse(res, StatusCodes.OK, result);
  } catch (error: any) {
    return sendResponse(res, StatusCodes.UNAUTHORIZED, null, error.message);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.getMe(req.user.id);
    return sendResponse(res, StatusCodes.OK, result);
  } catch (error: any) {
    return sendResponse(res, StatusCodes.NOT_FOUND, null, error.message);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.logout(req.user.id);
    return sendResponse(res, StatusCodes.OK, result);
  } catch (error: any) {
    return sendResponse(res, StatusCodes.BAD_REQUEST, null, error.message);
  }
};
