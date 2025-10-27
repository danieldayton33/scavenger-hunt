import HuntItemForm from '@/components/HuntItemForm';
import getHuntItemById from '@/lib/api/queries/huntItems/getHuntItemById';
import getHuntBySlug from '@/lib/api/queries/hunts/getHuntBySlug';
import { HuntItemFormData } from '@/lib/schemas/huntItem';
import { notFound } from 'next/navigation';

const HuntItemEditPage = async ({
  params,
}: {
  params: Promise<{ slug: string; itemId: string }>;
}) => {
  const { slug, itemId } = await params;
  const hunt = await getHuntBySlug(slug);
  if ('error' in hunt) {
    console.log(hunt.error);
    notFound();
  }
  const item = await getHuntItemById(parseInt(itemId, 10));
  if ('error' in item) {
    console.log(item.error);
    notFound();
  }
  console.log(item, 'item');

  const formValues: HuntItemFormData = {
    title: item.title,
    description: item.description || '',
    hint: item.hint || '',
    imageUrl: item.imageUrl || '',
    lat: item.lat.toString() || '0',
    lng: item.lng.toString() || '0',
    itemType: (item.itemType as 'critter' | 'art' | 'other') || 'critter',
  };
  console.log(formValues, 'formValues');

  return (
    <div className="gap4 flex flex-col">
      <h1 className="mb-4 text-2xl font-bold">Edit Item: {item.title}</h1>
      <HuntItemForm defaultValues={formValues} hunt={hunt} isEdit />
    </div>
  );
};

export default HuntItemEditPage;
