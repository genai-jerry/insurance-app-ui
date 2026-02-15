import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { Shield } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { LoginRequest } from '../../types';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    try {
      setLoading(true);
      setError('');
      await login(data.email, data.password);
      const user = useAuthStore.getState().user;
      if (user?.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/agent/dashboard');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Panel - Branding */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '45%',
          background: 'linear-gradient(135deg, #1B2A4A 0%, #0D9488 100%)',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          p: 6,
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -120,
            left: -60,
            width: 400,
            height: 400,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '30%',
            left: -30,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.03)',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              mx: 'auto',
            }}
          >
            <Shield sx={{ fontSize: 36, color: '#ffffff' }} />
          </Box>
          <Typography
            variant="h4"
            sx={{ color: '#ffffff', fontWeight: 700, mb: 1.5, letterSpacing: '-0.02em' }}
          >
            InsureCRM
          </Typography>
          <Typography
            sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', maxWidth: 320, lineHeight: 1.6 }}
          >
            Streamline your insurance operations with AI-powered outreach, smart recommendations, and automated prospectus generation.
          </Typography>
        </Box>
      </Box>

      {/* Right Panel - Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#F8FAFC',
          p: { xs: 3, sm: 6 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile-only logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Shield sx={{ fontSize: 22, color: '#ffffff' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1B2A4A' }}>
              InsureCRM
            </Typography>
          </Box>

          <Typography variant="h4" sx={{ mb: 0.5, fontSize: '1.5rem' }}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Enter your credentials to access your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.primary' }}>
              Email
            </Typography>
            <TextField
              fullWidth
              placeholder="you@company.com"
              sx={{ mb: 2.5 }}
              {...register('email', {
                required: 'Email is required',
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={loading}
            />

            <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.primary' }}>
              Password
            </Typography>
            <TextField
              fullWidth
              type="password"
              placeholder="Enter your password"
              sx={{ mb: 3 }}
              {...register('password', {
                required: 'Password is required',
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.3,
                background: 'linear-gradient(135deg, #1B2A4A 0%, #2D4A7A 100%)',
                fontSize: '0.875rem',
                '&:hover': {
                  background: 'linear-gradient(135deg, #101B32 0%, #1B2A4A 100%)',
                },
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
};
