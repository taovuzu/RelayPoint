import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { saveWorkflow } from '@/redux/builder';
import { workflowPayloadSchema } from '../model/builder.schemas';
import { toast } from 'sonner';

export function useSaveWorkflow() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async ({ workflowData, id }, isEdit = false) => {
    setIsLoading(true);
    
    try {
      const validWorkflowData = workflowPayloadSchema.parse(workflowData);

      await dispatch(saveWorkflow({ workflowData: validWorkflowData, id })).unwrap();
      
      toast.success(isEdit ? 'Workflow updated successfully' : 'Workflow created successfully');
      
      navigate('/workflows');

    } catch (err) {
      if (err.name === 'ZodError') {
        toast.error(err.errors[0].message);
      } else {
        toast.error(err?.message || 'Failed to save workflow. Please try again.');
        console.error('Workflow Save Error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading };
}
