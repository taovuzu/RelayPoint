import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";
import { Toaster } from "@/shared/ui/sonner";
import { ThemeProvider } from "./ThemeProvider";

export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" closeButton />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

