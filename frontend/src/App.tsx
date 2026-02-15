import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useAuthStore } from './store/authStore';
import { PrivateRoute } from './components/PrivateRoute';
import { Layout } from './components/Layout';

// Auth Pages
import { Login } from './pages/auth/Login';

// Agent Pages
import { Dashboard } from './pages/agent/Dashboard';
import { LeadList } from './pages/agent/LeadList';
import { LeadDetail } from './pages/agent/LeadDetail';
import { LeadKanban } from './pages/agent/LeadKanban';
import { CallCalendar } from './pages/agent/CallCalendar';
import { ProductBrowser } from './pages/agent/ProductBrowser';
import { VoiceSessionViewer } from './pages/agent/VoiceSessionViewer';
import { ProspectusPreview } from './pages/agent/ProspectusPreview';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { ProductManagement } from './pages/admin/ProductManagement';
import { CategoryManagement } from './pages/admin/CategoryManagement';
import { DocumentManagement } from './pages/admin/DocumentManagement';
import { ModelConfig } from './pages/admin/ModelConfig';
import { AuditLogs } from './pages/admin/AuditLogs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1B2A4A',
      light: '#2D4A7A',
      dark: '#101B32',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0D9488',
      light: '#14B8A6',
      dark: '#0F766E',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8FAFC',
      paper: '#ffffff',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    divider: '#E2E8F0',
    error: { main: '#DC2626', light: '#FEE2E2' },
    warning: { main: '#D97706', light: '#FEF3C7' },
    success: { main: '#059669', light: '#D1FAE5' },
    info: { main: '#2563EB', light: '#DBEAFE' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontSize: '1.625rem', fontWeight: 700, letterSpacing: '-0.01em', color: '#1E293B' },
    h5: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontSize: '1.05rem', fontWeight: 600 },
    subtitle1: { fontSize: '0.95rem', fontWeight: 500 },
    subtitle2: { fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.02em' },
    body1: { fontSize: '0.875rem', lineHeight: 1.6 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', color: '#64748B' },
    overline: { fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8' },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' },
  },
  shape: { borderRadius: 10 },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0,0,0,0.05)',
    '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.04)',
    '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.04)',
    '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -4px rgba(0,0,0,0.04)',
    '0 20px 25px -5px rgba(0,0,0,0.07), 0 8px 10px -6px rgba(0,0,0,0.04)',
    ...Array(19).fill('0 20px 25px -5px rgba(0,0,0,0.07), 0 8px 10px -6px rgba(0,0,0,0.04)'),
  ] as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#F8FAFC' },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1E293B',
          borderBottom: '1px solid #E2E8F0',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1B2A4A',
          color: '#CBD5E1',
          borderRight: 'none',
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #E2E8F0',
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.04)',
            borderColor: '#CBD5E1',
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '7px 18px',
          fontWeight: 600,
        },
        contained: {
          background: 'linear-gradient(135deg, #1B2A4A 0%, #2D4A7A 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #101B32 0%, #1B2A4A 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)',
          },
        },
        outlined: {
          borderColor: '#CBD5E1',
          color: '#475569',
          '&:hover': {
            borderColor: '#94A3B8',
            backgroundColor: '#F8FAFC',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            fontSize: '0.6875rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#64748B',
            backgroundColor: '#F8FAFC',
            borderBottom: '2px solid #E2E8F0',
            padding: '12px 16px',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#F1F5F9',
          padding: '12px 16px',
          fontSize: '0.8125rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.7rem',
          borderRadius: 6,
        },
        colorSuccess: {
          backgroundColor: '#D1FAE5',
          color: '#065F46',
        },
        colorWarning: {
          backgroundColor: '#FEF3C7',
          color: '#92400E',
        },
        colorError: {
          backgroundColor: '#FEE2E2',
          color: '#991B1B',
        },
        colorPrimary: {
          backgroundColor: '#DBEAFE',
          color: '#1E40AF',
        },
        colorSecondary: {
          backgroundColor: '#CCFBF1',
          color: '#0F766E',
        },
        colorInfo: {
          backgroundColor: '#DBEAFE',
          color: '#1E40AF',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
          border: 'none',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.125rem',
          fontWeight: 700,
          padding: '20px 24px 8px',
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': { borderColor: '#E2E8F0' },
            '&:hover fieldset': { borderColor: '#CBD5E1' },
            '&.Mui-focused fieldset': { borderColor: '#0D9488', borderWidth: 2 },
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          padding: '8px 12px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(13, 148, 136, 0.12)',
            color: '#ffffff',
            '& .MuiListItemIcon-root': { color: '#14B8A6' },
            '&:hover': { backgroundColor: 'rgba(13, 148, 136, 0.18)' },
          },
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.06)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8, fontSize: '0.8125rem' },
        standardInfo: { backgroundColor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' },
        standardSuccess: { backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' },
        standardWarning: { backgroundColor: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' },
        standardError: { backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1E293B',
          fontSize: '0.75rem',
          borderRadius: 6,
          padding: '6px 12px',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': { backgroundColor: '#F1F5F9' },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '0.8125rem',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& fieldset': { borderColor: '#E2E8F0' },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: { borderTop: '1px solid #F1F5F9' },
      },
    },
  },
});

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Agent Routes */}
            <Route
              path="/agent/*"
              element={
                <PrivateRoute>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="leads" element={<LeadList />} />
                      <Route path="leads/:id" element={<LeadDetail />} />
                      <Route path="kanban" element={<LeadKanban />} />
                      <Route path="calendar" element={<CallCalendar />} />
                      <Route path="products" element={<ProductBrowser />} />
                      <Route path="voice-sessions/:sessionId" element={<VoiceSessionViewer />} />
                      <Route path="prospectus/:requestId" element={<ProspectusPreview />} />
                      <Route
                        path="*"
                        element={<Navigate to="/agent/dashboard" replace />}
                      />
                    </Routes>
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <PrivateRoute requireAdmin>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="users" element={<UserManagement />} />
                      <Route path="products" element={<ProductManagement />} />
                      <Route path="categories" element={<CategoryManagement />} />
                      <Route path="documents" element={<DocumentManagement />} />
                      <Route path="config" element={<ModelConfig />} />
                      <Route path="audit" element={<AuditLogs />} />
                      <Route
                        path="*"
                        element={<Navigate to="/admin/dashboard" replace />}
                      />
                    </Routes>
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Default Route */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/agent/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
