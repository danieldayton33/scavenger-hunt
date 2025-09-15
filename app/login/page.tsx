import SignIn from '@/components/SignIn';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const LoginPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Card className="min-w-sm">
        <CardHeader>
          <CardTitle>Welcome to Scavenger Hunt</CardTitle>
          <CardDescription>Please sign in to continue</CardDescription>
        </CardHeader>
        <CardFooter>
          <SignIn />
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
