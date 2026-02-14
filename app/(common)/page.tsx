import { Button } from '@/components/ui/button';
import { getHuntsByStatusWithParticipation } from '@/lib/api/queries/hunts/getHuntsByStatusWithParticipation';
import Link from 'next/link';
import { auth } from '@/auth/config';
import HuntCardWithSignUp from '@/components/HuntCardWithSignUp';

export default async function Home() {
  const session = await auth();
  const hunts = await getHuntsByStatusWithParticipation({
    status: 'published',
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
