import { ReactNode, Suspense } from 'react';
import Link from 'next/link';
import UserMenuOrSignIn from '@/components/UserMenuOrSignIn';

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <nav className="flex items-center justify-between gap-2 rounded bg-blue-50 p-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Link className="font-bold hover:underline" href="/admin/hunts">
            Hunts
          </Link>
          <Link className="font-bold hover:underline" href="/admin/users">
            Users
          </Link>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <UserMenuOrSignIn isAdminDashboard={true} />
        </Suspense>
      </nav>
      <div className="p-8">{children}</div>
    </div>
  );
};

export default DashboardLayout;
