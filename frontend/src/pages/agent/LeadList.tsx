import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import { Edit, Phone, Email, Visibility } from '@mui/icons-material';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { leadsApi } from '../../api/leads';
import { CreateLeadRequest, LeadStatus } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { formatDate, formatPhone } from '../../utils/formatters';

const statusChipStyles: Record<LeadStatus, { bgcolor: string; color: string }> = {
  NEW: { bgcolor: '#D1FAE5', color: '#065F46' },
  CONTACTED: { bgcolor: '#DBEAFE', color: '#1E40AF' },
  QUALIFIED: { bgcolor: '#EDE9FE', color: '#5B21B6' },
  PROPOSAL_SENT: { bgcolor: '#FEF3C7', color: '#92400E' },
  CONVERTED: { bgcolor: '#CCFBF1', color: '#0F766E' },
  LOST: { bgcolor: '#FEE2E2', color: '#991B1B' },
};

export const LeadList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLeadRequest>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['leads', page, rowsPerPage, search, statusFilter],
    queryFn: () =>
      leadsApi.getAll({
        page,
        size: rowsPerPage,
        search: search || undefined,
        status: statusFilter || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: leadsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setCreateDialogOpen(false);
      reset();
    },
  });

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const onSubmit = (data: CreateLeadRequest) => {
    createMutation.mutate(data);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading leads..." />;
  }

  if (error) {
    return <ErrorAlert error={error as Error} />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4">Leads</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track your lead pipeline
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Lead
        </Button>
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 300 }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => {
                setStatusFilter(e.target.value as LeadStatus);
                setPage(0);
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="NEW">New</MenuItem>
              <MenuItem value="CONTACTED">Contacted</MenuItem>
              <MenuItem value="QUALIFIED">Qualified</MenuItem>
              <MenuItem value="PROPOSAL_SENT">Proposal Sent</MenuItem>
              <MenuItem value="CONVERTED">Converted</MenuItem>
              <MenuItem value="LOST">Lost</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.content.map((lead) => (
              <TableRow key={lead.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{lead.name}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{formatPhone(lead.phone)}</TableCell>
                <TableCell>
                  <Chip
                    label={lead.status.replace('_', ' ')}
                    size="small"
                    sx={{
                      ...statusChipStyles[lead.status],
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  />
                </TableCell>
                <TableCell>{lead.leadSource}</TableCell>
                <TableCell>{formatDate(lead.createdAt)}</TableCell>
                <TableCell>
                  <Tooltip title="View details">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/agent/leads/${lead.id}`)}
                    >
                      <Visibility sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Call lead">
                    <IconButton size="small">
                      <Phone sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Email lead">
                    <IconButton size="small">
                      <Email sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={data?.totalElements || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Create Lead Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Create New Lead</DialogTitle>
          <DialogContent>
            {createMutation.error && (
              <ErrorAlert error={createMutation.error as Error} />
            )}
            <TextField
              fullWidth
              label="Name"
              margin="normal"
              {...register('name', { required: 'Name is required' })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              fullWidth
              label="Phone"
              margin="normal"
              {...register('phone', { required: 'Phone is required' })}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
            <TextField
              fullWidth
              label="Source"
              margin="normal"
              {...register('leadSource')}
              error={!!errors.leadSource}
              helperText={errors.leadSource?.message}
            />
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              margin="normal"
              {...register('notes')}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending}
            >
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
