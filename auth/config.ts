import NextAuth, { type DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';
import Postmark from 'next-auth/providers/postmark';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/db';
import { accounts, sessions, users, verificationTokens } from '@/db/schema';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      role: 'admin' | 'user';
    };
  }
}

const isDev = process.env.NODE_ENV !== 'production';

const DevEmail = {
  id: 'dev-email',
  name: 'Email',
  type: 'email',
  maxAge: 60 * 60 * 24, // 24h
  async sendVerificationRequest(params: { identifier: string; url: string }) {
    const { identifier: email, url } = params;

    console.log('\n================ AUTH MAGIC LINK (DEV) ================');
    console.log('To:', email);
    console.log(url);
    console.log('======================================================\n');

    // Do not send an email in dev
  },
} as const;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google,

    // dev: log link, prod: send via Postmark
    ...(isDev
      ? [DevEmail]
      : [
          Postmark({
            from: 'no-reply@friendsoftheraleighgreenway.org',
            // apiKey is typically read from env by the provider, but you can also pass it explicitly if you want
          }),
        ]),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id as unknown as string;
        session.user.role = (user as unknown as { role: 'admin' | 'user' }).role ?? 'user';
      }
      return session;
    },
  },
});
