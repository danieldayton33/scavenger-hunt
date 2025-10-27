// File: components/ServerModal.tsx
'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'; // shadcn/ui path — adjust if yours differs

export type ServerModalProps = {
  /** Modal title (optional). Render your own header if you prefer. */
  title?: React.ReactNode;
  /** Optional description text under the title. */
  description?: React.ReactNode;
  /** Start open when mounted. Intercepting routes usually want this true. */
  initialOpen?: boolean;
  /**
   * Where to navigate on close. "back" calls router.back().
   * Or provide a href (e.g. "/settings") to router.push().
   */
  onCloseNavigate?: 'back' | string;
  /** Prevent closing via outside click */
  closeOnOutsideClick?: boolean;
  /** Prevent closing via Escape key */
  closeOnEscape?: boolean;
  /** Optional footer area */
  footer?: React.ReactNode;
  /** Modal content */
  children: React.ReactNode;
  /** Optional className passed to DialogContent */
  contentClassName?: string;
};

export default function ServerModal({
  title,
  description,
  initialOpen = true,
  onCloseNavigate = 'back',
  closeOnOutsideClick = true,
  closeOnEscape = true,
  footer,
  children,
  contentClassName = 'min-w-[70vw] max-h-[90vh] overflow-y-auto',
}: ServerModalProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState<boolean>(initialOpen);

  const handleCloseNav = React.useCallback(() => {
    if (onCloseNavigate === 'back') {
      router.back();
    } else if (typeof onCloseNavigate === 'string') {
      router.push(onCloseNavigate);
    }
  }, [onCloseNavigate, router]);

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setOpen(next);
      if (!next) handleCloseNav();
    },
    [handleCloseNav]
  );

  // Block closing via ESC or outside click if disabled
  const onInteractOutside = React.useCallback(
    (e: Event) => {
      if (!closeOnOutsideClick) e.preventDefault();
    },
    [closeOnOutsideClick]
  );

  const onEscapeKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (!closeOnEscape) e.preventDefault();
    },
    [closeOnEscape]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={contentClassName}
        onInteractOutside={onInteractOutside}
        onEscapeKeyDown={onEscapeKeyDown}
      >
        {(title || description) && (
          <DialogHeader>
            {title ? <DialogTitle>{title}</DialogTitle> : null}
            {description ? <DialogDescription>{description}</DialogDescription> : null}
            <DialogClose />
          </DialogHeader>
        )}
        <div className="mt-2">{children}</div>
        {footer ? <DialogFooter className="mt-4">{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}
