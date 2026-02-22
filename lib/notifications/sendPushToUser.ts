/**
 * Sends FCM data messages to a user's registered devices.
 * Requires in Google Cloud (project frog-scavenger-hunt):
 * - Firebase Cloud Messaging API enabled
 * - Service account with access to use it (or enable for project).
 *
 * Payload types and notification content are generic so new notification types
 * can be added by extending PushPayload and the getNotificationContent / getDataFromPayload helpers.
 */
import { getMessaging } from 'firebase-admin/messaging';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import { db } from '@/db';
import { userDevices } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export type SubmissionStatusPayload = {
  type: 'submission_status';
  huntId: number;
  status: 'approved' | 'rejected';
  submissionId?: number;
};

/** Union of all push payload types; extend when adding new notification kinds. */
export type PushPayload = SubmissionStatusPayload;

export type NotificationContent = { title: string; body: string };

export type SendPushResult = { ok: true } | { ok: false; error: string };

/** Returns FCM notification title/body for the given payload. Add cases here for new payload types. */
export function getNotificationContent(payload: PushPayload): NotificationContent {
  switch (payload.type) {
    case 'submission_status':
      return payload.status === 'approved'
        ? { title: 'Submission approved', body: 'Your submission was approved.' }
        : { title: 'Submission rejected', body: 'Your submission was not approved.' };
    default:
      return { title: 'Notification', body: 'You have a new notification.' };
  }
}

/** Builds FCM data map from payload. Add cases here for new payload types. */
export function getDataFromPayload(payload: PushPayload): Record<string, string> {
  switch (payload.type) {
    case 'submission_status': {
      const data: Record<string, string> = {
        type: payload.type,
        huntId: String(payload.huntId),
        status: payload.status,
      };
      if (payload.submissionId != null) data.submissionId = String(payload.submissionId);
      return data;
    }
    default:
      return { type: (payload as PushPayload).type };
  }
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<SendPushResult> {
  const tokens = await db
    .select({ pushToken: userDevices.pushToken })
    .from(userDevices)
    .where(and(eq(userDevices.userId, userId), eq(userDevices.isActive, true)));
  console.log('[sendPushToUser] tokens:', tokens);

  if (tokens.length === 0) return { ok: true };

  const app = getFirebaseAdmin();
  console.log('[sendPushToUser] projectId:', app.options.projectId);
  console.log('[sendPushToUser] hasCredential:', Boolean(app.options.credential));

  try {
    const access = await (app.options.credential as any)?.getAccessToken?.();
    console.log('[sendPushToUser] accessToken ok:', Boolean(access?.access_token));
  } catch (e) {
    console.error('[sendPushToUser] accessToken FAILED:', e);
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }

  const messaging = getMessaging(app);
  const data = getDataFromPayload(payload);
  const notification = getNotificationContent(payload);

  // Debug: log FCM request URL and Authorization header. Run with DEBUG_FCM_REQUEST=1 to confirm auth is sent.
  let restoreHttps: (() => void) | null = null;
  if (process.env.DEBUG_FCM_REQUEST === '1') {
    const https = require('https');
    const orig = https.request.bind(https);
    (https as NodeJS.EventEmitter & { request: typeof orig }).request = function (
      options: import('https').RequestOptions | string | URL,
      ...args: unknown[]
    ) {
      const opts = typeof options === 'object' && options !== null && !(options instanceof URL)
        ? options as import('https').RequestOptions
        : {};
      const host = opts.hostname || opts.host || '';
      const path = opts.path || '/';
      const url = opts.protocol ? `${opts.protocol}//${host}${path}` : `https://${host}${path}`;
      const headers = opts.headers as Record<string, string> | undefined;
      const hasAuth = Boolean(headers?.Authorization ?? headers?.authorization);
      console.log('[DEBUG_FCM_REQUEST] url:', url, 'hasAuth:', hasAuth);
      return orig(options as import('https').RequestOptions, ...args);
    };
    restoreHttps = () => {
      (https as NodeJS.EventEmitter & { request: typeof orig }).request = orig;
    };
  }

  // Notification title/body for system tray; badge for app icon
  const baseMessage = {
    data,
    notification,
    apns: { payload: { aps: { badge: 1 } } },
    android: { notification: { notificationCount: 1 } },
  };

  const errors: string[] = [];
  const sendPromises = tokens.map(async ({ pushToken }) => {
    try {
      await messaging.send({ ...baseMessage, token: pushToken });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[sendPushToUser]', userId, pushToken?.slice(0, 20), err);
      errors.push(msg);
    }
  });
  try {
    await Promise.all(sendPromises);
  } finally {
    restoreHttps?.();
  }

  if (errors.length > 0) {
    const error = errors.length === 1 ? errors[0]! : errors.join('; ');
    return { ok: false, error };
  }
  return { ok: true };
}
