import { z } from 'zod';
import { OpportunityTypes } from '../../constants/opportunityType';

export const opportunityExtractionSchema = z.object({
  title: z.string(),
  type: z.enum(OpportunityTypes),
  organization: z.string().optional(),
  deadline: z.string().optional().describe("ISO date string if available, else null"),
  applyUrl: z.string().url().optional(),
  eligibility: z.string().optional(),
  amount: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export type ExtractedOpportunity = z.infer<typeof opportunityExtractionSchema>;
