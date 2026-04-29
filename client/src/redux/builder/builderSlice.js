import { createSlice } from '@reduxjs/toolkit';
import { saveWorkflow } from './builderThunks';

const INITIAL_STATE = {
  workflowId: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  workflowName: "Untitled Workflow",
  nodeOutputs: {},
  isLoading: false,
  errorMessage: "",
  validationErrors: []
};

const builderSlice = createSlice({
  name: 'builder',
  initialState: INITIAL_STATE,
  reducers: {
    clearBuilderError: (state) => {
      state.errorMessage = "";
      state.validationErrors = [];
    },
    setWorkflowId: (state, action) => {
      state.workflowId = action.payload;
    },
    setNodes: (state, action) => {
      state.nodes = action.payload;
    },
    setEdges: (state, action) => {
      state.edges = action.payload;
    },
    addNode: (state, action) => {
      state.nodes.push(action.payload);
    },
    removeNode: (state, action) => {
      state.nodes = state.nodes.filter(n => n.id !== action.payload);
      state.edges = state.edges.filter(e => e.source !== action.payload && e.target !== action.payload);
      if (state.selectedNodeId === action.payload) {
        state.selectedNodeId = null;
      }
    },
    updateNodeConfig: (state, action) => {
      const { id, config } = action.payload;
      const node = state.nodes.find(n => n.id === id);
      if (node) {
        node.data.config = { ...node.data.config, ...config };
      }
    },
    setSelectedNodeId: (state, action) => {
      state.selectedNodeId = action.payload;
    },
    setWorkflowName: (state, action) => {
      state.workflowName = action.payload;
    },
    setNodeOutput: (state, action) => {
      const { nodeId, output } = action.payload;
      state.nodeOutputs[nodeId] = output;
    }
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.isLoading = true;
      state.errorMessage = "";
      state.validationErrors = [];
    };

    const handleRejected = (state, action) => {
      state.isLoading = false;
      state.errorMessage = action.payload?.message || "An unexpected error occurred";
      state.validationErrors = action.payload?.errors || [];
    };

    builder
      .addCase(saveWorkflow.pending, handlePending)
      .addCase(saveWorkflow.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(saveWorkflow.rejected, handleRejected);
  },
  selectors: {
    selectWorkflowId: (state) => state.workflowId,
    selectBuilderState: (state) => state,
    selectNodes: (state) => state.nodes,
    selectEdges: (state) => state.edges,
    selectSelectedNodeId: (state) => state.selectedNodeId,
    selectWorkflowName: (state) => state.workflowName,
    selectBuilderLoading: (state) => state.isLoading,
    selectBuilderErrorMessage: (state) => state.errorMessage,
    selectBuilderValidationErrors: (state) => state.validationErrors,
    selectNodeOutputs: (state) => state.nodeOutputs
  }
});

export const {
  clearBuilderError,
  setWorkflowId,
  setNodes,
  setEdges,
  addNode,
  removeNode,
  updateNodeConfig,
  setSelectedNodeId,
  setWorkflowName,
  setNodeOutput
} = builderSlice.actions;

export const {
  selectWorkflowId,
  selectBuilderState,
  selectNodes,
  selectEdges,
  selectSelectedNodeId,
  selectWorkflowName,
  selectBuilderLoading,
  selectBuilderErrorMessage,
  selectBuilderValidationErrors,
  selectNodeOutputs
} = builderSlice.selectors;

export default builderSlice.reducer;

