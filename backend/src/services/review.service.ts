import Opportunity from '../models/Opportunity';
import AuditLog from '../models/AuditLog';
import { postSaveRouting } from '../agent/scorer';

export const getPendingOpportunities = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Opportunity.find({ status: 'pending' })
      .sort({ createdAt: 1 }) // oldest first for queue
      .skip(skip)
      .limit(limit)
      .lean(),
    Opportunity.countDocuments({ status: 'pending' })
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const reviewOpportunity = async (
  opportunityId: string,
  curatorId: string,
  action: 'approve' | 'reject',
  reason?: string,
  fields?: any
) => {
  const opp = await Opportunity.findById(opportunityId);
  if (!opp) {
    throw new Error('Opportunity not found');
  }
  if (opp.status !== 'pending') {
    throw new Error(`Opportunity is already ${opp.status}`);
  }

  if (action === 'approve') {
    if (fields) {
      Object.assign(opp, fields);
    }
    opp.status = 'published';
    opp.publishedAt = new Date();
    opp.reviewedBy = curatorId as any;
    await opp.save();
    
    // Notify users
    await postSaveRouting(opp as any);

  } else if (action === 'reject') {
    opp.status = 'rejected';
    opp.reviewedBy = curatorId as any;
    await opp.save();
  }

  await AuditLog.create({
    actorId: curatorId,
    action: `opportunity_${action}`,
    entityType: 'Opportunity',
    entityId: opp._id,
    meta: { reason, updatedFields: Object.keys(fields || {}) }
  });

  return opp;
};
