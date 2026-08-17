import Opportunity from '../models/Opportunity';
import mongoose from 'mongoose';

export const getPublishedOpportunities = async (query: any) => {
  const { page, limit, type, tag, q, sort } = query;
  
  const filter: any = { status: 'published' };
  
  if (type) filter.type = type;
  if (tag) filter.tags = { $in: [tag] };
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { organization: { $regex: q, $options: 'i' } }
    ];
  }

  let sortObj: any = { publishedAt: -1 };
  if (sort === 'deadline_asc') {
    sortObj = { deadline: 1 };
    filter.deadline = { $ne: null }; // Only sort items that have a deadline
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Opportunity.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .select('-rawExtract -dedupeKey') // hide large internal fields
      .lean(),
    Opportunity.countDocuments(filter)
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

export const getOpportunityById = async (id: string) => {
  const opp = await Opportunity.findOne({ _id: id, status: 'published' })
    .select('-rawExtract -dedupeKey')
    .lean();
    
  if (!opp) {
    throw new Error('Opportunity not found');
  }
  return opp;
};
