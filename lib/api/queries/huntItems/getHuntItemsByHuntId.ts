'use server';
import { db } from '@/db';
import { huntItems } from '@/db/schema';
import { eq } from 'drizzle-orm';

const getHuntItemsByHuntId = async (id: number) => {
  return await db.query.huntItems.findMany({
    where: eq(huntItems.huntId, id),
  });
};

export default getHuntItemsByHuntId;
