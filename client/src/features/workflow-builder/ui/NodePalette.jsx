import { useSelector } from 'react-redux';
import { selectAllApps } from '@/redux/apps';
import { selectNodes } from '@/redux/builder';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { cn } from '@/shared/lib/cn';

export function NodePalette() {
  const nodes = useSelector(selectNodes);
  const apps = useSelector(selectAllApps);
  const hasTrigger = nodes.some(n => n.type === 'trigger');

  const triggers = apps.flatMap(app =>
    app.triggers.map(t => ({
      ...t,
      appKey: app.key,
      appName: app.name,
      iconUrl: app.iconUrl,
      primaryColor: app.primaryColor
    }))
  );

  const actions = apps.flatMap(app =>
    app.actions.map(a => ({
      ...a,
      appKey: app.key,
      appName: app.name,
      iconUrl: app.iconUrl,
      primaryColor: app.primaryColor
    }))
  );

  const onDragStart = (event, nodeType, payloadType, appKey) => {
    event.dataTransfer.setData(
      'application/reactflow', 
      JSON.stringify({ type: nodeType, subType: payloadType, appKey })
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  const PaletteItem = ({ def, nodeType, disabled }) => {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-md border p-3 bg-card transition-all group text-left w-full",
          disabled 
            ? "opacity-50 cursor-not-allowed bg-muted/50" 
            : "cursor-grab active:cursor-grabbing hover:border-primary hover:shadow-sm"
        )}
        draggable={!disabled}
        onDragStart={(event) => !disabled && onDragStart(event, nodeType, def.key, def.appKey)}
      >
        <div 
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded border bg-background overflow-hidden"
          style={{ borderColor: def.primaryColor ? `${def.primaryColor}40` : undefined }}
        >
          {def.iconUrl ? (
            <img src={def.iconUrl} alt={def.appName} className="h-5 w-5 object-contain" />
          ) : (
            <div className="h-4 w-4 bg-muted rounded-full" />
          )}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium leading-none truncate">{def.name}</span>
          </div>
          <span className="text-xs text-muted-foreground truncate mt-1">{def.description}</span>
        </div>
      </div>
    );
  };

  return (
    <aside className="w-[300px] border-r bg-background flex flex-col h-full z-10">
      <div className="p-4 border-b text-left">
        <h2 className="text-sm font-semibold">Components</h2>
        <p className="text-xs text-muted-foreground mt-1">Drag and drop nodes onto the canvas.</p>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Triggers Section */}
          <div>
            <div className="flex items-center justify-between mb-3 text-left">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Triggers</h3>
              {hasTrigger && <span className="text-[10px] text-orange-500 font-medium bg-orange-500/10 px-1.5 py-0.5 rounded">Max 1 allowed</span>}
            </div>
            <div className="grid gap-2">
              {triggers.map((def) => (
                <PaletteItem 
                  key={`${def.appKey}-${def.key}`}
                  def={def} 
                  nodeType="trigger" 
                  disabled={hasTrigger} 
                />
              ))}
              {triggers.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No triggers available</p>
              )}
            </div>
          </div>

          {/* Actions Section */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 text-left">Actions</h3>
            <div className="grid gap-2">
              {actions.map((def) => (
                <PaletteItem 
                  key={`${def.appKey}-${def.key}`}
                  def={def} 
                  nodeType="action" 
                />
              ))}
              {actions.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No actions available</p>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}

