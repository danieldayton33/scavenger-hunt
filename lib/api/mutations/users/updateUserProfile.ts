'use server';
import { auth } from '@/auth/config';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateUserProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long').optional(),
  role: z.enum(['admin', 'user']).optional(),
});

export async function updateUserProfile(data: {
  name?: string;
  role?: 'admin' | 'user';
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validatedData = updateUserProfileSchema.parse(data);

  try {
    const updateData: { name?: string | null; role?: 'admin' | 'user' } = {};

    // Users can always update their name
    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name || null;
    }

    // Only admins can update role
    if (validatedData.role !== undefined && session.user.role === 'admin') {
      updateData.role = validatedData.role;
    }

    const result = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))
      .returning();

    return {
      id: result[0].id,
      name: result[0].name,
      role: result[0].role,
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw new Error('Failed to update user profile');
  }
}

