import { Button } from '@/components/ui/button';
import { db } from '@/db';
import { scavengerHunts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';

export default async function Home() {
  const hunts = await db.query.scavengerHunts.findMany({
    where: eq(scavengerHunts.isPublished, true),
  });
  return (
    <div>
      <h1 className="text-2xl font-bold">Published Hunts</h1>
      <ul className="mt-4 space-y-4">
        {hunts.map((hunt) => (
          <li key={hunt.id} className="rounded-lg border p-4 shadow-sm">
            <h2 className="text-xl font-semibold">{hunt.title}</h2>
            <p className="text-gray-600">{hunt.description}</p>
            <p className="text-sm text-gray-500">
              Start: {new Date(hunt.startAt).toLocaleDateString()} | End:{' '}
              {new Date(hunt.endAt).toLocaleDateString()}
            </p>
            <p
              className={`text-sm font-medium ${hunt.isPublished ? 'text-green-600' : 'text-red-600'}`}
            >
              {hunt.isPublished ? 'Published' : 'Unpublished'}
            </p>
            <Button>
              <Link href={`/scavenger-hunt/${hunt.slug}`}>View Details</Link>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
