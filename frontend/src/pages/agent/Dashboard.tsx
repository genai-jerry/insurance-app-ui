import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
} from '@mui/material';
import {
  Phone,
  People,
  TrendingUp,
  CheckCircle,
  PhoneCallback,
  PersonSearch,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { schedulerApi } from '../../api/scheduler';
import { leadsApi } from '../../api/leads';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { formatDateTime, formatDate } from '../../utils/formatters';

export const Dashboard = () => {
  const navigate = useNavigate();

  const { data: todayTasks, isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['todayTasks'],
    queryFn: schedulerApi.getToday,
  });

  const { data: myLeads, isLoading: leadsLoading, error: leadsError } = useQuery({
    queryKey: ['myLeads'],
    queryFn: () => leadsApi.getMyLeads({ size: 10 }),
  });

  if (tasksLoading || leadsLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const error = tasksError || leadsError;
  if (error) {
    return <ErrorAlert error={error as Error} />;
  }

  const pendingTasks = todayTasks?.filter((t) => t.status === 'PENDING') || [];
  const completedTasks = todayTasks?.filter((t) => t.status === 'DONE') || [];
  const newLeads = myLeads?.content.filter((l) => l.status === 'NEW') || [];

  const stats = [
    {
      title: 'Calls Today',
      value: todayTasks?.length || 0,
      icon: <Phone sx={{ fontSize: '1.25rem' }} />,
      tint: '#DBEAFE',
      iconColor: '#2563EB',
    },
    {
      title: 'Pending Calls',
      value: pendingTasks.length,
      icon: <CheckCircle sx={{ fontSize: '1.25rem' }} />,
      tint: '#FEF3C7',
      iconColor: '#D97706',
    },
    {
      title: 'My Leads',
      value: myLeads?.totalElements || 0,
      icon: <People sx={{ fontSize: '1.25rem' }} />,
      tint: '#D1FAE5',
      iconColor: '#059669',
    },
    {
      title: 'New Leads',
      value: newLeads.length,
      icon: <TrendingUp sx={{ fontSize: '1.25rem' }} />,
      tint: '#EDE9FE',
      iconColor: '#7C3AED',
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of your daily activities and leads
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {/* Stats Cards */}
        {stats.map((stat) => (
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

        {/* Today's Call Queue */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Today's Call Queue</Typography>
              <Button
                size="small"
                onClick={() => navigate('/agent/calendar')}
                sx={{ color: 'secondary.main' }}
              >
                View all
              </Button>
            </Box>
            {pendingTasks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PhoneCallback sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  No pending calls for today
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {pendingTasks.slice(0, 5).map((task) => (
                  <ListItem
                    key={task.id}
                    sx={{
                      borderLeft: 3,
                      borderColor: 'secondary.main',
                      mb: 1,
                      bgcolor: '#F8FAFC',
                      borderRadius: '0 8px 8px 0',
                      py: 1,
                    }}
                  >
                    <ListItemText
                      primary={task.leadName}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }}
                      secondary={
                        <>
                          <Typography variant="caption" display="block">
                            {formatDateTime(task.scheduledTime)}
                          </Typography>
                          {task.leadPhone && (
                            <Typography variant="caption" display="block">
                              {task.leadPhone}
                            </Typography>
                          )}
                        </>
                      }
                    />
                    <Chip label={task.status} size="small" color="warning" />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Recent Leads */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Leads</Typography>
              <Button
                size="small"
                onClick={() => navigate('/agent/leads')}
                sx={{ color: 'secondary.main' }}
              >
                View all
              </Button>
            </Box>
            {myLeads?.content.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PersonSearch sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  No leads assigned yet
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {myLeads?.content.slice(0, 5).map((lead) => (
                  <ListItem
                    key={lead.id}
                    sx={{
                      mb: 1,
                      bgcolor: '#F8FAFC',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      '&:hover': { bgcolor: '#F1F5F9' },
                      py: 1,
                    }}
                    onClick={() => navigate(`/agent/leads/${lead.id}`)}
                  >
                    <ListItemText
                      primary={lead.name}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }}
                      secondary={
                        <>
                          <Typography variant="caption" display="block">
                            {lead.email}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Created: {formatDate(lead.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                    <Chip
                      label={lead.status}
                      size="small"
                      color={lead.status === 'NEW' ? 'success' : 'default'}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Completed Calls Today */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Completed Calls Today ({completedTasks.length})
            </Typography>
            {completedTasks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="text.secondary" variant="body2">
                  No completed calls yet
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {completedTasks.map((task) => (
                  <ListItem
                    key={task.id}
                    sx={{
                      borderLeft: 3,
                      borderColor: 'success.main',
                      mb: 1,
                      bgcolor: '#F8FAFC',
                      borderRadius: '0 8px 8px 0',
                      py: 1,
                    }}
                  >
                    <ListItemText
                      primary={task.leadName}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }}
                      secondary={
                        <>
                          <Typography variant="caption" display="block">
                            Completed: {formatDateTime(task.completedAt!)}
                          </Typography>
                          {task.notes && (
                            <Typography variant="caption" display="block">
                              Notes: {task.notes}
                            </Typography>
                          )}
                        </>
                      }
                    />
                    <Chip
                      label="Completed"
                      size="small"
                      sx={{ bgcolor: '#D1FAE5', color: '#065F46', fontWeight: 600 }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
