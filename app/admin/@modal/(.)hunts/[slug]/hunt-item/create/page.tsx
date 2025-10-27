import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { scavengerHunts } from '@/db/schema';
import { notFound } from 'next/navigation';
import HuntItemForm from '@/components/HuntItemForm';
import ServerModal from '@/components/ServerModal';

const HuntItemCreateModal = async ({ params }: { params: Promise<{ slug: string }> }) => {
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
  return (
    <ServerModal title={`Add Item to ${hunt.title}`} description="Create a new hunt item">
      <HuntItemForm hunt={hunt} />
    </ServerModal>
  );
};

export default HuntItemCreateModal;
