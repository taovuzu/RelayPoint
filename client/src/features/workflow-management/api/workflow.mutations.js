import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toggleWorkflow, deleteWorkflow } from '@/redux/workflows';
import { toast } from 'sonner';

export function useToggleWorkflow() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (id) => {
    setIsLoading(true);
    try {
      await dispatch(toggleWorkflow(id)).unwrap();
      toast.success('Workflow status updated');
    } catch (err) {
      toast.error(err?.message || 'Failed to update workflow status');
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading };
}

export function useDeleteWorkflow() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (id) => {
    setIsLoading(true);
    try {
      await dispatch(deleteWorkflow(id)).unwrap();
      toast.success('Workflow deleted successfully');
    } catch (err) {
      toast.error(err?.message || 'Failed to delete workflow');
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading };
}
