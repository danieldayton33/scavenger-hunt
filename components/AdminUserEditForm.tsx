'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { updateUserByAdmin } from '@/lib/api/mutations/users/updateUserByAdmin';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const adminUserEditSchema = z.object({
  name: z.string().max(255, 'Name is too long').optional(),
  role: z.enum(['admin', 'user']),
  isActive: z.boolean(),
});

type AdminUserEditFormData = z.infer<typeof adminUserEditSchema>;

export type AdminUserEditFormProps = {
  userId: string;
  initialName?: string | null;
  initialRole: 'admin' | 'user';
  initialIsActive: boolean;
  initialEmail?: string | null;
};

export default function AdminUserEditForm({
  userId,
  initialName,
  initialRole,
  initialIsActive,
  initialEmail,
}: AdminUserEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AdminUserEditFormData>({
    resolver: zodResolver(adminUserEditSchema),
    defaultValues: {
      name: initialName ?? '',
      role: initialRole,
      isActive: initialIsActive,
    },
  });

  const onSubmit = async (data: AdminUserEditFormData) => {
    setIsSubmitting(true);
    try {
      await updateUserByAdmin(userId, {
        name: data.name ?? undefined,
        role: data.role,
        isActive: data.isActive,
      });
      toast.success('User updated successfully');
      router.refresh();
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update user.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        {initialEmail != null && (
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={initialEmail} disabled className="bg-muted" />
            <p className="text-sm text-muted-foreground">
              Email cannot be changed here.
            </p>
          </div>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Display name" {...field} />
              </FormControl>
              <FormDescription>User&apos;s display name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Admin can manage hunts and users</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  Inactive users cannot sign in. Their data is preserved.
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/users/${encodeURIComponent(userId)}`}>
              Cancel
            </Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
