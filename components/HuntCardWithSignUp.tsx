import { HuntWithParticipation } from '@/lib/api/queries/hunts/getHuntsByStatusWithParticipation';
import { Button } from './ui/button';
import Link from 'next/link';
import { JoinHuntButton } from './JoinHuntButton';
import { Session } from 'next-auth';

const HuntCardWithSignUp = ({
  hunt,
  session,
}: {
  hunt: HuntWithParticipation;
  session: Session | null;
}) => {
  return (
    <li key={hunt.id} className="rounded-lg border p-4 shadow-sm">
      <h2 className="text-xl font-semibold">{hunt.title}</h2>
      <p className="text-gray-600">{hunt.description}</p>
      <p className="text-sm text-gray-500">
        Start: {new Date(hunt.startAt).toLocaleDateString()} | End:{' '}
        {new Date(hunt.endAt).toLocaleDateString()}
      </p>
      <div className="mt-4 flex gap-2">
        <Button asChild>
          <Link href={`/scavenger-hunt/${hunt.slug}`}>View Details</Link>
        </Button>
        {session?.user && !hunt.userIsParticipant && (
          <JoinHuntButton huntId={hunt.id} huntSlug={hunt.slug} />
        )}
      </div>
    </li>
  );
};

export default HuntCardWithSignUp;
