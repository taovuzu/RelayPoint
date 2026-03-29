import { useDeleteWorkflow } from '../api/workflow.mutations';
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

export function DeleteWorkflowDialog({ workflowId, workflowName, isOpen, onClose }) {
  const { mutate, isLoading } = useDeleteWorkflow();

  const handleDelete = () => {
    mutate(workflowId)
      .then(() => {
        onClose();
      })
      .catch(() => {});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete "{workflowName}"?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All run history and configuration for this workflow will
            be permanently removed. Active executions will be terminated immediately.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2 sm:gap-0 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Workflow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
