import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectWorkflowName, setWorkflowName, selectNodes } from '@/redux/builder';
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
  const nodes = useSelector(selectNodes);
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

    const payload = serializeWorkflow({ nodes, name: workflowName });
    mutate(payload, false);
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
