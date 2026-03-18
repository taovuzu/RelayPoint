import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage
import authReducer from './auth';
import appReducer from './app';

const authPersistConfig = {
  key: 'relaypoint-auth',
  storage,
  whitelist: ['user', 'isAuthenticated'],
};

const appPersistConfig = {
  key: 'relaypoint:app',
  storage,
  whitelist: ['theme', 'sidebarCollapsed'],
};

export const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
export const persistedAppReducer = persistReducer(appPersistConfig, appReducer);

// ref: https://blog.logrocket.com/persist-state-redux-persist-redux-toolkit-react/ (important)
