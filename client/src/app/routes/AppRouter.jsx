import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { GuestRoute } from './GuestRoute';
import { MainLayout } from '@/widgets/layouts/MainLayout';

import LoginPage from '@/pages/auth/LoginPage';
import RegisterEmailPage from '@/pages/auth/RegisterEmailPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import SSOCallbackPage from '@/pages/auth/SSOCallbackPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import WorkflowListPage from '@/pages/workflows/WorkflowListPage';
import WorkflowDetailPage from '@/pages/workflows/WorkflowDetailPage';
import ConnectionsPage from '@/pages/connections/ConnectionsPage';
import WorkflowEditorPage from '@/pages/workflow-editor/WorkflowEditorPage';
import SettingsPage from '@/pages/settings/SettingsPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback" element={<SSOCallbackPage />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/workflows" element={<WorkflowListPage />} />
            <Route path="/workflows/:id" element={<WorkflowDetailPage />} />
            <Route path="/workflows/new" element={<WorkflowEditorPage />} />
            <Route path="/workflows/:id/edit" element={<WorkflowEditorPage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

