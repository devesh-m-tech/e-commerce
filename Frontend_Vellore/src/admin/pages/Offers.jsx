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
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import * as XLSX from 'xlsx';
import { couponApi } from '../../APi/couponApi';

const Offers = () => {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [open, setOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    badge: 'Special Silk Courtesy',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    status: 'active',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const res = await couponApi.getAllCoupons();
      if (res?.success && Array.isArray(res.coupons)) {
        setCoupons(res.coupons);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
      setErrorMessage(err.message || 'Failed to load coupons from server');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (coupon = null) => {
    if (coupon) {
      setEditCoupon(coupon);
      setFormData({
        code: coupon.code || '',
        title: coupon.title || '',
        badge: coupon.badge || 'Special Silk Courtesy',
        description: coupon.description || '',
        discountType: coupon.discountType || 'percentage',
        discountValue: coupon.discountValue !== undefined ? coupon.discountValue : '',
        minOrderValue: coupon.minOrderValue !== undefined ? coupon.minOrderValue : '',
        maxDiscount: coupon.maxDiscount !== undefined && coupon.maxDiscount !== null ? coupon.maxDiscount : '',
        startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
        endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
        status: coupon.status || 'active',
      });
    } else {
      setEditCoupon(null);
      setFormData({
        code: '',
        title: '',
        badge: 'Special Silk Courtesy',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderValue: '',
        maxDiscount: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'active',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditCoupon(null);
    setErrorMessage('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'code' ? value.toUpperCase().trim() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code) {
      setErrorMessage('Please enter a coupon code');
      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage('');

      const payload = {
        code: formData.code.toUpperCase().trim(),
        title: formData.title || formData.code,
        badge: formData.badge,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue) || 0,
        minOrderValue: Number(formData.minOrderValue) || 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        status: formData.status,
      };

      if (editCoupon && editCoupon._id) {
        await couponApi.updateCoupon(editCoupon._id, payload);
        setSuccessMessage(`Coupon "${payload.code}" updated successfully!`);
      } else {
        await couponApi.createCoupon(payload);
        setSuccessMessage(`Coupon "${payload.code}" created successfully!`);
      }

      handleClose();
      await fetchCoupons();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error saving coupon:', err);
      setErrorMessage(err.message || 'Error saving coupon');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await couponApi.deleteCoupon(coupon._id);
      setSuccessMessage(`Coupon "${coupon.code}" deleted successfully!`);
      await fetchCoupons();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error deleting coupon:', err);
      setErrorMessage(err.message || 'Failed to delete coupon');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleExportToExcel = () => {
    const exportData = coupons.map((c) => ({
      'Code': c.code,
      'Title': c.title,
      'Badge': c.badge,
      'Description': c.description,
      'Discount Type': c.discountType,
      'Discount': c.discountType === 'percentage'
        ? `${c.discountValue}%`
        : c.discountType === 'flat'
        ? `₹${c.discountValue}`
        : 'Free Air Shipping',
      'Min Order Value': c.minOrderValue ? `₹${c.minOrderValue}` : 'None',
      'Times Used': c.usedCount || 0,
      'Status': c.status,
      'Start Date': c.startDate ? new Date(c.startDate).toLocaleDateString('en-IN') : '',
      'End Date': c.endDate ? new Date(c.endDate).toLocaleDateString('en-IN') : 'No Expiry',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Coupons');
    XLSX.writeFile(wb, `shri_deepaalaya_coupons_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#4D0E22' }}>
            Coupons & Store Offers
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage promotional discount vouchers, festive privileges, and free shipping codes for shrideepalayasilks.com/deals
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleExportToExcel}
            startIcon={<FileDownloadIcon />}
            sx={{ borderColor: '#6D1734', color: '#6D1734', '&:hover': { borderColor: '#4D0E22', bgcolor: '#FBF4F6' } }}
          >
            Export to Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{ bgcolor: '#6D1734', '&:hover': { bgcolor: '#4D0E22' } }}
          >
            Add Coupon
          </Button>
        </Box>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F9F6F0' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#4D0E22' }}>PROMO CODE</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#4D0E22' }}>OFFER DETAILS</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#4D0E22' }}>DISCOUNT</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#4D0E22' }}>MIN ORDER</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#4D0E22' }}>USED</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#4D0E22' }}>VALIDITY</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#4D0E22' }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#4D0E22' }} align="right">ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={36} sx={{ color: '#6D1734' }} />
                  <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>Loading coupons...</Typography>
                </TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography variant="subtitle1" color="textSecondary">
                    No promo coupons found. Click "Add Coupon" to create your first offer.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((c) => (
                <TableRow key={c._id || c.code} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={c.code}
                        sx={{
                          bgcolor: '#FBF4F6',
                          color: '#4D0E22',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          letterSpacing: '0.6px',
                          border: '1px solid #E8DFD3',
                        }}
                      />
                      <Tooltip title="Copy Code">
                        <IconButton
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(c.code);
                            setSuccessMessage(`Copied code "${c.code}"`);
                            setTimeout(() => setSuccessMessage(''), 2000);
                          }}
                        >
                          <ContentCopyIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#222' }}>
                      {c.title || c.code}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8C6A28', display: 'block', fontWeight: 600 }}>
                      {c.badge}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '12px' }}>
                      {c.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2E6B38' }}>
                      {c.discountType === 'percentage'
                        ? `${c.discountValue}% OFF`
                        : c.discountType === 'flat'
                        ? `₹${Number(c.discountValue).toLocaleString('en-IN')} OFF`
                        : 'Free Air Delivery'}
                    </Typography>
                    {c.maxDiscount && (
                      <Typography variant="caption" color="textSecondary">
                        Up to ₹{c.maxDiscount}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {c.minOrderValue > 0 ? (
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ₹{Number(c.minOrderValue).toLocaleString('en-IN')}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary">No Min</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#555' }}>
                      {c.usedCount || 0} times
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ display: 'block', color: '#555' }}>
                      Start: {c.startDate ? new Date(c.startDate).toLocaleDateString('en-IN') : 'Immediate'}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: c.endDate && new Date(c.endDate) < new Date() ? 'error.main' : '#555' }}>
                      End: {c.endDate ? new Date(c.endDate).toLocaleDateString('en-IN') : 'No Expiry'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={c.status.toUpperCase()}
                      color={getStatusColor(c.status)}
                      size="small"
                      sx={{ fontWeight: 600, fontSize: '11px' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Coupon">
                      <IconButton onClick={() => handleOpen(c)} color="primary" size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Coupon">
                      <IconButton onClick={() => handleDelete(c)} color="error" size="small">
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

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#4D0E22' }}>
          {editCoupon ? `Edit Coupon: ${editCoupon.code}` : 'Create New Boutique Coupon'}
        </DialogTitle>
        <DialogContent dividers>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Promo Code *"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. DEEPAALAYA15"
                inputProps={{ style: { textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' } }}
                helperText="Code customers enter at cart & checkout"
                required
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Offer Title *"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Flat 15% OFF"
                required
              />
              <TextField
                fullWidth
                label="Badge Tag"
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                placeholder="e.g. Special Silk Courtesy"
              />
            </Box>

            <TextField
              fullWidth
              label="Description / Terms"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Valid on all pure Kanchipuram silk sarees above ₹9,999"
              multiline
              rows={2}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Discount Type</InputLabel>
                <Select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                  label="Discount Type"
                >
                  <MenuItem value="percentage">Percentage (%)</MenuItem>
                  <MenuItem value="flat">Flat Amount (₹)</MenuItem>
                  <MenuItem value="free_shipping">Free Air Shipping</MenuItem>
                </Select>
              </FormControl>

              {formData.discountType !== 'free_shipping' && (
                <TextField
                  fullWidth
                  label={formData.discountType === 'percentage' ? 'Percentage (e.g. 10)' : 'Flat Amount (₹)'}
                  name="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={handleChange}
                  required
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Minimum Order Value (₹)"
                name="minOrderValue"
                type="number"
                value={formData.minOrderValue}
                onChange={handleChange}
                placeholder="e.g. 9999 (0 for no minimum)"
              />
              {formData.discountType === 'percentage' && (
                <TextField
                  fullWidth
                  label="Max Discount Cap (₹)"
                  name="maxDiscount"
                  type="number"
                  value={formData.maxDiscount}
                  onChange={handleChange}
                  placeholder="Optional limit"
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Expiry Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                helperText="Leave empty for unlimited validity"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={actionLoading}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={actionLoading}
            sx={{ bgcolor: '#6D1734', '&:hover': { bgcolor: '#4D0E22' }, minWidth: 100 }}
          >
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : (editCoupon ? 'Update Coupon' : 'Create Coupon')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Offers;
