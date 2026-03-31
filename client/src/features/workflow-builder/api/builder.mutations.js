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

  const mutate = async (serializedPayload, isEdit = false) => {
    setIsLoading(true);
    
    try {
      const validPayload = workflowPayloadSchema.parse(serializedPayload);

      const result = await dispatch(saveWorkflow(validPayload)).unwrap();
      
      toast.success(isEdit ? 'Workflow updated' : 'Workflow created successfully');
      
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
