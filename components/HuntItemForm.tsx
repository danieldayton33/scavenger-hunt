'use client';

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
import createHuntItem from '@/lib/api/mutations/huntItems/createHuntItem';
import updatedHuntItem from '@/lib/api/mutations/huntItems/updateHuntItem';
import { Button } from './ui/button';
import { ScavengerHunt } from '@/lib/schemas/hunt';
import { HuntItemFormData } from '@/lib/schemas/huntItem';
import { AddressPinPicker } from './AddressPicker';
import { useParams, useRouter } from 'next/navigation';

const HuntItemForm = ({
  defaultValues = {
    title: '',
    description: '',
    hint: '',
    imageUrl: '',
    lat: '0',
    lng: '0',
    itemType: 'critter',
  },
  hunt,
  isEdit = false,
}: {
  defaultValues?: HuntItemFormData;
  hunt: ScavengerHunt;
  isEdit?: boolean;
}) => {
  const params = useParams();

  const form = useForm({
    defaultValues,
  });
  const router = useRouter();

  const onSubmit = async (data: HuntItemFormData) => {
    const mutation = isEdit ? updatedHuntItem : createHuntItem;

    try {
      const result = await mutation({
        huntItem: {
          ...data,
          // @ts-expect-error we know these are valid numbers because of the zod schema
          lat: parseFloat(data.lat),
          // @ts-expect-error we know these are valid numbers because of the zod schema
          lng: parseFloat(data.lng),
        },
        hunt: hunt,
        ...(isEdit && { huntItemId: parseInt(params.itemId as string, 10) }),
      });

      toast.success(`Hunt item ${isEdit ? 'updated' : 'created'} successfully!: ${result.id}`);
      router.back();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} hunt item.`);
    }
  };
  const { watch } = form;
  const lat = watch('lat');
  const lng = watch('lng');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <input
                  className="focus:border-primary focus:ring-primary w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                />
              </FormControl>
              <FormDescription>Enter the title of the hunt item.</FormDescription>
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
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hint</FormLabel>
              <FormControl>
                <input
                  className="focus:border-primary focus:ring-primary w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <input
                  className="focus:border-primary focus:ring-primary w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="itemType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Type</FormLabel>
              <FormControl>
                <select
                  className="focus:border-primary focus:ring-primary w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                >
                  <option value="critter">Critter</option>
                  <option value="art">Art</option>
                  <option value="other">Other</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <AddressPinPicker
          initialPosition={lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined}
        />
        <FormField
          control={form.control}
          name="lat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitude</FormLabel>
              <FormControl>
                <input
                  className="focus:border-primary focus:ring-primary w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  type="number"
                  step="any"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lng"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Longitude</FormLabel>
              <FormControl>
                <input
                  className="focus:border-primary focus:ring-primary w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  type="number"
                  step="any"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{isEdit ? 'Update Hunt Item' : 'Create Hunt Item'}</Button>
      </form>
    </Form>
  );
};

export default HuntItemForm;
