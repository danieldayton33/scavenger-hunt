/**
 * Zod schemas for mobile API request/response shapes.
 * Used for validation and for typegen (Zod → JSON Schema → Dart).
 * Keep in sync with actual API responses and db/schema.
 */
import { z } from 'zod';

// --- Enums (match db enums) ---
export const huntStatusSchema = z.enum(['draft', 'published', 'completed']);
export const submissionStatusSchema = z.enum(['pending', 'approved', 'rejected']);
export const roleSchema = z.enum(['admin', 'user']);

// --- GET /api/v1/mobile/me ---
export const mobileUserSchema = z.object({
  id: z.string(),
  role: roleSchema,
  firebaseUid: z.string().nullable(),
  email: z.string(),
  name: z.string().nullable(),
  image: z.string().nullable(),
});

// --- GET /api/v1/mobile/hunts (list item) ---
export const huntListItemSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  startAt: z.string(),
  endAt: z.string(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: huntStatusSchema,
  userIsParticipant: z.boolean(),
  imageUrl: z.string().nullable(),
});

// --- GET /api/v1/mobile/hunts/:huntId ---
export const huntDetailSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  startAt: z.string(),
  endAt: z.string(),
  status: huntStatusSchema,
  createdAt: z.string(),
  participantCount: z.number().int(),
  imageUrl: z.string().nullable(),
});

// --- GET /api/v1/mobile/hunts/:huntId/items (item with optional submission) ---
export const submissionStatusOnItemSchema = z.object({
  id: z.number().int(),
  status: submissionStatusSchema,
});

export const huntItemWithSubmissionSchema = z.object({
  id: z.number().int(),
  huntId: z.number().int(),
  title: z.string(),
  description: z.string().nullable(),
  hint: z.string().nullable(),
  imageUrl: z.string().nullable(),
  itemType: z.string(),
  lat: z.string(),
  lng: z.string(),
  sortOrder: z.number().int(),
  createdAt: z.string(),
  submission: submissionStatusOnItemSchema.nullable(),
});

// --- GET /api/v1/mobile/hunts/:huntId/submissions ---
export const submissionSchema = z.object({
  id: z.number().int(),
  huntId: z.number().int(),
  itemId: z.number().int(),
  userId: z.string(),
  imageUrl: z.string().nullable(),
  comment: z.string().nullable(),
  lat: z.string().nullable(),
  lng: z.string().nullable(),
  accuracyMeters: z.string().nullable(),
  status: submissionStatusSchema,
  submittedAt: z.string(),
});

// --- GET /api/v1/mobile/hunts/:huntId/progress ---
export const progressSchema = z.object({
  totalItems: z.number().int(),
  approved: z.number().int(),
  pending: z.number().int(),
  rejected: z.number().int(),
});

// --- POST /api/v1/mobile/.../submissions (body) ---
export const createSubmissionBodySchema = z.object({
  imageUrl: z.string().url().optional(),
  imagePath: z.string().min(1).optional(),
  comment: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  accuracyMeters: z.number().optional(),
});

// --- POST /api/v1/mobile/hunts/:huntId/join (response) ---
export const joinHuntResponseSchema = z.object({
  id: z.number().int(),
  alreadyJoined: z.boolean(),
});

// --- POST /api/v1/mobile/link-firebase/request-code (response) ---
export const requestLinkCodeResponseSchema = z.object({
  code: z.string(),
  expiresIn: z.number().int(),
});

// --- POST /api/v1/mobile/link-firebase (response) ---
export const linkFirebaseResponseSchema = z.object({
  linked: z.boolean(), // always true on success
  alreadyLinked: z.boolean(),
  firebaseUid: z.string(),
});

// --- POST /api/v1/mobile/.../submissions (response) ---
export const createSubmissionResponseSchema = z.object({
  id: z.number().int(),
  status: submissionStatusSchema,
  submittedAt: z.string(),
});

// --- GET /api/v1/mobile/hunts/:huntId/scoreboard ---
export const scoreboardEntrySchema = z.object({
  userId: z.string(),
  userName: z.string().nullable(),
  userImage: z.string().nullable(),
  score: z.number().int(),
  firstApprovedAt: z.string().nullable(),
  lastApprovedAt: z.string().nullable(),
  completionTime: z.string().nullable(),
});

export const scoreboardResponseSchema = z.array(scoreboardEntrySchema);

// --- API envelope (success) ---
export const apiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({ ok: z.literal(true), data: dataSchema });

// --- Mobile API error (4xx/5xx response body: { ok: false, error: { code, message } }) ---
export const mobileApiErrorCodeSchema = z.enum([
  'UNAUTHORIZED',
  'ACCOUNT_DISABLED',
  'LINK_REQUIRED',
  'EMAIL_EXISTS',
  'FORBIDDEN',
  'VALIDATION_ERROR',
  'NOT_FOUND',
  'CONFLICT',
  'INTERNAL_ERROR',
]);
export const mobileApiErrorSchema = z.object({
  code: mobileApiErrorCodeSchema,
  message: z.string(),
});

// Export types for TS
export type MobileUser = z.infer<typeof mobileUserSchema>;
export type HuntListItem = z.infer<typeof huntListItemSchema>;
export type HuntDetail = z.infer<typeof huntDetailSchema>;
export type HuntItemWithSubmission = z.infer<typeof huntItemWithSubmissionSchema>;
export type Submission = z.infer<typeof submissionSchema>;
export type Progress = z.infer<typeof progressSchema>;
export type CreateSubmissionBody = z.infer<typeof createSubmissionBodySchema>;
export type ScoreboardEntry = z.infer<typeof scoreboardEntrySchema>;
export type MobileApiErrorCode = z.infer<typeof mobileApiErrorCodeSchema>;
export type MobileApiError = z.infer<typeof mobileApiErrorSchema>;
