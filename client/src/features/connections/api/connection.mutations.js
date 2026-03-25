import { useState } from 'react';
import { useDispatch } from 'react-redux';
import Nango from '@nangohq/frontend';
import { getSessionToken, fetchConnections, deleteConnection, createConnection } from '@/redux/connections';
import { toast } from 'sonner';

export function useConnectSession() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async () => {
    setIsLoading(true);
    try {
      const resultAction = await dispatch(getSessionToken()).unwrap();
      const token = resultAction?.data?.sessionToken || resultAction?.sessionToken;
      
      if (!token) {
        throw new Error("No session token received from the server.");
      }

      const nango = new Nango(); 

      const connect = nango.openConnectUI({
        onEvent: async (event) => {
          if (event.type === 'connect') {
            const providerConfigKey = event.payload?.providerConfigKey || event.providerConfigKey;
            const connectionId = event.payload?.connectionId || event.connectionId;
            const accountIdentifier = event.payload?.accountIdentifier || event.accountIdentifier || 'Connected Account';
            
            toast.info(`Connecting ${providerConfigKey}...`);
            
            const serviceMapping = {
              'google-mail': 'GMAIL',
              'gmail': 'GMAIL',
              'slack': 'SLACK',
              'github': 'GITHUB',
              'github-oauth': 'GITHUB',
              'notion': 'NOTION'
            };
            
            const service = serviceMapping[providerConfigKey] || providerConfigKey?.toUpperCase() || 'UNKNOWN';
            
            try {
              if (!connectionId) throw new Error("Missing connectionId from Nango");
              
              await dispatch(createConnection({
                service: service,
                connectionId: connectionId,
                accountIdentifier: accountIdentifier
              })).unwrap();
              
              toast.success(`${service} connected and persisted successfully!`);
              dispatch(fetchConnections());
            } catch (err) {
              toast.error(err?.message || `Failed to persist ${service} connection.`);
            }
          } else if (event.type === 'error') {
            toast.error(`Nango Error: ${event.payload.message}`);
          }
        },
      });

      connect.setSessionToken(token);

    } catch (err) {
      console.error('Nango Auth Error:', err);
      toast.error(err?.message || 'Failed to initiate connection session.');
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading };
}

export function useDeleteConnection() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (id) => {
    setIsLoading(true);
    try {
      await dispatch(deleteConnection(id)).unwrap();
      toast.success('Connection deleted successfully.');
      dispatch(fetchConnections());
    } catch (err) {
      toast.error(err?.message || 'Failed to delete connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading };
}

