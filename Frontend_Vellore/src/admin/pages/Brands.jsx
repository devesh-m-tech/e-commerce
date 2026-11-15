import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Modal,
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
  Input,
  TablePagination,
  CircularProgress,
  Avatar,
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { createBrand, getAllBrands, updateBrand, deleteBrand } from '../api/brandApi';
import AdminPageHeader from '../components/common/AdminPageHeader';
import AdminTableToolbar from '../components/common/AdminTableToolbar';
import AdminTableEmptyState from '../components/common/AdminTableEmptyState';

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: null
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch brands on component mount
  useEffect(() => {
    fetchBrands();
  }, []);

  // Fetch all brands
  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await getAllBrands();
      const brandList = Array.isArray(data)
        ? data
        : Array.isArray(data?.brands)
        ? data.brands
        : [];
      setBrands(brandList);
    } catch (error) {
      setBrands([]);
      toast.error(error.message || 'Error fetching brands');
    } finally {
      setLoading(false);
    }
  };

  const filteredBrands = useMemo(() => {
    const list = Array.isArray(brands) ? brands : [];
    return list.filter((brand) => {
      const q = (searchQuery || '').toLowerCase();
      return (brand?.name || '').toLowerCase().includes(q);
    });
  }, [brands, searchQuery]);

  const paginatedBrands = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredBrands.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredBrands, page, rowsPerPage]);

  const handleExportToExcel = () => {
    const exportData = (brands || []).map((b) => ({
      ID: b._id,
      'Brand Name': b.name,
      'Created At': b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Brands');
    XLSX.writeFile(wb, `brands_list_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    if (e.target.name === 'logo') {
      const file = e.target.files[0];
      if (file) {
        setFormData({
          ...formData,
          logo: file
        });
        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  // Open modal for create/edit
  const handleOpen = (brand = null) => {
    if (brand) {
      setFormData({ name: brand.name, logo: null });
      setPreviewUrl(brand.logo);
      setSelectedBrand(brand);
    } else {
      setFormData({ name: '', logo: null });
      setPreviewUrl('');
      setSelectedBrand(null);
    }
    setOpen(true);
  };

  // Close modal
  const handleClose = () => {
    setOpen(false);
    setFormData({ name: '', logo: '' });
    setSelectedBrand(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }

      if (selectedBrand) {
        await updateBrand(selectedBrand._id, formDataToSend);
        toast.success('Brand updated successfully');
      } else {
        await createBrand(formDataToSend);
        toast.success('Brand created successfully');
      }
      handleClose();
      fetchBrands();
    } catch (error) {
      toast.error(error.message || 'Error saving brand');
    } finally {
      setIsUploading(false);
    }
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (brand) => {
    setSelectedBrand(brand);
    setDeleteDialogOpen(true);
  };

  // Handle brand deletion
  const handleDelete = async () => {
    try {
      await deleteBrand(selectedBrand._id);
      toast.success('Brand deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedBrand(null);
      fetchBrands();
    } catch (error) {
      toast.error(error.message || 'Error deleting brand');
    }
  };

  return (
    <Box className="admin-page-container">
      <AdminPageHeader
        title="Brand Management"
        subtitle="Manage heritage silk loom guilds, artisanal partners, and hallmark labels"
        icon={LocalOfferIcon}
        badges={[
          { label: `Total Brands: ${(brands || []).length}`, color: 'default' },
        ]}
        onExport={handleExportToExcel}
        primaryAction={{
          label: 'Add Brand',
          icon: <AddIcon />,
          onClick: () => handleOpen(),
        }}
      />

      <AdminTableToolbar
        searchPlaceholder="Search brands by name..."
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPage(0);
        }}
        totalCount={(brands || []).length}
        filteredCount={filteredBrands.length}
        onResetFilters={() => {
          setSearchQuery('');
          setPage(0);
        }}
      />

      <Paper className="admin-table-paper">
        <TableContainer>
          <Table>
            <TableHead className="admin-table-head">
              <TableRow>
                <TableCell className="admin-table-th" width="100px">Logo</TableCell>
                <TableCell className="admin-table-th">Brand Name</TableCell>
                <TableCell className="admin-table-th" align="right" width="140px">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                    <CircularProgress sx={{ color: '#6D1734' }} />
                  </TableCell>
                </TableRow>
              ) : paginatedBrands.length === 0 ? (
                <AdminTableEmptyState
                  colSpan={3}
                  title="No brands found"
                  subtitle="No brands match your search query."
                  onReset={() => {
                    setSearchQuery('');
                    setPage(0);
                  }}
                />
              ) : (
                paginatedBrands.map((brand) => (
                  <TableRow key={brand._id} className="admin-table-row" hover>
                    <TableCell className="admin-table-cell">
                      {brand.logo ? (
                        <Avatar
                          src={brand.logo}
                          alt={brand.name}
                          variant="rounded"
                          sx={{ width: 44, height: 44, border: '1px solid #EDE2D2', bgcolor: '#FAF7F2' }}
                        />
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 44, height: 44, bgcolor: 'rgba(109,23,52,0.1)', color: '#6D1734', fontWeight: 700 }}>
                          {brand.name?.charAt(0) || 'B'}
                        </Avatar>
                      )}
                    </TableCell>
                    <TableCell className="admin-table-cell" sx={{ fontWeight: 600, color: '#282321' }}>
                      {brand.name}
                    </TableCell>
                    <TableCell className="admin-table-cell" align="right">
                      <Tooltip title="Edit Brand">
                        <IconButton onClick={() => handleOpen(brand)} sx={{ color: '#6D1734' }} size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Brand">
                        <IconButton onClick={() => handleDeleteClick(brand)} color="error" size="small">
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
          count={filteredBrands.length}
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

      {/* Create/Edit Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="brand-modal-title"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="brand-modal-title" variant="h6" component="h2" mb={3}>
            {selectedBrand ? 'Edit Brand' : 'Create Brand'}
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Brand Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <Box mt={2}>
              <Input
                type="file"
                name="logo"
                onChange={handleInputChange}
                style={{ display: 'none' }}
                id="logo-upload"
                accept="image/*"
              />
              <label htmlFor="logo-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                >
                  {formData.logo ? 'Change Logo' : 'Upload Logo'}
                </Button>
              </label>
              {(previewUrl || formData.logo) && (
                <Box mt={2} display="flex" justifyContent="center">
                  <img
                    src={previewUrl || URL.createObjectURL(formData.logo)}
                    alt="Brand logo preview"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              )}
            </Box>
            <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
              <Button onClick={handleClose}>Cancel</Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : (selectedBrand ? 'Update' : 'Create')}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the brand "{selectedBrand?.name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Brands;