import { z } from 'zod';
import { OpportunityTypes } from '../constants/opportunityType';

export const reviewActionSchema = z.object({
  body: z.object({
    action: z.enum(['approve', 'reject']),
    reason: z.string().optional(),
    fields: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      type: z.enum(OpportunityTypes as unknown as [string, ...string[]]).optional(),
      organization: z.string().optional(),
      applyUrl: z.string().url().optional(),
      deadline: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
      tags: z.array(z.string()).optional()
    }).optional()
  })
});

export const getPendingQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default('1').transform(Number),
    limit: z.string().regex(/^\d+$/).optional().default('20').transform(Number)
  })
});
