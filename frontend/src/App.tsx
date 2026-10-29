import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { getCsrfToken } from '@/lib/api';
import { ToastContainer } from '@/components/ui/ToastContainer';

// Page Components
import { RegisterPage } from '@/pages/RegisterPage';
import { VerifyOtpPage } from '@/pages/VerifyOtpPage';
import { LoginPage } from '@/pages/LoginPage';
import { TasksPage } from '@/pages/TasksPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Configure Query Client with serene defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isInitialized, initialize, refreshToken } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // While initializing or if refresh token exists, wait briefly for silent authentication
  if (!isInitialized) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-bg-base)',
        }}
      >
        <span
          style={{
            fontSize: '28px',
            color: 'var(--color-terracotta)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        >
          ✦
        </span>
      </div>
    );
  }

  if (!isAuthenticated && !refreshToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Guard (redirects already logged-in users to /tasks)
const PublicOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/tasks" replace />;
  }
  return children;
};

export const App: React.FC = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Bootstrap auth store & pre-fetch CSRF token
    initialize();
    getCsrfToken();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/tasks" replace />} />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
