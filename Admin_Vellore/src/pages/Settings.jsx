import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  CircularProgress,
  Divider,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip
} from '@mui/material';
import { useSnackbar } from 'notistack';
import SettingsIcon from '@mui/icons-material/Settings';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import TuneIcon from '@mui/icons-material/Tune';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

import AdminPageHeader from '../components/common/AdminPageHeader';
import { getSettings, updateSettings, resetSettings, uploadHeroImage } from '../api/settingApi';

const defaultFormState = {
  storeDetails: {
    storeName: 'Shri Deepaalaya Silks',
    legalName: 'Shri Deepaalaya Silks Pvt Ltd',
    tagline: 'Heritage of Pure Silk & Traditional Weaves',
    gstin: '33AAECS1234F1Z8',
    pan: 'AAECS1234F',
    phone: '+91 94432 18920',
    whatsapp: '+91 98423 45678',
    email: 'support@shrideepaalayasilks.com',
    address: {
      street: 'No. 42, Katpadi Main Road, Silk Paradise Complex',
      city: 'Vellore',
      state: 'Tamil Nadu',
      pincode: '632004',
      country: 'India'
    },
    supportHours: 'Mon - Sat: 9:30 AM - 8:30 PM (IST)'
  },
  orderRules: {
    minOrderAmount: 499,
    freeShippingThreshold: 2999,
    standardShippingFee: 120,
    expressShippingFee: 250,
    enableCod: true,
    maxCodLimit: 25000,
    codHandlingFee: 50,
    autoCancelUnpaidHours: 24
  },
  exchangePolicy: {
    enableExchange: true,
    exchangeWindowDays: 7,
    requireUnboxingVideo: true,
    policyNotice: 'Exchanges accepted within 7 days of delivery with original tags, Silk Mark intact, and mandatory unboxing video.'
  },
  taxCurrency: {
    currencySymbol: '₹',
    currencyCode: 'INR',
    silkGstRate: 5,
    apparelGstRate: 12,
    pricesInclusiveOfTax: true
  },
  loyaltyWallet: {
    enabled: true,
    coinsRewardRatePercent: 1,
    welcomeBonusCoins: 100,
    coinRedemptionValueInr: 1,
    maxRedemptionPercent: 20,
    coinExpiryDays: 365
  },
  inventoryAlerts: {
    lowStockThreshold: 5,
    allowBackorders: false,
    showUrgencyStockBadge: true
  },
  invoicingAndNotifications: {
    invoicePrefix: 'SDS-INV-',
    invoiceFooterNote: 'Pure Silk Mark Certified Genuine Handloom. Thank you for celebrating South Indian heritage with Shri Deepaalaya Silks!',
    orderConfirmationSms: true,
    dispatchNotificationSms: true,
    deliveryConfirmationSms: true
  },
  storeOperations: {
    maintenanceMode: false,
    maintenanceNotice: 'We are curating our newest bridal silk collection. Storefront will be back online shortly!',
    announcementBarEnabled: true,
    announcementBarText: '✨ Festive Silk Utsav: Get complimentary Pure Silk Mark pouch & free shipping on orders above ₹2,999!',
    heroSection: {
      enableCustomBg: true,
      bgImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85',
      title: 'Nice Summer Collection',
      subtitle: 'A Good Looking, Comfortable Traditional Collection',
      tag: 'Handloom Heritage'
    }
  }
};

const Settings = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [form, setForm] = useState(defaultFormState);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = React.useRef(null);

  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      const res = await getSettings();
      if (res?.data) {
        setForm((prev) => ({
          ...prev,
          storeDetails: { ...prev.storeDetails, ...res.data.storeDetails },
          orderRules: { ...prev.orderRules, ...res.data.orderRules },
          exchangePolicy: { ...prev.exchangePolicy, ...res.data.exchangePolicy },
          taxCurrency: { ...prev.taxCurrency, ...res.data.taxCurrency },
          loyaltyWallet: { ...prev.loyaltyWallet, ...res.data.loyaltyWallet },
          inventoryAlerts: { ...prev.inventoryAlerts, ...res.data.inventoryAlerts },
          invoicingAndNotifications: { ...prev.invoicingAndNotifications, ...res.data.invoicingAndNotifications },
          storeOperations: {
            ...prev.storeOperations,
            ...res.data.storeOperations,
            heroSection: {
              ...prev.storeOperations.heroSection,
              ...(res.data.storeOperations?.heroSection || {})
            }
          }
        }));
        if (res.data.updatedBy) {
          setLastUpdated(res.data.updatedBy);
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      enqueueSnackbar('Could not load current settings. Using standard defaults.', { variant: 'info' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const handleNestedChange = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleHeroChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      storeOperations: {
        ...prev.storeOperations,
        heroSection: {
          ...(prev.storeOperations?.heroSection || defaultFormState.storeOperations.heroSection),
          [field]: value
        }
      }
    }));
  };

  const handleHeroFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const res = await uploadHeroImage(file);
      if (res?.success && res?.imageUrl) {
        handleHeroChange('bgImage', res.imageUrl);
        enqueueSnackbar('Hero background image uploaded successfully!', { variant: 'success' });
      } else {
        enqueueSnackbar(res?.message || 'Failed to upload image', { variant: 'error' });
      }
    } catch (err) {
      console.error('Failed to upload hero image:', err);
      enqueueSnackbar(err?.message || 'Error uploading image file', { variant: 'error' });
    } finally {
      setUploadingImage(false);
      if (event.target) event.target.value = '';
    }
  };

  const formatHeroPreviewUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleAddressChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      storeDetails: {
        ...prev.storeDetails,
        address: {
          ...prev.storeDetails.address,
          [field]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await updateSettings(form);
      if (res?.success) {
        enqueueSnackbar('E-Commerce configuration updated successfully!', { variant: 'success' });
        if (res.data?.updatedBy) {
          setLastUpdated(res.data.updatedBy);
        }
      } else {
        enqueueSnackbar(res?.message || 'Failed to update settings', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      enqueueSnackbar(error?.message || 'Failed to save configuration', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetConfirm = async () => {
    try {
      setSaving(true);
      setResetDialogOpen(false);
      const res = await resetSettings();
      if (res?.success) {
        enqueueSnackbar('Settings reset to factory defaults successfully!', { variant: 'success' });
        fetchSettingsData();
      } else {
        enqueueSnackbar(res?.message || 'Failed to reset settings', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      enqueueSnackbar(error?.message || 'Failed to reset settings', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box className="admin-page-container" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <CircularProgress size={40} sx={{ color: '#6D1734', mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Loading store settings & configurations...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="admin-page-container">
      <AdminPageHeader
        title="Store & E-Commerce Settings"
        subtitle="Manage boutique profile, GST taxation, stock threshold alerts, tax invoicing, and operations"
        icon={SettingsIcon}
        extraActions={
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RestartAltIcon />}
              onClick={() => setResetDialogOpen(true)}
              disabled={saving}
              sx={{
                borderColor: '#EDE2D2',
                color: '#6b5f5a',
                '&:hover': { borderColor: '#C5A15A', bgcolor: '#FAF7F2' }
              }}
            >
              Reset Defaults
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                bgcolor: '#6D1734',
                color: '#FFF',
                px: 2.5,
                '&:hover': { bgcolor: '#531127' }
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        }
      />

      {lastUpdated && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            icon={<CheckCircleIcon sx={{ fontSize: '0.9rem !important', color: '#2E7D32' }} />}
            label={`Last updated: ${new Date(lastUpdated.updatedAt).toLocaleString('en-IN')} ${lastUpdated.adminName ? `by ${lastUpdated.adminName}` : ''}`}
            sx={{
              bgcolor: 'rgba(46, 125, 50, 0.08)',
              border: '1px solid rgba(46, 125, 50, 0.2)',
              color: '#2E7D32',
              fontSize: '0.75rem',
              fontWeight: 500
            }}
          />
        </Box>
      )}

      <Paper className="admin-table-paper" sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newVal) => setActiveTab(newVal)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: '1px solid #EDE2D2',
            bgcolor: '#FAF7F2',
            '& .MuiTab-root': {
              minHeight: 52,
              fontWeight: 600,
              fontSize: '0.82rem',
              letterSpacing: '0.02em',
              textTransform: 'none',
              color: '#6b5f5a',
              '&.Mui-selected': {
                color: '#6D1734',
                fontWeight: 700
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#6D1734',
              height: 3
            }
          }}
        >
          <Tab icon={<StorefrontIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Store Identity" />
          <Tab icon={<ReceiptLongIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Tax & GST" />
          <Tab icon={<Inventory2Icon sx={{ fontSize: 18 }} />} iconPosition="start" label="Inventory & Alerts" />
          <Tab icon={<NotificationsActiveIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Invoicing & SMS" />
          <Tab icon={<TuneIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Storefront & Operations" />
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {/* TAB 0: STORE IDENTITY */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#282321', mb: 0.5 }}>
                Boutique Profile & Legal Identity
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Official brand identity, contact numbers, and registered boutique address for customer invoices and customer support.
              </Typography>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Store Brand Name"
                    value={form.storeDetails.storeName}
                    onChange={(e) => handleNestedChange('storeDetails', 'storeName', e.target.value)}
                    helperText="Displayed in website navbar, emails, and SMS"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Legal Entity Name"
                    value={form.storeDetails.legalName}
                    onChange={(e) => handleNestedChange('storeDetails', 'legalName', e.target.value)}
                    helperText="Printed on tax invoices and payment receipts"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Brand Tagline / Motifs"
                    value={form.storeDetails.tagline}
                    onChange={(e) => handleNestedChange('storeDetails', 'tagline', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="GSTIN (Goods & Services Tax No.)"
                    value={form.storeDetails.gstin}
                    onChange={(e) => handleNestedChange('storeDetails', 'gstin', e.target.value.toUpperCase())}
                    helperText="15-character GSTIN (e.g., 33AAECS1234F1Z8)"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Company PAN"
                    value={form.storeDetails.pan}
                    onChange={(e) => handleNestedChange('storeDetails', 'pan', e.target.value.toUpperCase())}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Support Helpline Phone"
                    value={form.storeDetails.phone}
                    onChange={(e) => handleNestedChange('storeDetails', 'phone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Official WhatsApp Support"
                    value={form.storeDetails.whatsapp}
                    onChange={(e) => handleNestedChange('storeDetails', 'whatsapp', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Official Support Email"
                    value={form.storeDetails.email}
                    onChange={(e) => handleNestedChange('storeDetails', 'email', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Support & Working Hours"
                    value={form.storeDetails.supportHours}
                    onChange={(e) => handleNestedChange('storeDetails', 'supportHours', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1, borderColor: '#EDE2D2' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6D1734', mb: 1.5 }}>
                    Boutique Physical Address
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Street / Building / Landmark"
                    value={form.storeDetails.address?.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="City"
                    value={form.storeDetails.address?.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="State"
                    value={form.storeDetails.address?.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Pincode"
                    className="font-number"
                    value={form.storeDetails.address?.pincode}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Country"
                    value={form.storeDetails.address?.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 1: TAX & GST */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#282321', mb: 0.5 }}>
                GST & Currency Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure Indian Goods & Services Tax (GST) slab rates and currency display standards.
              </Typography>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Pure Silk Saree / Fabric GST Rate (%)"
                    className="font-number"
                    value={form.taxCurrency.silkGstRate}
                    onChange={(e) => handleNestedChange('taxCurrency', 'silkGstRate', Number(e.target.value))}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                    helperText="Standard Indian GST rate for pure silk sarees & handloom fabrics (HSN 5007)"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Ready-to-Wear Apparel GST Rate (%)"
                    className="font-number"
                    value={form.taxCurrency.apparelGstRate}
                    onChange={(e) => handleNestedChange('taxCurrency', 'apparelGstRate', Number(e.target.value))}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                    helperText="GST rate for stitched garments, blouses, and accessories"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Currency Symbol"
                    value={form.taxCurrency.currencySymbol}
                    onChange={(e) => handleNestedChange('taxCurrency', 'currencySymbol', e.target.value)}
                    helperText="Indian Rupee symbol (₹)"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Currency ISO Code"
                    value={form.taxCurrency.currencyCode}
                    onChange={(e) => handleNestedChange('taxCurrency', 'currencyCode', e.target.value.toUpperCase())}
                    helperText="Standard ISO currency code (INR)"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.taxCurrency.pricesInclusiveOfTax}
                        onChange={(e) => handleNestedChange('taxCurrency', 'pricesInclusiveOfTax', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#6D1734' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6D1734' }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>All Storefront Prices are Inclusive of Taxes (MRP)</Typography>
                        <Typography variant="caption" color="text.secondary">When enabled, listed product prices include applicable GST (Standard for Indian luxury retail)</Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 2: INVENTORY & STOCK ALERTS */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#282321', mb: 0.5 }}>
                Inventory Management & Low-Stock Alerts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure automated warnings for rare handloom weaves nearing stock depletion.
              </Typography>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Low Stock Warning Threshold (Units)"
                    className="font-number"
                    value={form.inventoryAlerts.lowStockThreshold}
                    onChange={(e) => handleNestedChange('inventoryAlerts', 'lowStockThreshold', Number(e.target.value))}
                    helperText="Products with variant stock at or below this value show amber alerts in Admin"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.inventoryAlerts.showUrgencyStockBadge}
                        onChange={(e) => handleNestedChange('inventoryAlerts', 'showUrgencyStockBadge', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#6D1734' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6D1734' }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Display Scarcity Urgency Badge on Product Details</Typography>
                        <Typography variant="caption" color="text.secondary">Show "Hurry, only 2 left in stock!" banner on customer product page when inventory is low</Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.inventoryAlerts.allowBackorders}
                        onChange={(e) => handleNestedChange('inventoryAlerts', 'allowBackorders', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#6D1734' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6D1734' }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Allow Backorders for Out-of-Stock Silk Products</Typography>
                        <Typography variant="caption" color="text.secondary">If disabled, product purchase is immediately blocked when stock reaches 0</Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 3: INVOICING & NOTIFICATIONS */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#282321', mb: 0.5 }}>
                Tax Invoicing & Customer SMS Alerts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure GST invoice prefixes, Silk Mark authenticity terms, and transactional notifications.
              </Typography>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Tax Invoice Series Prefix"
                    value={form.invoicingAndNotifications.invoicePrefix}
                    onChange={(e) => handleNestedChange('invoicingAndNotifications', 'invoicePrefix', e.target.value)}
                    helperText="E.g., SDS-INV- generates SDS-INV-001042"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    label="Invoice Authenticity Certification & Footer Note"
                    value={form.invoicingAndNotifications.invoiceFooterNote}
                    onChange={(e) => handleNestedChange('invoicingAndNotifications', 'invoiceFooterNote', e.target.value)}
                    helperText="Printed at the bottom of customer tax invoices"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1, borderColor: '#EDE2D2' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6D1734', mb: 1.5 }}>
                    Transactional Alerts & SMS Notifications
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.invoicingAndNotifications.orderConfirmationSms}
                        onChange={(e) => handleNestedChange('invoicingAndNotifications', 'orderConfirmationSms', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#6D1734' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6D1734' }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Order Confirmation SMS</Typography>
                        <Typography variant="caption" color="text.secondary">Send SMS confirmation immediately when an order is placed</Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.invoicingAndNotifications.dispatchNotificationSms}
                        onChange={(e) => handleNestedChange('invoicingAndNotifications', 'dispatchNotificationSms', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#6D1734' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6D1734' }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Shipment Dispatch & Tracking Link SMS</Typography>
                        <Typography variant="caption" color="text.secondary">Notify customer with courier AWB tracking link when order is shipped</Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.invoicingAndNotifications.deliveryConfirmationSms}
                        onChange={(e) => handleNestedChange('invoicingAndNotifications', 'deliveryConfirmationSms', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#6D1734' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6D1734' }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Delivery Confirmation & Exchange Window SMS</Typography>
                        <Typography variant="caption" color="text.secondary">Notify customer upon package delivery with Silk Mark verification tips</Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 4: STORE OPERATIONS & MAINTENANCE */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#282321', mb: 0.5 }}>
                Storefront Operations & Top Announcement Bar
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Control storefront availability during festive inventory drops or scheduled maintenance audits.
              </Typography>

              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: form.storeOperations.maintenanceMode ? '#FFF0F0' : '#FAF7F2', border: form.storeOperations.maintenanceMode ? '1px solid #FFCDD2' : '1px solid #EDE2D2', borderRadius: '4px' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.storeOperations.maintenanceMode}
                          onChange={(e) => handleNestedChange('storeOperations', 'maintenanceMode', e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#D32F2F' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#D32F2F' }
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: form.storeOperations.maintenanceMode ? '#D32F2F' : '#282321' }}>
                            {form.storeOperations.maintenanceMode ? 'Storefront Maintenance Mode is ACTIVE (Public Checkout Blocked)' : 'Storefront Maintenance Mode (Normal Active)'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            When active, public visitors see the maintenance banner. Admins can still preview the store.
                          </Typography>
                        </Box>
                      }
                    />

                    {form.storeOperations.maintenanceMode && (
                      <Box sx={{ mt: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Maintenance Mode Notice Message"
                          value={form.storeOperations.maintenanceNotice}
                          onChange={(e) => handleNestedChange('storeOperations', 'maintenanceNotice', e.target.value)}
                        />
                      </Box>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1, borderColor: '#EDE2D2' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6D1734', mb: 1.5 }}>
                    Top Sticky Announcement Header
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.storeOperations.announcementBarEnabled}
                        onChange={(e) => handleNestedChange('storeOperations', 'announcementBarEnabled', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#6D1734' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6D1734' }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Enable Top Announcement Banner</Typography>
                        <Typography variant="caption" color="text.secondary">Displays a prominent gold-accented strip at the very top of the customer portal</Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    disabled={!form.storeOperations.announcementBarEnabled}
                    label="Announcement Headline & Offer Text"
                    value={form.storeOperations.announcementBarText}
                    onChange={(e) => handleNestedChange('storeOperations', 'announcementBarText', e.target.value)}
                    helperText="E.g., ✨ Festive Silk Utsav: Get complimentary Silk Mark pouch on orders above ₹2,999!"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2, borderColor: '#EDE2D2' }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WallpaperIcon sx={{ fontSize: 24, color: '#C5A15A' }} />
                      <Typography variant="subtitle1" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: '#6D1734' }}>
                        User Portal Home Page Hero Section Background & Branding
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(form.storeOperations.heroSection?.enableCustomBg)}
                          onChange={(e) => handleHeroChange('enableCustomBg', e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#6D1734' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6D1734' }
                          }}
                        />
                      }
                      label={
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#282321' }}>
                          Enable Custom Hero Section
                        </Typography>
                      }
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Change the luxury hero background wallpaper and typography shown at the very top of the customer storefront (<code>http://localhost:3000</code>).
                  </Typography>
                </Grid>

                {/* Live Cinema 16:9 Aspect Ratio Preview */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#282321', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <PhotoLibraryIcon sx={{ fontSize: 18, color: '#C5A15A' }} />
                      Live Storefront Hero Preview
                    </Typography>
                    <Chip
                      size="small"
                      label="16:9 Widescreen Cinema Preview"
                      sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        bgcolor: 'rgba(197, 161, 90, 0.15)',
                        color: '#6D1734',
                        border: '1px solid rgba(197, 161, 90, 0.35)',
                      }}
                    />
                  </Box>

                  <Paper
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: { xs: 220, sm: 280, md: 340 },
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '2px solid #EDE2D2',
                      bgcolor: '#141110',
                      boxShadow: '0 8px 24px rgba(40, 10, 20, 0.12)',
                    }}
                  >
                    {/* Background Image */}
                    <Box
                      component="img"
                      src={formatHeroPreviewUrl(form.storeOperations.heroSection?.bgImage)}
                      alt="Hero Preview"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85';
                      }}
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center 38%',
                        transition: 'all 0.5s ease',
                      }}
                    />

                    {/* Radial Luxury Scrim */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at 50% 35%, rgba(20, 17, 16, 0.25) 0%, rgba(20, 17, 16, 0.85) 100%)',
                      }}
                    />

                    {/* Preview Content Overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3,
                        textAlign: 'center',
                        color: '#FFFFFF',
                      }}
                    >
                      {form.storeOperations.heroSection?.tag && (
                        <Chip
                          label={form.storeOperations.heroSection.tag}
                          size="small"
                          sx={{
                            mb: 1.5,
                            bgcolor: 'rgba(197, 161, 90, 0.25)',
                            color: '#F4D086',
                            border: '1px solid rgba(197, 161, 90, 0.6)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                          }}
                        />
                      )}

                      <Typography
                        variant="h4"
                        sx={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontWeight: 700,
                          fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.1rem' },
                          color: '#FFFFFF',
                          mb: 1,
                          textShadow: '0 2px 10px rgba(0,0,0,0.6)',
                        }}
                      >
                        {form.storeOperations.heroSection?.title || 'Nice Summer Collection'}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.88)',
                          maxWidth: 580,
                          fontSize: { xs: '0.75rem', sm: '0.88rem' },
                          mb: 2,
                          textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                        }}
                      >
                        {form.storeOperations.heroSection?.subtitle || 'A Good Looking, Comfortable Traditional Collection'}
                      </Typography>

                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          bgcolor: '#C5A15A',
                          color: '#282321',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          px: 2.5,
                          py: 0.6,
                          borderRadius: '2px',
                          '&:hover': { bgcolor: '#F4D086' },
                        }}
                      >
                        Explore Collection →
                      </Button>
                    </Box>
                  </Paper>
                </Grid>

                {/* Upload or Image URL controls */}
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Hero Background Image URL"
                    value={form.storeOperations.heroSection?.bgImage || ''}
                    onChange={(e) => handleHeroChange('bgImage', e.target.value)}
                    helperText="Paste direct image URL or upload an image file from your device below"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleHeroFileUpload}
                  />
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={uploadingImage ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    sx={{
                      height: '40px',
                      borderColor: '#C5A15A',
                      color: '#6D1734',
                      fontWeight: 600,
                      bgcolor: '#FFFDF9',
                      '&:hover': { borderColor: '#6D1734', bgcolor: '#FAF7F2' }
                    }}
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload Image File'}
                  </Button>
                </Grid>

                {/* Curated Luxury Presets */}
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: '#FAF7F2', borderRadius: '4px', border: '1px solid #EDE2D2' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#6D1734', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 1.25 }}>
                      Quick Select Curated Luxury Wallpapers:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleHeroChange('bgImage', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85')}
                        sx={{ fontSize: '0.75rem', borderColor: '#EDE2D2', color: '#282321', textTransform: 'none', bgcolor: '#FFF' }}
                      >
                        🏛️ Kanchipuram Loom
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleHeroChange('bgImage', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&q=85')}
                        sx={{ fontSize: '0.75rem', borderColor: '#EDE2D2', color: '#282321', textTransform: 'none', bgcolor: '#FFF' }}
                      >
                        👑 Royal Bridal Gold
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleHeroChange('bgImage', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1920&q=85')}
                        sx={{ fontSize: '0.75rem', borderColor: '#EDE2D2', color: '#282321', textTransform: 'none', bgcolor: '#FFF' }}
                      >
                        🦚 Festive Temple Weave
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleHeroChange('bgImage', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1920&q=85')}
                        sx={{ fontSize: '0.75rem', borderColor: '#EDE2D2', color: '#282321', textTransform: 'none', bgcolor: '#FFF' }}
                      >
                        🌺 Crimson Silk Drape
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                {/* Hero Overlay Text Controls */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Hero Category Tag"
                    value={form.storeOperations.heroSection?.tag || ''}
                    onChange={(e) => handleHeroChange('tag', e.target.value)}
                    helperText="E.g., Handloom Heritage / Bridal Atelier"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Hero Main Headline"
                    value={form.storeOperations.heroSection?.title || ''}
                    onChange={(e) => handleHeroChange('title', e.target.value)}
                    helperText="Displayed in typewriter font effect on home page"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Hero Subtitle"
                    value={form.storeOperations.heroSection?.subtitle || ''}
                    onChange={(e) => handleHeroChange('subtitle', e.target.value)}
                    helperText="Descriptive slogan below title"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>

      {/* CONFIRM RESET DIALOG */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#D32F2F' }}>
          Reset Store Settings?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to restore factory default configurations for Shri Deepaalaya Silks?
            Any custom shipping thresholds, exchange notices, or tax rates will be reset.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setResetDialogOpen(false)} disabled={saving} sx={{ color: '#6b5f5a' }}>
            Cancel
          </Button>
          <Button
            onClick={handleResetConfirm}
            variant="contained"
            color="error"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <RestartAltIcon />}
          >
            Confirm Reset
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
