import { Handle, Position } from '@xyflow/react';
import { ACTION_REGISTRY } from '../model/node-registry';
import { cn } from '@/shared/lib/cn';
import { useSelector } from 'react-redux';
import { selectSelectedNodeId } from '@/redux/builder';
import { Badge } from '@/shared/ui/badge';

export function ActionNode({ id, data }) {
  const selectedNodeId = useSelector(selectSelectedNodeId);
  const isSelected = selectedNodeId === id;
  const def = ACTION_REGISTRY[data.actionType] || { label: 'Unknown Action', icon: () => null, color: 'border-zinc-500', service: 'UNKNOWN' };
  const Icon = def.icon;

  return (
    <>
      {/* Input Handle from Previous Step */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 border-2 border-background bg-zinc-400" 
      />

      <div 
        className={cn(
          "w-[240px] rounded-xl border bg-card p-4 shadow-sm transition-all",
          isSelected ? "ring-2 ring-ring ring-offset-2 border-primary" : "hover:shadow-md hover:border-zinc-400 cursor-pointer"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background text-foreground", def.color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</div>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{def.service}</Badge>
            </div>
            <div className="font-medium text-sm leading-none truncate" title={def.label}>{def.label}</div>
          </div>
        </div>
      </div>
      
      {/* Output Handle to Next Step */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 border-2 border-background bg-zinc-400" 
      />
    </>
  );
}
