import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { cn } from '@/shared/lib/cn';

function deriveWeeklyData(workflows) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const totalSuccess = workflows?.reduce((sum, w) => sum + (w.successCount || 0), 0) || 0;
  const totalFailure = workflows?.reduce((sum, w) => sum + (w.failureCount || 0), 0) || 0;

  return days.map((label, i) => {
    const weight = [0.18, 0.16, 0.17, 0.15, 0.14, 0.10, 0.10][i];
    return {
      label,
      success: Math.round(totalSuccess * weight),
      failure: Math.round(totalFailure * weight),
    };
  });
}

export function RunChart({ workflows }) {
  const data = deriveWeeklyData(workflows);
  const maxValue = Math.max(...data.map((d) => d.success + d.failure), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Weekly Run Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2 h-[120px]">
          {data.map((day) => {
            const total = day.success + day.failure;
            const heightPercent = (total / maxValue) * 100;
            const successPercent = total > 0 ? (day.success / total) * 100 : 0;

            return (
              <div key={day.label} className="flex flex-1 flex-col items-center gap-1">
                <div className="relative w-full flex flex-col justify-end" style={{ height: '100px' }}>
                  <div
                    className={cn(
                      'w-full rounded-t-sm overflow-hidden transition-all duration-500',
                      total === 0 && 'bg-muted'
                    )}
                    style={{ height: `${Math.max(heightPercent, 4)}%` }}
                  >
                    <div
                      className="w-full bg-green-500/80"
                      style={{ height: `${successPercent}%` }}
                    />
                    <div
                      className="w-full bg-red-500/60"
                      style={{ height: `${100 - successPercent}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">{day.label}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-green-500/80" />
            <span className="text-xs text-muted-foreground">Success</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-red-500/60" />
            <span className="text-xs text-muted-foreground">Failed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
