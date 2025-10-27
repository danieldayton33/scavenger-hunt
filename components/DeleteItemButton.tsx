'use client';

import deleteHuntItem from '@/lib/api/mutations/huntItems/deleteHuntItem';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

const DeleteItemButton = ({ itemId }: { itemId: number }) => {
  const handleConfirm = async () => {
    try {
      const result = deleteHuntItem(itemId);
      if ('error' in result) {
        console.error(result.error);
        toast.error(`Error deleting hunt item: ${result.error}`);
      } else {
        toast.success('Hunt item deleted successfully');
        // Optionally, you can add logic to refresh the list or navigate away
      }
    } catch (error) {
      console.error('Error deleting hunt item', error);
      toast.error('Failed to delete hunt item');
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this item?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteItemButton;
