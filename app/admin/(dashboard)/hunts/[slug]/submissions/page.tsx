import getHuntBySlug from '@/lib/api/queries/hunts/getHuntBySlug';
import getSubmissionsByHuntId from '@/lib/api/queries/submissions/getSubmissionsByHuntId';
import SubmissionsTable from '@/components/SubmissionsTable';
import SubmissionsRefreshButton from '@/components/SubmissionsRefreshButton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
] as const;

async function SubmissionsContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { slug } = await params;
  const { status: statusFilter } = await searchParams;

  const hunt = await getHuntBySlug(slug);
  if ('error' in hunt) notFound();

  const statusForQuery =
    statusFilter && statusFilter !== 'all'
      ? (statusFilter as 'pending' | 'approved' | 'rejected')
      : undefined;
  const filtered = await getSubmissionsByHuntId(hunt.id, statusForQuery);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Submissions</h1>
          <p className="text-muted-foreground">{hunt.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <SubmissionsRefreshButton />
          <Button variant="outline" asChild>
            <Link href={`/admin/hunts/${slug}/submissions/summary`}>Summary</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/hunts/${slug}`}>Back to hunt</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <Button
            key={value}
            variant={statusFilter === value || (!statusFilter && value === 'all') ? 'default' : 'outline'}
            size="sm"
            asChild
          >
            <Link href={value === 'all' ? `/admin/hunts/${slug}/submissions` : `/admin/hunts/${slug}/submissions?status=${value}`}>
              {label}
            </Link>
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No submissions match the selected filter.</p>
      ) : (
        <SubmissionsTable submissions={filtered} slug={slug} showApprovalActions />
      )}
    </div>
  );
}

export default async function SubmissionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-4">Loading submissions…</div>}>
      <SubmissionsContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
