import { IOpportunity } from '../models/Opportunity';
import { env } from '../config/env.config';
import { notifyMatches } from '../services/notification.service';

/**
 * Scores and updates the confidence and status of the opportunity inline.
 * If confidence >= AUTO_PUBLISH_THRESHOLD, sets status to 'published'.
 * Note: The document must be saved by the caller afterwards.
 */
export const scoreAndRoute = (opportunity: Partial<IOpportunity>): void => {
  let score = 0;
  const weights = {
    title: 0.3,
    type: 0.2,
    deadline: 0.2,
    applyUrl: 0.2,
    organization: 0.1
  };

  if (opportunity.title && opportunity.title.length > 3) score += weights.title;
  if (opportunity.type) score += weights.type;
  if (opportunity.deadline && opportunity.deadline instanceof Date) score += weights.deadline;
  if (opportunity.applyUrl && opportunity.applyUrl.startsWith('http')) score += weights.applyUrl;
  if (opportunity.organization && opportunity.organization.length > 2) score += weights.organization;

  // Additional penalty if extraction indicates severe issues
  if (opportunity.title?.toLowerCase().includes('unknown')) {
    score -= 0.5;
  }

  opportunity.confidence = Math.max(0, Math.min(1, score));

  // Determine routing (Hold for Drip Publishing)
  const threshold = parseFloat(env.AUTO_PUBLISH_THRESHOLD || '0.8');
  if (opportunity.confidence >= threshold) {
    opportunity.status = 'approved'; // Replaced 'published' for human-illusion drip feed
  } else {
    opportunity.status = 'pending';
  }
};

/**
 * Post-save hook to trigger notifications if it was published
 */
export const postSaveRouting = async (savedDoc: IOpportunity): Promise<void> => {
  if (savedDoc.status === 'published') {
    await notifyMatches(savedDoc);
  }
};
