import { ReactNode, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import UserMenuOrSignIn from '@/components/UserMenuOrSignIn';

const CommonLayout = async ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="shrink-0 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/frog-icon.png"
                alt="Friends of the Raleigh Greenway frog logo"
                width={36}
                height={36}
                priority
              />
              <span className="text-xl font-bold">FRoG Scavenger Hunt</span>
            </Link>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/archive"
                      className="hover:bg-accent hover:text-accent-foreground rounded-md px-4 py-2 text-sm font-medium transition-colors"
                    >
                      Past Hunts
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
      <main className="flex-1 p-8">{children}</main>
      <footer className="shrink-0 border-t bg-background">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-4 text-sm text-muted-foreground md:flex-row">
          <p>&copy; {new Date().getFullYear()} Friends of the Raleigh Greenway</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="https://friendsoftheraleighgreenway.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary underline-offset-4 hover:underline"
            >
              friendsoftheraleighgreenway.org
            </Link>
            <Link
              href="/privacy"
              className="hover:text-primary underline-offset-4 hover:underline"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-primary underline-offset-4 hover:underline"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CommonLayout;
