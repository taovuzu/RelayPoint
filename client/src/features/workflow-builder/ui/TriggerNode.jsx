import { Handle, Position } from '@xyflow/react';
import { cn } from '@/shared/lib/cn';
import { useSelector } from 'react-redux';
import { selectSelectedNodeId } from '@/redux/builder';
import { selectTriggerDef } from '@/redux/apps';

export function TriggerNode({ id, data }) {
  const selectedNodeId = useSelector(selectSelectedNodeId);
  const isSelected = selectedNodeId === id;
  
  const triggerDef = useSelector(selectTriggerDef(data.triggerType));
  const def = triggerDef || { name: 'Unknown Trigger', iconUrl: null, primaryColor: '#71717a' }; // fallback

  return (
    <>
      <div 
        className={cn(
          "w-[240px] rounded-xl border-2 bg-card p-4 shadow-sm transition-all",
          isSelected ? "ring-2 ring-ring ring-offset-2" : "hover:shadow-md cursor-pointer"
        )}
        style={{ borderColor: isSelected ? undefined : (def.primaryColor ? `${def.primaryColor}80` : undefined) }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background overflow-hidden"
            style={{ borderColor: def.primaryColor ? `${def.primaryColor}40` : undefined }}
          >
            {def.iconUrl ? (
              <img src={def.iconUrl} alt={def.appName || 'Trigger'} className="h-6 w-6 object-contain" />
            ) : (
              <div className="h-5 w-5 bg-muted rounded-full" />
            )}
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Trigger</div>
            <div className="font-medium text-sm leading-none">{def.name}</div>
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
