'use server';

import { signIn } from '@/auth/config';


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
