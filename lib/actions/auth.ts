'use server';

import { signIn } from '@/auth/config';
import { redirect } from 'next/navigation';

export async function signInWithCredentials(email: string, password: string) {
  const result = await signIn('credentials', {
    email,
    password,
    redirect: false,
  });
  console.log('result signInWithCredentials', result);

  if (result?.error) {
    return { error: result.error };
  }
  return result;
}

export async function signInWithGoogle() {
  await signIn('google', {
    redirectTo: '/',
  });
}

export async function signInWithPostmark(email: string) {
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    return await signIn('dev-email', {
      email,
      redirectTo: '/',
    });
  }
  await signIn('postmark', {
    email,
    redirectTo: '/',
  });
}
