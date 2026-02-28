'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

type State = 'linking' | 'success' | 'error';

export default function LinkFirebaseClient({ code }: { code: string }) {
  const [state, setState] = useState<State>('linking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/v1/mobile/link-firebase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ code }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data?.ok === true) {
          setState('success');
          return;
        }
        setState('error');
        setErrorMessage(
          typeof data?.error?.message === 'string'
            ? data.error.message
            : res.status === 403
              ? 'Link failed. Make sure you signed in with the same email as in the app.'
              : 'Link failed. The code may have expired. Try again from the app.'
        );
      } catch {
        if (!cancelled) {
          setState('error');
          setErrorMessage('Something went wrong. Try again from the app.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (state === 'linking') {
    return (
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Linking your account</CardTitle>
          <CardDescription>Please wait…</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Connecting your app account to this browser session.</p>
        </CardContent>
      </Card>
    );
  }

  if (state === 'success') {
    return (
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Account linked</CardTitle>
          <CardDescription>You can close this and return to the app.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm">
            Your web account is now linked to the app. In the app, tap &quot;I linked it, retry&quot; to continue.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const needsVerification =
    errorMessage.toLowerCase().includes('verified') ||
    errorMessage.toLowerCase().includes('verification') ||
    errorMessage.toLowerCase().includes('same email');

  return (
    <Card className="max-w-md border-destructive/50">
      <CardHeader>
        <CardTitle>Link failed</CardTitle>
        <CardDescription>{errorMessage}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {needsVerification && (
          <p className="text-muted-foreground text-sm">
            Your app account email must be verified first. Open the app, go to Create account (or your profile), and
            use <strong>Resend verification email</strong> if you didn’t get it. Check your inbox and spam, then try
            linking again from the app.
          </p>
        )}
        <p className="text-muted-foreground text-sm">
          You can also try signing in again on this page with the same email you use in the app, then open the link
          from the app again.
        </p>
        <Button asChild>
          <Link href="/login">Sign in again</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
