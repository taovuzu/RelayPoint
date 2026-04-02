import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ReactFlowProvider } from '@xyflow/react';
import { setPageTitle } from '@/redux/app';
import { clearBuilderError, setNodes, setEdges, setWorkflowName } from '@/redux/builder';

import { SaveWorkflowBar } from '@/features/workflow-builder/ui/SaveWorkflowBar';
import { NodePalette } from '@/features/workflow-builder/ui/NodePalette';
import { WorkflowCanvas } from '@/features/workflow-builder/ui/WorkflowCanvas';
import { NodeConfigPanel } from '@/features/workflow-builder/ui/NodeConfigPanel';

export default function WorkflowEditorPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle('Workflow Editor'));

    return () => {
      dispatch(setNodes([]));
      dispatch(setEdges([]));
      dispatch(setWorkflowName('Untitled Workflow'));
      dispatch(clearBuilderError());
    };
  }, [dispatch]);

  return (
    <div className="h-[calc(100vh-4rem)] -mt-6 -mx-8 flex flex-col bg-muted/20">
      {/* 
        We use negative margins because the MainLayout adds padding.
        The builder needs to be flush to the viewport edges.
      */}
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
