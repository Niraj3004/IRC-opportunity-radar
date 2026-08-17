import { z } from 'zod';
import { SourceTypes } from '../constants/sourceType';

export const createSourceSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    url: z.string().url(),
    type: z.enum(SourceTypes as unknown as [string, ...string[]]),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    fetchFrequency: z.string().default('0 0 * * *'),
    config: z.any().optional()
  })
});

export const updateMemberStatusSchema = z.object({
  body: z.object({
    status: z.enum(['active', 'suspended', 'pending']).optional(),
    role: z.enum(['member', 'curator', 'admin', 'super_admin']).optional()
  })
});
