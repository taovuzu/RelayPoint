import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/redux/store';
import { Toaster } from 'sonner';

export function RootProvider({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </PersistGate>
    </Provider>
  );
}

