import DeleteItemButton from '@/components/DeleteItemButton';
import HuntMap from '@/components/HuntMap';
import { Button } from '@/components/ui/button';

import getHuntBySlug from '@/lib/api/queries/hunts/getHuntBySlug';
import { Pencil } from 'lucide-react';
import { unstable_cache } from 'next/cache';
import Link from 'next/link';
import { notFound } from 'next/navigation';
const HuntDetails = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  const getCachedHuntWithItems = unstable_cache(
    getHuntBySlug,
    ['hunt-items'], // cache key seed
    {
      tags: ['hunt', `hunt-${slug}`],
    }
  );
  const hunt = await getCachedHuntWithItems(slug);

  if ('error' in hunt) {
    console.log(hunt.error);
    notFound();
  }
  const { items } = hunt;

  return (
    <div className="flex flex-col gap-2">
      <h1 className="mb-4 text-2xl font-bold">{hunt.title}</h1>
      <p className="text-gray-600">{hunt.description}</p>
      <p className="text-sm text-gray-500">
        Start: {new Date(hunt.startAt).toLocaleDateString()} | End:{' '}
        {new Date(hunt.endAt).toLocaleDateString()}
      </p>
      <p className={`text-sm font-medium ${hunt.isPublished ? 'text-green-600' : 'text-red-600'}`}>
        {hunt.isPublished ? 'Published' : 'Unpublished'}
      </p>
      <div>
        <Button className="mt-4">
          <Link href={`/admin/hunts/${hunt.slug}/edit`}>Edit Hunt</Link>
        </Button>
      </div>

      <h2 className="mt-6 mb-2 text-xl font-semibold">Hunt Items</h2>
      {items.length > 0 ? (
        <ul className="list-disc pl-5">
          {items.map((item) => (
            <li key={item.id} className="mb-1 grid grid-cols-[1fr_auto] items-center gap-4">
              {item.title}
              <div className="flex gap-2">
                <DeleteItemButton itemId={item.id} />
                <Button size="sm">
                  <Link href={`/admin/hunts/${hunt.slug}/hunt-item/${item.id}`}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No items found for this hunt.</p>
      )}

      <div>
        <Button>
          <Link href={`/admin/hunts/${hunt.slug}/hunt-item/create`}>Add Hunt Item</Link>
        </Button>
      </div>
      <HuntMap items={items} className="mt-6 h-96 w-full" />
    </div>
  );
};

export default HuntDetails;
