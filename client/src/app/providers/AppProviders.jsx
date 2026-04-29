import { Provider, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { useEffect } from "react";
import { store, persistor } from "@/redux/store";
import { Toaster } from "@/shared/ui/sonner";
import { ThemeProvider } from "./ThemeProvider";
import { fetchApps } from "@/redux/apps";

function AppInitializer() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(fetchApps());
  }, [dispatch]);
  
  return null;
}

export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <AppInitializer />
          {children}
          <Toaster richColors position="top-right" closeButton />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

