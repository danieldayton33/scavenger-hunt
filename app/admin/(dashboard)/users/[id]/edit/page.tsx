import getUserByIdWithHuntsAndSubmissions from '@/lib/api/queries/users/getUserByIdWithHuntsAndSubmissions';
import AdminUserEditForm from '@/components/AdminUserEditForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

async function EditUserContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = decodeURIComponent(id);
  const user = await getUserByIdWithHuntsAndSubmissions(userId);
  if (!user) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Edit user: {user.name ?? user.email}</h1>
        <Button variant="outline" asChild>
          <Link href={`/admin/users/${encodeURIComponent(user.id)}`}>Back to user</Link>
        </Button>
      </div>
      <AdminUserEditForm
        userId={user.id}
        initialName={user.name}
        initialRole={user.role}
        initialIsActive={user.isActive}
        initialEmail={user.email}
      />
    </div>
  );
}

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <EditUserContent params={params} />
    </Suspense>
  );
}
