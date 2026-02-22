'use server';
import { db } from '@/db';
import { scavengerHunts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ScavengerHuntWithItems } from '@/lib/schemas/hunt';
import { cacheTag } from 'next/cache';

const getHuntBySlug = async (
  slug: string
): Promise<
  | ScavengerHuntWithItems
  | {
      error: string;
    }
> => {
  'use cache';
  cacheTag(`hunt-${slug}`);
  console.log('slug', slug);
  try {
    const hunt = await db.query.scavengerHunts.findFirst({
      where: eq(scavengerHunts.slug, slug),
      with: {
        items: true,
        participants: true,
        submissions: true,
      },
    });
    if (!hunt) {
      return { error: 'Hunt not found' };
    }
    return hunt;
  } catch (error) {
    console.error('Error fetching hunt:', error);
    return { error: 'Internal server error' };
  }
};

export default getHuntBySlug;
