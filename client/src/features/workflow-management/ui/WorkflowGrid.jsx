import { WorkflowCard } from './WorkflowCard';
import { Card, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';
import { Link } from 'react-router-dom';
import { Workflow, Plus } from 'lucide-react';

export function WorkflowGrid({ workflows, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={`skeleton-${i}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-[140px]" />
                  <Skeleton className="h-3 w-[200px]" />
                </div>
                <Skeleton className="h-5 w-9 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
              <div className="flex gap-2 mt-4 pt-3 border-t">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!workflows?.length) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
            <Workflow className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">No workflows found</h2>
          <p className="mb-8 mt-2 text-sm text-muted-foreground">
            Create your first automation workflow to connect your services and automate tasks.
          </p>
          <Button asChild>
            <Link to="/workflows/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {workflows.map((w) => (
        <WorkflowCard key={w.id} workflow={w} />
      ))}
    </div>
  );
}
