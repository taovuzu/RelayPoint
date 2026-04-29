import { useState, useEffect } from 'react';
import { request } from '@/request';

export function useDynamicData(appKey, dynamicDataKey, parameters) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!appKey || !dynamicDataKey) return;
    
    let isMounted = true;
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const response = await request.post(`/api/v1/apps/dynamic-data/${appKey}`, {
          dynamicDataKey,
          parameters,
        });
        if (isMounted) {
          setData(response.data.data || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOptions();
    return () => { isMounted = false; };
  }, [appKey, dynamicDataKey, JSON.stringify(parameters)]);

  return { data, loading, error };
}
