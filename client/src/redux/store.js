import { configureStore } from '@reduxjs/toolkit';
import { persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { persistedAuthReducer, persistedAppReducer } from './storePersist';
import builderReducer from './builder';
import connectionsReducer from './connections';
import settingsReducer from './settings';
import workflowsReducer from './workflows';

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    app: persistedAppReducer,
    builder: builderReducer,
    connections: connectionsReducer,
    settings: settingsReducer,
    workflows: workflowsReducer,
  },
  devTools: import.meta.env.PROD === false,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      immutableCheck: import.meta.env.PROD ? false : { warnAfter: 32 },
      actionCreatorCheck: import.meta.env.PROD ? false : { warnAfter: 32 },
    }),
});

export const persistor = persistStore(store);
export default store;

// ref: https://redux-toolkit.js.org/api/configureStore
// ref: https://blog.logrocket.com/persist-state-redux-persist-redux-toolkit-react/ (important)
