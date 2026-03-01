'use server';
import { auth } from '@/auth/config';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateUserByAdminSchema = z.object({
  targetUserId: z.string().min(1, 'User ID is required'),
  name: z.string().max(255, 'Name is too long').optional(),
  role: z.enum(['admin', 'user']).optional(),
  isActive: z.boolean().optional(),
});

export async function updateUserByAdmin(
  targetUserId: string,
  data: { name?: string; role?: 'admin' | 'user'; isActive?: boolean }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Forbidden');
  }

  try {
    const validated = updateUserByAdminSchema.parse({ targetUserId, ...data });

    // Prevent admin from demoting themselves
    if (
      validated.role !== undefined &&
      validated.targetUserId === session.user.id &&
      validated.role !== 'admin'
    ) {
      throw new Error('You cannot demote yourself');
    }

    // Prevent admin from disabling themselves
    if (
      validated.isActive === false &&
      validated.targetUserId === session.user.id
    ) {
      throw new Error('You cannot disable your own account');
    }

    const updateData: {
      name?: string | null;
      role?: 'admin' | 'user';
      isActive?: boolean;
    } = {};
    if (validated.name !== undefined) {
      updateData.name = validated.name || null;
    }
    if (validated.role !== undefined) {
      updateData.role = validated.role;
    }
    if (validated.isActive !== undefined) {
      updateData.isActive = validated.isActive;
    }

    if (Object.keys(updateData).length === 0) {
      const existing = await db.query.users.findFirst({
        where: eq(users.id, validated.targetUserId),
        columns: { id: true },
      });
      if (!existing) {
        throw new Error('User not found');
      }
      return { id: targetUserId };
    }

    const [updated] = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, validated.targetUserId))
      .returning({ id: users.id, name: users.name, role: users.role, isActive: users.isActive });

    if (!updated) {
      throw new Error('User not found');
    }

    revalidatePath('/admin/users', 'layout');
    revalidatePath(`/admin/users/${encodeURIComponent(validated.targetUserId)}`);
    revalidatePath(`/admin/users/${encodeURIComponent(validated.targetUserId)}/edit`);

    return { id: updated.id, name: updated.name, role: updated.role, isActive: updated.isActive };
  } catch (error) {
    console.error('Error in updateUserByAdmin:', error);
    if (error instanceof Error) {
      const known = [
        'You cannot demote yourself',
        'You cannot disable your own account',
        'User not found',
      ];
      if (known.includes(error.message)) {
        throw error;
      }
    }
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0]?.message ?? 'Invalid input');
    }
    throw new Error('Failed to update user.');
  }
}
