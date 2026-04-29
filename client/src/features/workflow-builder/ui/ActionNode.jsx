import { Handle, Position } from '@xyflow/react';
import { cn } from '@/shared/lib/cn';
import { useSelector } from 'react-redux';
import { selectSelectedNodeId } from '@/redux/builder';
import { selectActionDef } from '@/redux/apps';
import { Badge } from '@/shared/ui/badge';

export function ActionNode({ id, data }) {
  const selectedNodeId = useSelector(selectSelectedNodeId);
  const isSelected = selectedNodeId === id;
  
  const actionDef = useSelector(selectActionDef(data.actionType));
  const def = actionDef || { name: 'Unknown Action', iconUrl: null, primaryColor: '#71717a', appName: 'UNKNOWN' };

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
          <div 
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background overflow-hidden"
            style={{ borderColor: def.primaryColor ? `${def.primaryColor}40` : undefined }}
          >
            {def.iconUrl ? (
              <img src={def.iconUrl} alt={def.appName || 'Action'} className="h-6 w-6 object-contain" />
            ) : (
              <div className="h-5 w-5 bg-muted rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</div>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{def.appName}</Badge>
            </div>
            <div className="font-medium text-sm leading-none truncate" title={def.name}>{def.name}</div>
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
