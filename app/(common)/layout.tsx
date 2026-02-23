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
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { MobileMenu } from '@/components/MobileMenu';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/archive', label: 'Past Hunts' },
] as const;

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
              <span className="hidden text-xl font-bold md:inline">FRoG Scavenger Hunt</span>
            </Link>
            <div className="hidden md:block">
              <NavigationMenu>
                <NavigationMenuList>
                  {navLinks.map((link) => (
                    <NavigationMenuItem key={link.href}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={link.href}
                          className="hover:bg-accent hover:text-accent-foreground rounded-md px-4 py-2 text-sm font-medium transition-colors"
                        >
                          {link.label}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Suspense fallback={<div>Loading...</div>}>
              <UserMenuOrSignIn />
            </Suspense>
            <div className="md:hidden">
              <MobileMenu />
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 p-8">{children}</main>
      <footer className="shrink-0 border-t bg-background">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-4 text-sm text-muted-foreground md:flex-row">
          <p>&copy; Friends of the Raleigh Greenway</p>
          <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
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
