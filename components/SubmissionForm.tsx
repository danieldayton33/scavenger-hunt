'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { createSubmission } from '@/lib/api/mutations/submissions/createSubmission';
import { updateSubmission } from '@/lib/api/mutations/submissions/updateSubmission';
import { Button } from './ui/button';
import { ScavengerHunt } from '@/lib/schemas/hunt';
import { ScavengerHuntItem } from '@/lib/schemas/huntItem';
import {
  SubmissionFormData,
  SubmissionFormInputSchema,
  SubmissionFormInputData,
  Submission,
} from '@/lib/schemas/submission';
import { useRouter } from 'next/navigation';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { LocationPicker } from './LocationPicker';
import { SubmissionImageUpload } from './SubmissionImageUpload';

const SubmissionForm = ({
  hunt,
  item,
  randomizedCircle,
  submission,
  submissionId,
}: {
  hunt: ScavengerHunt;
  item: ScavengerHuntItem;
  randomizedCircle?: {
    center: { lat: number; lng: number };
    radius: number;
  } | null;
  submission?: Submission;
  submissionId?: number;
}) => {
  const router = useRouter();
  const isEditMode = !!submission && !!submissionId;

  const form = useForm<SubmissionFormInputData>({
    resolver: zodResolver(SubmissionFormInputSchema),
    defaultValues: submission
      ? {
          imageUrl: submission.imageUrl || '',
          comment: submission.comment || '',
          lat: submission.lat ? parseFloat(submission.lat.toString()) : undefined,
          lng: submission.lng ? parseFloat(submission.lng.toString()) : undefined,
          accuracyMeters: submission.accuracyMeters
            ? parseFloat(submission.accuracyMeters.toString())
            : undefined,
        }
      : undefined,
  });

  const onSubmit = async (data: SubmissionFormInputData) => {
    try {
      const submissionData: SubmissionFormData = {
        ...data,
        huntId: hunt.id,
        itemId: item.id,
      };

      if (isEditMode && submissionId) {
        await updateSubmission(submissionId, submissionData);
        toast.success('Submission updated successfully!');
      } else {
        await createSubmission(submissionData);
        toast.success('Submission created successfully!');
      }

      router.push(`/scavenger-hunt/${hunt.slug}`);
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : isEditMode
            ? 'Failed to update submission.'
            : 'Failed to create submission.';
      toast.error(errorMessage);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <SubmissionImageUpload
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    huntId={hunt.id}
                  />
                  <Input
                    type="url"
                    placeholder="Or paste image URL"
                    {...field}
                    value={field.value || ''}
                  />
                </div>
              </FormControl>
              <FormDescription>Upload an image or paste a URL (optional)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any comments about your submission..."
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>Additional notes about your submission (optional)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lat"
          render={() => (
            <FormItem>
              <FormLabel>Your Location</FormLabel>
              <FormControl>
                <LocationPicker
                  latField="lat"
                  lngField="lng"
                  accuracyField="accuracyMeters"
                  initialPosition={
                    submission && submission.lat && submission.lng
                      ? {
                          lat: parseFloat(submission.lat.toString()),
                          lng: parseFloat(submission.lng.toString()),
                        }
                      : {
                          lat: parseFloat(item.lat.toString()),
                          lng: parseFloat(item.lng.toString()),
                        }
                  }
                  randomizedCircle={randomizedCircle}
                  className="h-96 w-full overflow-hidden rounded-lg"
                />
              </FormControl>
              <FormDescription>
                Select your location on the map or use your current location (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit">{isEditMode ? 'Update' : 'Submit'}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SubmissionForm;
