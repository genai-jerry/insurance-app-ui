import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  People,
  ShoppingCart,
  Description,
  TrendingUp,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const AdminDashboard = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getDashboardStats,
    retry: false,
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const buildStatCards = (data: any) => [
    {
      title: 'Total Leads',
      value: data?.totalLeads ?? '-',
      icon: <People sx={{ fontSize: '1.25rem' }} />,
      tint: '#DBEAFE',
      iconColor: '#2563EB',
    },
    {
      title: 'New Leads',
      value: data?.newLeads ?? '-',
      icon: <TrendingUp sx={{ fontSize: '1.25rem' }} />,
      tint: '#D1FAE5',
      iconColor: '#059669',
    },
    {
      title: 'Calls Today',
      value: data?.callsToday ?? '-',
      icon: <ShoppingCart sx={{ fontSize: '1.25rem' }} />,
      tint: '#FEF3C7',
      iconColor: '#D97706',
    },
    {
      title: 'Conversion Rate',
      value: data ? `${(data.conversionRate || 0).toFixed(1)}%` : '-',
      icon: <Description sx={{ fontSize: '1.25rem' }} />,
      tint: '#EDE9FE',
      iconColor: '#7C3AED',
    },
  ];

  const statCards = buildStatCards(error ? null : stats);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Admin Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          System-wide metrics and overview
        </Typography>
      </Box>

      {(error || !stats) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Dashboard statistics are not yet available. The stats endpoint may not be configured.
        </Alert>
      )}

      <Grid container spacing={2.5}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="overline" sx={{ mb: 0.5, display: 'block' }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.75rem' }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      bgcolor: stat.tint,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.iconColor,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {stats && (
          <>
            {/* Leads by Status */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Leads by Status
                </Typography>
                {stats.leadsByStatus && (
                  <Box>
                    {Object.entries(stats.leadsByStatus).map(([status, count]) => (
                      <Box
                        key={status}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          py: 1.25,
                          borderBottom: '1px solid #F1F5F9',
                          '&:last-child': { borderBottom: 'none' },
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {status.replace('_', ' ')}
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>{count}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* System Overview */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  System Overview
                </Typography>
                <Box>
                  {[
                    { label: 'Pending Calls', value: stats.callsPending || 0 },
                    { label: 'Conversion Rate', value: `${(stats.conversionRate || 0).toFixed(1)}%` },
                  ].map((row) => (
                    <Box
                      key={row.label}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 1.25,
                        borderBottom: '1px solid #F1F5F9',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                      <Typography variant="body2" fontWeight={700}>{row.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};
