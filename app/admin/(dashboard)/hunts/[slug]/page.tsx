import DeleteItemButton from '@/components/DeleteItemButton';
import HuntMap from '@/components/HuntMap';
import ParticipantsByHuntSlug from '@/components/ParticipantsByHuntSlug';
import Scoreboard from '@/components/Scoreboard';
import SubmissionsTable from '@/components/SubmissionsTable';
import { Button } from '@/components/ui/button';
import getHuntBySlug from '@/lib/api/queries/hunts/getHuntBySlug';
import getSubmissionsByHuntId from '@/lib/api/queries/submissions/getSubmissionsByHuntId';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

async function HuntDetailsContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const hunt = await getHuntBySlug(slug);

  if ('error' in hunt) {
    notFound();
  }
  const { items } = hunt;
  const pendingSubmissions = await getSubmissionsByHuntId(hunt.id, 'pending');

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="flex flex-col gap-2">
        <h1 className="mb-4 text-2xl font-bold">{hunt.title}</h1>
        <p className="text-gray-600">{hunt.description}</p>
        <p className="text-sm text-gray-500">
          Start: {new Date(hunt.startAt).toLocaleDateString()} | End:{' '}
          {new Date(hunt.endAt).toLocaleDateString()}
        </p>
        <p
          className={`text-sm font-medium ${hunt.status === 'published' ? 'text-green-600' : 'text-red-600'}`}
        >
          {hunt.status === 'published'
            ? 'Published'
            : hunt.status === 'completed'
              ? 'Completed'
              : 'Draft'}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button asChild>
            <Link href={`/admin/hunts/${hunt.slug}/edit`}>Edit Hunt</Link>
          </Button>
        </div>
      </div>
      <div className="lg:col-span-2 p-4 grid gap-2 border-1 border-accent rounded-lg">
        <h2 className="mt-6 mb-2 text-xl font-semibold">Hunt Items</h2>
        <div className="grid grid-cols-1 gap-4 rounded-lg bg-card p-4 md:grid-cols-[auto_1fr] border-accent border-2">
          <div>
            {items.length > 0 ? (
              <ul className="list-disc">
                {items.map((item) => (
                  <li key={item.id} className="mb-1 grid grid-cols-[1fr_auto] items-center gap-4">
                    {item.title}
                    <div className="flex gap-2">
                      <DeleteItemButton itemId={item.id} />
                      <Button size="sm">
                        <Link href={`/admin/hunts/${hunt.slug}/hunt-item/${item.id}`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No items found for this hunt.</p>
            )}

            <div>
              <Button>
                <Link href={`/admin/hunts/${hunt.slug}/hunt-item/create`}>Add Hunt Item</Link>
              </Button>
            </div>
          </div>
          <HuntMap items={items} className="flex h-full min-h-96 w-full flex-col" />
        </div>
      </div>
      <Scoreboard huntId={hunt.id} />
      <div className="flex flex-col gap-2 lg:col-span-2 p-4 border-1 border-accent rounded-lg">
        <h2 className="text-lg font-semibold">Pending submissions</h2>
        {pendingSubmissions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No pending submissions.</p>
        ) : (
          <SubmissionsTable
            submissions={pendingSubmissions}
            slug={slug}
            showApprovalActions
          />
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/hunts/${hunt.slug}/submissions/summary`}>
              Submissions summary
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/hunts/${hunt.slug}/submissions`}>
              View submissions
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function HuntDetails({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <HuntDetailsContent params={params} />
    </Suspense>
  );
}
