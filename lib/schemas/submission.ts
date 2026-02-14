import { submissions } from '@/db/schema';
import { InferSelectModel } from 'drizzle-orm';
import { z } from 'zod';

export const SubmissionSchema = z.object({
  huntId: z.number(),
  itemId: z.number(),
  imageUrl: z.string().url('Must be a valid URL').optional(),
  comment: z.string().optional(),
  lat: z
    .union([
      z.string().transform((val) => {
        if (val === '') return undefined;
        const num = parseFloat(val);
        return isNaN(num) ? undefined : num;
      }),
      z.number(),
    ])
    .optional(),
  lng: z
    .union([
      z.string().transform((val) => {
        if (val === '') return undefined;
        const num = parseFloat(val);
        return isNaN(num) ? undefined : num;
      }),
      z.number(),
    ])
    .optional(),
  accuracyMeters: z
    .union([
      z.string().transform((val) => {
        if (val === '') return undefined;
        const num = parseFloat(val);
        return isNaN(num) ? undefined : num;
      }),
      z.number(),
    ])
    .optional(),
});

export const SubmissionFormInputSchema = z.object({
  imageUrl: z.string().url('Must be a valid URL').optional(),
  comment: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  accuracyMeters: z.number().optional(),
});

export type SubmissionFormData = z.infer<typeof SubmissionSchema>;

export type SubmissionFormInputData = z.infer<typeof SubmissionFormInputSchema>;

export type Submission = InferSelectModel<typeof submissions>;
