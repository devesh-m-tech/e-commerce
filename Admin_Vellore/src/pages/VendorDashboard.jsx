import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    const vendorId = localStorage.getItem('vendorId');
    const userType = localStorage.getItem('userType');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (!isLoggedIn || userType !== 'vendor') {
      navigate('/login');
      return;
    }

    const vendors = JSON.parse(localStorage.getItem('vendors') || '[]');
    const currentVendor = vendors.find(v => v.id === vendorId);
    
    if (!currentVendor) {
      navigate('/login');
      return;
    }

    setVendor(currentVendor);
    setFormData({
      email: currentVendor.email,
      phone: currentVendor.phone,
      address: currentVendor.address,
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('vendorId');
    navigate('/login');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    const vendors = JSON.parse(localStorage.getItem('vendors') || '[]');
    const updatedVendors = vendors.map(v => 
      v.id === vendor.id ? { ...v, ...formData } : v
    );
    
    localStorage.setItem('vendors', JSON.stringify(updatedVendors));
    setVendor(prev => ({ ...prev, ...formData }));
    setOpenEdit(false);
  };

  if (!vendor) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
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
            Artisan & Weaver Atelier
          </Typography>
          <Typography variant="body2" sx={{ color: '#7D7571' }}>
            Account management, KYC verification credentials, and guild settlement parameters
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            borderRadius: 0,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontSize: '0.78rem',
            borderColor: '#EDE2D2',
            '&:hover': { borderColor: '#d32f2f' }
          }}
        >
          Logout
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 0, border: '1px solid #EDE2D2', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#6D1734' }}>Profile & Guild Identity</Typography>
              <Button
                startIcon={<EditIcon />}
                onClick={() => setOpenEdit(true)}
                sx={{
                  borderRadius: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '0.75rem',
                  color: '#6D1734'
                }}
              >
                Edit
              </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={vendor.image}
                alt={vendor.name}
                sx={{ width: 88, height: 88, mr: 2.5, borderRadius: 0, border: '1px solid #EDE2D2' }}
              />
              <Box>
                <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#282321' }}>{vendor.name}</Typography>
                <Chip
                  label={vendor.status.toUpperCase()}
                  color={vendor.status === 'active' ? 'success' : 'error'}
                  size="small"
                  sx={{ mt: 1, borderRadius: 0, fontWeight: 700, fontSize: '0.7rem' }}
                />
              </Box>
            </Box>

            <Typography variant="body2" sx={{ mb: 1.5, color: '#282321' }}>
              <strong style={{ color: '#4A1025' }}>Email:</strong> {vendor.email}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1.5, color: '#282321' }}>
              <strong style={{ color: '#4A1025' }}>Phone:</strong> {vendor.phone}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1.5, color: '#282321' }}>
              <strong style={{ color: '#4A1025' }}>Atelier Address:</strong> {vendor.address}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1.5, color: '#282321' }}>
              <strong style={{ color: '#4A1025' }}>GST Number:</strong> {vendor.gstNumber}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1.5, color: '#282321' }}>
              <strong style={{ color: '#4A1025' }}>PAN Number:</strong> {vendor.panNumber}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Typography variant="body2" sx={{ color: '#4A1025', fontWeight: 600 }}>
                KYC Verification:
              </Typography>
              <Chip
                label={vendor.kycStatus.toUpperCase()}
                color={
                  vendor.kycStatus === 'verified'
                    ? 'success'
                    : vendor.kycStatus === 'rejected'
                    ? 'error'
                    : 'warning'
                }
                size="small"
                sx={{ borderRadius: 0, fontWeight: 700, fontSize: '0.7rem' }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 0, border: '1px solid #EDE2D2', boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ mb: 3, fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#6D1734' }}>Bank & Guild Settlements</Typography>
            <Typography variant="body2" sx={{ mb: 1.5, color: '#282321' }}>
              <strong style={{ color: '#4A1025' }}>Bank Name:</strong> {vendor.bankName}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1.5, color: '#282321' }}>
              <strong style={{ color: '#4A1025' }}>Account Number:</strong> <span style={{ fontFamily: 'monospace' }}>{vendor.accountNumber}</span>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1.5, color: '#282321' }}>
              <strong style={{ color: '#4A1025' }}>IFSC Code:</strong> <span style={{ fontFamily: 'monospace' }}>{vendor.ifscCode}</span>
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Dialog 
        open={openEdit} 
        onClose={() => setOpenEdit(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 0, border: '1px solid #EDE2D2' } }}
      >
        <DialogTitle sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: '#6D1734', borderBottom: '1px solid #EDE2D2', pb: 2 }}>Edit Profile Information</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #EDE2D2', gap: 1 }}>
          <Button onClick={() => setOpenEdit(false)} sx={{ borderRadius: 0, textTransform: 'uppercase', letterSpacing: '1px', color: '#7D7571' }}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{
              borderRadius: 0,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              backgroundColor: '#6D1734',
              '&:hover': { backgroundColor: '#4A1025' }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VendorDashboard; 