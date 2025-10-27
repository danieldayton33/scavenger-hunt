'use server';
import { db } from '@/db';
import { huntItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ScavengerHuntItem } from '@/lib/schemas/huntItem';

const getHuntItemById = async (
  id: number
): Promise<
  | ScavengerHuntItem
  | {
      error: string;
    }
> => {
  try {
    const item = await db.query.huntItems.findFirst({
      where: eq(huntItems.id, id),
    });
    if (!item) {
      return { error: 'Hunt item not found' };
    }
    return item;
  } catch (error) {
    console.error('Error fetching hunt item:', error);
    return { error: 'Internal server error' };
  }
};
export default getHuntItemById;
