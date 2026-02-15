import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
} from '@mui/material';
import {
  Notifications,
  Menu as MenuIcon,
  Search,
  Logout,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface NavbarProps {
  onMenuClick: () => void;
}

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
            {getGreeting()}, {firstName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            {formatDate()}
          </Typography>
        </Box>

        <IconButton sx={{ color: 'text.secondary', mr: 0.5 }}>
          <Search sx={{ fontSize: '1.25rem' }} />
        </IconButton>

        <IconButton sx={{ color: 'text.secondary', mr: 1 }}>
          <Notifications sx={{ fontSize: '1.25rem' }} />
        </IconButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1 }} />

        <IconButton onClick={handleMenu} sx={{ ml: 1, p: 0.5 }}>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: '#1B2A4A',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: '10px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                border: '1px solid #E2E8F0',
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={handleLogout}
            sx={{ color: '#DC2626', py: 1, mt: 0.5, mx: 0.5, borderRadius: 1 }}
          >
            <Logout sx={{ fontSize: '1.1rem', mr: 1.5 }} />
            Sign out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
