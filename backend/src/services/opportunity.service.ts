import Opportunity from '../models/Opportunity';
import mongoose from 'mongoose';

export const getPublishedOpportunities = async (query: any) => {
  const { page = 1, limit = 10, type, tag, q, sort } = query;
  
  const filter: any = { status: 'published' };
  
  if (type) filter.type = type;
  if (tag) filter.tags = { $in: [tag] };

  let sortObj: any = { publishedAt: -1 };
  if (sort === 'deadline_asc') {
    sortObj = { deadline: 1 };
    filter.deadline = { $ne: null }; 
  }

  const skip = (Number(page) - 1) * Number(limit);

  // If no search query, do standard database pagination
  if (!q) {
    const [items, total] = await Promise.all([
      Opportunity.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .select('-rawExtract -dedupeKey')
        .populate('sourceId', 'name url type')
        .lean(),
      Opportunity.countDocuments(filter)
    ]);

    return {
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  // SEMANTIC SEARCH
  const { generateEmbedding } = await import('../agent/extractor/embeddings');
  const queryEmbedding = await generateEmbedding(q as string);
  
  // If API fails to generate embedding, fallback to keyword search
  if (!queryEmbedding || queryEmbedding.length === 0) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { organization: { $regex: q, $options: 'i' } }
    ];
    
    const [items, total] = await Promise.all([
      Opportunity.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .select('-rawExtract -dedupeKey')
        .populate('sourceId', 'name url type')
        .lean(),
      Opportunity.countDocuments(filter)
    ]);
    return {
      items,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) }
    };
  }

  // Perform In-Memory Cosine Similarity
  const allOpps = await Opportunity.find(filter)
    .select('-rawExtract -dedupeKey')
    .populate('sourceId', 'name url type')
    .lean();
  
  const scoredOpps = allOpps.map(opp => {
    let score = 0;
    if (opp.embedding && opp.embedding.length === queryEmbedding.length) {
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      for (let i = 0; i < queryEmbedding.length; i++) {
        dotProduct += queryEmbedding[i] * opp.embedding[i];
        normA += queryEmbedding[i] * queryEmbedding[i];
        normB += opp.embedding[i] * opp.embedding[i];
      }
      if (normA > 0 && normB > 0) {
        score = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
      }
    }
    return { ...opp, score };
  });

  // Sort by highest similarity
  scoredOpps.sort((a, b) => b.score - a.score);
  
  // Filter out low relevance (e.g. < 0.4)
  const relevantOpps = scoredOpps.filter(opp => opp.score > 0.4);

  // Paginate manually
  const paginatedOpps = relevantOpps.slice(skip, skip + Number(limit));

  return {
    items: paginatedOpps,
    pagination: {
      total: relevantOpps.length,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(relevantOpps.length / Number(limit))
    }
  };
};

export const getOpportunityById = async (id: string) => {
  const opp = await Opportunity.findOne({ _id: id, status: 'published' })
    .select('-rawExtract -dedupeKey')
    .populate('sourceId', 'name url type')
    .lean();
    
  if (!opp) {
    throw new Error('Opportunity not found');
  }
  return opp;
};
