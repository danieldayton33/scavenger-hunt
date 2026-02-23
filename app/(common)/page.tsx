import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { auth } from '@/auth/config';
import { getHuntsByStatusWithParticipation } from '@/lib/api/queries/hunts/getHuntsByStatusWithParticipation';
import HuntCardWithSignUp from '@/components/HuntCardWithSignUp';
import { Button } from '@/components/ui/button';

async function HomeContent() {
  const session = await auth();
  const hunts = await getHuntsByStatusWithParticipation({
    statuses: ['published'],
    userId: session?.user.id,
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      {/* Home-only banner */}
      <section className="overflow-hidden rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
        <div className="grid gap-6 p-6 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] sm:p-8">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Friends of the Raleigh Greenway
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-emerald-900 sm:text-4xl">
              Explore Raleigh&apos;s greenways, one clue at a time.
            </h1>
            <p className="text-sm text-emerald-900/80 sm:text-base">
              Friends of the Raleigh Greenway (FRoG) is a community nonprofit that celebrates and
              cares for Raleigh&apos;s Capital Area Greenway. This scavenger hunt invites you to
              discover new trails, public art, and hidden corners of the greenway while you collect
              clues and log your finds.
            </p>
            <p className="text-sm text-emerald-900/80 sm:text-base">
              Join an upcoming hunt to explore at your own pace—walk, ride, or roll—and help keep
              our greenway system active, connected, and loved.
            </p>
            <div className="pt-1">
              <Button asChild size="sm" variant="outline" className="border-emerald-600 text-emerald-900 hover:bg-emerald-100">
                <Link
                  href="https://friendsoftheraleighgreenway.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto flex w-full max-w-xs items-center justify-center sm:max-w-none">
            <Image
              src="/FROG_logo.png"
              alt="Friends of the Raleigh Greenway logo"
              width={320}
              height={320}
              className="h-auto w-full max-w-xs drop-shadow-xl sm:max-w-sm"
              priority
            />
          </div>
        </div>
      </section>

      {/* Upcoming hunts */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-2xl font-bold">Upcoming Hunts</h2>
          {hunts.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Sign in to join a hunt and track your progress.
            </p>
          )}
        </div>
        {hunts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            There are no active hunts right now. Check back soon or follow Friends of the Raleigh
            Greenway for the next event.
          </p>
        ) : (
          <ul className="mt-2 space-y-4">
            {hunts.map((hunt) => (
              <HuntCardWithSignUp key={hunt.id} hunt={hunt} session={session} />
            ))}
          </ul>
        )}
      </section>
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
