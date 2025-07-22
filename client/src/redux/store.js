import { configureStore } from "@reduxjs/toolkit";

import { reducer as authReducer } from './auth';
import { reducer as settingsReducer } from './settings';
import { reducer as appReducer } from './app';
import { reducer as relayReducer } from './relay';
import connectionsReducer from './connections/connections.slice';

const AUTH_INITIAL_STATE = {
  current: {},
  isLoggedIn: false,
  isLoading: false,
  isSuccess: false
};

const initialState = { auth: AUTH_INITIAL_STATE };

const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
    app: appReducer,
    relay: relayReducer,
    connections: connectionsReducer
  },
  preloadedState: initialState,
  devTools: import.meta.env.PROD === false,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['_persist']
      },
      immutableCheck: import.meta.env.PROD ? false : { warnAfter: 32 },
      actionCreatorCheck: import.meta.env.PROD ? false : { warnAfter: 32 }
    })
});

export default store;