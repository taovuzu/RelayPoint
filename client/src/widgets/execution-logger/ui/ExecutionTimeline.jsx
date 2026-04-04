import { StageCard } from './StageCard';

export function ExecutionTimeline({ executionHistory = [], currentStage = 0 }) {
  if (!executionHistory.length) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        Waiting for execution data…
      </div>
    );
  }

  const sortedHistory = [...executionHistory].sort((a, b) => a.stageIndex - b.stageIndex);

  return (
    <div className="relative py-2">
      {sortedHistory.map((entry, index) => {
        const isActive = entry.stageIndex === currentStage && !entry.status;
        const isLast = index === sortedHistory.length - 1;

        return (
          <StageCard
            key={`${entry.stageIndex}-${entry.actionId}`}
            entry={entry}
            isActive={isActive}
            isLast={isLast}
          />
        );
      })}
    </div>
  );
}
