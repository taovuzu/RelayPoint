import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/redux/app';
import { useWorkflows } from '@/features/workflow-management/api/workflow.queries';
import { StatsOverview } from '@/widgets/stats-overview/ui/StatsOverview';
import { WorkflowGrid } from '@/features/workflow-management/ui/WorkflowGrid';
import { Button } from '@/shared/ui/button';
import { Link } from 'react-router-dom';
import { Plus, Link2 } from 'lucide-react';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { workflows, isLoading } = useWorkflows({ page: 1, limit: 6 });

  useEffect(() => {
    dispatch(setPageTitle('Dashboard'));
  }, [dispatch]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of your automation workflows and recent activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/connections">
              <Link2 className="mr-2 h-4 w-4" />
              Connections
            </Link>
          </Button>
          <Button asChild>
            <Link to="/workflows/new">
              <Plus className="mr-2 h-4 w-4" />
              New Workflow
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Recent Workflows */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Recent Workflows</h2>
          <Button variant="link" size="sm" asChild>
            <Link to="/workflows">View all →</Link>
          </Button>
        </div>
        <WorkflowGrid workflows={workflows} isLoading={isLoading} />
      </div>
    </div>
  );
}
