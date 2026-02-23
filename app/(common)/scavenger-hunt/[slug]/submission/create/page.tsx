import { auth } from '@/auth/config';
import { redirect } from 'next/navigation';
import SubmissionForm from '@/components/SubmissionForm';
import getHuntBySlug from '@/lib/api/queries/hunts/getHuntBySlug';
import getHuntItemById from '@/lib/api/queries/huntItems/getHuntItemById';
import { isUserParticipant } from '@/lib/api/queries/participants/getParticipantByHuntAndUser';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { JoinHuntButton } from '@/components/JoinHuntButton';
import Link from 'next/link';
import { createRandomizedCircle } from '@/lib/utils/mapUtils';
import { Suspense } from 'react';

async function CreateSubmissionContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ itemId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { slug } = await params;
  const { itemId } = await searchParams;

  if (!itemId) {
    notFound();
  }

  const hunt = await getHuntBySlug(slug);
  if ('error' in hunt) {
    notFound();
  }

  const item = await getHuntItemById(parseInt(itemId, 10));
  if ('error' in item) {
    notFound();
  }

  // Verify item belongs to this hunt
  if (item.huntId !== hunt.id) {
    notFound();
  }

  // If hunt is completed, submissions are closed
  if (hunt.status === 'completed') {
    return (
      <div className="container mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold">Submissions Closed</h1>
        <div className="rounded-lg border p-6">
          <p className="mb-4 text-gray-600">
            This hunt has ended and is now part of our past hunts. New submissions are closed.
          </p>
          <Button variant="outline" asChild>
            <Link href={`/scavenger-hunt/${slug}`}>Back to Hunt</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Check if user is a participant
  const userIsParticipant = await isUserParticipant(hunt.id);
  if (!userIsParticipant) {
    return (
      <div className="container mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold">Join Hunt Required</h1>
        <div className="rounded-lg border p-6">
          <p className="mb-4 text-gray-600">
            You need to join this hunt before you can create a submission.
          </p>
          <div className="flex gap-2">
            {hunt.status !== 'completed' && (
              <JoinHuntButton huntId={hunt.id} huntSlug={slug} />
            )}
            <Button variant="outline" asChild>
              <Link href={`/scavenger-hunt/${slug}`}>Back to Hunt</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate randomized circle on server side (stable across renders)
  const itemLat = parseFloat(item.lat.toString());
  const itemLng = parseFloat(item.lng.toString());
  const randomizedCircle = createRandomizedCircle(itemLat, itemLng, 750, 200);

  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold">Create Submission</h1>
      <div className="mb-4 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">{item.title}</h2>
        <p className="text-sm text-gray-600">{item.description}</p>
        {item.hint && (
          <p className="mt-2 text-sm">
            <span className="font-medium">Clue:</span> {item.hint}
          </p>
        )}
      </div>
      <SubmissionForm hunt={hunt} item={item} randomizedCircle={randomizedCircle} />
    </div>
  );
}

export default function CreateSubmissionPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ itemId?: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <CreateSubmissionContent params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}
