import { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import { vendorApi } from '../api/vendorApi';
import { PERMISSIONS, ACTIONS, getRoleDefaultPermissions } from '../constants/permissions';
import { useSnackbar } from 'notistack';

const Login = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
    setErrors({});
    setFormData({ email: '', password: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // For admin login
      if (activeTab === 0) {
        const response = await adminApi.login(formData);
        
        if (response.success) {
          // Store token
          localStorage.setItem('token', response.token);
          
          // Store admin data
          const adminData = {
            id: response.admin._id,
            name: response.admin.name,
            email: response.admin.email,
            role: response.admin.role,
            status: response.admin.status,
            permissions: response.admin.permissions || getDefaultPermissions(response.admin.role)
          };

          localStorage.setItem('userType', 'admin');
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('currentUser', JSON.stringify(adminData));

          enqueueSnackbar(response.message || `Welcome ${adminData.name}!`, { 
            variant: 'success'
          });
          navigate('/dashboard');
        }
      }
      // For vendor login
      else {
        const response = await vendorApi.loginVendor(formData);
        
        if (response.success) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userType', 'vendor');
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('vendorId', response.vendor.id);
          localStorage.setItem('currentVendor', JSON.stringify(response.vendor));

          enqueueSnackbar(`Welcome ${response.vendor.name}!`, { 
            variant: 'success'
          });
          navigate('/vendor-dashboard');
        }
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
      enqueueSnackbar(error.message || 'Login failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPermissions = (role) => {
    return getRoleDefaultPermissions(role);
  };

  return (
    <Box
      component="main"
      role="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#FFF9F0',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          width: '100%',
          maxWidth: 440,
          border: '1px solid #EDE2D2',
          borderRadius: '2px',
          bgcolor: '#ffffff',
          boxShadow: '0 8px 32px rgba(109, 23, 52, 0.06)',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            color: '#C5A15A',
            letterSpacing: '0.2em',
            fontWeight: 600,
            fontSize: '0.75rem',
            mb: 0.5,
          }}
        >
          SHRI DEEPAALAYA SILKS
        </Typography>

        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Playfair Display", Georgia, serif',
            color: '#6D1734',
            fontWeight: 600,
            mb: 1,
            letterSpacing: '-0.01em',
          }}
        >
          Admin Portal
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: '#6b5f5a', mb: 3, fontSize: '0.875rem' }}
        >
          Sign in to manage handpicked silk sarees, inventory, and orders.
        </Typography>

        <Alert
          severity="info"
          sx={{
            mb: 3,
            textAlign: 'left',
            borderRadius: '2px',
            bgcolor: 'rgba(109, 23, 52, 0.04)',
            color: '#282321',
            border: '1px solid #EDE2D2',
            '& .MuiAlert-icon': { color: '#6D1734' }
          }}
        >
          <strong>Demo Admin:</strong> admin@shrideepaalayasilks.com / Admin@1234
          <Box sx={{ mt: 0.5 }}>
            <Button
              size="small"
              onClick={() => setFormData({ email: 'admin@shrideepaalayasilks.com', password: 'Admin@1234' })}
              sx={{ textTransform: 'none', p: 0, minWidth: 'auto', color: '#6D1734', textDecoration: 'underline' }}
            >
              Autofill credentials
            </Button>
          </Box>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '2px' }}>
            {error}
          </Alert>
        )}

        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          noValidate
          role="form"
        >
          <TextField
            id="email"
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            error={!!errors.email}
            helperText={errors.email}
            disabled={loading}
            autoComplete="email"
            inputProps={{
              'aria-label': 'Email',
              'aria-required': 'true'
            }}
          />
          <TextField
            id="password"
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            error={!!errors.password}
            helperText={errors.password}
            disabled={loading}
            autoComplete="current-password"
            inputProps={{
              'aria-label': 'Password',
              'aria-required': 'true'
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
            aria-label={loading ? 'Logging in...' : 'Login'}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              activeTab === 0 ? 'Admin Login' : 'Vendor Login'
            )}
          </Button>
        </Box>

        {activeTab === 1 && (
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Contact admin to register as a vendor
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default Login; 