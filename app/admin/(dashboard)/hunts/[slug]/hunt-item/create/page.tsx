import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { scavengerHunts } from '@/db/schema';
import { notFound } from 'next/navigation';
import HuntItemForm from '@/components/HuntItemForm';

const HuntItemCreatePage = async ({ params }: { params: Promise<{ slug: string }> }) => {
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

  return <HuntItemForm hunt={hunt} />;
};

export default HuntItemCreatePage;
