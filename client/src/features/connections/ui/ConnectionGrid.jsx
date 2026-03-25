import { useConnections } from '@/features/connections/api/connection.queries';
import { ConnectionCard } from './ConnectionCard';
import { AddConnectionButton } from './AddConnectionButton';
import { Skeleton } from '@/shared/ui/skeleton';
import { Card, CardContent } from '@/shared/ui/card';
import { Link2 } from 'lucide-react';

export function ConnectionGrid() {
  const { connections, isLoading } = useConnections();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={`skeleton-${i}`}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!connections?.length) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
            <Link2 className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">No connections found</h2>
          <p className="mb-8 mt-2 text-sm text-muted-foreground">
            Connect your favorite tools like Gmail, Slack, and GitHub to start automating your workflows.
          </p>
          <AddConnectionButton />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {connections.map((c) => (
        <ConnectionCard key={c.id} connection={c} />
      ))}
    </div>
  );
}

