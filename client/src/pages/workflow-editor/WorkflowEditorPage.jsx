import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { setPageTitle } from '@/redux/app';
import { useWorkflowById } from '@/features/workflow-management/api/workflow.queries';
import { setWorkflowId, setNodes, setEdges, setWorkflowName, clearBuilderError } from '@/redux/builder';
import { deserializeWorkflow } from '@/features/workflow-builder/model/deserializer';

import { SaveWorkflowBar } from '@/features/workflow-builder/ui/SaveWorkflowBar';
import { NodePalette } from '@/features/workflow-builder/ui/NodePalette';
import { WorkflowCanvas } from '@/features/workflow-builder/ui/WorkflowCanvas';
import { NodeConfigPanel } from '@/features/workflow-builder/ui/NodeConfigPanel';

export default function WorkflowEditorPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { workflow, isLoading: isFetching } = useWorkflowById(id);

  useEffect(() => {
    dispatch(setPageTitle(id ? 'Edit Workflow' : 'Create Workflow'));
    
    if (id) {
      dispatch(setWorkflowId(id));
    }

    return () => {
      dispatch(setWorkflowId(null));
      dispatch(setNodes([]));
      dispatch(setEdges([]));
      dispatch(setWorkflowName('Untitled Workflow'));
      dispatch(clearBuilderError());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (id && workflow && !isFetching) {
      const { nodes, edges } = deserializeWorkflow(workflow);
      dispatch(setNodes(nodes));
      dispatch(setEdges(edges));
      dispatch(setWorkflowName(workflow.name));
    }
  }, [id, workflow, isFetching, dispatch]);

  return (
    <div className="h-[calc(100vh-4rem)] -mt-6 -mx-8 flex flex-col bg-muted/20">
      <ReactFlowProvider>
        <SaveWorkflowBar />
        
        <div className="flex flex-1 overflow-hidden relative">
          <NodePalette />
          <WorkflowCanvas />
        </div>
        
        <NodeConfigPanel />
      </ReactFlowProvider>
    </div>
  );
}
