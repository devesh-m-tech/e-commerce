import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  Chip,
  Tooltip,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Alert,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} from '../api/bannerApi';

const BACKEND_BASE = (import.meta.env?.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const resolveImageUrl = (img) => {
  if (!img) return '';
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:image')) {
    return img;
  }
  const clean = img.replace(/\\/g, '/');
  return clean.startsWith('/') ? `${BACKEND_BASE}${clean}` : `${BACKEND_BASE}/${clean}`;
};

const Banners = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    tag: 'Exclusive Collection',
    buttonText: 'SHOP THE COLLECTION',
    link: '/products',
    imageUrl: '',
    order: 1,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Live Carousel Preview Index
  const [previewIndex, setPreviewIndex] = useState(0);

  // Fetch all banners
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await getAllBanners();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.banners)
        ? data.banners
        : [];
      // Sort by order ascending
      list.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
      setBanners(list);
    } catch (error) {
      console.error('Error fetching banners:', error);
      enqueueSnackbar(error.message || 'Failed to load banners', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Active banners for preview
  const activeBanners = useMemo(() => {
    return banners.filter((b) => b.isActive);
  }, [banners]);

  useEffect(() => {
    if (previewIndex >= activeBanners.length && activeBanners.length > 0) {
      setPreviewIndex(0);
    }
  }, [activeBanners, previewIndex]);

  // Open Dialog for Add
  const handleOpenAdd = () => {
    setSelectedBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      tag: 'Exclusive Collection',
      buttonText: 'SHOP THE COLLECTION',
      link: '/products',
      imageUrl: '',
      order: (banners.length > 0 ? Math.max(...banners.map((b) => Number(b.order) || 0)) + 1 : 1),
      isActive: true,
    });
    setImageFile(null);
    setPreviewUrl('');
    setDialogOpen(true);
  };

  // Open Dialog for Edit
  const handleOpenEdit = (banner) => {
    setSelectedBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      tag: banner.tag || 'Exclusive Collection',
      buttonText: banner.buttonText || 'SHOP THE COLLECTION',
      link: banner.link || '/products',
      imageUrl: banner.imageUrl || '',
      order: banner.order !== undefined ? banner.order : 1,
      isActive: banner.isActive !== undefined ? banner.isActive : true,
    });
    setImageFile(null);
    setPreviewUrl(resolveImageUrl(banner.imageUrl));
    setDialogOpen(true);
  };

  // Close form dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedBanner(null);
    setImageFile(null);
    setPreviewUrl('');
  };

  // Handle Image File Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, imageUrl: '' }));
    }
  };

  // Handle URL change
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    if (url) {
      setImageFile(null);
      setPreviewUrl(url);
    } else {
      setPreviewUrl('');
    }
  };

  // Submit Add / Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      enqueueSnackbar('Banner title is required', { variant: 'warning' });
      return;
    }
    if (!imageFile && !formData.imageUrl.trim() && !previewUrl) {
      enqueueSnackbar('Please provide a banner image file or image URL', { variant: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('subtitle', formData.subtitle.trim());
      payload.append('tag', formData.tag.trim());
      payload.append('buttonText', formData.buttonText.trim());
      payload.append('link', formData.link.trim());
      payload.append('order', formData.order);
      payload.append('isActive', formData.isActive);

      if (imageFile) {
        payload.append('image', imageFile);
      } else if (formData.imageUrl.trim()) {
        payload.append('imageUrl', formData.imageUrl.trim());
      }

      if (selectedBanner) {
        await updateBanner(selectedBanner._id, payload);
        enqueueSnackbar('Hero banner updated successfully', { variant: 'success' });
      } else {
        await createBanner(payload);
        enqueueSnackbar('Hero banner created successfully', { variant: 'success' });
      }

      handleCloseDialog();
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      enqueueSnackbar(error.message || 'Failed to save banner', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (banner) => {
    // Optimistic UI update
    setBanners((prev) =>
      prev.map((b) => (b._id === banner._id ? { ...b, isActive: !b.isActive } : b))
    );
    try {
      await toggleBannerStatus(banner._id);
      enqueueSnackbar(`Banner ${!banner.isActive ? 'activated' : 'deactivated'}`, {
        variant: 'info',
      });
    } catch (error) {
      // Revert if error
      setBanners((prev) =>
        prev.map((b) => (b._id === banner._id ? { ...b, isActive: banner.isActive } : b))
      );
      enqueueSnackbar(error.message || 'Failed to toggle banner status', { variant: 'error' });
    }
  };

  // Open Delete Dialog
  const handleOpenDelete = (banner) => {
    setSelectedBanner(banner);
    setDeleteDialogOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!selectedBanner) return;
    try {
      await deleteBanner(selectedBanner._id);
      enqueueSnackbar('Banner deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setSelectedBanner(null);
      fetchBanners();
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to delete banner', { variant: 'error' });
    }
  };

  const currentPreviewBanner = activeBanners[previewIndex];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Top Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              fontFamily: '"Playfair Display", Georgia, serif',
              letterSpacing: '0.02em',
            }}
          >
            Hero Banner Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage the animated hero slides displayed at the top of the homepage.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchBanners}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{
              fontWeight: 600,
              letterSpacing: '0.04em',
              px: 3,
            }}
          >
            Add New Banner
          </Button>
        </Box>
      </Box>

      {/* Summary Chips */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <Chip
          label={`Total Banners: ${banners.length}`}
          color="default"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
        <Chip
          label={`Active on Homepage: ${activeBanners.length}`}
          color="success"
          sx={{ fontWeight: 600 }}
        />
        <Chip
          label={`Inactive: ${banners.length - activeBanners.length}`}
          color="default"
          sx={{ fontWeight: 500 }}
        />
      </Box>

      {/* Live Preview Card */}
      {activeBanners.length > 0 && currentPreviewBanner && (
        <Card
          sx={{
            mb: 4,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid #EDE2D2',
            boxShadow: '0 4px 20px rgba(109, 23, 52, 0.08)',
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              bgcolor: '#FAF7F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #EDE2D2',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VisibilityIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '0.05em' }}>
                LIVE SLIDER PREVIEW ({previewIndex + 1} of {activeBanners.length})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="small"
                onClick={() =>
                  setPreviewIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1))
                }
                sx={{ border: '1px solid #EDE2D2' }}
              >
                <ArrowBackIosIcon sx={{ fontSize: 13, ml: 0.5 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() =>
                  setPreviewIndex((prev) => (prev === activeBanners.length - 1 ? 0 : prev + 1))
                }
                sx={{ border: '1px solid #EDE2D2' }}
              >
                <ArrowForwardIosIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Box>
          </Box>

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: { xs: 260, sm: 340, md: 420 },
              overflow: 'hidden',
              bgcolor: '#1a1816',
            }}
          >
            <img
              src={resolveImageUrl(currentPreviewBanner.imageUrl)}
              alt={currentPreviewBanner.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.85)',
                transition: 'transform 0.6s ease',
              }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80';
              }}
            />

            {/* Gradient Overlay */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(20,15,14,0.3) 0%, rgba(20,15,14,0.7) 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                px: 3,
                color: '#ffffff',
              }}
            >
              {currentPreviewBanner.tag && (
                <Chip
                  label={currentPreviewBanner.tag}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(197, 161, 90, 0.95)',
                    color: '#282321',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    letterSpacing: '0.12em',
                    mb: 1.5,
                  }}
                />
              )}
              <Typography
                variant="h3"
                sx={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontWeight: 700,
                  fontSize: { xs: '1.4rem', sm: '2.2rem', md: '2.8rem' },
                  maxWidth: 800,
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  mb: 1,
                }}
              >
                {currentPreviewBanner.title}
              </Typography>
              {currentPreviewBanner.subtitle && (
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: '"Karla", sans-serif',
                    fontSize: { xs: '0.85rem', sm: '1.05rem' },
                    maxWidth: 650,
                    color: '#F4ECE1',
                    mb: 2.5,
                  }}
                >
                  {currentPreviewBanner.subtitle}
                </Typography>
              )}
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#ffffff',
                  color: '#282321',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  letterSpacing: '0.12em',
                  px: 3.5,
                  py: 1,
                  borderRadius: 0,
                  '&:hover': {
                    bgcolor: 'secondary.main',
                    color: '#ffffff',
                  },
                }}
              >
                {currentPreviewBanner.buttonText || 'SHOP THE COLLECTION'}
              </Button>
            </Box>
          </Box>
        </Card>
      )}

      {/* Main Table Card */}
      <Paper
        sx={{
          borderRadius: 2,
          border: '1px solid #EDE2D2',
          boxShadow: '0 2px 8px rgba(40,35,33,0.03)',
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#FAF7F2' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Order
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Image Preview
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Banner Info
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Call-To-Action
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Active
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} color="primary" />
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                      Loading hero banners...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      No hero banners found. Click "Add New Banner" to create the first slide.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner) => (
                  <TableRow
                    key={banner._id}
                    hover
                    sx={{
                      '&:hover': { bgcolor: '#FBF9F5' },
                      opacity: banner.isActive ? 1 : 0.65,
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    {/* Order */}
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>
                      #{banner.order || 0}
                    </TableCell>

                    {/* Image Preview */}
                    <TableCell sx={{ width: 140 }}>
                      <Box
                        sx={{
                          width: 120,
                          height: 68,
                          borderRadius: 1,
                          overflow: 'hidden',
                          border: '1px solid #EDE2D2',
                          bgcolor: '#1a1816',
                        }}
                      >
                        <img
                          src={resolveImageUrl(banner.imageUrl)}
                          alt={banner.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      </Box>
                    </TableCell>

                    {/* Banner Info */}
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {banner.tag && (
                          <Chip
                            label={banner.tag}
                            size="small"
                            sx={{
                              width: 'fit-content',
                              bgcolor: 'rgba(197, 161, 90, 0.15)',
                              color: '#9e7b32',
                              fontWeight: 700,
                              fontSize: '0.68rem',
                              height: 20,
                            }}
                          />
                        )}
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {banner.title}
                        </Typography>
                        {banner.subtitle && (
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                          >
                            {banner.subtitle}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* CTA */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {banner.buttonText || 'SHOP THE COLLECTION'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {banner.link || '/products'}
                      </Typography>
                    </TableCell>

                    {/* Active Switch */}
                    <TableCell align="center">
                      <Tooltip title={banner.isActive ? 'Active on Homepage' : 'Hidden from Homepage'}>
                        <Switch
                          checked={banner.isActive}
                          onChange={() => handleToggleStatus(banner)}
                          color="primary"
                        />
                      </Tooltip>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Tooltip title="Edit Banner">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEdit(banner)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Banner">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDelete(banner)}
                        >
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
      </Paper>

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, border: '1px solid #EDE2D2' },
        }}
      >
        <DialogTitle sx={{ bgcolor: '#FAF7F2', fontWeight: 700, color: 'primary.main', borderBottom: '1px solid #EDE2D2' }}>
          {selectedBanner ? 'Edit Hero Banner' : 'Create New Hero Banner'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2.5}>
              {/* Image Preview & Upload Controls */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                  Banner Slide Image *
                </Typography>

                {previewUrl ? (
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: 220,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      mb: 2,
                      border: '2px solid #C5A15A',
                    }}
                  >
                    <img
                      src={previewUrl}
                      alt="Banner Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      sx={{ position: 'absolute', bottom: 12, right: 12 }}
                    >
                      Change Image File
                      <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                    </Button>
                  </Box>
                ) : (
                  <Box
                    component="label"
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 4,
                      borderRadius: 1.5,
                      border: '2px dashed #C5A15A',
                      bgcolor: '#FFFDF9',
                      cursor: 'pointer',
                      mb: 2,
                      transition: 'border-color 0.2s ease',
                      '&:hover': { borderColor: 'primary.main', bgcolor: '#FAF7F2' },
                    }}
                  >
                    <CloudUploadIcon sx={{ fontSize: 44, color: 'primary.main', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      Click to upload banner image file
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Recommended: 1920 x 800px or 16:9 ratio (JPEG, PNG, WEBP max 10MB)
                    </Typography>
                    <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                  </Box>
                )}

                <TextField
                  fullWidth
                  size="small"
                  label="Or enter Image URL directly"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={handleUrlChange}
                  helperText="You can either upload a local file or paste an external image URL"
                />
              </Grid>

              {/* Title */}
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  required
                  label="Slide Title / Main Headline"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Nice Summer Collection"
                />
              </Grid>

              {/* Tag / Category Badge */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Tag / Pill Label"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  placeholder="e.g. Pure Silk Collection"
                />
              </Grid>

              {/* Subtitle */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Subheading / Description"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. A Good Looking, Comfortable Traditional Collection"
                />
              </Grid>

              {/* Button Text */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CTA Button Text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  placeholder="SHOP THE COLLECTION"
                />
              </Grid>

              {/* Target Link */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Destination Link"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="/products or /products?category=..."
                />
              </Grid>

              {/* Display Order */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Display Order (Sequence)"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  helperText="Lower numbers appear first (e.g. 1, 2, 3)"
                />
              </Grid>

              {/* Active Toggle */}
              <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', pt: { sm: 2 } }}>
                <Typography variant="body2" sx={{ mr: 1, fontWeight: 600 }}>
                  Active on Homepage:
                </Typography>
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  color="primary"
                />
                <Typography variant="caption" color="text.secondary">
                  {formData.isActive ? 'Visible' : 'Hidden'}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #EDE2D2' }}>
            <Button onClick={handleCloseDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              sx={{ px: 3, fontWeight: 600 }}
            >
              {isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : selectedBanner ? (
                'Save Changes'
              ) : (
                'Create Banner'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          Delete Hero Banner
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete the hero slide "
            <strong>{selectedBanner?.title}</strong>"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{ fontWeight: 600 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Banners;
