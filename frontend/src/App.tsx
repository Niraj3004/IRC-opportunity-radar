import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RequireRole } from './components/auth/RequireRole';
import { AppLayout } from './components/layout/AppLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { VerifyEmail } from './pages/auth/VerifyEmail';

// Dashboard Pages
import { Feed } from './pages/dashboard/Feed';
import { OpportunityDetail } from './pages/dashboard/OpportunityDetail';

// Admin Pages
import { ReviewQueue } from './pages/admin/ReviewQueue';

const queryClient = new QueryClient();

// Placeholder components for Phase F2 testing
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex h-[60vh] flex-col items-center justify-center text-center">
    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
    <p className="text-gray-400">This page will be built in an upcoming phase.</p>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
            </Route>

            {/* Protected Routes (Members+) */}
            <Route element={<RequireRole allowedRoles={['member', 'curator', 'admin', 'super_admin']} />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Feed />} />
                <Route path="/opportunity/:id" element={<OpportunityDetail />} />
                <Route path="/bookmarks" element={<Placeholder title="Bookmarks" />} />
                <Route path="/applied" element={<Placeholder title="Applied Tracker" />} />
                <Route path="/alerts" element={<Placeholder title="Alerts & Interests" />} />
                <Route path="/notifications" element={<Placeholder title="Notifications" />} />

                {/* Curator+ Routes */}
                <Route element={<RequireRole allowedRoles={['curator', 'admin', 'super_admin']} />}>
                  <Route path="/review" element={<ReviewQueue />} />
                </Route>

                {/* Admin+ Routes */}
                <Route element={<RequireRole allowedRoles={['admin', 'super_admin']} />}>
                  <Route path="/sources" element={<Placeholder title="Sources Management" />} />
                  <Route path="/members" element={<Placeholder title="Members" />} />
                  <Route path="/kpis" element={<Placeholder title="KPIs" />} />
                  <Route path="/logs" element={<Placeholder title="Audit Logs" />} />
                </Route>
              </Route>
            </Route>

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
