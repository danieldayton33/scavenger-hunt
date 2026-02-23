import { HuntWithParticipation } from '@/lib/api/queries/hunts/getHuntsByStatusWithParticipation';
import { Button } from './ui/button';
import Link from 'next/link';
import { JoinHuntButton } from './JoinHuntButton';
import { Session } from 'next-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const HuntCardWithSignUp = ({
  hunt,
  session,
}: {
  hunt: HuntWithParticipation;
  session: Session | null;
}) => {
  const hasImage = hunt.imageUrl != null && hunt.imageUrl.length > 0;

  return (
    <li>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="flex w-full flex-col sm:flex-row">
          {/* Image on the left */}
          <div className="relative h-40 w-full shrink-0 sm:h-auto sm:w-48 sm:min-h-[180px]">
            {hasImage ? (
              <Link
                href={`/scavenger-hunt/${hunt.slug}`}
                className="block h-full w-full overflow-hidden bg-muted"
              >
                <img
                  src={hunt.imageUrl!}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </Link>
            ) : (
              <Link
                href={`/scavenger-hunt/${hunt.slug}`}
                className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground"
              >
                <span className="text-sm">No image</span>
              </Link>
            )}
          </div>
          {/* Content on the right */}
          <div className="flex min-w-0 flex-1 flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="line-clamp-2 text-lg">
                <Link href={`/scavenger-hunt/${hunt.slug}`} className="hover:underline">
                  {hunt.title}
                </Link>
              </CardTitle>
              {hunt.description ? (
                <CardDescription className="line-clamp-2">
                  {hunt.description}
                </CardDescription>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <p className="text-muted-foreground text-xs">
                {new Date(hunt.startAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                –{' '}
                {new Date(hunt.endAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              {hunt.userIsParticipant && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                  Joined
                </span>
              )}
            </CardContent>
            <CardFooter className="mt-auto gap-2 pt-0">
              <Button asChild variant="secondary" size="sm">
                <Link href={`/scavenger-hunt/${hunt.slug}`}>View details</Link>
              </Button>
              {session?.user && !hunt.userIsParticipant && hunt.status !== 'completed' && (
                <JoinHuntButton huntId={hunt.id} huntSlug={hunt.slug} />
              )}
            </CardFooter>
          </div>
        </div>
      </Card>
    </li>
  );
};

export default HuntCardWithSignUp;
