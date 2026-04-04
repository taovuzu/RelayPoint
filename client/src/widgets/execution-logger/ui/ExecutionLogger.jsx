import { useExecutionPolling } from '@/features/execution-monitor/api/execution.queries';
import { ExecutionTimeline } from './ExecutionTimeline';
import { RunStatusBadge } from '@/features/workflow-management/ui/RunStatusBadge';
import { formatDuration, formatRelativeTime } from '@/shared/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Separator } from '@/shared/ui/separator';
import { Button } from '@/shared/ui/button';
import { Loader2, Clock, Timer, X, AlertTriangle } from 'lucide-react';


export function ExecutionLogger({ workflowId, relayRunId, onClose }) {
  const { run, isPolling, error } = useExecutionPolling(workflowId, relayRunId);

  return (
    <Card className="mt-4 animate-in slide-in-from-top-2 duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">Execution Details</CardTitle>
            {run && <RunStatusBadge status={run.status} />}
            {isPolling && (
              <span className="flex items-center gap-1.5 text-xs text-blue-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                Live
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-4">
        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 mb-4">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State (no run data yet) */}
        {!run && !error && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Fetching execution data…</p>
          </div>
        )}

        {/* Run Data */}
        {run && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Started</p>
                  <p className="font-medium text-xs">{formatRelativeTime(run.startedAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-mono font-medium text-xs">{formatDuration(run.totalDuration)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3.5 w-3.5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                  #
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Steps</p>
                  <p className="font-medium text-xs">{run.executionHistory?.length || 0} completed</p>
                </div>
              </div>
            </div>

            {/* Global Error Message */}
            {run.errorMessage && (
              <div className="rounded-md bg-red-950/50 border border-red-500/20 p-3 text-sm text-red-300 mb-4">
                <p className="font-semibold text-xs uppercase tracking-wider text-red-400 mb-1">Error</p>
                <p className="text-xs font-mono">{run.errorMessage}</p>
              </div>
            )}

            <Separator className="mb-4" />

            {/* Step-by-Step Timeline */}
            <ExecutionTimeline
              executionHistory={run.executionHistory || []}
              currentStage={run.currentStage}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}


