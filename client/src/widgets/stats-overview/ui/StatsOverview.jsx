import { useSelector } from 'react-redux';
import { selectWorkflows } from '@/redux/workflows';
import { StatCard } from './StatCard';
import { RunChart } from './RunChart';
import { Workflow, Activity, CheckCircle2, XCircle } from 'lucide-react';

export function StatsOverview() {
  const workflows = useSelector(selectWorkflows);

  const activeCount = workflows?.filter((w) => w.active).length || 0;
  const totalRuns = workflows?.reduce((sum, w) => sum + (w.runCount || 0), 0) || 0;
  const totalSuccess = workflows?.reduce((sum, w) => sum + (w.successCount || 0), 0) || 0;
  const totalFailures = workflows?.reduce((sum, w) => sum + (w.failureCount || 0), 0) || 0;
  const successRate = totalRuns > 0 ? Math.round((totalSuccess / totalRuns) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Workflows"
          value={activeCount}
          icon={Workflow}
          description={`of ${workflows?.length || 0} total`}
        />
        <StatCard
          title="Total Runs"
          value={totalRuns.toLocaleString()}
          icon={Activity}
          description="all time"
        />
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
          icon={CheckCircle2}
          trend={
            totalRuns > 0
              ? { value: successRate, isPositive: successRate >= 50 }
              : undefined
          }
        />
        <StatCard
          title="Failed Runs"
          value={totalFailures.toLocaleString()}
          icon={XCircle}
          description={totalFailures > 0 ? 'needs attention' : 'looking good'}
        />
      </div>
      <RunChart workflows={workflows} />
    </div>
  );
}
