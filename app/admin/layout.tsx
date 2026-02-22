import { auth } from '@/auth/config';
import { redirect } from 'next/navigation';
import { ReactNode, Suspense } from 'react';

async function AdminLayoutContent({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  if (session.user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <>
      {children}
      {modal}
    </>
  );
}

export default function AdminLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <AdminLayoutContent children={children} modal={modal} />
    </Suspense>
  );
}
