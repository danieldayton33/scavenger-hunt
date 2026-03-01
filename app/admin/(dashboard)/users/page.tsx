import getUsers from '@/lib/api/queries/users/getUsers';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { Suspense } from 'react';

async function UsersTable() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">All registered users</p>
      </div>

      {users.length === 0 ? (
        <p className="text-muted-foreground">No users found.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[140px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className={user.isActive === false ? 'opacity-60' : undefined}
                >
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.name ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isActive ? 'secondary' : 'destructive'}
                      className={user.isActive ? '' : 'bg-muted text-muted-foreground'}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span className="flex gap-3">
                      <Link
                        href={`/admin/users/${encodeURIComponent(user.id)}`}
                        className="text-primary hover:underline text-sm font-medium"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/users/${encodeURIComponent(user.id)}/edit`}
                        className="text-primary hover:underline text-sm font-medium"
                      >
                        Edit
                      </Link>
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading users…</div>}>
      <UsersTable />
    </Suspense>
  );
}
