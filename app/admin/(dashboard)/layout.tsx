import { ReactNode, Suspense } from 'react';
import Link from 'next/link';
import UserMenuOrSignIn from '@/components/UserMenuOrSignIn';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <nav className="flex items-center justify-between gap-2 rounded border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Link className="font-bold hover:underline" href="/admin/hunts">
            Hunts
          </Link>
          <Link className="font-bold hover:underline" href="/admin/users">
            Users
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <Suspense fallback={<div>Loading...</div>}>
            <UserMenuOrSignIn isAdminDashboard={true} />
          </Suspense>
        </div>
      </nav>
      <div className="p-8">{children}</div>
    </div>
  );
};

export default DashboardLayout;
