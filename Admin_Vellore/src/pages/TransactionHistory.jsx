import { useState, useEffect, useCallback, useMemo } from 'react';
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
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
  Pagination,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import * as XLSX from 'xlsx';
import { userApi } from '../api/userApi';
import { PERMISSIONS, ACTIONS } from '../constants/permissions';
import usePermissions from '../hooks/usePermissions';

const TransactionHistory = () => {
  const { canRead, canWrite, canDelete, isSuperAdmin } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTransactions: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  });
  const [summary, setSummary] = useState({
    totalCredit: 0,
    totalDebit: 0,
    netAmount: 0,
    totalTransactions: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0
  });
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    userId: '',
    type: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  // Memoize permission check to prevent unnecessary re-renders
  const hasPermission = useMemo(() => {
    return canRead(PERMISSIONS.TRANSACTION_HISTORY) || isSuperAdmin;
  }, [canRead, isSuperAdmin]);

  // Memoize fetchTransactions function to prevent unnecessary re-renders
  const fetchTransactions = useCallback(async () => {
    if (!hasPermission) {
      setError('You do not have permission to view transaction history');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await userApi.getAllUsersTransactions(filters);
      const data = response?.data || response || {};
      const txList = Array.isArray(data.transactions)
        ? data.transactions
        : Array.isArray(response?.transactions)
        ? response.transactions
        : Array.isArray(response)
        ? response
        : [];
      setTransactions(txList);
      if (data.pagination) setPagination(prev => ({ ...prev, ...data.pagination }));
      if (data.summary) setSummary(prev => ({ ...prev, ...data.summary }));
    } catch (err) {
      setError(err.message || 'Failed to fetch transaction history');
    } finally {
      setLoading(false);
    }
  }, [filters, hasPermission]);

  // Only fetch transactions when filters change or permission changes
  useEffect(() => {
    if (hasPermission) {
      fetchTransactions();
    }
  }, [hasPermission, fetchTransactions]);

  // Memoize filter change handler
  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field !== 'page' ? 1 : value // Reset to page 1 when changing other filters
    }));
  }, []);

  // Memoize page change handler
  const handlePageChange = useCallback((event, newPage) => {
    handleFilterChange('page', newPage);
  }, [handleFilterChange]);

  // Memoize export function
  const handleExportToExcel = useCallback(() => {
    // Prepare the data for export
    const safeTx = Array.isArray(transactions) ? transactions : [];
    const exportData = safeTx.map(transaction => ({
      'Transaction ID': transaction?._id || 'N/A',
      'User Name': transaction?.userId?.name || 'N/A',
      'User Email': transaction?.userId?.email || 'N/A',
      'User Contact': transaction?.userId?.contact || 'N/A',
      'Amount': transaction?.amount || 0,
      'Type': (transaction?.type || 'credit').toUpperCase(),
      'Description': transaction?.description || '',
      'Status': (transaction?.status || 'completed').toUpperCase(),
      'Date': transaction?.createdAt ? new Date(transaction.createdAt).toLocaleString() : 'N/A'
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transaction History');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `transaction_history_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  }, [transactions]);

  // Memoize clear filters function
  const clearFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
      userId: '',
      type: '',
      status: '',
      startDate: '',
      endDate: ''
    });
  }, []);

  // Memoize status and type color functions
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  }, []);

  const getTypeColor = useCallback((type) => {
    switch (type) {
      case 'credit':
        return 'success';
      case 'debit':
        return 'error';
      default:
        return 'default';
    }
  }, []);

  // Early return if no permission
  if (!hasPermission) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Transaction History</Typography>
        </Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          You do not have permission to view transaction history.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
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
            Ledger & Transaction History
          </Typography>
          <Typography variant="body2" sx={{ color: '#7D7571' }}>
            Comprehensive audit of customer wallet balances, order payments, and debit adjustments
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleExportToExcel}
            startIcon={<FileDownloadIcon />}
            disabled={!Array.isArray(transactions) || transactions.length === 0}
            sx={{
              borderRadius: 0,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontSize: '0.78rem',
              borderColor: '#EDE2D2',
              color: '#6D1734',
              '&:hover': { borderColor: '#6D1734', backgroundColor: '#FAF7F2' }
            }}
          >
            Export to Excel
          </Button>
          <Button
            variant="outlined"
            onClick={fetchTransactions}
            startIcon={<RefreshIcon />}
            disabled={loading}
            sx={{
              borderRadius: 0,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontSize: '0.78rem',
              borderColor: '#EDE2D2',
              color: '#6D1734',
              '&:hover': { borderColor: '#6D1734', backgroundColor: '#FAF7F2' }
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 0, border: '1px solid #EDE2D2', boxShadow: 'none', backgroundColor: '#FAF7F2' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ color: '#7D7571', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }} gutterBottom>
                Total Credit
              </Typography>
              <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: '#2e7d32' }}>
                ₹{(summary?.totalCredit ?? 0).toLocaleString('en-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 0, border: '1px solid #EDE2D2', boxShadow: 'none', backgroundColor: '#FAF7F2' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ color: '#7D7571', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }} gutterBottom>
                Total Debit
              </Typography>
              <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: '#d32f2f' }}>
                ₹{(summary?.totalDebit ?? 0).toLocaleString('en-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 0, border: '1px solid #EDE2D2', boxShadow: 'none', backgroundColor: '#FAF7F2' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ color: '#7D7571', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }} gutterBottom>
                Net Balance
              </Typography>
              <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: (summary?.netAmount ?? 0) >= 0 ? "#2e7d32" : "#d32f2f" }}>
                ₹{(summary?.netAmount ?? 0).toLocaleString('en-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 0, border: '1px solid #EDE2D2', boxShadow: 'none', backgroundColor: '#FAF7F2' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ color: '#7D7571', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }} gutterBottom>
                Total Transactions
              </Typography>
              <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: '#6D1734' }}>
                {(summary?.totalTransactions ?? 0).toLocaleString('en-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 0, border: '1px solid #EDE2D2', backgroundColor: '#FAF7F2' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1, color: '#6D1734' }} />
          <Typography variant="subtitle1" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, color: '#6D1734' }}>
            Filter Transactions
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="User ID"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              size="small"
              sx={{ backgroundColor: '#FFFFFF' }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" sx={{ backgroundColor: '#FFFFFF' }}>
              <InputLabel>Transaction Type</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                label="Transaction Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="credit">Credit</MenuItem>
                <MenuItem value="debit">Debit</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" sx={{ backgroundColor: '#FFFFFF' }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" sx={{ backgroundColor: '#FFFFFF' }}>
              <InputLabel>Items per page</InputLabel>
              <Select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', e.target.value)}
                label="Items per page"
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ backgroundColor: '#FFFFFF' }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ backgroundColor: '#FFFFFF' }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              onClick={clearFilters}
              fullWidth
              sx={{
                borderRadius: 0,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '0.78rem',
                borderColor: '#EDE2D2',
                color: '#6D1734',
                height: 40,
                '&:hover': { borderColor: '#6D1734', backgroundColor: '#FAF7F2' }
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      {/* Transactions Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 0, border: '1px solid #EDE2D2', boxShadow: 'none' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#FAF7F2' }}>
            <TableRow>
              <TableCell sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025', borderBottom: '1px solid #EDE2D2' }}>Transaction ID</TableCell>
              <TableCell sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025', borderBottom: '1px solid #EDE2D2' }}>User Details</TableCell>
              <TableCell sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025', borderBottom: '1px solid #EDE2D2' }}>Amount</TableCell>
              <TableCell sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025', borderBottom: '1px solid #EDE2D2' }}>Type</TableCell>
              <TableCell sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025', borderBottom: '1px solid #EDE2D2' }}>Description</TableCell>
              <TableCell sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025', borderBottom: '1px solid #EDE2D2' }}>Status</TableCell>
              <TableCell sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025', borderBottom: '1px solid #EDE2D2' }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (!Array.isArray(transactions) || transactions.length === 0) ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No transactions found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              (Array.isArray(transactions) ? transactions : []).map((transaction) => (
                <TableRow key={transaction?._id || Math.random()}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {transaction?._id ? transaction._id.slice(-8) : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {transaction?.userId?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {transaction?.userId?.email || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {transaction?.userId?.contact || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      ₹{(transaction?.amount ?? 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={(transaction?.type || 'credit').toUpperCase()}
                      color={getTypeColor(transaction?.type)}
                      size="small"
                      sx={{ borderRadius: 0, fontWeight: 600, fontSize: '0.7rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, color: '#282321' }}>
                      {transaction.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.status.toUpperCase()}
                      color={getStatusColor(transaction.status)}
                      size="small"
                      sx={{ borderRadius: 0, fontWeight: 600, fontSize: '0.7rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(transaction.createdAt).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Pagination Info */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
          {Math.min(pagination.currentPage * pagination.limit, pagination.totalTransactions)} of{' '}
          {pagination.totalTransactions} transactions
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Page {pagination.currentPage} of {pagination.totalPages}
        </Typography>
      </Box>
    </Box>
  );
};

export default TransactionHistory; 