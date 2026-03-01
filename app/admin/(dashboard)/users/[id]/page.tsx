import getUserByIdWithHuntsAndSubmissions from '@/lib/api/queries/users/getUserByIdWithHuntsAndSubmissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

async function UserDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = decodeURIComponent(id);
  const user = await getUserByIdWithHuntsAndSubmissions(userId);
  if (!user) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{user.name ?? user.email}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
              {user.role}
            </Badge>
            <Badge
              variant={user.isActive ? 'secondary' : 'destructive'}
              className={user.isActive ? '' : 'bg-muted text-muted-foreground'}
            >
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/admin/users/${encodeURIComponent(userId)}/edit`}>Edit</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/users">Back to users</Link>
          </Button>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">Hunts joined</h2>
        {user.participatedHunts.length === 0 ? (
          <p className="text-muted-foreground text-sm">Not joined any hunts yet.</p>
        ) : (
          <ul className="rounded-md border divide-y">
            {user.participatedHunts.map(({ hunt, joinedAt }) => (
              <li key={hunt.id}>
                <Link
                  href={`/admin/hunts/${hunt.slug}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50"
                >
                  <span className="font-medium">{hunt.title}</span>
                  <span className="text-muted-foreground text-sm">
                    Joined {new Date(joinedAt).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Submissions</h2>
        {user.submissions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No submissions yet.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hunt</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.submissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <Link
                        href={`/admin/hunts/${sub.hunt.slug}`}
                        className="font-medium hover:underline"
                      >
                        {sub.hunt.title}
                      </Link>
                    </TableCell>
                    <TableCell>{sub.item.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sub.status === 'approved'
                            ? 'default'
                            : sub.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/hunts/${sub.hunt.slug}/submissions/${sub.id}`}
                        className="text-primary hover:underline text-sm font-medium"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <UserDetailContent params={params} />
    </Suspense>
  );
}
