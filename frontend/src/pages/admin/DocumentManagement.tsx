import {
  Box,
  Paper,
  Typography,
  Alert,
  Button,
} from '@mui/material';
import { Description, ShoppingCart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const DocumentManagement = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Document Management</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage product-related documents and files
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Documents are managed through individual product pages. Navigate to a
        product to upload or manage its associated documents.
      </Alert>

      <Paper sx={{ p: 5, textAlign: 'center' }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <Description sx={{ fontSize: 36, color: '#94A3B8' }} />
        </Box>
        <Typography variant="h6" sx={{ color: '#475569', mb: 1 }}>
          Product Documents
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
          To manage documents, go to Product Management and select a product to
          view and upload its documents via the product document API.
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ShoppingCart />}
          onClick={() => navigate('/admin/products')}
        >
          Go to Products
        </Button>
      </Paper>
    </Box>
  );
};
