import { huntItems } from '@/db/schema';
import { InferSelectModel } from 'drizzle-orm';
import { z } from 'zod';

export const HuntItemSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().optional(),
  hint: z.string().optional(),
  imageUrl: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
});

export type HuntItemFormData = z.infer<typeof HuntItemSchema>;

export type ScavengerHuntItem = InferSelectModel<typeof huntItems>;
