import { db } from '@/db';
import { scavengerHunts } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/auth/config';
import { isUserParticipant } from '@/lib/api/queries/participants/getParticipantByHuntAndUser';
import { Suspense } from 'react';
import HuntCardWithSignUp from '@/components/HuntCardWithSignUp';

async function ArchiveContent() {
  const session = await auth();
  const hunts = await db.query.scavengerHunts.findMany({
    where: eq(scavengerHunts.status, 'completed'),
    orderBy: [desc(scavengerHunts.createdAt)],
  });

  // Check participation status for all hunts if user is logged in
  const huntsWithParticipation = await Promise.all(
    hunts.map(async (hunt) => {
      const userIsParticipant = session?.user ? await isUserParticipant(hunt.id) : false;
      return { ...hunt, userIsParticipant };
    })
  );

  return (
    <div className="container mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Past Hunts</h1>
      {hunts.length === 0 ? (
        <p className="text-muted-foreground">No past hunts yet.</p>
      ) : (
        <ul className="space-y-4">
          {huntsWithParticipation.map((hunt) => (
            <HuntCardWithSignUp key={hunt.id} hunt={hunt} session={session} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ArchivePage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <ArchiveContent />
    </Suspense>
  );
}
