import { Button } from '@/components/ui/button';
import { db } from '@/db';
import { scavengerHunts } from '@/db/schema';
import getHuntItemsByHuntId from '@/lib/api/queries/huntItems/getHuntItemsByHuntId';
import { eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import Link from 'next/link';
import { notFound } from 'next/navigation';
const HuntDetails = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  let hunt = null;
  try {
    hunt = await db.query.scavengerHunts.findFirst({
      where: eq(scavengerHunts.slug, slug),
    });
  } catch (error) {
    console.error('Error fetching hunt:', error);
    notFound();
  }

  if (!hunt) {
    notFound();
  }
  const items = await unstable_cache(getHuntItemsByHuntId, [], {
    tags: ['hunt', `hunt-${hunt.id}`],
  }).apply();

  console.log(items);

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">{hunt.title}</h1>
      <p className="text-gray-600">{hunt.description}</p>
      <p className="text-sm text-gray-500">
        Start: {new Date(hunt.startAt).toLocaleDateString()} | End:{' '}
        {new Date(hunt.endAt).toLocaleDateString()}
      </p>
      <p className={`text-sm font-medium ${hunt.isPublished ? 'text-green-600' : 'text-red-600'}`}>
        {hunt.isPublished ? 'Published' : 'Unpublished'}
      </p>
      <Button>
        <Link href={`/admin/hunts/${hunt.slug}/edit`}>Edit Hunt</Link>
      </Button>
    </div>
  );
};

export default HuntDetails;
