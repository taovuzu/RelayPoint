import { useDeleteConnection } from '@/features/connections/api/connection.mutations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Loader2 } from 'lucide-react';

export function DeleteConnectionDialog({ connectionId, connectionName, isOpen, onClose }) {
  const { mutate, isLoading } = useDeleteConnection();

  const handleDelete = () => {
    mutate(connectionId).then(() => {
      onClose();
    }).catch(() => {});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {connectionName} Connection?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Workflows relying on this integration will fail immediately upon execution until reconfigured.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2 sm:gap-0 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

