import { db } from '@/db';
import { scavengerHunts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { HuntForm } from '@/components/HuntForm';
import { toInputValue } from '@/lib/utils/dateUtils';

const EditHuntPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  const hunt = await db.query.scavengerHunts.findFirst({
    where: eq(scavengerHunts.slug, slug),
  });
  if (!hunt) {
    notFound();
  }

  const defaultValues = {
    title: hunt.title,
    slug: hunt.slug,
    description: hunt.description || '',
    startAt: toInputValue(hunt.startAt),
    endAt: toInputValue(hunt.endAt),
    status: hunt.status,
  };

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Edit Hunt: {hunt.title}</h1>
      <HuntForm defaultValues={defaultValues} isEdit />
    </div>
  );
};

export default EditHuntPage;
