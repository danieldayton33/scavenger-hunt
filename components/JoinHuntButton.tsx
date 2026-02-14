'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { joinHunt } from '@/lib/api/mutations/participants/joinHunt';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function JoinHuntButton({ huntId, huntSlug }: { huntId: number; huntSlug: string }) {
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const result = await joinHunt(huntId, huntSlug);
      if (result.alreadyJoined) {
        toast.info('You are already a participant in this hunt');
      } else {
        toast.success('Successfully joined the hunt!');
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to join hunt.';
      toast.error(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Button onClick={handleJoin} disabled={isJoining}>
      {isJoining ? 'Joining...' : 'Join Hunt'}
    </Button>
  );
}

