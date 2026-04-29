import React from 'react';
import { useSelector } from 'react-redux';
import { selectNodeOutputs, selectNodes } from '@/redux/builder';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover';
import { Button } from '@/shared/ui/button';
import { Plus, ChevronRight, Hash, Text as TextIcon, Info } from 'lucide-react';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { cn } from '@/shared/lib/cn';

/**
 * VariablePicker
 *
 * Allows users to insert dynamic variables from prior step outputs
 * into action configuration fields.
 *
 * Variable resolution:
 *   - Trigger data:  {{trigger.<field>}}
 *   - Action steps:  {{steps.<index>.<field>}}
 *
 * Data sources (in priority order):
 *   1. Real test data from nodeOutputs (populated by "Test Step")
 *   2. sampleOutput from node-registry.js (schema-based fallback)
 *
 * This matches automatisch's approach where variables are available
 * from the output of previous steps, and the VariablePicker walks
 * the output schema recursively to build variable paths.
 *
 * @see reference_automatisch/packages/web/src/components/Slate/Variable.jsx
 */
export function VariablePicker({ onSelect, currentNodeId }) {
  const nodes = useSelector(selectNodes);
  const nodeOutputs = useSelector(selectNodeOutputs);
  const triggerMap = useSelector(state => state.apps.triggerMap);
  const actionMap = useSelector(state => state.apps.actionMap);

  // Get all nodes that come before the current node in the flow.
  // For triggers: always available (they're the first step).
  // For actions: available if they have test data or a sampleOutput schema.
  const availableNodes = nodes.filter(n => {
    if (n.id === currentNodeId) return false;

    // Has real test data
    if (nodeOutputs[n.id]) return true;

    // Has sampleOutput from registry (fallback)
    const def = n.type === 'trigger'
      ? triggerMap[n.data.triggerType]
      : actionMap[n.data.actionType];

    return def?.sampleOutput != null;
  });

  /**
   * Get the output data for a node, preferring real test data
   * over registry sampleOutput.
   */
  const getNodeData = (nodeId) => {
    if (nodeOutputs[nodeId]) return { data: nodeOutputs[nodeId], isSample: false };

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const def = node.type === 'trigger'
      ? triggerMap[node.data.triggerType]
      : actionMap[node.data.actionType];

    if (def?.sampleOutput) return { data: def.sampleOutput, isSample: true };

    return null;
  };

  const renderValue = (nodeId, prefix, obj) => {
    return Object.entries(obj).map(([key, value]) => {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);

      const node = nodes.find(n => n.id === nodeId);
      const isTrigger = node?.type === 'trigger';

      let variableName = '';
      if (isTrigger) {
        variableName = `{{trigger.${fullPath}}}`;
      } else {
        // Sort only action nodes by vertical position to match serialization order
        const actionNodes = nodes
          .filter(n => n.type === 'action')
          .sort((a, b) => a.position.y - b.position.y);

        const stepIndex = actionNodes.findIndex(n => n.id === nodeId);
        variableName = `{{steps.${stepIndex}.${fullPath}}}`;
      }

      return (
        <div key={fullPath} className="pl-3">
          {isObject ? (
            <>
              <div className="flex items-center py-1 text-xs font-medium text-muted-foreground">
                <ChevronRight className="h-3 w-3 mr-1" />
                {key}
              </div>
              {renderValue(nodeId, fullPath, value)}
            </>
          ) : (
            <button
              onClick={() => onSelect(variableName)}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground"
            >
              {typeof value === 'number' ? <Hash className="h-3 w-3" /> : <TextIcon className="h-3 w-3" />}
              <span className="truncate flex-1">{key}</span>
              <span className="text-[10px] text-muted-foreground opacity-50 uppercase">{typeof value}</span>
            </button>
          )}
        </div>
      );
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <div className="p-2 border-b bg-muted/30">
          <h4 className="text-xs font-semibold">Insert Variable</h4>
          <p className="text-[10px] text-muted-foreground">Select data from previous steps</p>
        </div>
        <ScrollArea className="h-72">
          {availableNodes.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">No previous steps available.</p>
              <p className="text-[10px] text-muted-foreground mt-1">Add a trigger or action before this step.</p>
            </div>
          ) : (
            <div className="p-1">
              {availableNodes.map(node => {
                const def = node.type === 'trigger' ? triggerMap[node.data.triggerType] : actionMap[node.data.actionType];
                const nodeData = getNodeData(node.id);

                if (!nodeData) return null;

                return (
                  <div key={node.id} className="mb-2">
                    <div className="flex items-center gap-2 px-2 py-1 mb-1 rounded bg-muted/50">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded border bg-background overflow-hidden border-zinc-200">
                        {def?.iconUrl ? (
                          <img src={def.iconUrl} alt={def.appName} className="h-3 w-3 object-contain" />
                        ) : (
                          <div className="h-2 w-2 bg-muted rounded-full" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider truncate flex-1">
                        {def?.name || node.id}
                      </span>
                      {nodeData.isSample && (
                        <span className="flex items-center gap-0.5 text-[9px] text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded" title="Sample schema — run Test Step for real data">
                          <Info className="h-2.5 w-2.5" />
                          Sample
                        </span>
                      )}
                    </div>
                    {renderValue(node.id, '', nodeData.data)}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
