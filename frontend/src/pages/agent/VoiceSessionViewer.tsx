import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid,
} from '@mui/material';
import { RecordVoiceOver, Psychology, Recommend } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { voiceApi } from '../../api/voice';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { formatDateTime } from '../../utils/formatters';

export const VoiceSessionViewer = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['voiceSession', sessionId],
    queryFn: () => voiceApi.getSession(Number(sessionId)),
    enabled: !!sessionId,
  });

  const { data: needs } = useQuery({
    queryKey: ['needs', sessionId],
    queryFn: () => voiceApi.getNeeds(Number(sessionId)),
    enabled: !!sessionId,
  });

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', sessionId],
    queryFn: () => voiceApi.getRecommendations(Number(sessionId)),
    enabled: !!sessionId,
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading voice session..." />;
  }

  if (error || !session) {
    return <ErrorAlert error={error as Error || 'Session not found'} />;
  }

  const formatDurationFromSeconds = (seconds?: number): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const SectionIcon = ({ icon, color }: { icon: React.ReactNode; color: string }) => (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: '8px',
        bgcolor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mr: 1.5,
      }}
    >
      {icon}
    </Box>
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Voice Session Details</Typography>
        <Typography variant="body2" color="text.secondary">
          {session.leadName} - {formatDateTime(session.createdAt)}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Session Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SectionIcon icon={<RecordVoiceOver sx={{ fontSize: '1.1rem', color: '#1E40AF' }} />} color="#DBEAFE" />
              <Typography variant="h6">Session Information</Typography>
            </Box>
            <Box>
              {[
                { label: 'Lead', value: session.leadName },
                { label: 'Duration', value: formatDurationFromSeconds(session.durationSeconds) },
                { label: 'Created', value: formatDateTime(session.createdAt) },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1.25,
                    borderBottom: '1px solid #F1F5F9',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                  <Typography variant="body2" fontWeight={500}>{item.value}</Typography>
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.25 }}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip
                  label={session.status}
                  size="small"
                  sx={{
                    bgcolor: session.status === 'COMPLETED' ? '#D1FAE5' : '#F1F5F9',
                    color: session.status === 'COMPLETED' ? '#065F46' : '#64748B',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                  }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Transcript */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transcript
            </Typography>
            <Box
              sx={{
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                p: 2.5,
                borderRadius: 2,
                maxHeight: 400,
                overflow: 'auto',
                fontFamily: 'monospace',
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {session.transcriptText || 'No transcript available'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Extracted Needs */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SectionIcon icon={<Psychology sx={{ fontSize: '1.1rem', color: '#5B21B6' }} />} color="#EDE9FE" />
              <Typography variant="h6">Extracted Needs</Typography>
            </Box>
            {needs && Object.keys(needs).length > 0 ? (
              <Box
                sx={{
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  p: 2.5,
                  borderRadius: 2,
                  fontFamily: 'monospace',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {JSON.stringify(needs, null, 2)}
                </Typography>
              </Box>
            ) : (
              <Typography color="text.secondary" variant="body2">No needs extracted</Typography>
            )}
          </Paper>
        </Grid>

        {/* Product Recommendations */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SectionIcon icon={<Recommend sx={{ fontSize: '1.1rem', color: '#065F46' }} />} color="#D1FAE5" />
              <Typography variant="h6">Product Recommendations</Typography>
            </Box>
            {recommendations && Object.keys(recommendations).length > 0 ? (
              <Box
                sx={{
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  p: 2.5,
                  borderRadius: 2,
                  fontFamily: 'monospace',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {JSON.stringify(recommendations, null, 2)}
                </Typography>
              </Box>
            ) : (
              <Typography color="text.secondary" variant="body2">
                No recommendations generated
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
