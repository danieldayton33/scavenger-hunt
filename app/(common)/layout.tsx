import { ReactNode, Suspense } from 'react';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import UserMenuOrSignIn from '@/components/UserMenuOrSignIn';

const CommonLayout = async ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen">
      <nav className="bg-background border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold">
              Scavenger Hunt
            </Link>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/archive"
                      className="hover:bg-accent hover:text-accent-foreground rounded-md px-4 py-2 text-sm font-medium transition-colors"
                    >
                      Hunt Archive
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <Suspense fallback={<div>Loading...</div>}>
            <UserMenuOrSignIn />
          </Suspense>
        </div>
      </nav>
      <div className="p-8">{children}</div>
    </div>
  );
};

export default CommonLayout;
