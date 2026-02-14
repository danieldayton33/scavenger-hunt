import { auth } from '@/auth/config';
import Link from 'next/link';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/auth/config';
import { Button } from '@/components/ui/button';

const UserMenuOrSignIn = async ({ isAdminDashboard = false }: { isAdminDashboard?: boolean }) => {
  const session = await auth();
  const isAdmin = session?.user?.role === 'admin';
  const link = isAdminDashboard ? '/' : '/admin/hunts';
  return (
    <div className="flex items-center gap-4">
      {session?.user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:ring-ring flex items-center gap-2 rounded-full focus:ring-2 focus:ring-offset-2 focus:outline-none">
              <Avatar>
                <AvatarImage
                  src={session.user.image || undefined}
                  alt={session.user.name || 'User'}
                />
                <AvatarFallback>
                  {session.user.name
                    ? session.user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                    : 'U'}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{session.user.name || 'User'}</p>
                <p className="text-muted-foreground text-xs">{session.user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">View Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/login' });
              }}
            >
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full text-left">
                  Sign Out
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      )}
      {isAdmin && (
        <Button asChild>
          <Link href={link}>{isAdminDashboard ? 'Public Dashboard' : 'Admin Dashboard'}</Link>
        </Button>
      )}
    </div>
  );
};

export default UserMenuOrSignIn;
