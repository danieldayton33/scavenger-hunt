import type { SubmissionWithUserAndItem } from '@/lib/api/queries/submissions/getSubmissionsByHuntId';
import SubmissionApprovalButtons from '@/components/SubmissionApprovalButtons';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';
import Link from 'next/link';

type SubmissionsTableProps = {
  submissions: SubmissionWithUserAndItem[];
  slug: string;
  showApprovalActions?: boolean;
};

export default function SubmissionsTable({
  submissions,
  slug,
  showApprovalActions = true,
}: SubmissionsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Image</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            {showApprovalActions && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell>
                <Link
                  href={`/admin/hunts/${slug}/submissions/${sub.id}`}
                  className="block w-fit"
                >
                  {sub.imageUrl ? (
                    <span className="block overflow-hidden rounded border ring-offset-background transition focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:opacity-90">
                      {sub.imageUrl.startsWith('data:') ? (
                        <img
                          src={sub.imageUrl}
                          alt=""
                          className="h-20 w-20 object-cover"
                          width={80}
                          height={80}
                        />
                      ) : (
                        <Image
                          src={sub.imageUrl}
                          alt=""
                          width={80}
                          height={80}
                          className="h-20 w-20 object-cover"
                        />
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/admin/hunts/${slug}/submissions/${sub.id}`}
                  className="font-medium hover:underline"
                >
                  {sub.item.title}
                </Link>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{sub.user.name ?? '—'}</div>
                  <div className="text-muted-foreground">{sub.user.email}</div>
                </div>
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-sm">
                {sub.comment || '—'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(sub.submittedAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    sub.status === 'approved'
                      ? 'default'
                      : sub.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {sub.status}
                </Badge>
              </TableCell>
              {showApprovalActions && (
                <TableCell className="text-right">
                  <SubmissionApprovalButtons
                    submissionId={sub.id}
                    currentStatus={sub.status}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
