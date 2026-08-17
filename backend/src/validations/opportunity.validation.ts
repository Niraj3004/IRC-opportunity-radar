import { z } from 'zod';
import { OpportunityTypes } from '../constants/opportunityType';

export const getOpportunitiesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default('1').transform(Number),
    limit: z.string().regex(/^\d+$/).optional().default('10').transform(Number),
    type: z.enum(OpportunityTypes as unknown as [string, ...string[]]).optional(),
    tag: z.string().optional(),
    q: z.string().optional(),
    sort: z.enum(['newest', 'deadline_asc']).optional().default('newest')
  })
});
