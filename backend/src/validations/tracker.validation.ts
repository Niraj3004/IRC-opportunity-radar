import { z } from 'zod';

export const updateTrackerSchema = z.object({
  body: z.object({
    status: z.enum(['interested', 'applying', 'applied', 'submitted', 'won', 'rejected']),
    notes: z.string().optional()
  })
});
