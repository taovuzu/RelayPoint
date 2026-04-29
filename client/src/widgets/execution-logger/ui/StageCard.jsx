import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAllApps } from '@/redux/apps';
import { getStageLabel, getStageIcon } from '@/features/execution-monitor/model/execution.utils';
import { formatDuration, formatDate } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/badge';
import { ChevronDown, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function StepStatusIcon({ status, isActive }) {
  if (isActive) {
    return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
  }
  if (status === 'SUCCESS') {
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  }
  if (status === 'FAILURE') {
    return <XCircle className="h-4 w-4 text-red-500" />;
  }
  return <div className="h-4 w-4 rounded-full border-2 border-zinc-600" />;
}

export function StageCard({ entry, isActive, isLast }) {
  const [isErrorExpanded, setIsErrorExpanded] = useState(false);
  const apps = useSelector(selectAllApps);
  const label = getStageLabel(entry.actionId, apps);
  const iconSrc = getStageIcon(entry.actionId, apps);

  return (
    <div className="relative flex gap-4">
      {/* Timeline Connector Line */}
      <div className="flex flex-col items-center">
        <div className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-background z-10",
          isActive && "border-blue-500 ring-4 ring-blue-500/20",
          entry.status === 'SUCCESS' && !isActive && "border-green-500/50",
          entry.status === 'FAILURE' && !isActive && "border-red-500/50",
          !entry.status && !isActive && "border-zinc-700"
        )}>
          <StepStatusIcon status={entry.status} isActive={isActive} />
        </div>
        {!isLast && (
          <div className={cn(
            "w-0.5 flex-1 min-h-[24px]",
            entry.status === 'SUCCESS' ? "bg-green-500/30" :
            entry.status === 'FAILURE' ? "bg-red-500/30" :
            "bg-zinc-700"
          )} />
        )}
      </div>

      {/* Content */}
      <div className={cn(
        "flex-1 pb-6 -mt-0.5",
        isLast && "pb-0"
      )}>
        <div className={cn(
          "rounded-lg border p-3 transition-all",
          isActive && "border-blue-500/50 bg-blue-500/5 shadow-sm shadow-blue-500/10",
          entry.status === 'FAILURE' && !isActive && "border-red-500/30 bg-red-500/5",
          entry.status === 'SUCCESS' && !isActive && "border-zinc-800",
          !entry.status && !isActive && "border-zinc-800 bg-muted/30"
        )}>
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {iconSrc ? (
                <img src={iconSrc} alt={label} className="h-4 w-4 shrink-0 object-contain" />
              ) : (
                <div className="h-4 w-4 rounded-full bg-muted shrink-0" />
              )}
              <span className="text-sm font-medium truncate">{label}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                Step {entry.stageIndex + 1}
              </Badge>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {entry.duration != null && (
                <span className="text-xs font-mono text-muted-foreground">
                  {formatDuration(entry.duration)}
                </span>
              )}
            </div>
          </div>

          {/* Timestamp */}
          {entry.timestamp && (
            <p className="text-xs text-muted-foreground mt-1.5">
              {formatDate(entry.timestamp, 'MMM d, h:mm:ss a')}
            </p>
          )}

          {/* Error Details (Expandable) */}
          {entry.error && (
            <div className="mt-2">
              <button
                onClick={() => setIsErrorExpanded(prev => !prev)}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <ChevronDown className={cn("h-3 w-3 transition-transform", isErrorExpanded && "rotate-180")} />
                {isErrorExpanded ? 'Hide error' : 'Show error details'}
              </button>
              {isErrorExpanded && (
                <pre className="mt-2 rounded-md bg-red-950/50 border border-red-500/20 p-3 text-xs text-red-300 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                  {entry.error}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

