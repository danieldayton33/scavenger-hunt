import { Button } from '@/components/ui/button';
import { JoinHuntButton } from '@/components/JoinHuntButton';
import { db } from '@/db';
import { scavengerHunts } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { auth } from '@/auth/config';
import { isUserParticipant } from '@/lib/api/queries/participants/getParticipantByHuntAndUser';
import { Suspense } from 'react';

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
      <h1 className="mb-6 text-3xl font-bold">Hunt Archive</h1>
      {hunts.length === 0 ? (
        <p className="text-muted-foreground">No published hunts available yet.</p>
      ) : (
        <ul className="space-y-4">
          {huntsWithParticipation.map((hunt) => (
            <li key={hunt.id} className="rounded-lg border p-4 shadow-sm">
              <h2 className="text-xl font-semibold">{hunt.title}</h2>
              <p className="text-gray-600">{hunt.description}</p>
              <p className="text-sm text-gray-500">
                Start: {new Date(hunt.startAt).toLocaleDateString()} | End:{' '}
                {new Date(hunt.endAt).toLocaleDateString()}
              </p>
              <div className="mt-4 flex gap-2">
                <Button asChild>
                  <Link href={`/scavenger-hunt/${hunt.slug}`}>View Details</Link>
                </Button>
                {session?.user && !hunt.userIsParticipant && (
                  <JoinHuntButton huntId={hunt.id} huntSlug={hunt.slug} />
                )}
              </div>
            </li>
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
