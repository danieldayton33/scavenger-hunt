/**
 * Verifies FCM (Firebase Cloud Messaging) is set up correctly:
 * - Service account credentials load
 * - Firebase Cloud Messaging API is enabled and accepts our credentials
 *
 * Without FCM_TEST_TOKEN: uses SDK with a fake token (expect invalid-token error = credentials OK).
 * With FCM_TEST_TOKEN: uses SDK to send submission_status payload to the device.
 *
 * Run from project root: pnpm run check-fcm
 * Requires .env: FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH
 * Optional: FCM_TEST_TOKEN for real device send test (sends submission_status payload).
 * Optional: FCM_TEST_HUNT_ID, FCM_TEST_STATUS, FCM_TEST_SUBMISSION_ID to override payload (defaults: 1, approved, 1).
 */
import 'dotenv/config';
import { getMessaging } from 'firebase-admin/messaging';
import { getFirebaseAdmin } from '../lib/firebaseAdmin';

async function main() {
  console.log('Checking FCM setup...\n');

  let app;
  try {
    app = getFirebaseAdmin();
    console.log('✓ Firebase Admin initialized (credentials loaded)');
  } catch (err) {
    console.error('✗ Firebase Admin init failed:', (err as Error).message);
    console.error('\n  Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH in .env');
    process.exit(1);
  }

  const realToken = process.env.FCM_TEST_TOKEN?.trim();

  if (realToken) {
    // Use SDK to send submission_status payload (same shape Flutter app expects)
    const status = (process.env.FCM_TEST_STATUS as 'approved' | 'rejected') || 'approved';
    const data: Record<string, string> = {
      type: 'submission_status',
      huntId: process.env.FCM_TEST_HUNT_ID || '1',
      status,
      submissionId: process.env.FCM_TEST_SUBMISSION_ID || '1',
    };
    const notification =
      status === 'approved'
        ? { title: 'Submission approved', body: 'Your submission was approved.' }
        : { title: 'Submission rejected', body: 'Your submission was not approved.' };
    const messaging = getMessaging(app);
    try {
      const messageId = await messaging.send({
        token: realToken,
        data,
        notification,
        apns: { payload: { aps: { badge: 1 } } },
        android: { notification: { notificationCount: 1 } },
      });
      console.log('✓ FCM message sent successfully to device (SDK, submission_status, badge)');
      console.log('  Message ID:', messageId);
      process.exit(0);
    } catch (err: unknown) {
      const message = String((err as Error)?.message ?? err);
      const code = (err as { code?: string })?.code ?? '';

      if (
        code?.includes('auth') ||
        message.toLowerCase().includes('authentication') ||
        message.toLowerCase().includes('credential') ||
        message.toLowerCase().includes('oauth')
      ) {
        console.error('✗ FCM authentication failed');
        console.error('  Error:', message);
        console.error('\n  Fix: Enable "Firebase Cloud Messaging API" for your project:');
        console.error('  https://console.cloud.google.com/apis/library/fcm.googleapis.com');
        process.exit(1);
      }
      if (
        code?.includes('invalid') ||
        code?.includes('not-found') ||
        code?.includes('not-registered') ||
        message.toLowerCase().includes('token') ||
        message.toLowerCase().includes('registration') ||
        message === 'NotRegistered'
      ) {
        console.error('✗ FCM send failed (bad or unregistered token)');
        console.error('  Error:', message);
        process.exit(1);
      }
      console.error('✗ Unexpected error:', message);
      process.exit(1);
    }
  }

  // No FCM_TEST_TOKEN: use SDK with fake token to verify credentials
  const messaging = getMessaging(app);
  try {
    const result = await messaging.send({
      token: 'test-invalid-token',
      data: { test: '1' },
    });
    console.log('✓ FCM send accepted (unexpected for invalid token)', result);
  } catch (err: unknown) {
    const message = String((err as Error)?.message ?? err);
    const code = (err as { code?: string })?.code ?? '';

    if (
      code?.includes('auth') ||
      message.toLowerCase().includes('authentication') ||
      message.toLowerCase().includes('credential') ||
      message.toLowerCase().includes('oauth')
    ) {
      console.error('✗ FCM authentication failed');
      console.error('  Error:', message);
      console.error('\n  Fix: Enable "Firebase Cloud Messaging API" for your project:');
      console.error('  https://console.cloud.google.com/apis/library/fcm.googleapis.com');
      process.exit(1);
    }
    if (
      code?.includes('invalid') ||
      code?.includes('not-found') ||
      code?.includes('not-registered') ||
      message.toLowerCase().includes('token') ||
      message.toLowerCase().includes('registration') ||
      message === 'NotRegistered'
    ) {
      console.log('✓ FCM API is enabled and credentials are valid');
      console.log('  (Invalid token error is expected when using a test token.)');
      console.log('Message:', message);
      console.log('Code:', code);
      process.exit(0);
    }
    console.error('? Unexpected error:', message);
    process.exit(1);
  }
}

main();
