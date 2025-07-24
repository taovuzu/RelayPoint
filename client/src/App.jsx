import "@ant-design/v5-patch-for-react-19";
import "antd/dist/reset.css";

import "./style/app.css";
import "./style/global.css";

import React, { useEffect, useRef, useState, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "@/redux/store";
import { getCurrentUser } from "@/redux/auth/actions";

const Layout = lazy(() => import("@/components/Layout"));
const Landing = lazy(() => import("@/pages/Landing"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const LogoutPage = lazy(() => import("@/pages/LogoutPage"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const RelayBuilder = lazy(() => import("@/pages/RelayBuilder"));
const RelayDetails = lazy(() => import("@/pages/RelayDetails"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const ConnectionsPage = lazy(() => import("@/pages/ConnectionsPage"));

import PageLoader from "./components/PageLoader";


const AuthGate = ({ children }) => {
  const dispatch = useDispatch();
  const initializedRef = useRef(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    try { console.log('[App] AuthGate init: dispatch getCurrentUser'); } catch (_) {}
    dispatch(getCurrentUser())
      .catch(() => {
        try { console.warn('[App] No active session found or session expired.'); } catch (_) {}
      })
      .finally(() => {
        setBootstrapping(false);
      });
  }, [dispatch]);

  if (bootstrapping) {
    return <PageLoader />;
  }

  return children;
};

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useSelector((state) => state.auth);
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isLoggedIn } = useSelector((state) => state.auth);
  return !isLoggedIn ? children : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />
      <Route path="/logout" element={<LogoutPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="connections" element={<ConnectionsPage />} />
      </Route>

      <Route
        path="/relays"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RelayBuilder />} />
        <Route path=":relayId" element={<RelayDetails />} />
      </Route>

      {/* Catch-all route to redirect unknown paths */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AuthGate>
        <Suspense fallback={<PageLoader />}>
          <Router>
            <div className="App">
              <AppRoutes />
            </div>
          </Router>
        </Suspense>
      </AuthGate>
    </Provider>
  );
};

export default App;
