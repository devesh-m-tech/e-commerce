import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';
import { getAllDeals, addDeal, updateDeal, deleteDeal } from '../api/dealsApi';

const Deals = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deals, setDeals] = useState([]);
  const [open, setOpen] = useState(false);
  const [editDeal, setEditDeal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null,
    products: [],
    startDate: '',
    endDate: '',
    status: 'active',
  });
  const [selectedProduct, setSelectedProduct] = useState({
    product: '',
    dealPrice: '',
    dealDiscount: '',
    variant: ''
  });

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllDeals();
      setDeals(response.deals);
    } catch (err) {
      setError(err.message || 'Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (deal = null) => {
    if (deal) {
      setEditDeal(deal);
      setFormData({
        title: deal.title,
        content: deal.content,
        image: null,
        products: deal.products || [],
        startDate: new Date(deal.startDate).toISOString().split('T')[0],
        endDate: new Date(deal.endDate).toISOString().split('T')[0],
        status: deal.status,
      });
    } else {
      setEditDeal(null);
      setFormData({
        title: '',
        content: '',
        image: null,
        products: [],
        startDate: '',
        endDate: '',
        status: 'active',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditDeal(null);
    setError(null);
    setSelectedProduct({
      product: '',
      dealPrice: '',
      dealDiscount: '',
      variant: ''
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files) {
      setFormData(prev => ({
        ...prev,
        image: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProduct = () => {
    if (!selectedProduct.product || !selectedProduct.dealPrice || !selectedProduct.dealDiscount) {
      setError('Please fill in all product details');
      return;
    }

    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { ...selectedProduct }]
    }));

    setSelectedProduct({
      product: '',
      dealPrice: '',
      dealDiscount: '',
      variant: ''
    });
  };

  const handleRemoveProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (formData.products.length === 0) {
        setError('At least one product is required');
        return;
      }

      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'products') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      if (editDeal) {
        await updateDeal(editDeal._id, submitData);
      } else {
        await addDeal(submitData);
      }

      await fetchDeals();
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to save deal');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        setLoading(true);
        setError(null);
        await deleteDeal(id);
        await fetchDeals();
      } catch (err) {
        setError(err.message || 'Failed to delete deal');
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'expired':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleExportToExcel = () => {
    const exportData = deals.map(deal => ({
      'ID': deal._id,
      'Title': deal.title,
      'Content': deal.content,
      'Start Date': new Date(deal.startDate).toLocaleDateString(),
      'End Date': new Date(deal.endDate).toLocaleDateString(),
      'Status': deal.status,
      'Products': deal.products.length
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Deals');
    XLSX.writeFile(wb, `deals_list_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  };

  if (loading && !deals.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontFamily: '"Playfair Display", Georgia, serif', 
              fontWeight: 700, 
              color: '#6D1734', 
              letterSpacing: '0.5px',
              mb: 0.5 
            }}
          >
            Exclusive Deals & Promotions
          </Typography>
          <Typography variant="body2" sx={{ color: '#7D7571' }}>
            Curate limited-time bridal showcases, festive offers, and heirloom silk bundles
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleExportToExcel}
            startIcon={<FileDownloadIcon />}
            sx={{
              borderRadius: 0,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontSize: '0.78rem',
              borderColor: '#EDE2D2',
              color: '#6D1734',
              '&:hover': { borderColor: '#6D1734', backgroundColor: '#FAF7F2' }
            }}
          >
            Export to Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{
              borderRadius: 0,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontSize: '0.78rem',
              backgroundColor: '#6D1734',
              '&:hover': { backgroundColor: '#4A1025' }
            }}
          >
            Add Deal
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {deals.map((deal) => (
          <Grid item xs={12} sm={6} md={4} key={deal._id}>
            <Card sx={{ 
              borderRadius: 0, 
              border: '1px solid #EDE2D2', 
              boxShadow: '0 4px 15px rgba(109,23,52,0.04)',
              transition: 'all 0.3s ease',
              '&:hover': { borderColor: '#C5A15A', transform: 'translateY(-2px)' }
            }}>
              <CardMedia
                component="img"
                height="220"
                image={deal.image}
                alt={deal.title}
                sx={{ borderRadius: 0, objectFit: 'cover' }}
              />
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Typography 
                    variant="h6" 
                    component="div"
                    sx={{ 
                      fontFamily: '"Playfair Display", Georgia, serif', 
                      fontWeight: 600, 
                      color: '#282321' 
                    }}
                  >
                    {deal.title}
                  </Typography>
                  <Chip
                    label={deal.status.toUpperCase()}
                    color={getStatusColor(deal.status)}
                    size="small"
                    sx={{ borderRadius: 0, fontSize: '0.7rem', fontWeight: 600 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40, lineHeight: 1.6 }}>
                  {deal.content}
                </Typography>
                <Box sx={{ p: 1.5, backgroundColor: '#FAF7F2', border: '1px solid #EDE2D2', mb: 1 }}>
                  <Typography variant="caption" display="block" sx={{ color: '#6D1734', fontWeight: 600, letterSpacing: '0.5px' }}>
                    VALIDITY
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#282321', fontSize: '0.8rem' }}>
                    {new Date(deal.startDate).toLocaleDateString()} — {new Date(deal.endDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#7D7571', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Linked Products: {deal.products.length}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2, pt: 0, borderTop: '1px solid #EDE2D2' }}>
                <IconButton onClick={() => handleOpen(deal)} color="primary" size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton onClick={() => handleDelete(deal._id)} color="error" size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 0, border: '1px solid #EDE2D2' } }}
      >
        <DialogTitle sx={{ 
          fontFamily: '"Playfair Display", Georgia, serif', 
          fontWeight: 700, 
          color: '#6D1734',
          borderBottom: '1px solid #EDE2D2',
          pb: 2
        }}>
          {loading ? <CircularProgress size={24} /> : (editDeal ? 'Edit Deal' : 'Add Exclusive Deal')}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
              required
            />
            <TextField
              fullWidth
              type="file"
              name="image"
              onChange={handleChange}
              margin="normal"
              inputProps={{ accept: 'image/*' }}
              required={!editDeal}
            />
            <TextField
              fullWidth
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>

            {/* Products Section */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Products</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Product ID"
                  name="product"
                  value={selectedProduct.product}
                  onChange={handleProductChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Variant ID (Optional)"
                  name="variant"
                  value={selectedProduct.variant}
                  onChange={handleProductChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Deal Price"
                  name="dealPrice"
                  type="number"
                  value={selectedProduct.dealPrice}
                  onChange={handleProductChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Deal Discount (%)"
                  name="dealDiscount"
                  type="number"
                  value={selectedProduct.dealDiscount}
                  onChange={handleProductChange}
                  margin="normal"
                />
              </Grid>
            </Grid>
            <Button
              variant="outlined"
              onClick={handleAddProduct}
              sx={{ mt: 1 }}
            >
              Add Product
            </Button>

            {/* Selected Products List */}
            <List>
              {formData.products.map((product, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`Product ID: ${product.product}`}
                    secondary={`Price: ${product.dealPrice}, Discount: ${product.dealDiscount}%`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveProduct(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #EDE2D2', gap: 1 }}>
          <Button 
            onClick={handleClose}
            sx={{
              borderRadius: 0,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#7D7571'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
            sx={{
              borderRadius: 0,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              backgroundColor: '#6D1734',
              '&:hover': { backgroundColor: '#4A1025' }
            }}
          >
            {editDeal ? 'Update Deal' : 'Create Deal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Deals; 