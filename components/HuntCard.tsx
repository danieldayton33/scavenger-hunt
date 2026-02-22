import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type HuntStatus = 'draft' | 'published' | 'completed';

export interface HuntCardProps {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  startAt: Date;
  endAt: Date;
  status: HuntStatus;
}

const statusConfig: Record<
  HuntStatus,
  { label: string; className: string }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  },
  published: {
    label: 'Published',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  completed: {
    label: 'Completed',
    className: 'bg-slate-200 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300',
  },
};

export function HuntCard({
  title,
  slug,
  description,
  imageUrl,
  startAt,
  endAt,
  status,
}: HuntCardProps) {
  const { label, className: statusClassName } = statusConfig[status];

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      {imageUrl ? (
        <Link href={`/admin/hunts/${slug}`} className="block aspect-video w-full overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </Link>
      ) : (
        <Link
          href={`/admin/hunts/${slug}`}
          className="flex aspect-video w-full items-center justify-center bg-muted text-muted-foreground"
        >
          <span className="text-sm">No image</span>
        </Link>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2 text-lg">
          <Link href={`/admin/hunts/${slug}`} className="hover:underline">
            {title}
          </Link>
        </CardTitle>
        {description ? (
          <CardDescription className="line-clamp-2">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <p className="text-muted-foreground text-xs">
          {new Date(startAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}{' '}
          –{' '}
          {new Date(endAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClassName}`}
        >
          {label}
        </span>
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild variant="secondary" size="sm" className="w-full">
          <Link href={`/admin/hunts/${slug}`}>View details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
