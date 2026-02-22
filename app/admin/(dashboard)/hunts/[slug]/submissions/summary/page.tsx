import getHuntBySlug from '@/lib/api/queries/hunts/getHuntBySlug';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ScavengerHuntItem } from '@/lib/schemas/huntItem';
import type { Submission } from '@/lib/schemas/hunt';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

type ItemCounts = {
  item: ScavengerHuntItem;
  foundCount: number; // distinct users with approved submission
  pendingCount: number;
};

function buildItemCounts(
  items: ScavengerHuntItem[],
  submissions: Submission[]
): ItemCounts[] {
  const byItem = new Map<
    number,
    { foundUserIds: Set<string>; pendingUserIds: Set<string> }
  >();
  for (const item of items) {
    byItem.set(item.id, { foundUserIds: new Set(), pendingUserIds: new Set() });
  }
  for (const sub of submissions) {
    const entry = byItem.get(sub.itemId);
    if (!entry) continue;
    if (sub.status === 'approved') {
      entry.foundUserIds.add(sub.userId);
    } else if (sub.status === 'pending') {
      entry.pendingUserIds.add(sub.userId);
    }
  }
  return items.map((item) => {
    const entry = byItem.get(item.id) ?? {
      foundUserIds: new Set<string>(),
      pendingUserIds: new Set<string>(),
    };
    return {
      item,
      foundCount: entry.foundUserIds.size,
      pendingCount: entry.pendingUserIds.size,
    };
  });
}

async function SubmissionsSummaryContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const hunt = await getHuntBySlug(slug);
  if ('error' in hunt) notFound();

  const rows = buildItemCounts(hunt.items, hunt.submissions);
  const totalFound = rows.reduce((sum, r) => sum + r.foundCount, 0);
  const totalPending = rows.reduce((sum, r) => sum + r.pendingCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Submissions summary</h1>
          <p className="text-muted-foreground">{hunt.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/hunts/${slug}/submissions`}>View submissions</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/hunts/${slug}`}>Back to hunt</Link>
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground text-sm">
        Breakdown of how many users have found each item (approved submissions).
        Pending counts are users who have submitted but not yet approved.
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-right w-[120px]">Found</TableHead>
              <TableHead className="text-right w-[100px]">Pending</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground text-center py-8">
                  No items in this hunt.
                </TableCell>
              </TableRow>
            ) : (
              rows.map(({ item, foundCount, pendingCount }, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">
                    {item.sortOrder ?? index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-right font-medium">
                    {foundCount}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {pendingCount}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {rows.length > 0 && (
        <div className="flex gap-6 text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">Total found:</strong>{' '}
            {totalFound} (across all items)
          </span>
          <span>
            <strong className="text-foreground">Total pending:</strong>{' '}
            {totalPending}
          </span>
        </div>
      )}
    </div>
  );
}

export default async function SubmissionsSummaryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-4">Loading summary…</div>}>
      <SubmissionsSummaryContent params={params} />
    </Suspense>
  );
}
