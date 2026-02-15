import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Phone, CheckCircle, Schedule, Cancel } from '@mui/icons-material';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { schedulerApi } from '../../api/scheduler';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { formatDateTime } from '../../utils/formatters';
import { CallTask } from '../../types';

export const CallCalendar = () => {
  const queryClient = useQueryClient();
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<CallTask | null>(null);

  const { register, handleSubmit, reset } = useForm<{ notes: string }>();

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['myTasks'],
    queryFn: () => schedulerApi.getAll(),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      schedulerApi.complete(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
      setCompleteDialogOpen(false);
      setSelectedTask(null);
      reset();
    },
  });

  const onCompleteSubmit = (data: { notes: string }) => {
    if (selectedTask) {
      completeMutation.mutate({ id: selectedTask.id, notes: data.notes });
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading call calendar..." />;
  }

  if (error) {
    return <ErrorAlert error={error as Error} />;
  }

  const pendingTasks = tasks?.filter((t: CallTask) => t.status === 'PENDING') || [];
  const completedTasks = tasks?.filter((t: CallTask) => t.status === 'DONE') || [];
  const cancelledTasks = tasks?.filter((t: CallTask) => t.status === 'CANCELLED') || [];

  const SectionHeader = ({ icon, title, count, color }: { icon: React.ReactNode; title: string; count: number; color: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '8px',
          bgcolor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" sx={{ flex: 1 }}>{title}</Typography>
      <Chip
        label={count}
        size="small"
        sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22, minWidth: 28, bgcolor: color, color: 'inherit' }}
      />
    </Box>
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Call Calendar</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your scheduled calls and track completion
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: 'column' }}>
        {/* Pending Calls */}
        <Paper sx={{ p: 3 }}>
          <SectionHeader
            icon={<Schedule sx={{ fontSize: '1.1rem', color: '#92400E' }} />}
            title="Pending Calls"
            count={pendingTasks.length}
            color="#FEF3C7"
          />
          {pendingTasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography color="text.secondary" variant="body2">No pending calls</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {pendingTasks.map((task: CallTask) => (
                <ListItem
                  key={task.id}
                  sx={{
                    borderLeft: 3,
                    borderColor: 'warning.main',
                    mb: 1,
                    bgcolor: '#FFFBEB',
                    borderRadius: '0 8px 8px 0',
                    py: 1,
                  }}
                  secondaryAction={
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<CheckCircle sx={{ fontSize: '0.9rem' }} />}
                      onClick={() => {
                        setSelectedTask(task);
                        setCompleteDialogOpen(true);
                      }}
                      sx={{
                        background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                        '&:hover': { background: 'linear-gradient(135deg, #047857 0%, #059669 100%)' },
                      }}
                    >
                      Complete
                    </Button>
                  }
                >
                  <ListItemText
                    primary={task.leadName}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }}
                    secondary={
                      <>
                        <Typography variant="caption" display="block">
                          Scheduled: {formatDateTime(task.scheduledTime)}
                        </Typography>
                        {task.leadPhone && (
                          <Typography variant="caption" display="block">
                            Phone: {task.leadPhone}
                          </Typography>
                        )}
                        {task.notes && (
                          <Typography variant="caption" display="block">
                            Notes: {task.notes}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

        {/* Completed Calls */}
        <Paper sx={{ p: 3 }}>
          <SectionHeader
            icon={<CheckCircle sx={{ fontSize: '1.1rem', color: '#065F46' }} />}
            title="Completed Calls"
            count={completedTasks.length}
            color="#D1FAE5"
          />
          {completedTasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography color="text.secondary" variant="body2">No completed calls</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {completedTasks.map((task: CallTask) => (
                <ListItem
                  key={task.id}
                  sx={{
                    borderLeft: 3,
                    borderColor: 'success.main',
                    mb: 1,
                    bgcolor: '#ECFDF5',
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

        {/* Cancelled Calls */}
        {cancelledTasks.length > 0 && (
          <Paper sx={{ p: 3 }}>
            <SectionHeader
              icon={<Cancel sx={{ fontSize: '1.1rem', color: '#991B1B' }} />}
              title="Cancelled Calls"
              count={cancelledTasks.length}
              color="#FEE2E2"
            />
            <List disablePadding>
              {cancelledTasks.map((task: CallTask) => (
                <ListItem
                  key={task.id}
                  sx={{
                    borderLeft: 3,
                    borderColor: 'error.main',
                    mb: 1,
                    bgcolor: '#FEF2F2',
                    borderRadius: '0 8px 8px 0',
                    py: 1,
                  }}
                >
                  <ListItemText
                    primary={task.leadName}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }}
                    secondary={formatDateTime(task.scheduledTime)}
                  />
                  <Chip
                    label="Cancelled"
                    size="small"
                    sx={{ bgcolor: '#FEE2E2', color: '#991B1B', fontWeight: 600 }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      {/* Complete Call Dialog */}
      <Dialog
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit(onCompleteSubmit)}>
          <DialogTitle>Complete Call</DialogTitle>
          <DialogContent>
            <Typography variant="body2" gutterBottom>
              Lead: <strong>{selectedTask?.leadName}</strong>
            </Typography>
            <TextField
              fullWidth
              label="Call Notes"
              multiline
              rows={4}
              margin="normal"
              {...register('notes')}
              placeholder="Enter call summary and outcomes..."
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={completeMutation.isPending}
              sx={{
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #047857 0%, #059669 100%)' },
              }}
            >
              Complete Call
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
