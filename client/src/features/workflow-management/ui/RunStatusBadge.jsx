import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/cn';


const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    className: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/25',
  },
  PROCESS: {
    label: 'Processing',
    className: 'bg-blue-500/15 text-blue-500 border-blue-500/20 hover:bg-blue-500/25 animate-pulse',
  },
  SUCCESS: {
    label: 'Success',
    className: 'bg-green-500/15 text-green-500 border-green-500/20 hover:bg-green-500/25',
  },
  FAILURE: {
    label: 'Failed',
    className: 'bg-red-500/15 text-red-500 border-red-500/20 hover:bg-red-500/25',
  },
};


export function RunStatusBadge({ status, className }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
