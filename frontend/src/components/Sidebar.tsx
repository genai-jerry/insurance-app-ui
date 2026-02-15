import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import {
  Dashboard,
  People,
  CalendarToday,
  ShoppingCart,
  AdminPanelSettings,
  Category,
  FolderOpen,
  Assessment,
  ViewKanban,
  Shield,
  Settings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const drawerWidth = 260;

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

interface NavSection {
  label: string;
  items: { text: string; icon: React.ReactNode; path: string }[];
}

export const Sidebar = ({ mobileOpen, onDrawerToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const agentSections: NavSection[] = [
    {
      label: 'WORKSPACE',
      items: [
        { text: 'Dashboard', icon: <Dashboard />, path: '/agent/dashboard' },
        { text: 'Leads', icon: <People />, path: '/agent/leads' },
        { text: 'Kanban Board', icon: <ViewKanban />, path: '/agent/kanban' },
      ],
    },
    {
      label: 'TOOLS',
      items: [
        { text: 'Call Calendar', icon: <CalendarToday />, path: '/agent/calendar' },
        { text: 'Products', icon: <ShoppingCart />, path: '/agent/products' },
      ],
    },
  ];

  const adminSections: NavSection[] = [
    {
      label: 'OVERVIEW',
      items: [
        { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
      ],
    },
    {
      label: 'MANAGEMENT',
      items: [
        { text: 'Users', icon: <AdminPanelSettings />, path: '/admin/users' },
        { text: 'Products', icon: <ShoppingCart />, path: '/admin/products' },
        { text: 'Categories', icon: <Category />, path: '/admin/categories' },
        { text: 'Documents', icon: <FolderOpen />, path: '/admin/documents' },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        { text: 'Model Config', icon: <Settings />, path: '/admin/config' },
        { text: 'Audit Logs', icon: <Assessment />, path: '/admin/audit' },
      ],
    },
  ];

  const sections = user?.role === 'ADMIN' ? adminSections : agentSections;

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Branded Header */}
      <Box sx={{ px: 2.5, py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield sx={{ fontSize: 20, color: '#ffffff' }} />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ color: '#ffffff', fontWeight: 700, lineHeight: 1.2, fontSize: '1rem' }}
            >
              InsureCRM
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#64748B', fontSize: '0.65rem', letterSpacing: '0.04em' }}
            >
              Agent Platform
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, px: 1, overflow: 'auto' }}>
        {sections.map((section) => (
          <Box key={section.label} sx={{ mb: 1.5 }}>
            <Typography
              variant="overline"
              sx={{
                px: 2,
                py: 0.5,
                display: 'block',
                color: '#475569',
                fontSize: '0.625rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
              }}
            >
              {section.label}
            </Typography>
            <List disablePadding>
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
                    <ListItemButton
                      selected={isActive}
                      onClick={() => {
                        navigate(item.path);
                        if (mobileOpen) onDrawerToggle();
                      }}
                      sx={{
                        borderRadius: '8px',
                        mx: 1,
                        py: 0.75,
                        px: 1.5,
                        borderLeft: isActive ? '3px solid #14B8A6' : '3px solid transparent',
                        '&.Mui-selected': {
                          bgcolor: 'rgba(13, 148, 136, 0.1)',
                          color: '#ffffff',
                          '& .MuiListItemIcon-root': { color: '#14B8A6' },
                        },
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.06)',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          color: isActive ? '#14B8A6' : '#64748B',
                          '& .MuiSvgIcon-root': { fontSize: '1.2rem' },
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: '0.8125rem',
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? '#ffffff' : '#94A3B8',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* User Profile at Bottom */}
      {user && (
        <Box
          sx={{
            p: 2,
            mx: 1.5,
            mb: 1.5,
            borderRadius: '10px',
            bgcolor: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: '#0D9488',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography
              variant="body2"
              sx={{ color: '#E2E8F0', fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.3 }}
              noWrap
            >
              {user.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#64748B', fontSize: '0.65rem' }}
              noWrap
            >
              {user.role === 'ADMIN' ? 'Administrator' : 'Agent'}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};
