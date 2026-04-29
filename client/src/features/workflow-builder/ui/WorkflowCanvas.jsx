import { useCallback, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ReactFlowProvider, ReactFlow, Background, addEdge, applyNodeChanges, applyEdgeChanges, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CanvasControls } from './CanvasControls';
import { nodeTypes } from '../config/node-types';
import { 
  selectNodes,
  selectEdges,
  setNodes,
  setEdges,
  addNode,
  setSelectedNodeId
} from '@/redux/builder';

export function WorkflowCanvas() {
  const reactFlowWrapper = useRef(null);
  const dispatch = useDispatch();
  const { screenToFlowPosition } = useReactFlow();
  
  const nodes = useSelector(selectNodes);
  const edges = useSelector(selectEdges);

  const onNodesChange = useCallback(
    (changes) => dispatch(setNodes(applyNodeChanges(changes, nodes))),
    [dispatch, nodes]
  );

  const onEdgesChange = useCallback(
    (changes) => dispatch(setEdges(applyEdgeChanges(changes, edges))),
    [dispatch, edges]
  );

  const onConnect = useCallback(
    (connection) => dispatch(setEdges(addEdge(connection, edges))),
    [dispatch, edges]
  );

  const onNodeClick = useCallback(
    (_, node) => {
      dispatch(setSelectedNodeId(node.id));
    },
    [dispatch]
  );

  const onPaneClick = useCallback(
    () => {
      dispatch(setSelectedNodeId(null));
    },
    [dispatch]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const rawData = event.dataTransfer.getData('application/reactflow');
      
      if (!rawData) return;
      
      const payload = JSON.parse(rawData);
      
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${payload.type}-${crypto.randomUUID()}`,
        type: payload.type,
        position,
        data: {
          [payload.type === 'trigger' ? 'triggerType' : 'actionType']: payload.subType,
          config: {}
        },
      };

      dispatch(addNode(newNode));
      dispatch(setSelectedNodeId(newNode.id)); // Auto-select new node
    },
    [dispatch]
  );

  return (
    <div className="flex-1 h-full w-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant="dots" gap={16} size={1} color="#e4e4e7" className="dark:!bg-zinc-950 dark:!text-zinc-800" />
        <CanvasControls />
      </ReactFlow>
    </div>
  );
}
