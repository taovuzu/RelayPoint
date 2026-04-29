import { v4 as uuidv4 } from 'uuid';

export function deserializeWorkflow(workflow) {
  if (!workflow) return { nodes: [], edges: [] };

  const nodes = [];
  const edges = [];

  const triggerNodeId = uuidv4();
  if (workflow.trigger) {
    nodes.push({
      id: triggerNodeId,
      type: 'trigger',
      position: { x: 250, y: 100 },
      data: {
        triggerType: workflow.trigger.id,
        config: workflow.trigger.config || {},
        label: workflow.trigger.id
      }
    });
  }

  let lastNodeId = triggerNodeId;
  const sortedActions = [...(workflow.actions || [])].sort((a, b) => a.order - b.order);

  sortedActions.forEach((action, index) => {
    const currentNodeId = uuidv4();
    nodes.push({
      id: currentNodeId,
      type: 'action',
      position: { x: 250, y: 250 + (index * 150) },
      data: {
        actionType: action.id,
        config: action.config || {},
        label: action.id
      }
    });

    if (lastNodeId) {
      edges.push({
        id: `e-${lastNodeId}-${currentNodeId}`,
        source: lastNodeId,
        target: currentNodeId,
        animated: true,
      });
    }
    lastNodeId = currentNodeId;
  });

  return { nodes, edges };
}
