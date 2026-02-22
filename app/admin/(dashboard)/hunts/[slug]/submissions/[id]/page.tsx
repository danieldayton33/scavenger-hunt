import getHuntBySlug from '@/lib/api/queries/hunts/getHuntBySlug';
import getSubmissionByIdWithItemAndUser from '@/lib/api/queries/submissions/getSubmissionByIdWithItemAndUser';
import SubmissionApprovalButtons from '@/components/SubmissionApprovalButtons';
import SubmissionLocationMap from '@/components/SubmissionLocationMap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

function toNum(n: string | number | null | undefined): number | null {
  if (n == null) return null;
  const v = typeof n === 'string' ? parseFloat(n) : n;
  return Number.isFinite(v) ? (v as number) : null;
}

async function SubmissionDetailContent({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const submissionId = parseInt(id, 10);
  if (Number.isNaN(submissionId)) notFound();

  const hunt = await getHuntBySlug(slug);
  if ('error' in hunt) notFound();

  const submission = await getSubmissionByIdWithItemAndUser(submissionId);
  if (!submission || submission.huntId !== hunt.id) notFound();

  const itemLat = submission.item.lat;
  const itemLng = submission.item.lng;
  const subLat = submission.lat;
  const subLng = submission.lng;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Submission</h1>
          <p className="text-muted-foreground">
            {submission.item.title} · {submission.user.name ?? submission.user.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/hunts/${slug}/submissions`}>Back to submissions</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Photo</h2>
            {submission.imageUrl ? (
              <a
                href={submission.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-md border"
              >
                {submission.imageUrl.startsWith('data:') ? (
                  <img
                    src={submission.imageUrl}
                    alt=""
                    className="h-auto max-h-80 w-full object-contain"
                  />
                ) : (
                  <Image
                    src={submission.imageUrl}
                    alt=""
                    width={400}
                    height={300}
                    className="h-auto max-h-80 w-full object-contain"
                  />
                )}
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">No image</p>
            )}
          </div>

          <div className="rounded-lg border p-4">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Details</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Item</dt>
                <dd>{submission.item.title}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">User</dt>
                <dd>{submission.user.name ?? '—'}</dd>
                <dd className="text-muted-foreground">{submission.user.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Submitted</dt>
                <dd>{new Date(submission.submittedAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <Badge
                    variant={
                      submission.status === 'approved'
                        ? 'default'
                        : submission.status === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {submission.status}
                  </Badge>
                </dd>
              </div>
              {submission.comment && (
                <div>
                  <dt className="text-muted-foreground">Comment</dt>
                  <dd>{submission.comment}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">Actions</dt>
                <dd>
                  <SubmissionApprovalButtons
                    submissionId={submission.id}
                    currentStatus={submission.status}
                  />
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Location (item vs submission)
          </h2>
          <SubmissionLocationMap
            itemLat={itemLat}
            itemLng={itemLng}
            submissionLat={subLat}
            submissionLng={subLng}
            className="h-[400px] w-full rounded-lg overflow-hidden border"
          />
          {toNum(subLat) == null && (
            <p className="text-xs text-muted-foreground">
              Submission location was not reported; only the item target is shown.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <SubmissionDetailContent params={params} />
    </Suspense>
  );
}
