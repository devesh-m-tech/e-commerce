import React, { useState, useEffect, useMemo } from 'react';
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
  Fab,
  TablePagination,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import usePermissions from '../hooks/usePermissions';
import { PERMISSIONS, ACTIONS } from '../constants/permissions';
import AdminPageHeader from '../components/common/AdminPageHeader';
import AdminTableToolbar from '../components/common/AdminTableToolbar';
import AdminTableEmptyState from '../components/common/AdminTableEmptyState';

const Shipping = () => {
  const [deliveryData, setDeliveryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingState, setEditingState] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [feeFilter, setFeeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
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
      const rawData = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setDeliveryData(rawData);
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
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  const filteredDeliveryData = useMemo(() => {
    const list = Array.isArray(deliveryData) ? deliveryData : [];
    return list.filter((item) => {
      const q = (searchQuery || '').toLowerCase();
      const matchesSearch = (item?.state || '').toLowerCase().includes(q);
      const isFree = Number(item?.productdeliveryfee || 0) === 0;
      const matchesFee =
        feeFilter === 'all' ||
        (feeFilter === 'free' && isFree) ||
        (feeFilter === 'paid' && !isFree);
      return matchesSearch && matchesFee;
    });
  }, [deliveryData, searchQuery, feeFilter]);

  const paginatedDeliveryData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredDeliveryData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredDeliveryData, page, rowsPerPage]);

  const totalTariffsCount = (deliveryData || []).length;
  const freeTariffsCount = useMemo(
    () => (deliveryData || []).filter((d) => Number(d.productdeliveryfee || 0) === 0).length,
    [deliveryData]
  );
  const paidTariffsCount = totalTariffsCount - freeTariffsCount;

  const handleExportToExcel = () => {
    const exportData = (deliveryData || []).map((row) => ({
      State: row.state,
      'Product Delivery Fee': row.productdeliveryfee,
      'Combo Delivery Fee': row.combodeliveryfee,
      'Above 500 Delivery Fee': row.above500_deliveryfee || 0,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ShippingTariffs');
    XLSX.writeFile(wb, `shipping_tariffs_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  };

  return (
    <Box className="admin-page-container">
      <AdminPageHeader
        title="Shipping & Delivery Tariffs"
        subtitle="Configure regional state-wise logistics tariffs, insured delivery fees, and combo rates"
        icon={ShippingIcon}
        badges={[
          { label: `Total States: ${totalTariffsCount}`, color: 'default' },
          { label: `Free Delivery: ${freeTariffsCount}`, color: 'success' },
          { label: `Standard Rates: ${paidTariffsCount}`, color: 'default' },
        ]}
        onExport={handleExportToExcel}
        primaryAction={{
          label: 'Add State Tariff',
          icon: <AddIcon />,
          onClick: () => handleOpenDialog(),
        }}
      />

      <AdminTableToolbar
        searchPlaceholder="Search states or territories by name..."
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPage(0);
        }}
        filters={[
          {
            id: 'feeFilter',
            label: 'Tariff Type',
            value: feeFilter,
            onChange: (val) => {
              setFeeFilter(val);
              setPage(0);
            },
            options: [
              { label: 'All Tariffs', value: 'all' },
              { label: 'Free Delivery (₹0)', value: 'free' },
              { label: 'Standard Paid Rates', value: 'paid' },
            ],
          },
        ]}
        quickFilters={{
          selected: feeFilter,
          onChange: (val) => {
            setFeeFilter(val);
            setPage(0);
          },
          options: [
            { label: 'All', value: 'all', count: totalTariffsCount },
            { label: 'Free Delivery', value: 'free', count: freeTariffsCount, color: 'success' },
            { label: 'Paid Rates', value: 'paid', count: paidTariffsCount },
          ],
        }}
        totalCount={totalTariffsCount}
        filteredCount={filteredDeliveryData.length}
        onResetFilters={() => {
          setSearchQuery('');
          setFeeFilter('all');
          setPage(0);
        }}
      />

      <Paper className="admin-table-paper">
        <TableContainer>
          <Table>
            <TableHead className="admin-table-head">
              <TableRow>
                <TableCell className="admin-table-th">State / Region</TableCell>
                <TableCell className="admin-table-th" align="right">Standard Delivery Fee</TableCell>
                <TableCell className="admin-table-th" align="right">Combo Delivery Fee</TableCell>
                <TableCell className="admin-table-th" align="right">Above ₹500 Delivery Fee</TableCell>
                <TableCell className="admin-table-th" align="center" width="100px">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress sx={{ color: '#6D1734' }} />
                  </TableCell>
                </TableRow>
              ) : paginatedDeliveryData.length === 0 ? (
                <AdminTableEmptyState
                  colSpan={5}
                  title="No shipping tariffs found"
                  subtitle="No state logistics tariffs match your search criteria."
                  onReset={() => {
                    setSearchQuery('');
                    setFeeFilter('all');
                    setPage(0);
                  }}
                />
              ) : (
                paginatedDeliveryData.map((row) => (
                  <TableRow key={row.state} className="admin-table-row" hover>
                    <TableCell className="admin-table-cell">
                      <Chip
                        label={row.state}
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: '2px',
                          borderColor: '#C5A15A',
                          color: '#6D1734',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          backgroundColor: '#FAF7F2',
                        }}
                      />
                    </TableCell>
                    <TableCell className="admin-table-cell font-number" align="right" sx={{ fontWeight: 600, color: Number(row.productdeliveryfee) === 0 ? '#2e7d32' : '#282321' }}>
                      {Number(row.productdeliveryfee) === 0 ? 'FREE' : formatCurrency(row.productdeliveryfee)}
                    </TableCell>
                    <TableCell className="admin-table-cell font-number" align="right" sx={{ fontWeight: 600, color: '#282321' }}>
                      {formatCurrency(row.combodeliveryfee)}
                    </TableCell>
                    <TableCell className="admin-table-cell font-number" align="right" sx={{ color: '#6b5f5a' }}>
                      {formatCurrency(row.above500_deliveryfee || 0)}
                    </TableCell>
                    <TableCell className="admin-table-cell" align="center">
                      <Tooltip title="Edit State Tariff">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(row)}
                          sx={{ color: '#6D1734' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredDeliveryData.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
          className="admin-pagination font-number"
        />
      </Paper>

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
