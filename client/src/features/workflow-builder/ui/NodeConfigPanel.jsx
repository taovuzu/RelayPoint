import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  selectSelectedNodeId,
  selectNodes,
  setSelectedNodeId,
  updateNodeConfig,
  removeNode
} from '@/redux/builder';
import { TRIGGER_REGISTRY, ACTION_REGISTRY } from '../model/node-registry';
import { ActionConfigForm } from './ActionConfigForm';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/shared/ui/sheet';
import { Button } from '@/shared/ui/button';
import { Trash2 } from 'lucide-react';

export function NodeConfigPanel() {
  const dispatch = useDispatch();
  const selectedNodeId = useSelector(selectSelectedNodeId);
  const nodes = useSelector(selectNodes);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const isOpen = !!selectedNode;

  let def = null;
  if (selectedNode) {
    if (selectedNode.type === 'trigger') {
      def = TRIGGER_REGISTRY[selectedNode.data.triggerType];
    } else if (selectedNode.type === 'action') {
      def = ACTION_REGISTRY[selectedNode.data.actionType];
    }
  }

  const handleClose = useCallback(() => {
    dispatch(setSelectedNodeId(null));
  }, [dispatch]);

  const handleConfigChange = useCallback((key, value) => {
    if (selectedNodeId) {
      dispatch(updateNodeConfig({
        id: selectedNodeId,
        config: { [key]: value }
      }));
    }
  }, [dispatch, selectedNodeId]);

  const handleDelete = useCallback(() => {
    if (selectedNodeId) {
      dispatch(removeNode(selectedNodeId));
    }
  }, [dispatch, selectedNodeId]);

  if (!def || !selectedNode) return null;

  const Icon = def.icon;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="sm:max-w-md overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg border bg-background ${def.color || ''}`}>
              {Icon && <Icon className="h-5 w-5" />}
            </div>
            <div>
              <SheetTitle className="leading-tight">{def.label}</SheetTitle>
              <SheetDescription className="text-xs line-clamp-1">
                {selectedNode.type === 'trigger' ? 'Trigger Node' : 'Action Node'} • {selectedNode.id}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="py-6">
          {/* Dynamic configuration form mapped from registry configFields */}
          <ActionConfigForm 
            fields={def.configFields}
            values={selectedNode.data.config || {}}
            onChange={handleConfigChange}
          />
        </div>

        <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
          <Button variant="destructive" className="w-full" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Node
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
