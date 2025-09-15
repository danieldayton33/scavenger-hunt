import { scavengerHunts } from '@/db/schema';
import { InferSelectModel } from 'drizzle-orm';
import { z } from 'zod';

export const HuntSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().optional(),
  startAt: z.string(),
  endAt: z.string(),
  isPublished: z.boolean().default(false),
});

export type HuntFormData = z.infer<typeof HuntSchema>;

export type ScavengerHunt = InferSelectModel<typeof scavengerHunts>;
