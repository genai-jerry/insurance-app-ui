import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { adminApi } from '../../api/admin';
import { User } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { formatDate } from '../../utils/formatters';

export const UserManagement = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Partial<User>>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', page, rowsPerPage],
    queryFn: () => adminApi.getAllUsers({ page, size: rowsPerPage }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditDialogOpen(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    reset(user);
    setEditDialogOpen(true);
  };

  const handleDelete = (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(userId);
    }
  };

  const onSubmit = (data: Partial<User>) => {
    if (selectedUser) {
      updateMutation.mutate({ id: selectedUser.id, data });
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  if (error) {
    return <ErrorAlert error={error as Error} />;
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">User Management</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage agent and admin accounts
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.id}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    size="small"
                    sx={{
                      bgcolor: user.role === 'ADMIN' ? '#EDE9FE' : '#DBEAFE',
                      color: user.role === 'ADMIN' ? '#5B21B6' : '#1E40AF',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  />
                </TableCell>
                <TableCell>{user.createdAt ? formatDate(user.createdAt) : '-'}</TableCell>
                <TableCell>
                  <Tooltip title="Edit user">
                    <IconButton size="small" onClick={() => handleEdit(user)}>
                      <Edit sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete user">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(user.id)}
                      sx={{ color: '#DC2626', '&:hover': { bgcolor: '#FEF2F2' } }}
                    >
                      <Delete sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data?.length || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            {updateMutation.error && (
              <ErrorAlert error={updateMutation.error as Error} />
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
                  message: 'Invalid email',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              fullWidth
              select
              label="Role"
              margin="normal"
              defaultValue={selectedUser?.role}
              {...register('role')}
            >
              <MenuItem value="AGENT">Agent</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={updateMutation.isPending}
            >
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
