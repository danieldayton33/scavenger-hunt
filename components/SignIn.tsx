'use client';

import { signInWithGoogle, signInWithPostmark } from '@/lib/actions/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  // keep name optional, but allow empty string from the input
  name: z.string().min(1, 'Name is required').optional(),
});

type EmailFormData = z.infer<typeof emailSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

const SignIn = ({ redirectTo }: { redirectTo?: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  const signInForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', name: '' },
  });

  const sendMagicLink = async (email: string) => {
    setIsLoading(true);
    try {
      await signInWithPostmark(email, redirectTo ?? '/');
      toast.success('Check your email for a sign-in link.');
    } catch {
      toast.error('An error occurred sending the magic link');
    } finally {
      setIsLoading(false);
    }
  };

  const onPostmarkSignIn = async (data: EmailFormData) => {
    await sendMagicLink(data.email);
  };

  const onSignUp = async (data: SignUpFormData) => {
    // With magic link, "sign up" is the same as "sign in" — NextAuth will create the user on first verify.
    // If you want to persist name, do it after first login (onboarding) or via an event/createUser hook.
    await sendMagicLink(data.email);
  };

  const onGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle(redirectTo ?? '/');
      // redirect happens in the server action
    } catch {
      toast.error('An error occurred during Google sign in');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Email Link</TabsTrigger>
          <TabsTrigger value="signup">New Account</TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="space-y-4">
          <Form {...signInForm}>
            <form onSubmit={signInForm.handleSubmit(onPostmarkSignIn)} className="space-y-4">
              <FormField
                control={signInForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending link...' : 'Send sign-in link'}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="signup" className="space-y-4">
          <Form {...signUpForm}>
            <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
              <FormField
                control={signUpForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (optional)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signUpForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending link...' : 'Create account via email link'}
              </Button>
            </form>
          </Form>

          <p className="text-muted-foreground text-sm">
            We’ll email you a link to finish creating your account.
          </p>
        </TabsContent>
      </Tabs>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onGoogleSignIn}
        disabled={isLoading}
      >
        Sign in with Google
      </Button>
    </div>
  );
};

export default SignIn;
