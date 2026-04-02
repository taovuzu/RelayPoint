import { useSelector } from 'react-redux';
import { TRIGGER_REGISTRY, ACTION_REGISTRY } from '../model/node-registry';
import { selectNodes } from '@/redux/builder';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { cn } from '@/shared/lib/cn';

export function NodePalette() {
  const nodes = useSelector(selectNodes);
  const hasTrigger = nodes.some(n => n.type === 'trigger');

  const onDragStart = (event, nodeType, payloadType) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, subType: payloadType }));
    event.dataTransfer.effectAllowed = 'copy';
  };

  const PaletteItem = ({ type, def, nodeType, disabled }) => {
    const Icon = def.icon;
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-md border p-3 bg-card transition-all group",
          disabled 
            ? "opacity-50 cursor-not-allowed bg-muted/50" 
            : "cursor-grab active:cursor-grabbing hover:border-primary hover:shadow-sm"
        )}
        draggable={!disabled}
        onDragStart={(event) => !disabled && onDragStart(event, nodeType, type)}
      >
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded border bg-background", def.color)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium leading-none mb-1">{def.label}</span>
          <span className="text-xs text-muted-foreground truncate">{def.description}</span>
        </div>
      </div>
    );
  };

  return (
    <aside className="w-[300px] border-r bg-background flex flex-col h-full z-10">
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold">Components</h2>
        <p className="text-xs text-muted-foreground mt-1">Drag and drop nodes onto the canvas.</p>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Triggers Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Triggers</h3>
              {hasTrigger && <span className="text-[10px] text-orange-500 font-medium bg-orange-500/10 px-1.5 py-0.5 rounded">Max 1 allowed</span>}
            </div>
            <div className="grid gap-2">
              {Object.entries(TRIGGER_REGISTRY).map(([key, def]) => (
                <PaletteItem 
                  key={key} 
                  type={key} 
                  def={def} 
                  nodeType="trigger" 
                  disabled={hasTrigger} 
                />
              ))}
            </div>
          </div>

          {/* Actions Section */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Actions</h3>
            <div className="grid gap-2">
              {Object.entries(ACTION_REGISTRY).map(([key, def]) => (
                <PaletteItem 
                  key={key} 
                  type={key} 
                  def={def} 
                  nodeType="action" 
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
