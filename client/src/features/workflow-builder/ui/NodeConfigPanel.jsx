import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useState } from 'react';
import { selectSelectedNodeId, selectNodes, setSelectedNodeId, updateNodeConfig, removeNode, setNodeOutput } from '@/redux/builder';
import { selectSelectedWorkflow } from '@/redux/workflows/workflowsSlice';
import { selectTriggerDef, selectActionDef } from '@/redux/apps';
import { InputCreator } from '@/shared/ui/InputCreator';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/shared/ui/sheet';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Trash2, Play, Loader2, Copy, Check, Link, AlertTriangle } from 'lucide-react';
import { request } from '@/request';
import { toast } from 'sonner';

/**
 * NodeConfigPanel
 *
 * Side panel for configuring trigger and action nodes.
 * Handles:
 *   - Trigger-specific UI (webhook URL display, connection status)
 *   - Action config with VariablePicker for dynamic variable injection
 *   - "Test Step" that calls the server to fetch/execute sample data
 *   - Coming-soon state for unsupported triggers
 */
export function NodeConfigPanel() {
  const dispatch = useDispatch();
  const selectedNodeId = useSelector(selectSelectedNodeId);
  const nodes = useSelector(selectNodes);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const isOpen = !!selectedNode;
  const isTrigger = selectedNode?.type === 'trigger';

  const def = useSelector(
    isTrigger
      ? selectTriggerDef(selectedNode?.data?.triggerType)
      : selectActionDef(selectedNode?.data?.actionType)
  );

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

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);

  const handleTestStep = async () => {
    if (!selectedNodeId || !selectedNode || !def) return;

    setIsTesting(true);
    setTestResult(null);
    setTestError(null);

    try {
      const endpoint = isTrigger 
        ? `/api/v1/apps/${def.appKey}/test-trigger` 
        : `/api/v1/apps/${def.appKey}/test-action`;

      const payload = {
        [isTrigger ? 'triggerKey' : 'actionKey']: def.key,
        parameters: selectedNode.data.config || {}
      };

      const response = await request.post(endpoint, payload);
      const data = response.data.data;

      dispatch(setNodeOutput({ nodeId: selectedNodeId, output: data }));
      setTestResult(data);
      toast.success('Test successful! Sample data loaded.');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to test step. Check your connection.';
      setTestError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsTesting(false);
    }
  };

  if (!def || !selectedNode) return null;

  const isComingSoon = !!def.comingSoon;
  const requiresConnection = def.supportsConnections;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="sm:max-w-md p-0 flex flex-col h-full" onPointerDownOutside={(e) => e.preventDefault()}>
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div 
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background overflow-hidden"
              style={{ borderColor: def.primaryColor ? `${def.primaryColor}40` : undefined }}
            >
              {def.iconUrl ? (
                <img src={def.iconUrl} alt={def.appName} className="h-6 w-6 object-contain" />
              ) : (
                <div className="h-5 w-5 bg-muted rounded-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <SheetTitle className="leading-tight truncate">{def.name}</SheetTitle>
                {isComingSoon && (
                  <Badge variant="outline" className="text-[9px] border-amber-500/50 text-amber-600 bg-amber-500/10">
                    Coming Soon
                  </Badge>
                )}
              </div>
              <SheetDescription className="text-xs line-clamp-1">
                {isTrigger ? 'Trigger Node' : 'Action Node'} • {def.appName || 'App'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ── Coming Soon Warning ──────────────────────────── */}
          {isComingSoon && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-700">Not yet available</p>
                <p className="text-[10px] text-amber-600/80 mt-0.5">
                  This integration is on our roadmap. Configuration is disabled until backend support is added.
                </p>
              </div>
            </div>
          )}

          {/* ── Webhook URL Display (for webhook triggers) ───── */}
          {isTrigger && def.key === 'catchRawWebhook' && (
            <WebhookUrlInfo workflow={useSelector(selectSelectedWorkflow)} />
          )}

          {/* ── Connection Required Notice ──────────────────── */}
          {requiresConnection && !isComingSoon && (
            <div className="bg-muted/30 p-3 rounded-lg border flex items-center gap-2">
              <Link className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">Requires {def.appName} connection</p>
                <p className="text-[10px] text-muted-foreground">
                  Ensure your {def.appName} account is connected in Settings.
                </p>
              </div>
            </div>
          )}

          {/* ── Test Step Section ───────────────────────────── */}
          {!isComingSoon && (
            <div className="bg-muted/30 p-3 rounded-lg border space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold">
                    {isTrigger ? 'Test Trigger' : 'Test & Execute'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isTrigger
                      ? 'Fetch sample data to configure subsequent steps'
                      : 'Execute this action and capture the output'
                    }
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={handleTestStep}
                  disabled={isTesting}
                >
                  {isTesting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Play className="h-3 w-3 mr-2" />}
                  Test Step
                </Button>
              </div>

              {/* Test Result Display */}
              {testResult && (
                <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 max-h-64 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output Data</p>
                    <Badge variant="outline" className="text-[9px] h-4 border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                      Success
                    </Badge>
                  </div>
                  <ScrollArea className="flex-1">
                    <pre className="text-[11px] text-slate-300 font-mono leading-relaxed">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}

              {/* Test Error Display */}
              {testError && (
                <div className="bg-destructive/10 rounded border border-destructive/30 p-2">
                  <p className="text-[10px] text-destructive">{testError}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Configuration Fields ──────────────────────── */}
          <div className="space-y-4 pt-2">
            {!def.arguments || def.arguments.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-md border border-dashed">
                No configuration required.
              </div>
            ) : (
              def.arguments.map((schema) => (
                <InputCreator
                  key={schema.key}
                  schema={schema}
                  appKey={def.appKey}
                  stepId={selectedNodeId}
                  values={selectedNode.data.config || {}}
                  onChange={handleConfigChange}
                  disabled={isComingSoon}
                />
              ))
            )}
          </div>
        </div>

        <SheetFooter className="p-4 border-t bg-background shrink-0">
          <Button variant="destructive" className="w-full" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Node
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}





/**
 * WebhookUrlInfo
 *
 * Shows the generated webhook URL for webhook triggers.
 * The URL is generated server-side when the workflow is saved,
 * so this shows a placeholder for unsaved workflows.
 */
function WebhookUrlInfo({ workflow }) {
  const [copied, setCopied] = useState(false);

  const baseUrl = window.location.origin;
  const webhookUrl = workflow?.webhookUrl 
    ? `${baseUrl}/api/v1/webhook/external/${workflow.webhookUrl}`
    : null;

  const handleCopy = () => {
    if (webhookUrl) {
      navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      toast.success('Webhook URL copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link className="h-4 w-4 text-blue-500" />
          <p className="text-xs font-bold text-blue-700 uppercase tracking-tight">Webhook Endpoint</p>
        </div>
        {webhookUrl && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-500/10"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        )}
      </div>
      
      {webhookUrl ? (
        <div className="space-y-2">
          <div className="bg-background border rounded-lg p-2 font-mono text-[10px] break-all select-all">
            {webhookUrl}
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            External services should send <code className="bg-muted px-1 rounded text-slate-700">POST</code> requests to this URL.
          </p>
        </div>
      ) : (
        <p className="text-[10px] text-slate-500 leading-normal italic">
          Save your workflow to generate a unique webhook URL.
        </p>
      )}
    </div>
  );
}
