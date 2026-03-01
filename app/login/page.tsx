import { Suspense } from 'react';
import SignIn from '@/components/SignIn';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Props = { searchParams: Promise<{ callbackUrl?: string; error?: string }> };

async function LoginContent({ searchParams }: Props) {
  const params = await searchParams;
  const callbackUrl = typeof params.callbackUrl === 'string' ? params.callbackUrl : undefined;
  const error = typeof params.error === 'string' ? params.error : undefined;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Scavenger Hunt</CardTitle>
          <CardDescription>Please sign in to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error === 'AccountDisabled' && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              This account has been disabled.
            </p>
          )}
          <SignIn redirectTo={callbackUrl} />
        </CardContent>
      </Card>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Scavenger Hunt</CardTitle>
          <CardDescription>Loading…</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Loading sign-in options…</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage(props: Props) {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent {...props} />
    </Suspense>
  );
}
