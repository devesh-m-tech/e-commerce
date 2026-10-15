import React, { useState, useEffect } from 'react';
import { shippingApi } from '../api/shippApi';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Snackbar,
  Chip,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import usePermissions from '../hooks/usePermissions';
import { PERMISSIONS, ACTIONS } from '../constants/permissions';

const Shipping = () => {
  const [deliveryData, setDeliveryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingState, setEditingState] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state for new/edit delivery info
  const [formData, setFormData] = useState({
    state: '',
    productdeliveryfee: '',
    combodeliveryfee: '',
    above500_deliveryfee: ''
  });

  // Fetch delivery data on component mount
  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const fetchDeliveryData = async () => {
    try {
      setLoading(true);
      const response = await shippingApi.getAllDeliveryInfo();
      if (response.success) {
        setDeliveryData(response.data);
      }
    } catch (error) {
      showSnackbar(error.message || 'Failed to fetch delivery data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (data = null) => {
    if (data) {
      // Edit mode
      setEditingState(data.state);
      setFormData({
        state: data.state,
        productdeliveryfee: data.productdeliveryfee.toString(),
        combodeliveryfee: data.combodeliveryfee.toString(),
        above500_deliveryfee: data.above500_deliveryfee.toString()
      });
    } else {
      // Add mode
      setEditingState(null);
      setFormData({
        state: '',
        productdeliveryfee: '',
        combodeliveryfee: '',
        above500_deliveryfee: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingState(null);
    setFormData({
      state: '',
      productdeliveryfee: '',
      combodeliveryfee: '',
      above500_deliveryfee: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate form data
      if (!formData.state || !formData.productdeliveryfee || 
          !formData.combodeliveryfee || !formData.above500_deliveryfee) {
        showSnackbar('All fields are required', 'error');
        return;
      }

      const submitData = {
        state: formData.state,
        productdeliveryfee: parseFloat(formData.productdeliveryfee),
        combodeliveryfee: parseFloat(formData.combodeliveryfee),
        above500_deliveryfee: parseFloat(formData.above500_deliveryfee)
      };

      if (editingState) {
        // Update existing
        await shippingApi.updateDeliveryInfo(editingState, submitData);
        showSnackbar('Delivery information updated successfully', 'success');
      } else {
        // Create new
        await shippingApi.createDeliveryInfo(submitData);
        showSnackbar('Delivery information created successfully', 'success');
      }

      handleCloseDialog();
      fetchDeliveryData();
    } catch (error) {
      showSnackbar(error.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <ShippingIcon sx={{ fontSize: 28, color: '#6D1734' }} />
            <Typography 
              variant="h4" 
              component="h1"
              sx={{ 
                fontFamily: '"Playfair Display", Georgia, serif', 
                fontWeight: 700, 
                color: '#6D1734', 
                letterSpacing: '0.5px' 
              }}
            >
              Shipping & Delivery Tariffs
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#7D7571' }}>
            Configure regional state-wise logistics tariffs, insured delivery fees, and combo rates
          </Typography>
        </Box>

        {/* Add New Button */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            borderRadius: 0,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontSize: '0.78rem',
            backgroundColor: '#6D1734',
            '&:hover': { backgroundColor: '#4A1025' }
          }}
        >
          Add New State Tariff
        </Button>
      </Box>

      {/* Delivery Data Table */}
      <Card sx={{ borderRadius: 0, border: '1px solid #EDE2D2', boxShadow: 'none' }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box sx={{ p: 2.5, backgroundColor: '#FAF7F2', borderBottom: '1px solid #EDE2D2' }}>
            <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#6D1734' }}>
              State-Wise Logistics Rates
            </Typography>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography>Loading tariffs...</Typography>
            </Box>
          ) : deliveryData.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography color="textSecondary">
                No delivery information found. Add a new state tariff to begin.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#FAF7F2' }}>
                  <TableRow>
                    <TableCell sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025', borderBottom: '1px solid #EDE2D2' }}>State / Region</TableCell>
                    <TableCell align="right" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025', borderBottom: '1px solid #EDE2D2' }}>Product Delivery Fee</TableCell>
                    <TableCell align="right" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025', borderBottom: '1px solid #EDE2D2' }}>Combo Delivery Fee</TableCell>
                    <TableCell align="center" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025', borderBottom: '1px solid #EDE2D2' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deliveryData.map((row) => (
                    <TableRow key={row.state} hover sx={{ '&:hover': { backgroundColor: '#FAF7F2' } }}>
                      <TableCell>
                        <Chip 
                          label={row.state} 
                          variant="outlined"
                          size="small"
                          sx={{ 
                            borderRadius: 0, 
                            borderColor: '#C5A15A', 
                            color: '#6D1734', 
                            fontWeight: 600, 
                            fontSize: '0.75rem' 
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#282321' }}>
                          {formatCurrency(row.productdeliveryfee)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#282321' }}>
                          {formatCurrency(row.combodeliveryfee)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit Tariff">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(row)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
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
          {editingState ? `Edit Delivery Tariff — ${editingState}` : 'Add State Delivery Tariff'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                disabled={!!editingState}
                placeholder="Enter state name"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Delivery Fee (₹)"
                name="productdeliveryfee"
                type="number"
                value={formData.productdeliveryfee}
                onChange={handleInputChange}
                placeholder="0.00"
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Combo Delivery Fee (₹)"
                name="combodeliveryfee"
                type="number"
                value={formData.combodeliveryfee}
                onChange={handleInputChange}
                placeholder="0.00"
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Above ₹500 Delivery Fee (₹)"
                name="above500_deliveryfee"
                type="number"
                value={formData.above500_deliveryfee}
                onChange={handleInputChange}
                placeholder="0.00"
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #EDE2D2', gap: 1 }}>
          <Button 
            onClick={handleCloseDialog} 
            disabled={loading}
            sx={{
              borderRadius: 0,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#7D7571'
            }}
          >
            <CancelIcon sx={{ mr: 1, fontSize: 18 }} />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? null : <SaveIcon />}
            sx={{
              borderRadius: 0,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              backgroundColor: '#6D1734',
              '&:hover': { backgroundColor: '#4A1025' }
            }}
          >
            {loading ? 'Saving...' : (editingState ? 'Update Tariff' : 'Save Tariff')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Shipping;
