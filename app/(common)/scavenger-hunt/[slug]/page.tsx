import HuntMap from '@/components/HuntMap';
import DeleteItemButton from '@/components/DeleteItemButton';

import { Button } from '@/components/ui/button';

import getHuntItemsByHuntId from '@/lib/api/queries/huntItems/getHuntItemsByHuntId';
import getHuntBySlug from '@/lib/api/queries/hunts/getHuntBySlug';
import { Pencil } from 'lucide-react';
import { unstable_cache } from 'next/cache';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const HuntViewPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const hunt = await getHuntBySlug(slug);
  if ('error' in hunt) {
    console.log(hunt.error);
    notFound();
  }
  console.log(hunt);
  const getCachedHuntItems = unstable_cache(
    getHuntItemsByHuntId,
    ['hunt-items'], // cache key seed
    {
      tags: ['hunt', `hunt-${hunt.id}`],
    }
  );
  const items = await getCachedHuntItems(hunt.id);

  return <HuntMap items={items} />;
};

export default HuntViewPage;
