'use server';
import { db } from '@/db';
import { huntItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cacheTag } from 'next/cache';

const getHuntItemsByHuntId = async (id: number) => {
  'use cache';
  cacheTag(`huntItems-${id}`);
  return await db.query.huntItems.findMany({
    where: eq(huntItems.huntId, id),
  });
};

export default getHuntItemsByHuntId;
