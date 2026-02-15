import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
} from '@mui/material';
import { Download, Visibility } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { prospectusApi } from '../../api/prospectus';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { formatDateTime } from '../../utils/formatters';

export const ProspectusPreview = () => {
  const { requestId } = useParams<{ requestId: string }>();

  const { data: prospectus, isLoading, error } = useQuery({
    queryKey: ['prospectus', requestId],
    queryFn: () => prospectusApi.getById(Number(requestId)),
    enabled: !!requestId,
  });

  const handleDownload = async () => {
    if (!requestId) return;
    try {
      const blob = await prospectusApi.download(Number(requestId));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prospectus-${requestId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading prospectus..." />;
  }

  if (error || !prospectus) {
    return <ErrorAlert error={error as Error || 'Prospectus not found'} />;
  }

  const detailFields = [
    { label: 'Lead', value: prospectus.leadName },
    { label: 'Agent', value: prospectus.agentName },
    ...(prospectus.version ? [{ label: 'Version', value: String(prospectus.version) }] : []),
    { label: 'Created', value: formatDateTime(prospectus.createdAt) },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4">Prospectus Preview</Typography>
          <Typography variant="body2" color="text.secondary">
            {prospectus.leadName} - Version {prospectus.version || 1}
          </Typography>
        </Box>
        {prospectus.pdfUrl && (
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleDownload}
            sx={{
              background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)' },
            }}
          >
            Download PDF
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Prospectus Details */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Prospectus Details
            </Typography>
            <Box>
              {detailFields.map((field) => (
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
                  <Typography variant="body2" color="text.secondary">{field.label}</Typography>
                  <Typography variant="body2" fontWeight={500}>{field.value || '-'}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Preview/Download */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Document Preview
            </Typography>
            {prospectus.htmlContent ? (
              <Box
                sx={{
                  bgcolor: '#ffffff',
                  border: '1px solid #E2E8F0',
                  p: 3,
                  borderRadius: 2,
                  maxHeight: 600,
                  overflow: 'auto',
                }}
                dangerouslySetInnerHTML={{ __html: prospectus.htmlContent }}
              />
            ) : prospectus.pdfUrl ? (
              <Box sx={{ textAlign: 'center', p: 5 }}>
                <Typography variant="body1" gutterBottom fontWeight={500}>
                  Prospectus has been generated successfully!
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={handleDownload}
                  sx={{ mt: 2 }}
                >
                  View/Download PDF
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', p: 5 }}>
                <Typography variant="body1" color="text.secondary">
                  No preview available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
