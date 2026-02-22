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
  conflict: (message: string, data?: { existing?: unknown }) =>
    NextResponse.json(
      { ok: false as const, error: { code: 'CONFLICT', message }, ...(data ?? {}) },
      { status: 409 }
    ),
  serverError: (message = 'Internal server error') =>
    jsonError('INTERNAL_ERROR', message, 500),
};
