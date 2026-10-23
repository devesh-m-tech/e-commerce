import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import {
  Box,
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
  IconButton,
  TextField,
  InputAdornment,
  TablePagination,
  CircularProgress,
  Chip,
  Button,
  Grid,
  DialogActions,
  Link,
  Divider,
  Avatar,
  useTheme,
  alpha,
  Card,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import StorefrontIcon from '@mui/icons-material/Storefront';
import * as XLSX from 'xlsx';
import { fetchVendors, updateVendorStatus, deleteVendor } from '../redux/slices/vendorSlice';
import AdminPageHeader from '../components/common/AdminPageHeader';
import AdminTableToolbar from '../components/common/AdminTableToolbar';
import AdminTableEmptyState from '../components/common/AdminTableEmptyState';

const Vendors = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  
  // Redux state
  const { vendors, loading, error } = useSelector((state) => state.vendors);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [documentDialog, setDocumentDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentView, setDocumentView] = useState('preview'); // 'preview' or 'download'

  // Fetch vendors on component mount
  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  // Show error notifications
  useEffect(() => {
    if (error) {
      enqueueSnackbar(error.message || 'An error occurred', { variant: 'error' });
    }
  }, [error, enqueueSnackbar]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const safeVendors = Array.isArray(vendors) ? vendors : [];
  const filteredVendors = useMemo(() => {
    return safeVendors.filter((vendor) => {
      const q = (searchQuery || '').toLowerCase();
      const matchesSearch =
        (vendor?.vendorName || '').toLowerCase().includes(q) ||
        (vendor?.businessInfo?.businessName || '').toLowerCase().includes(q) ||
        (vendor?.email || '').toLowerCase().includes(q) ||
        (vendor?.phoneNumber || '').toLowerCase().includes(q);

      const isVerified = Boolean(vendor?.isVerified);
      const matchesVerif =
        verificationFilter === 'all' ||
        (verificationFilter === 'verified' && isVerified) ||
        (verificationFilter === 'pending' && !isVerified);

      const status = (vendor?.status || 'active').toLowerCase();
      const matchesStatus =
        statusFilter === 'all' || status === statusFilter.toLowerCase();

      return matchesSearch && matchesVerif && matchesStatus;
    });
  }, [safeVendors, searchQuery, verificationFilter, statusFilter]);

  const totalVendorsCount = safeVendors.length;
  const verifiedCount = useMemo(() => safeVendors.filter((v) => v.isVerified).length, [safeVendors]);
  const pendingCount = totalVendorsCount - verifiedCount;
  const inactiveCount = useMemo(
    () => safeVendors.filter((v) => (v.status || '').toLowerCase() === 'inactive').length,
    [safeVendors]
  );

  const handleExportToExcel = () => {
    const exportData = safeVendors.map((v) => ({
      ID: v._id,
      'Artisan Name': v.vendorName,
      'Guild / Workshop': v.businessInfo?.businessName || '',
      Email: v.email,
      Phone: v.phoneNumber,
      'Verification Status': v.isVerified ? 'Verified' : 'Pending',
      'Account Status': v.status || 'Active',
      Enrolled: v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Artisans');
    XLSX.writeFile(wb, `artisan_partners_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  };

  const handleViewDetails = (vendor) => {
    setSelectedVendor(vendor);
    setDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialog(false);
    setSelectedVendor(null);
  };

  const handleUpdateStatus = async (vendorId, newStatus) => {
    try {
      await dispatch(updateVendorStatus({ 
        id: vendorId, 
        status: {
          adminApprovalStatus: newStatus,
          adminMessage: newStatus === 'approved' 
            ? 'Your registration has been approved. You can now start using your account.' 
            : 'Your registration has been rejected. Please contact support for more information.'
        }
      })).unwrap();
      
      enqueueSnackbar(
        newStatus === 'approved' 
          ? 'Vendor has been approved successfully' 
          : 'Vendor has been rejected',
        { variant: 'success' }
      );
      
      handleCloseDetails();
      dispatch(fetchVendors()); // Refresh the vendors list
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to update vendor status', { variant: 'error' });
    }
  };

  const handleUpdateVendorStatus = async (vendorId, isActive) => {
    try {
      await dispatch(updateVendorStatus({ 
        id: vendorId, 
        status: {
          vendorStatus: isActive ? 'active' : 'inactive'
        }
      })).unwrap();
      
      enqueueSnackbar(
        isActive ? 'Vendor has been activated' : 'Vendor has been deactivated',
        { variant: 'success' }
      );
      
      handleCloseDetails();
      dispatch(fetchVendors()); // Refresh the vendors list
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to update vendor status', { variant: 'error' });
    }
  };

  const getStatusChipColor = (status, adminApproval) => {
    if (adminApproval?.status === 'pending') return 'warning';
    if (adminApproval?.status === 'rejected') return 'error';
    if (status === 'active') return 'success';
    return 'default';
  };

  const getStatusLabel = (status, adminApproval) => {
    if (adminApproval?.status === 'pending') return 'Pending Approval';
    if (adminApproval?.status === 'rejected') return 'Rejected';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleViewDocument = (url, documentName) => {
    try {
      if (!url) {
        console.log('No URL provided for document:', documentName);
        enqueueSnackbar('Document URL not available', { variant: 'error' });
        return;
      }

      console.log('Original URL:', url);
      console.log('Document Name:', documentName);

      // Format the URL for viewing
      let viewUrl = url;
      if (url.includes('cloudinary')) {
        console.log('Processing Cloudinary URL');
        // Remove any existing transformations
        viewUrl = url.split('/upload/')[0] + '/upload/';
        console.log('Base URL:', viewUrl);
        
        // Add the document name as a parameter
        const formattedName = documentName.replace(/\s+/g, '_');
        viewUrl += `fl_attachment:${formattedName}/`;
        console.log('URL with attachment flag:', viewUrl);
        
        // Add the rest of the URL
        viewUrl += url.split('/upload/')[1];
        console.log('Final view URL:', viewUrl);
      }

      // Open in new tab
      window.open(viewUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error handling document view:', error);
      enqueueSnackbar('Error loading document. Please try downloading instead.', { variant: 'error' });
    }
  };

  const handleCloseDocumentDialog = () => {
    setDocumentDialog(false);
    setSelectedDocument(null);
    setDocumentView('preview');
  };

  const handleDownloadDocument = () => {
    try {
      if (selectedDocument?.originalUrl) {
        console.log('Downloading document:', selectedDocument.name);
        console.log('Original URL for download:', selectedDocument.originalUrl);
        
        // Create a temporary link element
        const link = document.createElement('a');
        let downloadUrl = selectedDocument.originalUrl;
        
        // Format the URL for download if it's from Cloudinary
        if (downloadUrl.includes('cloudinary')) {
          console.log('Processing Cloudinary download URL');
          downloadUrl = downloadUrl.split('/upload/')[0] + '/upload/';
          console.log('Base download URL:', downloadUrl);
          
          downloadUrl += `fl_attachment:${selectedDocument.name.replace(/\s+/g, '_')}/`;
          console.log('URL with attachment flag:', downloadUrl);
          
          downloadUrl += selectedDocument.originalUrl.split('/upload/')[1];
          console.log('Final download URL:', downloadUrl);
        }
        
        link.href = downloadUrl;
        link.download = `${selectedDocument.name}.pdf`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        console.log('Download link created:', {
          href: link.href,
          download: link.download
        });
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.log('No original URL available for download');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      enqueueSnackbar('Error downloading document. Please try again.', { variant: 'error' });
    }
  };

  const handleDeleteVendor = async () => {
    if (window.confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      try {
        await dispatch(deleteVendor(selectedVendor._id)).unwrap();
        enqueueSnackbar('Vendor deleted successfully', { variant: 'success' });
        handleCloseDetails();
        dispatch(fetchVendors()); // Refresh the vendors list
      } catch (error) {
        enqueueSnackbar(error.message || 'Failed to delete vendor', { variant: 'error' });
      }
    }
  };

  return (
    <Box className="admin-page-container">
      <AdminPageHeader
        title="Master Weavers & Artisans"
        subtitle="Manage certified handloom weavers, guild partners, and jewellery craftsmen"
        icon={StorefrontIcon}
        badges={[
          { label: `Total Partners: ${totalVendorsCount}`, color: 'default' },
          { label: `Verified: ${verifiedCount}`, color: 'success' },
          ...(pendingCount > 0 ? [{ label: `Pending: ${pendingCount}`, color: 'warning' }] : []),
          ...(inactiveCount > 0 ? [{ label: `Inactive: ${inactiveCount}`, color: 'error' }] : []),
        ]}
        onExport={handleExportToExcel}
      />

      <AdminTableToolbar
        searchPlaceholder="Search weavers by name, loom guild, email or phone..."
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPage(0);
        }}
        filters={[
          {
            id: 'verificationFilter',
            label: 'Verification',
            value: verificationFilter,
            onChange: (val) => {
              setVerificationFilter(val);
              setPage(0);
            },
            options: [
              { label: 'All Verification', value: 'all' },
              { label: 'Verified Partners', value: 'verified' },
              { label: 'Pending Approval', value: 'pending' },
            ],
          },
          {
            id: 'statusFilter',
            label: 'Account Status',
            value: statusFilter,
            onChange: (val) => {
              setStatusFilter(val);
              setPage(0);
            },
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
          },
        ]}
        quickFilters={{
          selected: verificationFilter !== 'all' ? verificationFilter : statusFilter,
          onChange: (val) => {
            if (val === 'verified' || val === 'pending') {
              setVerificationFilter(val);
              setStatusFilter('all');
            } else if (val === 'inactive') {
              setStatusFilter('inactive');
              setVerificationFilter('all');
            } else {
              setVerificationFilter('all');
              setStatusFilter('all');
            }
            setPage(0);
          },
          options: [
            { label: 'All', value: 'all', count: totalVendorsCount },
            { label: 'Verified', value: 'verified', count: verifiedCount, color: 'success' },
            { label: 'Pending', value: 'pending', count: pendingCount, color: 'warning' },
            { label: 'Inactive', value: 'inactive', count: inactiveCount, color: 'error' },
          ],
        }}
        totalCount={totalVendorsCount}
        filteredCount={filteredVendors.length}
        onResetFilters={() => {
          setSearchQuery('');
          setVerificationFilter('all');
          setStatusFilter('all');
          setPage(0);
        }}
      />

      {/* Vendors Table Section */}
      <Paper className="admin-table-paper">
        <TableContainer>
          <Table>
            <TableHead className="admin-table-head">
              <TableRow>
                <TableCell className="admin-table-th">Artisan Name</TableCell>
                <TableCell className="admin-table-th">Guild / Workshop</TableCell>
                <TableCell className="admin-table-th">Contact</TableCell>
                <TableCell className="admin-table-th">Verification</TableCell>
                <TableCell className="admin-table-th">Account</TableCell>
                <TableCell className="admin-table-th">Enrolled</TableCell>
                <TableCell className="admin-table-th" align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress sx={{ color: '#6D1734' }} size={36} />
                  </TableCell>
                </TableRow>
              ) : filteredVendors.length === 0 ? (
                <AdminTableEmptyState
                  colSpan={7}
                  title="No artisans or weavers found"
                  subtitle="No guild partners match your search or filter criteria."
                  onReset={() => {
                    setSearchQuery('');
                    setVerificationFilter('all');
                    setStatusFilter('all');
                    setPage(0);
                  }}
                />
              ) : (
                filteredVendors
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((vendor) => (
                    <TableRow 
                      key={vendor._id}
                      sx={{
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: '#FAF7F2',
                          '& .action-button': {
                            opacity: 1,
                            transform: 'translateX(0)',
                          }
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ 
                            bgcolor: '#6D1734',
                            color: '#FFF9F0',
                            width: 36,
                            height: 36,
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            borderRadius: 0,
                            fontFamily: '"Playfair Display", Georgia, serif'
                          }}>
                            {vendor.vendorName?.charAt(0)}
                          </Avatar>
                          <Typography sx={{ fontWeight: 600, color: '#282321', fontFamily: '"Karla", sans-serif' }}>
                            {vendor.vendorName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: '#282321', fontWeight: 500 }}>
                          {vendor.businessInfo?.businessName || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ color: '#6D1734', fontWeight: 600 }}>
                            {vendor.email}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#7D7571' }}>
                            {vendor.phoneNumber}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={vendor.adminApproval?.status === 'approved' ? 'VERIFIED' : 
                                vendor.adminApproval?.status === 'rejected' ? 'REJECTED' : 'PENDING'}
                          color={vendor.adminApproval?.status === 'approved' ? 'success' : 
                                vendor.adminApproval?.status === 'rejected' ? 'error' : 'warning'}
                          size="small"
                          sx={{ 
                            borderRadius: 0,
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            letterSpacing: '0.5px'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={vendor.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                          color={vendor.status === 'active' ? 'success' : 'default'}
                          size="small"
                          sx={{ 
                            borderRadius: 0,
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            letterSpacing: '0.5px'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: '#7D7571', fontSize: '0.85rem' }}>
                          {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString('en-GB') : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          className="action-button"
                          onClick={() => handleViewDetails(vendor)} 
                          size="small"
                          sx={{
                            bgcolor: '#FAF7F2',
                            color: '#6D1734',
                            borderRadius: 0,
                            border: '1px solid #EDE2D2',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: '#6D1734',
                              color: 'white',
                            }
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredVendors.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          className="admin-pagination font-number"
        />
      </Paper>

      <Dialog 
        open={detailsDialog} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            overflow: 'hidden',
            border: '1px solid #EDE2D2',
            boxShadow: '0 12px 48px rgba(109,23,52,0.15)',
            '& .MuiDialogTitle-root': {
              backgroundColor: '#6D1734',
              color: 'white',
              py: 2.5,
              fontFamily: '"Playfair Display", Georgia, serif',
            }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon sx={{ color: '#C5A15A' }} />
          Artisan & Weaver Profile
        </DialogTitle>
        <DialogContent dividers>
          {selectedVendor && (
            <Grid container spacing={3}>
              {/* Basic Information Section */}
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#FAF7F2', borderRadius: 0, border: '1px solid #EDE2D2' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#6D1734', color: '#FFF9F0', mr: 2, borderRadius: 0 }}>
                      {selectedVendor.vendorName?.charAt(0)}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#6D1734' }}>Basic Information</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PersonIcon sx={{ color: '#6D1734', fontSize: 20 }} />
                        <Typography variant="subtitle2" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025' }}>Vendor / Weaver Name</Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 600, color: '#282321' }}>{selectedVendor.vendorName}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <EmailIcon sx={{ color: '#6D1734', fontSize: 20 }} />
                        <Typography variant="subtitle2" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025' }}>Email Address</Typography>
                      </Box>
                      <Typography sx={{ color: '#6D1734', fontWeight: 600 }}>{selectedVendor.email}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PhoneIcon sx={{ color: '#6D1734', fontSize: 20 }} />
                        <Typography variant="subtitle2" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025' }}>Phone Number</Typography>
                      </Box>
                      <Typography sx={{ color: '#282321' }}>{selectedVendor.phoneNumber}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <DescriptionIcon sx={{ color: '#6D1734', fontSize: 20 }} />
                        <Typography variant="subtitle2" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025' }}>Current Status</Typography>
                      </Box>
                      <Chip
                        label={getStatusLabel(selectedVendor.status, selectedVendor.adminApproval)}
                        color={getStatusChipColor(selectedVendor.status, selectedVendor.adminApproval)}
                        sx={{ borderRadius: 0, fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Business Information Section */}
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#FAF7F2', borderRadius: 0, border: '1px solid #EDE2D2' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BusinessIcon sx={{ color: '#6D1734', mr: 2 }} />
                    <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#6D1734' }}>Loom Guild & Business Information</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025' }} gutterBottom>
                        Business Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#282321' }}>
                        {selectedVendor.businessInfo?.businessName || '—'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025' }} gutterBottom>
                        Business Type
                      </Typography>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize', color: '#282321' }}>
                        {selectedVendor.businessInfo?.businessType || '—'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025' }} gutterBottom>
                        Product Category
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#282321' }}>
                        {selectedVendor.businessInfo?.productCategory || '—'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Documents Section */}
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#FAF7F2', borderRadius: 0, border: '1px solid #EDE2D2' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DescriptionIcon sx={{ color: '#6D1734', mr: 2 }} />
                    <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#6D1734' }}>Verification Documents</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 0, border: '1px solid #EDE2D2', backgroundColor: '#FFFFFF' }}>
                        <Typography variant="subtitle2" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025' }} gutterBottom>
                          Aadhar Card
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {selectedVendor.documents?.aadhar?.number || '—'}
                          </Typography>
                          {selectedVendor.documents?.aadhar?.document && (
                            <Button 
                              size="small" 
                              variant="outlined"
                              onClick={() => handleViewDocument(selectedVendor.documents.aadhar.document, 'Aadhar Card')}
                              sx={{ borderRadius: 0, textTransform: 'uppercase', fontSize: '0.7rem' }}
                            >
                              View
                            </Button>
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 0, border: '1px solid #EDE2D2', backgroundColor: '#FFFFFF' }}>
                        <Typography variant="subtitle2" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025' }} gutterBottom>
                          PAN Card
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {selectedVendor.documents?.pan?.number || '—'}
                          </Typography>
                          {selectedVendor.documents?.pan?.document && (
                            <Button 
                              size="small" 
                              variant="outlined"
                              onClick={() => handleViewDocument(selectedVendor.documents.pan.document, 'PAN Card')}
                              sx={{ borderRadius: 0, textTransform: 'uppercase', fontSize: '0.7rem' }}
                            >
                              View
                            </Button>
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 0, border: '1px solid #EDE2D2', backgroundColor: '#FFFFFF' }}>
                        <Typography variant="subtitle2" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025' }} gutterBottom>
                          GST Certificate
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {selectedVendor.documents?.gst?.number || '—'}
                          </Typography>
                          {selectedVendor.documents?.gst?.document && (
                            <Button 
                              size="small" 
                              variant="outlined"
                              onClick={() => handleViewDocument(selectedVendor.documents.gst.document, 'GST Certificate')}
                              sx={{ borderRadius: 0, textTransform: 'uppercase', fontSize: '0.7rem' }}
                            >
                              View
                            </Button>
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                    {selectedVendor.documents?.fssai?.number && (
                      <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 0, border: '1px solid #EDE2D2', backgroundColor: '#FFFFFF' }}>
                          <Typography variant="subtitle2" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025' }} gutterBottom>
                            FSSAI / Handloom License
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                              {selectedVendor.documents?.fssai?.number}
                            </Typography>
                            {selectedVendor.documents?.fssai?.document && (
                              <Button 
                                size="small" 
                                variant="outlined"
                                onClick={() => handleViewDocument(selectedVendor.documents.fssai.document, 'FSSAI License')}
                                sx={{ borderRadius: 0, textTransform: 'uppercase', fontSize: '0.7rem' }}
                              >
                                View
                              </Button>
                            )}
                          </Box>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>

              {/* Bank Details Section */}
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#FAF7F2', borderRadius: 0, border: '1px solid #EDE2D2' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccountBalanceIcon sx={{ color: '#6D1734', mr: 2 }} />
                    <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#6D1734' }}>Settlement & Bank Details</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025' }} gutterBottom>
                        Bank Name
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#282321' }}>
                        {selectedVendor.bankDetails?.bankName || '—'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025' }} gutterBottom>
                        Account Number
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#282321', fontFamily: 'monospace' }}>
                        {selectedVendor.bankDetails?.accountNumber || '—'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025' }} gutterBottom>
                        IFSC Code
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#282321', fontFamily: 'monospace' }}>
                        {selectedVendor.bankDetails?.ifscCode || '—'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025' }} gutterBottom>
                        Account Holder Name
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#282321' }}>
                        {selectedVendor.bankDetails?.accountHolderName || '—'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Status Management Section */}
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#FAF7F2', borderRadius: 0, border: '1px solid #EDE2D2' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BusinessIcon sx={{ color: '#6D1734', mr: 2 }} />
                    <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#6D1734' }}>Account Control & Approvals</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ 
                        p: 2, 
                        border: '1px solid #EDE2D2', 
                        borderRadius: 0,
                        backgroundColor: 'white'
                      }}>
                        <Typography variant="subtitle2" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025' }} gutterBottom>
                          Vendor Status
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Chip
                            label={selectedVendor?.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                            color={selectedVendor?.status === 'active' ? 'success' : 'default'}
                            sx={{ borderRadius: 0, fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        </Box>
                        <Button
                          fullWidth
                          variant="contained"
                          color={selectedVendor?.status === 'active' ? 'error' : 'success'}
                          onClick={() => handleUpdateVendorStatus(selectedVendor?._id, selectedVendor?.status !== 'active')}
                          startIcon={selectedVendor?.status === 'active' ? 
                            <BlockIcon /> : 
                            <CheckCircleIcon />}
                          sx={{ borderRadius: 0, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}
                        >
                          {selectedVendor?.status === 'active' ? 
                            'Deactivate Artisan Account' : 
                            'Activate Artisan Account'}
                        </Button>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ 
                        p: 2, 
                        border: '1px solid #EDE2D2', 
                        borderRadius: 0,
                        backgroundColor: 'white'
                      }}>
                        <Typography variant="subtitle2" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025' }} gutterBottom>
                          Admin Verification
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Chip
                            label={selectedVendor?.adminApproval?.status === 'approved' ? 'APPROVED' : 
                                  selectedVendor?.adminApproval?.status === 'rejected' ? 'REJECTED' : 'PENDING'}
                            color={selectedVendor?.adminApproval?.status === 'approved' ? 'success' : 
                                  selectedVendor?.adminApproval?.status === 'rejected' ? 'error' : 'warning'}
                            sx={{ borderRadius: 0, fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        </Box>
                        <Button
                          fullWidth
                          variant="contained"
                          color={selectedVendor?.adminApproval?.status === 'approved' ? 'error' : 'success'}
                          onClick={() => handleUpdateStatus(selectedVendor?._id, 
                            selectedVendor?.adminApproval?.status === 'approved' ? 'rejected' : 'approved')}
                          startIcon={selectedVendor?.adminApproval?.status === 'approved' ? 
                            <BlockIcon /> : 
                            <CheckCircleIcon />}
                          sx={{ borderRadius: 0, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}
                        >
                          {selectedVendor?.adminApproval?.status === 'approved' ? 
                            'Revoke Artisan Approval' : 
                            'Approve Artisan'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: '#FAF7F2', borderTop: '1px solid #EDE2D2' }}>
          <Button 
            onClick={handleDeleteVendor}
            variant="contained"
            color="error"
            sx={{ 
              borderRadius: 0,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontSize: '0.75rem',
              px: 3,
              mr: 1,
            }}
          >
            Delete Artisan
          </Button>
          <Button 
            onClick={handleCloseDetails}
            variant="outlined"
            sx={{ 
              borderRadius: 0,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontSize: '0.75rem',
              borderColor: '#EDE2D2',
              color: '#6D1734',
              px: 3,
              '&:hover': { borderColor: '#6D1734', backgroundColor: '#FFFFFF' }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Vendors;