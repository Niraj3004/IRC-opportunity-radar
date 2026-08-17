import mongoose from 'mongoose';
import { ExtractedOpportunity } from './extractor/schemas';
import Opportunity, { IOpportunity } from '../models/Opportunity';
import { contentHash } from '../utils/contentHash';
import { canonicalUrl } from '../utils/canonicalUrl';

export const processAndDeduplicate = async (
  extractedItems: ExtractedOpportunity[],
  sourceId: mongoose.Types.ObjectId,
  rawExtracts: any[]
): Promise<Partial<IOpportunity>[]> => {
  const newOpportunities: Partial<IOpportunity>[] = [];

  for (let i = 0; i < extractedItems.length; i++) {
    const item = extractedItems[i];
    const raw = rawExtracts[i] || {};

    // 1. Normalise URL
    const rawUrl = item.applyUrl || raw.url || raw.link || '';
    if (!rawUrl) continue; // Skip if we have no URL at all
    const url = canonicalUrl(rawUrl);

    // 2. Normalise title
    const normalisedTitle = (item.title || '').toLowerCase().replace(/\s+/g, ' ').trim();
    if (!normalisedTitle) continue; // Skip if no title

    // 3. Compute dedupeKey
    const dedupeKey = contentHash(`${url}|${normalisedTitle}`);

    // 4. Check for duplicates in DB
    const existing = await Opportunity.findOne({ dedupeKey });
    if (existing) {
      console.log(`[DEDUPE] Skipping duplicate: ${item.title}`);
      continue;
    }
    
    // Fuzzy matching within recency window (30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Basic exact text match on title (case-insensitive) as a fuzzy baseline
    const fuzzyMatch = await Opportunity.findOne({
      title: { $regex: new RegExp(`^${item.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    if (fuzzyMatch) {
       console.log(`[DEDUPE] Skipping fuzzy title duplicate: ${item.title}`);
       continue;
    }

    // 5. Build safe date
    let deadline: Date | undefined;
    if (item.deadline) {
      const parsed = new Date(item.deadline);
      if (!isNaN(parsed.getTime())) {
        deadline = parsed;
      }
    }

    // 6. Push to new opportunities array
    newOpportunities.push({
      title: item.title,
      description: raw.description || undefined,
      type: item.type,
      organization: item.organization || undefined,
      url: url, // canonical
      applyUrl: item.applyUrl || undefined,
      deadline,
      tags: item.tags || [],
      eligibility: item.eligibility || undefined,
      amount: item.amount || undefined,
      sourceId,
      rawExtract: raw,
      confidence: 0.9, // Default, will be recalculated in the scoring phase
      dedupeKey,
      status: 'pending'
    });
  }

  return newOpportunities;
};
