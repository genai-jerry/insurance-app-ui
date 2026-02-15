import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import { Save, Key, Storage, Email } from '@mui/icons-material';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { adminApi } from '../../api/admin';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';

interface ConfigForm {
  openaiApiKey: string;
  openaiModel: string;
  pineconeApiKey: string;
  pineconeIndex: string;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
}

export const ModelConfig = () => {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, reset } = useForm<ConfigForm>();

  const { data: configs, isLoading, error } = useQuery({
    queryKey: ['configs'],
    queryFn: adminApi.getAllConfigs,
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      adminApi.updateConfig(key, { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configs'] });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const onSubmit = async (data: ConfigForm) => {
    const updates = [
      { key: 'openai.api.key', value: data.openaiApiKey },
      { key: 'openai.model', value: data.openaiModel },
      { key: 'pinecone.api.key', value: data.pineconeApiKey },
      { key: 'pinecone.index', value: data.pineconeIndex },
      { key: 'smtp.host', value: data.smtpHost },
      { key: 'smtp.port', value: data.smtpPort },
      { key: 'smtp.username', value: data.smtpUsername },
      { key: 'smtp.password', value: data.smtpPassword },
    ];

    for (const update of updates) {
      if (update.value) {
        await updateMutation.mutateAsync(update);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading configuration..." />;
  }

  if (error) {
    return <ErrorAlert error={error as Error} />;
  }

  const getConfigValue = (key: string) => {
    return configs?.find((c) => c.key === key)?.value || '';
  };

  const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '8px',
          bgcolor: '#DBEAFE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6">{title}</Typography>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Model Configuration</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage API keys and integration settings
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Configuration updated successfully!
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* OpenAI Configuration */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderTop: '3px solid #2563EB' }}>
              <SectionHeader
                icon={<Key sx={{ fontSize: '1.1rem', color: '#2563EB' }} />}
                title="OpenAI Configuration"
              />
              <TextField
                fullWidth
                label="API Key"
                type="password"
                margin="normal"
                defaultValue={getConfigValue('openai.api.key')}
                {...register('openaiApiKey')}
                helperText="OpenAI API key for LLM operations"
              />
              <TextField
                fullWidth
                label="Model"
                margin="normal"
                defaultValue={getConfigValue('openai.model')}
                {...register('openaiModel')}
                helperText="Model name (e.g., gpt-4, gpt-3.5-turbo)"
              />
            </Paper>
          </Grid>

          {/* Pinecone Configuration */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderTop: '3px solid #7C3AED' }}>
              <SectionHeader
                icon={<Storage sx={{ fontSize: '1.1rem', color: '#7C3AED' }} />}
                title="Pinecone Configuration"
              />
              <TextField
                fullWidth
                label="API Key"
                type="password"
                margin="normal"
                defaultValue={getConfigValue('pinecone.api.key')}
                {...register('pineconeApiKey')}
                helperText="Pinecone API key for vector database"
              />
              <TextField
                fullWidth
                label="Index Name"
                margin="normal"
                defaultValue={getConfigValue('pinecone.index')}
                {...register('pineconeIndex')}
                helperText="Pinecone index name"
              />
            </Paper>
          </Grid>

          {/* SMTP Configuration */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderTop: '3px solid #0D9488' }}>
              <SectionHeader
                icon={<Email sx={{ fontSize: '1.1rem', color: '#0D9488' }} />}
                title="SMTP Configuration"
              />
              <TextField
                fullWidth
                label="SMTP Host"
                margin="normal"
                defaultValue={getConfigValue('smtp.host')}
                {...register('smtpHost')}
                helperText="SMTP server hostname"
              />
              <TextField
                fullWidth
                label="SMTP Port"
                type="number"
                margin="normal"
                defaultValue={getConfigValue('smtp.port')}
                {...register('smtpPort')}
                helperText="SMTP server port (usually 587 or 465)"
              />
              <TextField
                fullWidth
                label="SMTP Username"
                margin="normal"
                defaultValue={getConfigValue('smtp.username')}
                {...register('smtpUsername')}
                helperText="SMTP authentication username"
              />
              <TextField
                fullWidth
                label="SMTP Password"
                type="password"
                margin="normal"
                defaultValue={getConfigValue('smtp.password')}
                {...register('smtpPassword')}
                helperText="SMTP authentication password"
              />
            </Paper>
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<Save />}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};
