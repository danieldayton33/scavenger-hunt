'use server';
import { auth } from '@/auth/config';
import { db } from '@/db';
import { huntItems } from '@/db/schema';
import { revalidateTag } from 'next/cache';
import { HuntItemFormData, HuntItemSchema } from '@/lib/schemas/huntItem';

const createHuntItem = async (newHuntItem: HuntItemFormData, huntId: number) => {
  const session = await auth();
  if (!session || session.user.role !== 'admin') throw new Error('Forbidden');
  const data = HuntItemSchema.parse(newHuntItem);
  try {
    const result = await db.insert(huntItems).values({
      ...data,
      huntId,
    });
    const { insertId } = result[0];
    revalidateTag(`hunt-${huntId}`);
    return {
      id: insertId,
    };
  } catch (error) {
    console.error('Error creating huntItem', error);
    throw new Error('Failed to create hunt item');
  }
};

export default createHuntItem;
