import { useState, useEffect, useMemo } from 'react';
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
  TablePagination,
  Avatar,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import * as XLSX from 'xlsx';
import { getAllDeals, addDeal, updateDeal, deleteDeal } from '../api/dealsApi';
import AdminPageHeader from '../components/common/AdminPageHeader';
import AdminTableToolbar from '../components/common/AdminTableToolbar';
import AdminTableEmptyState from '../components/common/AdminTableEmptyState';

const Deals = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deals, setDeals] = useState([]);
  const [open, setOpen] = useState(false);
  const [editDeal, setEditDeal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
      const rawDeals = Array.isArray(response?.deals)
        ? response.deals
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setDeals(rawDeals);
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

  const filteredDeals = useMemo(() => {
    const list = Array.isArray(deals) ? deals : [];
    return list.filter((deal) => {
      const q = (searchQuery || '').toLowerCase();
      const matchesSearch =
        (deal?.title || '').toLowerCase().includes(q) ||
        (deal?.content || '').toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all' ||
        (deal?.status || '').toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [deals, searchQuery, statusFilter]);

  const paginatedDeals = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredDeals.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredDeals, page, rowsPerPage]);

  const totalDealsCount = (deals || []).length;
  const activeDealsCount = useMemo(
    () => (deals || []).filter((d) => (d.status || '').toLowerCase() === 'active').length,
    [deals]
  );
  const inactiveDealsCount = useMemo(
    () => (deals || []).filter((d) => (d.status || '').toLowerCase() === 'inactive').length,
    [deals]
  );
  const expiredDealsCount = useMemo(
    () => (deals || []).filter((d) => (d.status || '').toLowerCase() === 'expired').length,
    [deals]
  );

  const handleExportToExcel = () => {
    const exportData = (deals || []).map((deal) => ({
      ID: deal._id,
      Title: deal.title,
      Content: deal.content,
      'Start Date': new Date(deal.startDate).toLocaleDateString(),
      'End Date': new Date(deal.endDate).toLocaleDateString(),
      Status: deal.status,
      'Products Count': deal.products?.length || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Deals');
    XLSX.writeFile(wb, `deals_list_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  };

  return (
    <Box className="admin-page-container">
      <AdminPageHeader
        title="Exclusive Deals & Promotions"
        subtitle="Curate limited-time bridal showcases, festive offers, and heirloom silk bundles"
        icon={LocalOfferIcon}
        badges={[
          { label: `Total: ${totalDealsCount}`, color: 'default' },
          { label: `Active: ${activeDealsCount}`, color: 'success' },
          ...(expiredDealsCount > 0 ? [{ label: `Expired: ${expiredDealsCount}`, color: 'warning' }] : []),
          ...(inactiveDealsCount > 0 ? [{ label: `Inactive: ${inactiveDealsCount}`, color: 'error' }] : []),
        ]}
        onExport={handleExportToExcel}
        primaryAction={{
          label: 'Add Deal',
          icon: <AddIcon />,
          onClick: () => handleOpen(),
        }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '4px' }}>
          {error}
        </Alert>
      )}

      <AdminTableToolbar
        searchPlaceholder="Search deals by title or content..."
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPage(0);
        }}
        filters={[
          {
            id: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: (val) => {
              setStatusFilter(val);
              setPage(0);
            },
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
              { label: 'Expired', value: 'expired' },
            ],
          },
        ]}
        quickFilters={{
          selected: statusFilter,
          onChange: (val) => {
            setStatusFilter(val);
            setPage(0);
          },
          options: [
            { label: 'All', value: 'all', count: totalDealsCount },
            { label: 'Active', value: 'active', count: activeDealsCount, color: 'success' },
            { label: 'Inactive', value: 'inactive', count: inactiveDealsCount, color: 'error' },
            { label: 'Expired', value: 'expired', count: expiredDealsCount, color: 'warning' },
          ],
        }}
        totalCount={totalDealsCount}
        filteredCount={filteredDeals.length}
        onResetFilters={() => {
          setSearchQuery('');
          setStatusFilter('all');
          setPage(0);
        }}
      />

      <Paper className="admin-table-paper">
        <TableContainer>
          <Table>
            <TableHead className="admin-table-head">
              <TableRow>
                <TableCell className="admin-table-th" width="90px">Banner</TableCell>
                <TableCell className="admin-table-th">Deal Title & Offer Details</TableCell>
                <TableCell className="admin-table-th">Validity Period</TableCell>
                <TableCell className="admin-table-th">Products Linked</TableCell>
                <TableCell className="admin-table-th">Status</TableCell>
                <TableCell className="admin-table-th" align="right" width="120px">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && !deals.length ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress sx={{ color: '#6D1734' }} />
                  </TableCell>
                </TableRow>
              ) : paginatedDeals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <AdminTableEmptyState
                      message="No deals found matching your filter criteria"
                      onResetFilters={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                        setPage(0);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDeals.map((deal) => (
                  <TableRow key={deal._id} className="admin-table-row" hover>
                    <TableCell className="admin-table-cell">
                      {deal.image ? (
                        <Avatar
                          src={deal.image}
                          alt={deal.title}
                          variant="rounded"
                          sx={{ width: 64, height: 48, border: '1px solid #EDE2D2', bgcolor: '#FAF7F2' }}
                        />
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 64, height: 48, bgcolor: 'rgba(109,23,52,0.1)', color: '#6D1734' }}>
                          <LocalOfferIcon />
                        </Avatar>
                      )}
                    </TableCell>
                    <TableCell className="admin-table-cell">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#282321' }}>
                        {deal.title}
                      </Typography>
                      {deal.content && (
                        <Typography variant="body2" sx={{ color: '#7D7571', fontSize: '0.8rem', mt: 0.25, maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {deal.content}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell className="admin-table-cell font-number" sx={{ fontSize: '0.82rem', color: '#282321' }}>
                      {deal.startDate ? new Date(deal.startDate).toLocaleDateString() : '-'} — {deal.endDate ? new Date(deal.endDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="admin-table-cell font-number">
                      <Chip
                        label={`${deal.products?.length || 0} products`}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: '#EDE2D2', fontSize: '0.75rem', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell className="admin-table-cell">
                      <Chip
                        label={(deal.status || 'active').toUpperCase()}
                        color={getStatusColor(deal.status)}
                        size="small"
                        sx={{ fontSize: '0.7rem', fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell className="admin-table-cell" align="right">
                      <Tooltip title="Edit Deal">
                        <IconButton onClick={() => handleOpen(deal)} sx={{ color: '#6D1734' }} size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Deal">
                        <IconButton onClick={() => handleDelete(deal._id)} color="error" size="small">
                          <DeleteIcon fontSize="small" />
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
          count={filteredDeals.length}
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