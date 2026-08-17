import { Request, Response } from 'express';
import * as adminService from '../services/admin.service';
import { sendResponse } from '../utils/response';

export const createSource = async (req: Request, res: Response) => {
  try {
    const source = await adminService.createSource(req.body, req.user!.id);
    sendResponse(res, 201, source, 'Source created');
  } catch (error: any) { sendResponse(res, 400, null, error.message); }
};

export const getSources = async (req: Request, res: Response) => {
  try {
    const sources = await adminService.getSources();
    sendResponse(res, 200, sources, 'Sources fetched');
  } catch (error: any) { sendResponse(res, 500, null, error.message); }
};

export const getSourceById = async (req: Request, res: Response) => {
  try {
    const source = await adminService.getSourceById(req.params.id as string);
    sendResponse(res, 200, source, 'Source fetched');
  } catch (error: any) { sendResponse(res, 404, null, error.message); }
};

export const updateSource = async (req: Request, res: Response) => {
  try {
    const source = await adminService.updateSource(req.params.id as string, req.body);
    sendResponse(res, 200, source, 'Source updated');
  } catch (error: any) { sendResponse(res, 400, null, error.message); }
};

export const deleteSource = async (req: Request, res: Response) => {
  try {
    await adminService.deleteSource(req.params.id as string);
    sendResponse(res, 200, null, 'Source deleted');
  } catch (error: any) { sendResponse(res, 400, null, error.message); }
};

export const testFetchSource = async (req: Request, res: Response) => {
  try {
    const result = await adminService.testFetchSource(req.params.id as string);
    sendResponse(res, 200, result, 'Source tested successfully');
  } catch (error: any) { sendResponse(res, 500, null, error.message); }
};

export const getSourceLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await adminService.getSourceLogs(req.params.id as string, page, limit);
    sendResponse(res, 200, data, 'Source logs fetched');
  } catch (error: any) { sendResponse(res, 500, null, error.message); }
};

export const getMembers = async (req: Request, res: Response) => {
  try {
    const members = await adminService.getMembers();
    sendResponse(res, 200, members, 'Members fetched');
  } catch (error: any) { sendResponse(res, 500, null, error.message); }
};

export const updateMember = async (req: Request, res: Response) => {
  try {
    const member = await adminService.updateMember(req.params.id as string, req.body, req.user!.id);
    sendResponse(res, 200, member, 'Member updated');
  } catch (error: any) { sendResponse(res, 400, null, error.message); }
};

export const getKPIs = async (req: Request, res: Response) => {
  try {
    const kpis = await adminService.getKPIs();
    sendResponse(res, 200, kpis, 'KPIs fetched');
  } catch (error: any) { sendResponse(res, 500, null, error.message); }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const data = await adminService.getAuditLogs(page, limit);
    sendResponse(res, 200, data, 'Audit logs fetched');
  } catch (error: any) { sendResponse(res, 500, null, error.message); }
};
