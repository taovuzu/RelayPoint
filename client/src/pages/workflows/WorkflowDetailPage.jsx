import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/redux/app';
import { clearSelectedWorkflow } from '@/redux/workflows';
import { useWorkflowById } from '@/features/workflow-management/api/workflow.queries';
import { useToggleWorkflow } from '@/features/workflow-management/api/workflow.mutations';
import { RunHistoryTable } from '@/features/workflow-management/ui/RunHistoryTable';
import { DeleteWorkflowDialog } from '@/features/workflow-management/ui/DeleteWorkflowDialog';
import { ExecutionLogger } from '@/widgets/execution-logger/ui/ExecutionLogger';
import { RunStatusBadge } from '@/features/workflow-management/ui/RunStatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Switch } from '@/shared/ui/switch';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Separator } from '@/shared/ui/separator';
import { formatDate, formatRelativeTime } from '@/shared/lib/format';
import {
  Pencil,
  Trash2,
  ArrowLeft,
  Globe,
  Activity,
  CheckCircle2,
  XCircle,
  Calendar,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';

export default function WorkflowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { workflow, isLoading } = useWorkflowById(id);
  const { mutate: toggle, isLoading: isToggling } = useToggleWorkflow();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState(null);

  useEffect(() => {
    dispatch(setPageTitle(workflow?.name || 'Workflow Details'));
  }, [dispatch, workflow?.name]);

  useEffect(() => {
    return () => {
      dispatch(clearSelectedWorkflow());
    };
  }, [dispatch]);

  const computedWebhookUrl = workflow?.webhookUrl ? `${import.meta.env.VITE_API_BASE_URL}/hooks/triggers/${workflow.webhookUrl}` : '';

  const copyWebhookUrl = () => {
    if (computedWebhookUrl) {
      navigator.clipboard.writeText(computedWebhookUrl);
      toast.success('Webhook URL copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-[250px]" />
            <Skeleton className="h-4 w-[350px]" />
          </div>
        </div>
        <div className="grid gap-4 grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[100px]" />
          ))}
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <h2 className="text-xl font-semibold">Workflow not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The workflow you're looking for doesn't exist or has been deleted.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/workflows">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workflows
          </Link>
        </Button>
      </div>
    );
  }

  const successRate =
    workflow.runCount > 0
      ? Math.round((workflow.successCount / workflow.runCount) * 100)
      : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/workflows">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{workflow.name}</h1>
                <Badge
                  variant="outline"
                  className={
                    workflow.active
                      ? 'bg-green-500/15 text-green-500 border-green-500/20'
                      : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20'
                  }
                >
                  {workflow.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {workflow.description && (
                <p className="text-sm text-muted-foreground mt-0.5">{workflow.description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={workflow.active}
            onCheckedChange={() => toggle(workflow.id)}
            disabled={isToggling}
            aria-label="Toggle workflow status"
          />
          <Button variant="outline" asChild>
            <Link to={`/workflows/${workflow.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      {/* Tabbed Content */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* Stats Grid */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Activity className="h-4 w-4" />
                  Total Runs
                </div>
                <p className="text-2xl font-bold">{workflow.runCount || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Successful
                </div>
                <p className="text-2xl font-bold">{workflow.successCount || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Failed
                </div>
                <p className="text-2xl font-bold">{workflow.failureCount || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Success Rate
                </div>
                <p className="text-2xl font-bold">{successRate !== null ? `${successRate}%` : '—'}</p>
              </CardContent>
            </Card>
          </div>

          {/* Webhook URL */}
          {workflow.webhookUrl && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Webhook URL
                </CardTitle>
                <CardDescription className="text-xs">
                  Send a POST request to this URL to trigger the workflow.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono text-muted-foreground truncate">
                    {computedWebhookUrl}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyWebhookUrl}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Created
                  </span>
                  <span className="font-medium">{formatDate(workflow.createdAt)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Last Updated
                  </span>
                  <span className="font-medium">{formatDate(workflow.updatedAt)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5" />
                    Last Run
                  </span>
                  <span className="font-medium">
                    {workflow.lastRunAt ? formatRelativeTime(workflow.lastRunAt) : 'Never'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-4 space-y-4">
          <RunHistoryTable
            runs={workflow.relayRuns}
            onRowClick={(runId) => setSelectedRunId(prev => prev === runId ? null : runId)}
            selectedRunId={selectedRunId}
          />
          {selectedRunId && (
            <ExecutionLogger
              workflowId={id}
              relayRunId={selectedRunId}
              onClose={() => setSelectedRunId(null)}
            />
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Permanently delete this workflow and all associated run history. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Workflow
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeleteWorkflowDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          navigate('/workflows');
        }}
        workflowId={workflow.id}
        workflowName={workflow.name}
      />
    </div>
  );
}
