'use client';

import { setSubmissionStatus } from '@/lib/api/mutations/submissions/setSubmissionStatus';
import { Button } from '@/components/ui/button';
import { Check, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SubmissionApprovalButtons({
  submissionId,
  currentStatus,
}: {
  submissionId: number;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);

  const handleStatus = async (status: 'approved' | 'rejected') => {
    setLoading(status === 'approved' ? 'approve' : 'reject');
    try {
      const result = await setSubmissionStatus(submissionId, status);
      if (result.ok) {
        toast.success(status === 'approved' ? 'Submission approved' : 'Submission rejected');
        if (result.pushError) {
          toast.warning(`User notification failed: ${result.pushError}`);
        }
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(null);
    }
  };

  const isPending = currentStatus === 'pending';

  return (
    <div className="flex items-center gap-2">
      {isPending && (
        <>
          <Button
            size="sm"
            variant="default"
            onClick={() => handleStatus('approved')}
            disabled={!!loading}
          >
            {loading === 'approve' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            <span className="ml-1">Approve</span>
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleStatus('rejected')}
            disabled={!!loading}
          >
            {loading === 'reject' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <span className="ml-1">Reject</span>
          </Button>
        </>
      )}
      {!isPending && (
        <span className="text-sm text-muted-foreground capitalize">{currentStatus}</span>
      )}
    </div>
  );
}
