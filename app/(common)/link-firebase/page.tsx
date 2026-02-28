import { auth } from '@/auth/config';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LinkFirebaseClient from './LinkFirebaseClient';

type Props = { searchParams: Promise<{ code?: string }> };

export default async function LinkFirebasePage({ searchParams }: Props) {
  const params = await searchParams;
  const code = typeof params.code === 'string' ? params.code.trim() : undefined;

  if (!code) {
    return (
      <div className="container mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Link your account</CardTitle>
            <CardDescription>Open this page from the app to link your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              If you see a message in the app that your email already has a web account, use the &quot;Open web
              sign-in&quot; button there. You will be brought here with a link code to complete the process.
            </p>
            <Button asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const session = await auth();
  if (!session?.user?.email) {
    const callbackUrl = `/link-firebase?code=${encodeURIComponent(code)}`;
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return (
    <div className="container mx-auto max-w-md">
      <LinkFirebaseClient code={code} />
    </div>
  );
}
