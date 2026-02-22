import { z } from 'zod';

const numericString = z
  .string()
  .transform((val) => {
    const n = parseInt(val, 10);
    return Number.isNaN(n) ? undefined : n;
  })
  .pipe(z.number().int().positive());

export const pathParams = {
  huntId: z.object({ huntId: numericString }),
  huntIdItemId: z.object({
    huntId: numericString,
    itemId: numericString,
  }),
  submissionId: z.object({ id: numericString }),
};

const imageUrlSchema = z
  .string()
  .nullish()
  .refine(
    (val) =>
      val === undefined ||
      val === null ||
      val.startsWith('data:') ||
      (() => {
        try {
          if (!val || val.length === 0) return false;
          new URL(val);
          return true;
        } catch {
          return false;
        }
      })(),
    { message: 'imageUrl must be a valid URL or data URL' }
  );

export const createSubmissionBodySchema = z
  .object({
    imageUrl: imageUrlSchema,
    imagePath: z.string().min(1).nullish(),
    comment: z.string().nullish(),
    lat: z.number().nullish(),
    lng: z.number().nullish(),
    accuracyMeters: z.number().nullish(),
  })
  .refine((data) => data.imageUrl ?? data.imagePath, {
    message: 'Either imageUrl or imagePath is required',
    path: ['imageUrl'],
  });

export type CreateSubmissionBody = z.infer<typeof createSubmissionBodySchema>;

export const queryParams = {
  submissionsStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
};

export const registerDeviceBodySchema = z.object({
  platform: z.enum(['ios', 'android']),
  pushToken: z.string().min(1),
});
export type RegisterDeviceBody = z.infer<typeof registerDeviceBodySchema>;
