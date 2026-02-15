import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Phone, Edit } from '@mui/icons-material';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { leadsApi } from '../../api/leads';
import { schedulerApi } from '../../api/scheduler';
import { voiceApi } from '../../api/voice';
import { emailApi } from '../../api/email';
import { prospectusApi } from '../../api/prospectus';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { formatDate, formatDateTime, formatPhone } from '../../utils/formatters';
import { UpdateLeadRequest, LeadStatus, ScheduleCallRequest } from '../../types';

const statusChipStyles: Record<string, { bgcolor: string; color: string }> = {
  NEW: { bgcolor: '#D1FAE5', color: '#065F46' },
  CONTACTED: { bgcolor: '#DBEAFE', color: '#1E40AF' },
  QUALIFIED: { bgcolor: '#EDE9FE', color: '#5B21B6' },
  PROPOSAL_SENT: { bgcolor: '#FEF3C7', color: '#92400E' },
  CONVERTED: { bgcolor: '#CCFBF1', color: '#0F766E' },
  LOST: { bgcolor: '#FEE2E2', color: '#991B1B' },
};

export const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<UpdateLeadRequest>();

  const {
    register: registerSchedule,
    handleSubmit: handleScheduleSubmit,
    reset: resetSchedule,
    formState: { errors: scheduleErrors },
  } = useForm<ScheduleCallRequest>();

  const { data: lead, isLoading, error } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsApi.getById(Number(id)),
    enabled: !!id,
  });

  const { data: voiceSessions } = useQuery({
    queryKey: ['voiceSessions', id],
    queryFn: () => voiceApi.getLeadSessions(Number(id)),
    enabled: !!id,
  });

  const { data: emails } = useQuery({
    queryKey: ['emails', id],
    queryFn: () => emailApi.getByLead(Number(id)),
    enabled: !!id,
  });

  const { data: prospectusRequests } = useQuery({
    queryKey: ['prospectus', id],
    queryFn: () => prospectusApi.getByLead(Number(id)),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateLeadRequest) =>
      leadsApi.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      setEditDialogOpen(false);
      resetEdit();
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: schedulerApi.schedule,
    onSuccess: () => {
      setScheduleDialogOpen(false);
      resetSchedule();
    },
  });

  const onEditSubmit = (data: UpdateLeadRequest) => {
    updateMutation.mutate(data);
  };

  const onScheduleSubmit = (data: any) => {
    scheduleMutation.mutate({
      leadId: Number(id),
      agentId: data.agentId,
      scheduledTime: data.scheduledTime,
      notes: data.notes,
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading lead details..." />;
  }

  if (error || !lead) {
    return <ErrorAlert error={error as Error || 'Lead not found'} />;
  }

  const contactFields = [
    { label: 'Name', value: lead.name },
    { label: 'Email', value: lead.email },
    { label: 'Phone', value: formatPhone(lead.phone) },
    { label: 'Source', value: lead.leadSource },
    { label: 'Created', value: formatDate(lead.createdAt) },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4">Lead Details</Typography>
          <Typography variant="body2" color="text.secondary">
            {lead.name} - {lead.email}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => {
              resetEdit(lead);
              setEditDialogOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            startIcon={<Phone />}
            onClick={() => setScheduleDialogOpen(true)}
          >
            Schedule Call
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Lead Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Box>
              {contactFields.map((field) => (
                <Box
                  key={field.label}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1.25,
                    borderBottom: '1px solid #F1F5F9',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {field.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {field.value || '-'}
                  </Typography>
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.25 }}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={lead.status.replace('_', ' ')}
                  size="small"
                  sx={{
                    ...(statusChipStyles[lead.status] || {}),
                    fontWeight: 600,
                    fontSize: '0.7rem',
                  }}
                />
              </Box>
              {lead.notes && (
                <Box sx={{ pt: 1.25, borderTop: '1px solid #F1F5F9' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Notes
                  </Typography>
                  <Typography variant="body2">{lead.notes}</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Activity Timeline */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>

            {/* Voice Sessions */}
            {voiceSessions && voiceSessions.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="overline"
                  sx={{ display: 'block', mb: 1 }}
                >
                  Voice Sessions ({voiceSessions.length})
                </Typography>
                {voiceSessions.slice(0, 3).map((session) => (
                  <Card
                    key={session.id}
                    sx={{ mb: 1, borderLeft: 3, borderLeftColor: 'secondary.main' }}
                  >
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="body2" fontWeight={500}>
                        Duration: {Math.floor((session.durationSeconds || 0) / 60)} minutes
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(session.createdAt)} - {session.status}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {/* Emails */}
            {emails && emails.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="overline"
                  sx={{ display: 'block', mb: 1 }}
                >
                  Emails ({emails.length})
                </Typography>
                {emails.slice(0, 3).map((email) => (
                  <Card
                    key={email.id}
                    sx={{ mb: 1, borderLeft: 3, borderLeftColor: 'info.main' }}
                  >
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={500}>{email.subject}</Typography>
                        <Chip
                          label={email.status}
                          size="small"
                          sx={{
                            bgcolor: email.status === 'SENT' ? '#D1FAE5' : '#F1F5F9',
                            color: email.status === 'SENT' ? '#065F46' : '#64748B',
                            fontWeight: 600,
                            fontSize: '0.65rem',
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {email.sentAt ? formatDateTime(email.sentAt) : 'Pending'}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {/* Prospectus */}
            {prospectusRequests && prospectusRequests.length > 0 && (
              <Box>
                <Typography
                  variant="overline"
                  sx={{ display: 'block', mb: 1 }}
                >
                  Prospectus ({prospectusRequests.length})
                </Typography>
                {prospectusRequests.map((p) => (
                  <Card
                    key={p.id}
                    sx={{ mb: 1, borderLeft: 3, borderLeftColor: 'warning.main' }}
                  >
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          Version: {p.version || 1}
                        </Typography>
                        {p.pdfUrl && (
                          <Chip
                            label="PDF Ready"
                            size="small"
                            sx={{ bgcolor: '#D1FAE5', color: '#065F46', fontWeight: 600, fontSize: '0.65rem' }}
                          />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(p.createdAt)}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleEditSubmit(onEditSubmit)}>
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              margin="normal"
              defaultValue={lead.name}
              {...registerEdit('name')}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              defaultValue={lead.email}
              {...registerEdit('email')}
            />
            <TextField
              fullWidth
              label="Phone"
              margin="normal"
              defaultValue={lead.phone}
              {...registerEdit('phone')}
            />
            <TextField
              fullWidth
              select
              label="Status"
              margin="normal"
              defaultValue={lead.status}
              {...registerEdit('status')}
            >
              <MenuItem value="NEW">New</MenuItem>
              <MenuItem value="CONTACTED">Contacted</MenuItem>
              <MenuItem value="QUALIFIED">Qualified</MenuItem>
              <MenuItem value="PROPOSAL_SENT">Proposal Sent</MenuItem>
              <MenuItem value="CONVERTED">Converted</MenuItem>
              <MenuItem value="LOST">Lost</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              margin="normal"
              defaultValue={lead.notes}
              {...registerEdit('notes')}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Schedule Call Dialog */}
      <Dialog
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleScheduleSubmit(onScheduleSubmit)}>
          <DialogTitle>Schedule Call</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Scheduled Time"
              type="datetime-local"
              margin="normal"
              InputLabelProps={{ shrink: true }}
              {...registerSchedule('scheduledTime', {
                required: 'Scheduled time is required',
              })}
              error={!!scheduleErrors.scheduledTime}
              helperText={scheduleErrors.scheduledTime?.message}
            />
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              margin="normal"
              {...registerSchedule('notes')}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Schedule
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
