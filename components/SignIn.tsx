import { signIn } from '@/auth/config';
import { Button } from './ui/button';

const SignIn = () => {
  return (
    <form
      action={async () => {
        'use server';
        await signIn('google');
      }}
    >
      <Button type="submit">Signin with Google</Button>
    </form>
  );
};

export default SignIn;
