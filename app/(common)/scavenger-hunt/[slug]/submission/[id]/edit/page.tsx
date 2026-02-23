import { auth } from '@/auth/config';
import { redirect } from 'next/navigation';
import SubmissionForm from '@/components/SubmissionForm';
import getHuntBySlug from '@/lib/api/queries/hunts/getHuntBySlug';
import getHuntItemById from '@/lib/api/queries/huntItems/getHuntItemById';
import getSubmissionById from '@/lib/api/queries/submissions/getSubmissionById';
import { isUserParticipant } from '@/lib/api/queries/participants/getParticipantByHuntAndUser';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { JoinHuntButton } from '@/components/JoinHuntButton';
import Link from 'next/link';
import { createRandomizedCircle } from '@/lib/utils/mapUtils';
import { Suspense } from 'react';

async function EditSubmissionContent({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { slug, id } = await params;
  const submissionId = parseInt(id, 10);

  if (isNaN(submissionId)) {
    notFound();
  }

  const submission = await getSubmissionById(submissionId);
  if ('error' in submission) {
    notFound();
  }

  // Verify submission belongs to the user
  if (submission.userId !== session.user.id) {
    notFound();
  }

  const hunt = await getHuntBySlug(slug);
  if ('error' in hunt) {
    notFound();
  }

  // Verify submission belongs to this hunt
  if (submission.huntId !== hunt.id) {
    notFound();
  }

  const item = await getHuntItemById(submission.itemId);
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
            This hunt has ended and is now part of our past hunts. Editing submissions is closed.
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
            You need to join this hunt before you can edit a submission.
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
      <h1 className="mb-6 text-3xl font-bold">Edit Submission</h1>
      <div className="mb-4 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">{item.title}</h2>
        <p className="text-sm text-gray-600">{item.description}</p>
        {item.hint && (
          <p className="mt-2 text-sm">
            <span className="font-medium">Clue:</span> {item.hint}
          </p>
        )}
      </div>
      <SubmissionForm
        hunt={hunt}
        item={item}
        randomizedCircle={randomizedCircle}
        submission={submission}
        submissionId={submissionId}
      />
    </div>
  );
}

export default function EditSubmissionPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <EditSubmissionContent params={params} />
    </Suspense>
  );
}

