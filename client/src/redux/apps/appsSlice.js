import { createSlice } from '@reduxjs/toolkit';
import { fetchApps } from './appsThunks';

const initialState = {
  list: [],
  isLoading: false,
  error: null,
  triggerMap: {},
  actionMap: {},
};

export const appsSlice = createSlice({
  name: 'apps',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApps.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApps.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;

        const tMap = {};
        const aMap = {};

        action.payload.forEach((app) => {
          app.triggers.forEach((t) => {
            tMap[t.key] = { ...t, appKey: app.key, appName: app.name, iconUrl: app.iconUrl, primaryColor: app.primaryColor };
          });
          app.actions.forEach((a) => {
            aMap[a.key] = { ...a, appKey: app.key, appName: app.name, iconUrl: app.iconUrl, primaryColor: app.primaryColor };
          });
        });

        state.triggerMap = tMap;
        state.actionMap = aMap;
      })
      .addCase(fetchApps.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch apps';
      });
  },
});

export const selectAllApps = (state) => state.apps.list;
export const selectAppsLoading = (state) => state.apps.isLoading;
export const selectTriggerDef = (key) => (state) => state.apps.triggerMap[key];
export const selectActionDef = (key) => (state) => state.apps.actionMap[key];
export const selectAppByKey = (key) => (state) => state.apps.list.find((a) => a.key === key);

export default appsSlice.reducer;
