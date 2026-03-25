import { useConnectSession } from '@/features/connections/api/connection.mutations';
import { Button } from '@/shared/ui/button';
import { Loader2, Plus } from 'lucide-react';

export function AddConnectionButton() {
  const { mutate, isLoading } = useConnectSession();

  return (
    <Button onClick={() => mutate()} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Plus className="mr-2 h-4 w-4" />
      )}
      Add Connection
    </Button>
  );
}
