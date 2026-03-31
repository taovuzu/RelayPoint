export function serializeWorkflow({ nodes = [], name = 'Untitled Workflow' }) {
  const triggerNode = nodes.find(n => n.type === 'trigger');
  const actionNodes = nodes.filter(n => n.type === 'action');

  const sortedActions = [...actionNodes].sort((a, b) => a.position.y - b.position.y);

  return {
    name,
    trigger: triggerNode ? {
      id: triggerNode.data.triggerType,
      config: triggerNode.data.config || {}
    } : null,
    actions: sortedActions.map((node, index) => ({
      id: node.data.actionType,
      order: index,
      config: node.data.config || {}
    }))
  };
}

export function deserializeWorkflow(workflow) {
  if (!workflow) return { nodes: [], edges: [] };

  const nodes = [];
  const edges = [];
  
  const X_POS = 250;
  const Y_START = 50;
  const Y_SPACING = 150;

  if (workflow.trigger?.id) {
    const triggerId = 'trigger-1';
    nodes.push({
      id: triggerId,
      type: 'trigger',
      position: { x: X_POS, y: Y_START },
      data: {
        triggerType: workflow.trigger.id,
        config: workflow.trigger.config || {}
      }
    });

    if (workflow.actions && workflow.actions.length > 0) {
      const sortedActions = [...workflow.actions].sort((a, b) => a.order - b.order);
      
      let previousNodeId = triggerId;

      sortedActions.forEach((action, idx) => {
        const actionNodeId = `action-${action.order}-${idx}`;
        nodes.push({
          id: actionNodeId,
          type: 'action',
          position: { x: X_POS, y: Y_START + (Y_SPACING * (idx + 1)) },
          data: {
            actionType: action.id,
            config: action.config || {}
          }
        });

        edges.push({
          id: `e-${previousNodeId}-${actionNodeId}`,
          source: previousNodeId,
          target: actionNodeId,
          type: 'smoothstep'
        });

        previousNodeId = actionNodeId;
      });
    }
  }

  return { nodes, edges };
}
