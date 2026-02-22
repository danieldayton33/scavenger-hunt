import { getHuntsByStatusWithParticipation } from '@/lib/api/queries/hunts/getHuntsByStatusWithParticipation';
import { auth } from '@/auth/config';
import HuntCardWithSignUp from '@/components/HuntCardWithSignUp';
import { Suspense } from 'react';

async function HomeContent() {
  const session = await auth();
  const hunts = await getHuntsByStatusWithParticipation({
    statuses: ['published'],
    userId: session?.user.id,
  });
  return (
    <div>
      <h1 className="text-2xl font-bold">Open Hunts</h1>
      <ul className="mt-4 space-y-4">
        {hunts.map((hunt) => (
          <HuntCardWithSignUp key={hunt.id} hunt={hunt} session={session} />
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
