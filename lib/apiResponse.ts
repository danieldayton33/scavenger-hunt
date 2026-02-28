import { NextResponse } from 'next/server';

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true as const, data }, { status });
}

export function jsonError(
  code: string,
  message: string,
  status: number = 400
) {
  return NextResponse.json(
    { ok: false as const, error: { code, message } },
    { status }
  );
}

export const mobileApi = {
  unauthorized: () => jsonError('UNAUTHORIZED', 'Missing or invalid auth token', 401),
  forbidden: (message = 'Forbidden') => jsonError('FORBIDDEN', message, 403),
  badRequest: (message = 'Validation error') => jsonError('VALIDATION_ERROR', message, 400),
  notFound: (message = 'Not found') => jsonError('NOT_FOUND', message, 404),
  authConflict: (reason: 'EMAIL_EXISTS' | 'LINK_REQUIRED') => {
    if (reason === 'LINK_REQUIRED') {
      return jsonError(
        'LINK_REQUIRED',
        'This email already has an account. Sign in on web and link your Firebase account.',
        409
      );
    }
    return jsonError('EMAIL_EXISTS', 'This email is already linked to another Firebase account.', 409);
  },
  conflict: (message: string, data?: { existing?: unknown }) =>
    NextResponse.json(
      { ok: false as const, error: { code: 'CONFLICT', message }, ...(data ?? {}) },
      { status: 409 }
    ),
  serverError: (message = 'Internal server error') =>
    jsonError('INTERNAL_ERROR', message, 500),
};
