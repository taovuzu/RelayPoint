import { createSlice } from '@reduxjs/toolkit';
import { saveWorkflow } from './builderThunks';

const INITIAL_STATE = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  workflowName: "Untitled Workflow",
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
        node.data = { ...node.data, ...config };
      }
    },
    setSelectedNodeId: (state, action) => {
      state.selectedNodeId = action.payload;
    },
    setWorkflowName: (state, action) => {
      state.workflowName = action.payload;
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
        // Optionally reset builder state here or handle navigation in the component
      })
      .addCase(saveWorkflow.rejected, handleRejected);
  },
  selectors: {
    selectBuilderState: (state) => state,
    selectNodes: (state) => state.nodes,
    selectEdges: (state) => state.edges,
    selectSelectedNodeId: (state) => state.selectedNodeId,
    selectWorkflowName: (state) => state.workflowName,
    selectBuilderLoading: (state) => state.isLoading,
    selectBuilderErrorMessage: (state) => state.errorMessage,
    selectBuilderValidationErrors: (state) => state.validationErrors
  }
});

export const {
  clearBuilderError,
  setNodes,
  setEdges,
  addNode,
  removeNode,
  updateNodeConfig,
  setSelectedNodeId,
  setWorkflowName
} = builderSlice.actions;

export const {
  selectBuilderState,
  selectNodes,
  selectEdges,
  selectSelectedNodeId,
  selectWorkflowName,
  selectBuilderLoading,
  selectBuilderErrorMessage,
  selectBuilderValidationErrors
} = builderSlice.selectors;

export default builderSlice.reducer;

