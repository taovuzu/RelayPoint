import { useState, useEffect, useCallback, useRef } from 'react';
import { request } from '@/request';
import { isTerminalStatus } from '../model/execution.utils';

const POLL_INTERVAL_MS = 3000;

export function useExecutionPolling(workflowId, relayRunId) {
  const [run, setRun] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const fetchRun = useCallback(async () => {
    try {
      const response = await request.get(`/api/v1/workflows/${workflowId}`);
      const workflow = response.data?.data;
      const matchedRun = workflow?.relayRuns?.find(r => r.id === relayRunId);

      if (matchedRun) {
        setRun(matchedRun);
        setError(null);

        if (isTerminalStatus(matchedRun.status)) {
          stopPolling();
        }
      } else {
        setError('Run not found in workflow data.');
        stopPolling();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch run status.');
      stopPolling();
    }
  }, [workflowId, relayRunId, stopPolling]);

  useEffect(() => {
    if (!workflowId || !relayRunId) {
      stopPolling();
      setRun(null);
      return;
    }

    setIsPolling(true);
    setError(null);
    fetchRun();

    intervalRef.current = setInterval(fetchRun, POLL_INTERVAL_MS);

    return () => {
      stopPolling();
    };
  }, [workflowId, relayRunId, fetchRun, stopPolling]);

  return { run, isPolling, error };
}

