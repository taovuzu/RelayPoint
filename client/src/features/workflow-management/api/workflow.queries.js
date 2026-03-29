import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWorkflows,
  fetchWorkflowById,
  selectWorkflows,
  selectSelectedWorkflow,
  selectPagination,
  selectWorkflowsLoading,
} from '@/redux/workflows';

export function useWorkflows({ page = 1, limit = 10 } = {}) {
  const dispatch = useDispatch();
  const workflows = useSelector(selectWorkflows);
  const pagination = useSelector(selectPagination);
  const isLoading = useSelector(selectWorkflowsLoading);

  useEffect(() => {
    dispatch(fetchWorkflows({ page, limit }));
  }, [dispatch, page, limit]);

  return { workflows, pagination, isLoading };
}

export function useWorkflowById(id) {
  const dispatch = useDispatch();
  const workflow = useSelector(selectSelectedWorkflow);
  const isLoading = useSelector(selectWorkflowsLoading);

  useEffect(() => {
    if (id) {
      dispatch(fetchWorkflowById(id));
    }
  }, [dispatch, id]);

  return { workflow, isLoading };
}
