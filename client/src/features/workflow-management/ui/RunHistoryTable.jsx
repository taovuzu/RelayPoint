import { RunStatusBadge } from './RunStatusBadge';
import { formatRelativeTime, formatDuration } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Clock, ListChecks } from 'lucide-react';


export function RunHistoryTable({ runs, onRowClick, selectedRunId }) {
  if (!runs?.length) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center animate-in fade-in-50">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-3">
          <Clock className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold">No execution history</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Runs will appear here once the workflow is triggered.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="hidden md:table-cell">Steps</TableHead>
            <TableHead className="hidden lg:table-cell">Current Stage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((run) => {
            const stepsCompleted = run.executionHistory?.length || 0;
            const lastStep = run.executionHistory?.[stepsCompleted - 1];

            return (
              <TableRow
                key={run.id}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedRunId === run.id && "bg-muted/50"
                )}
                onClick={() => onRowClick?.(run.id)}
              >
                <TableCell>
                  <RunStatusBadge status={run.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatRelativeTime(run.startedAt)}
                </TableCell>
                <TableCell className="text-sm font-mono text-muted-foreground">
                  {formatDuration(run.totalDuration)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <ListChecks className="h-3.5 w-3.5" />
                    <span>{stepsCompleted} step{stepsCompleted !== 1 ? 's' : ''}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {lastStep ? (
                    <span className="truncate max-w-[200px] block">
                      {lastStep.actionId}
                    </span>
                  ) : (
                    <span className="text-xs">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
