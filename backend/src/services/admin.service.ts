import Source from '../models/Source';
import User from '../models/User';
import FetchLog from '../models/FetchLog';
import Opportunity from '../models/Opportunity';
import AuditLog from '../models/AuditLog';
import { fetchSourceContent } from '../agent/fetchers';
import { extractData } from '../agent/extractor';

export const createSource = async (data: any, adminId: string) => {
  return await Source.create({ ...data, createdBy: adminId });
};

export const getSources = async () => {
  return await Source.find().sort({ createdAt: -1 }).lean();
};

export const getSourceById = async (id: string) => {
  return await Source.findById(id).lean();
};

export const updateSource = async (id: string, data: any) => {
  return await Source.findByIdAndUpdate(id, data, { new: true }).lean();
};

export const deleteSource = async (id: string) => {
  return await Source.findByIdAndDelete(id);
};

export const testFetchSource = async (sourceId: string) => {
  const source = await Source.findById(sourceId);
  if (!source) throw new Error('Source not found');

  console.log(`[TEST FETCH] Testing source: ${source.name}`);
  const fetchResult = await fetchSourceContent(source);
  
  if (source.type === 'html') {
    const { extractedItems, rawExtracts } = await extractData(source, fetchResult);
    return {
      fetchHash: fetchResult.hash,
      extractedCount: extractedItems.length,
      extractedItems,
      rawExtracts
    };
  } else {
    const { extractedItems } = await extractData(source, fetchResult);
    return {
      fetchHash: fetchResult.hash,
      extractedCount: extractedItems.length,
      extractedItems
    };
  }
};

import { processSingleSource } from '../agent/pipeline';

export const forceFetchSource = async (sourceId: string, adminId: string) => {
  const source = await Source.findById(sourceId);
  if (!source) throw new Error('Source not found');
  
  await AuditLog.create({
    actorId: adminId,
    action: 'force_fetch_source',
    entityType: 'Source',
    entityId: source._id
  });

  return await processSingleSource(source);
};

export const getSourceLogs = async (sourceId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    FetchLog.find({ sourceId }).sort({ startedAt: -1 }).skip(skip).limit(limit).lean(),
    FetchLog.countDocuments({ sourceId })
  ]);
  return { items, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const getMembers = async () => {
  return await User.find().select('-passwordHash').sort({ createdAt: -1 }).lean();
};

export const updateMember = async (userId: string, data: any, adminId: string) => {
  const user = await User.findByIdAndUpdate(userId, data, { new: true }).select('-passwordHash');
  await AuditLog.create({
    actorId: adminId,
    action: 'update_member',
    entityType: 'User',
    entityId: userId,
    meta: data
  });
  return user;
};

export const getKPIs = async () => {
  const [totalUsers, pendingUsers, totalSources, activeSources, publishedOpps, pendingOpps] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: 'pending' }),
    Source.countDocuments(),
    Source.countDocuments({ enabled: true }),
    Opportunity.countDocuments({ status: 'published' }),
    Opportunity.countDocuments({ status: 'pending' })
  ]);

  return {
    users: { total: totalUsers, pending: pendingUsers },
    sources: { total: totalSources, active: activeSources },
    opportunities: { published: publishedOpps, pending: pendingOpps }
  };
};

export const getAuditLogs = async (page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    AuditLog.find().populate('actorId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AuditLog.countDocuments()
  ]);
  return { items, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};
