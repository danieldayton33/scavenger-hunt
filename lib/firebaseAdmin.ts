/**
 * Firebase Admin SDK singleton for verifying Firebase ID tokens.
 * Use Node runtime only (not Edge) for any route that imports this.
 *
 * Config: set either
 * - FIREBASE_SERVICE_ACCOUNT_PATH: path to a JSON file (multi-line OK), or
 * - FIREBASE_SERVICE_ACCOUNT_JSON: single-line JSON string (no newlines in .env value).
 */
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

function ensureEnvLoaded(): void {
  let json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const pathEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (json || pathEnv) return;
  try {
    // Next.js server actions / some runtimes may not have loaded .env; load it once
    require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
  } catch {
    // dotenv not available or .env missing
  }
}

export function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  ensureEnvLoaded();
  let json: string | undefined = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const pathEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (pathEnv) {
    const resolved = path.resolve(process.cwd(), pathEnv);
    if (!fs.existsSync(resolved)) {
      throw new Error(`FIREBASE_SERVICE_ACCOUNT_PATH file not found: ${resolved}`);
    }
    json = fs.readFileSync(resolved, 'utf-8');
  }
  if (!json) {
    throw new Error('Set FIREBASE_SERVICE_ACCOUNT_JSON (single-line) or FIREBASE_SERVICE_ACCOUNT_PATH (path to JSON file)');
  }

  let credentials: Record<string, unknown>;
  try {
    credentials = JSON.parse(json) as Record<string, unknown>;
    // Vercel/env often stores private_key with literal \n; replace for Firebase
    if (typeof credentials.private_key === 'string' && credentials.private_key.includes('\\n')) {
      credentials = {
        ...credentials,
        private_key: credentials.private_key.replace(/\\n/g, '\n'),
      };
    }
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is invalid JSON');
  }

  const projectId = credentials.project_id as string | undefined;
  return admin.initializeApp({
    credential: admin.credential.cert(credentials as admin.ServiceAccount),
    ...(projectId && { projectId }),
  });
}

export async function verifyFirebaseIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
  const app = getFirebaseAdmin();
  return app.auth().verifyIdToken(token);
}
