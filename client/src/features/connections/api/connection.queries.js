import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConnections, selectConnections, selectConnectionsLoading } from '@/redux/connections';


export function useConnections() {
  const dispatch = useDispatch();
  const connections = useSelector(selectConnections);
  const isLoading = useSelector(selectConnectionsLoading);

  useEffect(() => {
    dispatch(fetchConnections());
  }, [dispatch]);

  return { connections, isLoading };
}
