import SignIn from '@/components/SignIn';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Props = { searchParams: Promise<{ callbackUrl?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const callbackUrl = typeof params.callbackUrl === 'string' ? params.callbackUrl : undefined;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Scavenger Hunt</CardTitle>
          <CardDescription>Please sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <SignIn redirectTo={callbackUrl} />
        </CardContent>
      </Card>
    </div>
  );
}
