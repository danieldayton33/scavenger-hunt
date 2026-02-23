'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DURATION_MS = 500;

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/#upcoming-hunts', label: 'Upcoming Hunts' },
  { href: '/archive', label: 'Past Hunts' },
] as const;

const footerLinks = [
  { href: 'https://friendsoftheraleighgreenway.org', label: 'friendsoftheraleighgreenway.org', external: true },
  { href: '/privacy', label: 'Privacy', external: false },
  { href: '/terms', label: 'Terms', external: false },
] as const;

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const t = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(t);
    } else {
      document.body.style.overflow = '';
      setEntered(false);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const closeMenu = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
      closeTimeoutRef.current = null;
    }, DURATION_MS);
  };

  const slideIn = entered && !isClosing;

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-background"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className={`flex h-full w-full flex-col transition-transform duration-500 ease-out ${
              slideIn ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
          <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <Image
                src="/frog-icon.png"
                alt=""
                width={32}
                height={32}
              />
              <span className="text-lg font-bold">FRoG Scavenger Hunt</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close menu"
              onClick={closeMenu}
            >
              <X className="size-5" />
            </Button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-auto p-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-4 py-3 text-lg font-medium hover:bg-accent hover:text-accent-foreground"
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}

            <div className="my-4 border-t" />
            <p className="px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              More
            </p>
            {footerLinks.map((link) => (
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg px-4 py-3 text-base text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={closeMenu}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-4 py-3 text-base text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>
          </div>
        </div>
      )}
    </>
  );
}
