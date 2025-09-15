'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { createHunt } from '@/lib/api/mutations/hunts/createHunt';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from './ui/button';
import { updateHunt } from '@/lib/api/mutations/hunts/updateHunt';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  slug: z.string().min(3, { message: 'Slug must be at least 3 characters.' }),
  description: z.string().optional(),
  startAt: z.string().min(1, { message: 'Start date is required.' }),
  endAt: z.string().min(1, { message: 'End date is required.' }),
  isPublished: z.boolean().default(false),
});

export function HuntForm({
  defaultValues = {
    title: '',
    slug: '',
    description: '',
    startAt: '',
    endAt: '',
    isPublished: false,
  },
  isEdit = false,
}: {
  defaultValues?: z.infer<typeof formSchema>;
  isEdit?: boolean;
}) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const mutation = isEdit ? updateHunt : createHunt;
      await mutation(values);
      toast.success('Hunt created successfully!');
      return router.push('/admin/hunts');
    } catch (error) {
      console.error('Error creating hunt:', error);
      toast.error('Failed to create hunt. Please try again.');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <input
                  className="focus:border-primary focus:ring-primary w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Spring Scavenger Hunt"
                  {...field}
                />
              </FormControl>
              <FormDescription>The title of the scavenger hunt.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <input
                  className="focus:border-primary focus:ring-primary w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="spring-scavenger-hunt"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The unique slug for the scavenger hunt (used in the URL).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  className="focus:border-primary focus:ring-primary w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="A fun scavenger hunt for spring!"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>A brief description of the scavenger hunt.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="startAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <input
                    type="datetime-local"
                    className="focus:border-primary focus:ring-primary w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  />
                </FormControl>
                <FormDescription>The date and time when the scavenger hunt starts.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <input
                    type="datetime-local"
                    className="focus:border-primary focus:ring-primary w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  />
                </FormControl>
                <FormDescription>The date and time when the scavenger hunt ends.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-y-0 space-x-3">
              <FormControl>
                <input
                  type="checkbox"
                  className="focus:ring-primary h-4 w-4 rounded border border-gray-300 bg-white focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              </FormControl>
              <div className="space-y-1">
                <FormLabel className="text-base">Published</FormLabel>
                <FormDescription>
                  Whether the scavenger hunt is published and visible to users.
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="bg-primary hover:bg-primary/80 rounded px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!form.formState.isValid}
        >
          {isEdit ? 'Update Hunt' : 'Create Hunt'}
        </Button>
      </form>
    </Form>
  );
}

export default HuntForm;
