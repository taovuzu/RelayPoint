import { Handle, Position } from '@xyflow/react';
import { TRIGGER_REGISTRY } from '../model/node-registry';
import { cn } from '@/shared/lib/cn';
import { useSelector } from 'react-redux';
import { selectSelectedNodeId } from '@/redux/builder';

export function TriggerNode({ id, data }) {
  const selectedNodeId = useSelector(selectSelectedNodeId);
  const isSelected = selectedNodeId === id;
  const def = TRIGGER_REGISTRY[data.triggerType] || { label: 'Unknown Trigger', icon: () => null, color: 'border-zinc-500' };
  const Icon = def.icon;

  return (
    <>
      <div 
        className={cn(
          "w-[240px] rounded-xl border-2 bg-card p-4 shadow-sm transition-all",
          def.color,
          isSelected ? "ring-2 ring-ring ring-offset-2" : "hover:shadow-md cursor-pointer"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border bg-background text-foreground", def.color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Trigger</div>
            <div className="font-medium text-sm leading-none">{def.label}</div>
          </div>
        </div>
      </div>
      
      {/* Single Output Handle at the bottom */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 border-2 border-background bg-zinc-400" 
      />
    </>
  );
}
