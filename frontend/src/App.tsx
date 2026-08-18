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
import { Bookmarks } from './pages/dashboard/Bookmarks';
import { AppliedTracker } from './pages/dashboard/AppliedTracker';
import { Alerts } from './pages/dashboard/Alerts';
import { Notifications } from './pages/dashboard/Notifications';

// Admin Pages
import { ReviewQueue } from './pages/admin/ReviewQueue';
import { KPIs } from './pages/admin/KPIs';
import { AuditLogs } from './pages/admin/AuditLogs';
import { Members } from './pages/admin/Members';
import { Sources } from './pages/admin/Sources';

const queryClient = new QueryClient();

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
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/applied" element={<AppliedTracker />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/notifications" element={<Notifications />} />

                {/* Curator+ Routes */}
                <Route element={<RequireRole allowedRoles={['curator', 'admin', 'super_admin']} />}>
                  <Route path="/review" element={<ReviewQueue />} />
                </Route>

                {/* Admin+ Routes */}
                <Route element={<RequireRole allowedRoles={['admin', 'super_admin']} />}>
                  <Route path="/sources" element={<Sources />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/kpis" element={<KPIs />} />
                  <Route path="/logs" element={<AuditLogs />} />
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
