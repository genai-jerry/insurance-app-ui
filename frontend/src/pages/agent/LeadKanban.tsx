import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
} from '@mui/material';
import { Phone } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { leadsApi } from '../../api/leads';
import { Lead, LeadStatus } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { formatPhone } from '../../utils/formatters';

const columns: { status: LeadStatus; title: string; accent: string; chipBg: string; chipColor: string }[] = [
  { status: 'NEW', title: 'New', accent: '#059669', chipBg: '#D1FAE5', chipColor: '#065F46' },
  { status: 'CONTACTED', title: 'Contacted', accent: '#2563EB', chipBg: '#DBEAFE', chipColor: '#1E40AF' },
  { status: 'QUALIFIED', title: 'Qualified', accent: '#7C3AED', chipBg: '#EDE9FE', chipColor: '#5B21B6' },
  { status: 'PROPOSAL_SENT', title: 'Proposal Sent', accent: '#D97706', chipBg: '#FEF3C7', chipColor: '#92400E' },
  { status: 'CONVERTED', title: 'Converted', accent: '#0D9488', chipBg: '#CCFBF1', chipColor: '#0F766E' },
  { status: 'LOST', title: 'Lost', accent: '#DC2626', chipBg: '#FEE2E2', chipColor: '#991B1B' },
];

export const LeadKanban = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: leads, isLoading, error } = useQuery({
    queryKey: ['allLeads'],
    queryFn: () => leadsApi.getAll({ size: 100 }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: LeadStatus }) =>
      leadsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLeads'] });
    },
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading kanban board..." />;
  }

  if (error) {
    return <ErrorAlert error={error as Error} />;
  }

  const getLeadsByStatus = (status: LeadStatus): Lead[] => {
    return leads?.content.filter((lead) => lead.status === status) || [];
  };

  const handleStatusChange = (leadId: number, newStatus: LeadStatus) => {
    updateStatusMutation.mutate({ id: leadId, status: newStatus });
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Lead Kanban Board</Typography>
        <Typography variant="body2" color="text.secondary">
          Drag-free pipeline view of all your leads
        </Typography>
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 2, minWidth: 'min-content', pb: 2 }}>
          {columns.map((column) => {
            const columnLeads = getLeadsByStatus(column.status);
            return (
              <Paper
                key={column.status}
                sx={{
                  minWidth: 290,
                  maxWidth: 290,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderBottom: `3px solid ${column.accent}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    {column.title}
                  </Typography>
                  <Chip
                    label={columnLeads.length}
                    size="small"
                    sx={{
                      bgcolor: column.chipBg,
                      color: column.chipColor,
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      height: 22,
                      minWidth: 28,
                    }}
                  />
                </Box>
                <Box sx={{ p: 1.5, maxHeight: 'calc(100vh - 250px)', overflow: 'auto' }}>
                  {columnLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      sx={{
                        mb: 1.5,
                        borderLeft: `3px solid ${column.accent}`,
                        cursor: 'pointer',
                        '&:hover': { borderColor: column.accent },
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {lead.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {lead.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {formatPhone(lead.phone)}
                        </Typography>
                        {lead.leadSource && (
                          <Chip
                            label={lead.leadSource}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 1, fontSize: '0.65rem', height: 22 }}
                          />
                        )}
                      </CardContent>
                      <CardActions sx={{ pt: 0, px: 2, pb: 1.5 }}>
                        <Button
                          size="small"
                          onClick={() => navigate(`/agent/leads/${lead.id}`)}
                          sx={{ fontSize: '0.75rem' }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Phone sx={{ fontSize: '0.9rem' }} />}
                          sx={{ fontSize: '0.75rem' }}
                        >
                          Call
                        </Button>
                      </CardActions>
                    </Card>
                  ))}
                  {columnLeads.length === 0 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      align="center"
                      sx={{ display: 'block', py: 3 }}
                    >
                      No leads
                    </Typography>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};
