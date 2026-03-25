import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/redux/app';
import { AddConnectionButton } from '@/features/connections/ui/AddConnectionButton';
import { ConnectionGrid } from '@/features/connections/ui/ConnectionGrid';

export default function ConnectionsPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle('Integrations & Connections'));
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations & Connections</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your connected services and API authentications.
          </p>
        </div>
        <AddConnectionButton />
      </div>
      
      <ConnectionGrid />
    </div>
  );
}
