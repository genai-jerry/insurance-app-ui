import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { ShoppingCart, Inventory2 } from '@mui/icons-material';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi, categoriesApi } from '../../api/products';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export const ProductBrowser = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const { data: products, isLoading: productsLoading, error } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () =>
      productsApi.getAll({
        categoryId: selectedCategory || undefined,
      }),
  });

  if (categoriesLoading || productsLoading) {
    return <LoadingSpinner message="Loading products..." />;
  }

  if (error) {
    return <ErrorAlert error={error as Error} />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4">Product Browser</Typography>
          <Typography variant="body2" color="text.secondary">
            Browse insurance products to recommend to leads
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value as number)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories?.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2.5}>
        {products?.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderTop: '3px solid #0D9488' }}>
              <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {product.name}
                </Typography>
                <Chip
                  label={product.categoryName}
                  size="small"
                  variant="outlined"
                  sx={{ mb: 2, fontSize: '0.65rem' }}
                />
                {product.insurer && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Insurer: {product.insurer}
                  </Typography>
                )}
                {product.planType && (
                  <Typography variant="body2" color="text.secondary">
                    Plan Type: {product.planType}
                  </Typography>
                )}
                {product.tags && product.tags.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="overline" sx={{ display: 'block', mb: 0.5 }}>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {product.tags.map((tag, idx) => (
                        <Chip
                          key={idx}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.65rem', height: 22 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
              <CardActions sx={{ px: 2.5, pb: 2 }}>
                <Button
                  size="small"
                  startIcon={<ShoppingCart sx={{ fontSize: '0.9rem' }} />}
                  fullWidth
                  variant="outlined"
                  sx={{ borderColor: '#0D9488', color: '#0D9488', '&:hover': { borderColor: '#0F766E', bgcolor: '#F0FDFA' } }}
                >
                  Recommend to Lead
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {products?.length === 0 && (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Inventory2 sx={{ fontSize: 48, color: '#CBD5E1', mb: 1.5 }} />
          <Typography color="text.secondary" variant="body2">
            No products found in this category
          </Typography>
        </Paper>
      )}
    </Box>
  );
};
