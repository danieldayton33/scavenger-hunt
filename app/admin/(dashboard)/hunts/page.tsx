import { Button } from '@/components/ui/button';
import { HuntCard } from '@/components/HuntCard';
import { db } from '@/db';
import { scavengerHunts } from '@/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';

const HuntArchive = async () => {
  const hunts = await db.query.scavengerHunts.findMany({
    orderBy: [desc(scavengerHunts.createdAt)],
  });
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Hunts</h1>
        <Button asChild>
          <Link href="/admin/hunts/new">Create New Hunt</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hunts.map((hunt) => (
          <HuntCard
            key={hunt.id}
            id={hunt.id}
            title={hunt.title}
            slug={hunt.slug}
            description={hunt.description}
            imageUrl={hunt.imageUrl}
            startAt={hunt.startAt}
            endAt={hunt.endAt}
            status={hunt.status}
          />
        ))}
      </div>
    </div>
  );
};

export default HuntArchive;
