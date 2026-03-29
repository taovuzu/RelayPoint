import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToggleWorkflow } from '../api/workflow.mutations';
import { DeleteWorkflowDialog } from './DeleteWorkflowDialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui/card';
import { Switch } from '@/shared/ui/switch';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { formatRelativeTime } from '@/shared/lib/format';
import { Trash2, Pencil, Activity, CheckCircle2, XCircle, Clock } from 'lucide-react';


export function WorkflowCard({ workflow }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { mutate: toggle, isLoading: isToggling } = useToggleWorkflow();

  const successRate =
    workflow.runCount > 0
      ? Math.round((workflow.successCount / workflow.runCount) * 100)
      : null;

  return (
    <>
      <Card className="group flex flex-col justify-between overflow-hidden transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div className="space-y-1 min-w-0 flex-1 mr-4">
            <Link to={`/workflows/${workflow.id}`} className="block">
              <CardTitle className="text-base font-semibold leading-tight truncate hover:underline underline-offset-2">
                {workflow.name}
              </CardTitle>
            </Link>
            {workflow.description && (
              <CardDescription className="line-clamp-2 text-xs">
                {workflow.description}
              </CardDescription>
            )}
          </div>
          <Switch
            checked={workflow.active}
            onCheckedChange={() => toggle(workflow.id)}
            disabled={isToggling}
            aria-label={`Toggle ${workflow.name}`}
          />
        </CardHeader>

        <CardContent className="pb-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-3.5 w-3.5 shrink-0" />
              <span className="font-medium text-foreground">{workflow.runCount || 0}</span>
              <span className="text-xs">runs</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
              <span className="font-medium text-foreground">{workflow.successCount || 0}</span>
              <span className="text-xs">passed</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
              <span className="font-medium text-foreground">{workflow.failureCount || 0}</span>
              <span className="text-xs">failed</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs truncate">
                {workflow.lastRunAt ? formatRelativeTime(workflow.lastRunAt) : 'Never run'}
              </span>
            </div>
          </div>

          {successRate !== null && (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Success rate</span>
                <span className="font-medium text-foreground">{successRate}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-500"
                  style={{ width: `${successRate}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t pt-3 gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to={`/workflows/${workflow.id}/edit`}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </CardFooter>
      </Card>

      <DeleteWorkflowDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        workflowId={workflow.id}
        workflowName={workflow.name}
      />
    </>
  );
}
