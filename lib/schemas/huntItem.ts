import { huntItems } from '@/db/schema';
import { InferSelectModel } from 'drizzle-orm';
import { z } from 'zod';

export const HuntItemSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().optional(),
  hint: z.string().optional(),
  imageUrl: z.string().optional(),
  lat: z
    .number()
    .min(-90)
    .max(90)
    .transform((val) => val.toString()),
  lng: z
    .number()
    .min(-180)
    .max(180)
    .transform((val) => val.toString()),
  itemType: z.enum(['critter', 'art', 'other']),
});

export type HuntItemFormData = z.infer<typeof HuntItemSchema>;

export type ScavengerHuntItem = InferSelectModel<typeof huntItems>;
