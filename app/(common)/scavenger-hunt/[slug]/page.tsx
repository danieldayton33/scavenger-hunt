import HuntMap from '@/components/HuntMap';
import { JoinHuntButton } from '@/components/JoinHuntButton';
import Countdown from '@/components/Countdown';
import Scoreboard from '@/components/Scoreboard';
import { auth } from '@/auth/config';
import getHuntBySlug from '@/lib/api/queries/hunts/getHuntBySlug';
import { notFound } from 'next/navigation';
import getSubmissionsForUserByHuntId from '@/lib/api/queries/submissions/getSubmissionsForUserByHuntId';
import { Suspense } from 'react';

async function HuntViewContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const huntWithItems = await getHuntBySlug(slug);
  if ('error' in huntWithItems) {
    console.log(huntWithItems.error);
    notFound();
  }

  const { items, participants } = huntWithItems;
  const submissions = session?.user
    ? await getSubmissionsForUserByHuntId(huntWithItems.id, session.user.id)
    : [];
  if (Array.isArray(submissions) ? false : 'error' in submissions) {
    console.log((submissions as { error: string }).error);
    notFound();
  }

  const submissionList = Array.isArray(submissions) ? submissions : [];
  const userIsParticipant = participants.some(
    (participant) => participant.userId === session?.user?.id
  );

  let leftToFind = items.length;

  const itemsWithSubmissionStatus = items.map((item) => {
    const submission = submissionList.find((s) => s.itemId === item.id);
    const status: 'not_submitted' | 'submitted' | 'approved' | 'rejected' = submission
      ? submission.status === 'pending'
        ? 'submitted'
        : (submission.status as 'approved' | 'rejected')
      : 'not_submitted';
    if (status === 'approved') {
      leftToFind--;
    }
    return {
      ...item,
      submissionStatus: status,
      submissionId: submission?.id,
    };
  });

  return (
    <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{huntWithItems.title}</h1>
        {huntWithItems.description && (
          <p className="mt-2 text-gray-600">{huntWithItems.description}</p>
        )}
        {session?.user && !userIsParticipant && huntWithItems.status !== 'completed' && (
          <JoinHuntButton huntId={huntWithItems.id} huntSlug={slug} />
        )}
        <Countdown endAt={huntWithItems.endAt} />
        <p className="mt-2 font-bold text-gray-600">Left to find: {leftToFind}</p>
        <Scoreboard huntId={huntWithItems.id} />
      </div>
      <div className="lg:col-span-2 xl:col-span-3">
        <HuntMap
          items={itemsWithSubmissionStatus}
          isParticipantView={true}
          huntSlug={slug}
          isParticipant={userIsParticipant}
        />
      </div>
    </div>
  );
}

export default function HuntViewPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="p-4">Loading hunt...</div>}>
      <HuntViewContent params={params} />
    </Suspense>
  );
}
