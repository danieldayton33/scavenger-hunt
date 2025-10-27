import { ReactNode } from 'react';
import Link from 'next/link';

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <nav className="flex gap-2 rounded bg-blue-50 p-4">
        <Link className="font-bold hover:underline" href="/admin/hunts">
          Hunts
        </Link>
        <Link className="font-bold hover:underline" href="/admin/users">
          Users
        </Link>
      </nav>
      <div className="p-8">{children}</div>
    </div>
  );
};

export default DashboardLayout;
