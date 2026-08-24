import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ReportsProvider } from './context/ReportsContext';
import { ToastProvider } from './context/ToastContext';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ReportDetail from './pages/ReportDetail';
import ReportEditor from './pages/ReportEditor';
import Settings from './pages/Settings';
import UploadFlow from './pages/UploadFlow';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ReportsProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/reports" element={<Dashboard />} />
                <Route path="/upload" element={<UploadFlow />} />
                <Route path="/reports/:id" element={<ReportDetail />} />
                <Route path="/reports/:id/edit" element={<ReportEditor />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ReportsProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
