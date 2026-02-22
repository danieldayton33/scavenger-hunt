import { huntParticipants, huntStatusEnum, scavengerHunts, submissions } from '@/db/schema';
import { InferSelectModel } from 'drizzle-orm';
import { z } from 'zod';
import { ScavengerHuntItem } from './huntItem';

export const HuntSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  startAt: z.string(),
  endAt: z.string(),
  status: z.enum(huntStatusEnum.enumValues),
});

export type HuntFormData = z.infer<typeof HuntSchema>;

export type ScavengerHunt = InferSelectModel<typeof scavengerHunts>;

export type HuntStatus = (typeof huntStatusEnum.enumValues)[number];

export type HuntParticipant = InferSelectModel<typeof huntParticipants>;
export type Submission = InferSelectModel<typeof submissions>;

export type ScavengerHuntWithItems = ScavengerHunt & {
  items: ScavengerHuntItem[];
  participants: HuntParticipant[];
  submissions: Submission[];
};
