import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectWorkflowName, setWorkflowName, selectNodes, selectWorkflowId } from '@/redux/builder';
import { selectAllApps } from '@/redux/apps';
import { useSaveWorkflow } from '../api/builder.mutations';
import { serializeWorkflow } from '../model/serializer';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

export function SaveWorkflowBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const workflowName = useSelector(selectWorkflowName);
  const workflowId = useSelector(selectWorkflowId);
  const nodes = useSelector(selectNodes);
  const apps = useSelector(selectAllApps);
  const { mutate, isLoading } = useSaveWorkflow();

  const handleSave = () => {
    const hasTrigger = nodes.some(n => n.type === 'trigger');
    const hasActions = nodes.some(n => n.type === 'action');

    if (!hasTrigger) {
      toast.error('Workflow requires a Trigger node to start.');
      return;
    }

    if (!hasActions) {
      toast.error('Workflow requires at least one Action node.');
      return;
    }

    // ── Validation: Check for missing required fields ────────────────
    const invalidNodes = nodes.filter(node => {
      const type = node.type === 'trigger' ? node.data.triggerType : node.data.actionType;
      const app = apps.find(a => 
        (a.triggers || []).some(t => t.key === type) || 
        (a.actions || []).some(act => act.key === type)
      );
      if (!app) return false;
      
      const def = (app.triggers || []).find(t => t.key === type) || 
                  (app.actions || []).find(act => act.key === type);
      
      if (!def || !def.arguments) return false;
      
      const requiredArgs = def.arguments.filter(a => a.required);
      return requiredArgs.some(arg => {
        const val = node.data.config?.[arg.key];
        return val === undefined || val === null || val === '';
      });
    });

    if (invalidNodes.length > 0) {
      toast.error(`Please complete the configuration for all nodes.`);
      return;
    }

    const payload = serializeWorkflow({ nodes, name: workflowName, apps });
    mutate({ workflowData: payload, id: workflowId }, !!workflowId);
  };

  const handleCancel = () => {
    if (window.confirm("Discard unsaved changes?")) {
      navigate('/workflows');
    }
  };

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0 z-50">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="w-full max-w-sm relative group">
          <Input 
            value={workflowName} 
            onChange={(e) => dispatch(setWorkflowName(e.target.value))}
            className="font-semibold text-lg border-transparent hover:border-input focus-visible:border-input focus-visible:ring-1 h-9 bg-transparent hover:bg-muted/50 rounded-sm px-2 -ml-2 w-full transition-all"
            placeholder="Name your workflow..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Workflow
        </Button>
      </div>
    </header>
  );
}
