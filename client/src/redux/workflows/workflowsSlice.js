import { createSlice } from '@reduxjs/toolkit';
import { fetchWorkflows, fetchWorkflowById, deleteWorkflow, toggleWorkflow, pollWorkflowRun } from './workflowsThunks';

const INITIAL_STATE = {
  workflows: [],
  selectedWorkflow: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  },
  isLoading: false,
  errorMessage: "",
  validationErrors: []
};

const workflowsSlice = createSlice({
  name: 'workflows',
  initialState: INITIAL_STATE,
  reducers: {
    clearWorkflowsError: (state) => {
      state.errorMessage = "";
      state.validationErrors = [];
    },
    clearSelectedWorkflow: (state) => {
      state.selectedWorkflow = null;
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
      .addCase(fetchWorkflows.pending, handlePending)
      .addCase(fetchWorkflows.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workflows = action.payload.data?.workflows || [];
        state.pagination = {
          page: action.payload.data?.page || 1,
          limit: action.payload.data?.limit || 10,
          total: action.payload.data?.total || 0
        };
      })
      .addCase(fetchWorkflows.rejected, handleRejected)

      .addCase(fetchWorkflowById.pending, handlePending)
      .addCase(fetchWorkflowById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedWorkflow = action.payload.data;
      })
      .addCase(fetchWorkflowById.rejected, handleRejected)

      .addCase(pollWorkflowRun.fulfilled, (state, action) => {
        state.selectedWorkflow = action.payload.data;
      })

      .addCase(deleteWorkflow.pending, handlePending)
      .addCase(deleteWorkflow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workflows = state.workflows.filter(w => w.id !== action.payload.data?.id);
        if (state.selectedWorkflow?.id === action.payload.data?.id) {
          state.selectedWorkflow = null;
        }
      })
      .addCase(deleteWorkflow.rejected, handleRejected)

      .addCase(toggleWorkflow.pending, handlePending)
      .addCase(toggleWorkflow.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload.data;
        const idx = state.workflows.findIndex(w => w.id === updated.id);
        if (idx !== -1) {
          state.workflows[idx] = updated;
        }
        if (state.selectedWorkflow?.id === updated.id) {
          state.selectedWorkflow = updated;
        }
      })
      .addCase(toggleWorkflow.rejected, handleRejected);
  },
  selectors: {
    selectWorkflowsState: (state) => state,
    selectWorkflows: (state) => state.workflows,
    selectSelectedWorkflow: (state) => state.selectedWorkflow,
    selectPagination: (state) => state.pagination,
    selectWorkflowsLoading: (state) => state.isLoading,
    selectWorkflowsErrorMessage: (state) => state.errorMessage,
    selectWorkflowsValidationErrors: (state) => state.validationErrors
  }
});

export const { clearWorkflowsError, clearSelectedWorkflow } = workflowsSlice.actions;

export const {
  selectWorkflowsState,
  selectWorkflows,
  selectSelectedWorkflow,
  selectPagination,
  selectWorkflowsLoading,
  selectWorkflowsErrorMessage,
  selectWorkflowsValidationErrors
} = workflowsSlice.selectors;

export default workflowsSlice.reducer;

