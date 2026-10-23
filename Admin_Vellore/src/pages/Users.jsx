import React, { useState, useEffect, memo, useMemo } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  TablePagination,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
// removed eye icon in favor of text button
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { PERMISSIONS, ACTIONS } from '../constants/permissions';
import usePermissions from '../hooks/usePermissions';
import { userApi } from '../api/userApi';
import { fetchOrders } from '../api/dashboardApi';
import { useSnackbar } from 'notistack';
import { UserAvatar } from '../components/UserAvatar';
import AdminPageHeader from '../components/common/AdminPageHeader';
import AdminTableToolbar from '../components/common/AdminTableToolbar';
import AdminTableEmptyState from '../components/common/AdminTableEmptyState';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');
  const [walletFilter, setWalletFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [orders, setOrders] = useState([]);
  const [selectedUserOrders, setSelectedUserOrders] = useState(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [walletSummary, setWalletSummary] = useState(null);

  const { enqueueSnackbar } = useSnackbar();
  const { canRead, canWrite, canDelete, isSuperAdmin } = usePermissions();
  const navigate = useNavigate();

  // Memoize the permission check
  const hasPermission = useMemo(() => {
    return canRead(PERMISSIONS.USERS) || isSuperAdmin;
  }, [canRead, isSuperAdmin]);

  const fetchUsersAndOrders = async () => {
    try {
      setLoading(true);
      const [usersResponse, ordersResponse] = await Promise.all([
        userApi.getAllUsers().catch(() => ({ success: false, users: [] })),
        fetchOrders().catch(() => ({ success: false, orders: [] }))
      ]);

      const rawOrders = Array.isArray(ordersResponse?.orders)
        ? ordersResponse.orders
        : Array.isArray(ordersResponse?.data)
        ? ordersResponse.data
        : Array.isArray(ordersResponse)
        ? ordersResponse
        : [];
      
      const rawUsers = Array.isArray(usersResponse?.users)
        ? usersResponse.users
        : Array.isArray(usersResponse?.data)
        ? usersResponse.data
        : Array.isArray(usersResponse)
        ? usersResponse
        : [];

      // Calculate delivered order count for each user
      const userOrderCount = {};
      rawOrders.forEach(order => {
        if (order?.user && order?.orderStatus === 'DELIVERED') {
          const userId = order.user._id || order.user;
          userOrderCount[userId] = (userOrderCount[userId] || 0) + 1;
        }
      });

      // Combine user data with their delivered order count
      const usersWithStats = rawUsers.map(user => ({
        ...user,
        orderCount: userOrderCount[user?._id] || 0
      }));

      setUsers(usersWithStats);
      setOrders(rawOrders);
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to fetch data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPermission) {
      fetchUsersAndOrders();
    } else {
      setLoading(false);
    }
  }, [hasPermission]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredUsers = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    return list.filter(user => {
      const q = (searchQuery || '').toLowerCase().trim();
      const matchesSearch = !q ||
        (user?.name || '').toLowerCase().includes(q) ||
        (user?.email || '').toLowerCase().includes(q) ||
        (user?.phone || user?.contact || '').toLowerCase().includes(q);

      const status = (user?.status || 'active').toLowerCase();
      const matchesStatus = statusFilter === 'all' || status === statusFilter.toLowerCase();

      const ordersCount = Number(user?.orderCount || 0);
      const matchesOrders =
        orderFilter === 'all' ||
        (orderFilter === 'hasOrders' && ordersCount > 0) ||
        (orderFilter === 'noOrders' && ordersCount === 0);

      const wallet = Number(user?.walletBalance || 0);
      const matchesWallet =
        walletFilter === 'all' ||
        (walletFilter === 'hasWallet' && wallet > 0) ||
        (walletFilter === 'zeroWallet' && wallet <= 0);

      return matchesSearch && matchesStatus && matchesOrders && matchesWallet;
    });
  }, [users, searchQuery, statusFilter, orderFilter, walletFilter]);

  const totalUsersCount = (users || []).length;
  const withOrdersCount = useMemo(() => (users || []).filter(u => (u?.orderCount || 0) > 0).length, [users]);
  const noOrdersCount = useMemo(() => (users || []).filter(u => !(u?.orderCount > 0)).length, [users]);
  const activeCount = useMemo(() => (users || []).filter(u => (u?.status || 'active').toLowerCase() === 'active').length, [users]);

  const handleEdit = (user) => {
    setEditUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      status: user.status || 'active'
    });
    setErrors({});
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditUser(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const phoneRegex = /^\+?[1-9]\d{9,11}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (editUser) {
        const response = await userApi.updateUser(editUser._id, formData);
        if (response.success) {
          enqueueSnackbar('User updated successfully', { variant: 'success' });
          fetchUsersAndOrders();
        }
      }
      handleClose();
    } catch (error) {
      enqueueSnackbar(error.message || 'Operation failed', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await userApi.deleteUser(id);
      if (response.success) {
        enqueueSnackbar('User deleted successfully', { variant: 'success' });
        fetchUsersAndOrders();
      }
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to delete user', { variant: 'error' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      [name]: undefined
    }));
  };

  const handleExportToExcel = () => {
    const exportData = (Array.isArray(users) ? users : []).map(user => ({
      'ID': user?._id || '',
      'Name': user?.name || '',
      'Email': user?.email || '',
      'Phone': user?.phone || '',
      'Status': user?.status || 'active',
      'Created At': user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
      'Orders Count': user?.orderCount || 0,
      'Wallet Balance': user?.walletBalance || 0
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, `users_list_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  };

  const handleViewUserOrders = (user) => {
    // Navigate to dedicated page instead of popup
    navigate(`/users/${user._id}`);
  };

  const handleCloseOrderDialog = () => {
    setOrderDialogOpen(false);
    setSelectedUserOrders(null);
    setWalletTransactions([]);
    setWalletSummary(null);
  };

  const getOrderStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'success';
      case 'PENDING':
      case 'ORDER PLACED':
        return 'warning';
      case 'DISPATCHED':
        return 'info';
      case 'CANCELLED':
      case 'CANCELED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getWalletStatusColor = (status) => {
    switch ((status || '').toString().toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
      case 'CANCELLED':
      case 'CANCELED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box className="admin-page-container">
      {(canRead(PERMISSIONS.USERS) || isSuperAdmin) ? (
        <>
          <AdminPageHeader
            title="Customer Accounts"
            subtitle="Manage customer profiles, order histories, and digital wallet balances"
            icon={PeopleIcon}
            badges={[
              { label: 'Total Customers', count: totalUsersCount },
              { label: 'With Orders', count: withOrdersCount, color: 'success' },
              { label: 'Active', count: activeCount, color: 'primary' }
            ]}
            onExport={canRead(PERMISSIONS.USERS) ? handleExportToExcel : undefined}
            exportLabel="Export to Excel"
          />

          <AdminTableToolbar
            searchPlaceholder="Search customers by name, email, or phone number..."
            searchQuery={searchQuery}
            onSearchChange={(val) => {
              setSearchQuery(val);
              setPage(0);
            }}
            filters={[
              {
                id: 'orders',
                label: 'Order Activity',
                value: orderFilter,
                onChange: (val) => {
                  setOrderFilter(val);
                  setPage(0);
                },
                options: [
                  { label: 'All Customers', value: 'all' },
                  { label: 'With Orders', value: 'hasOrders' },
                  { label: 'No Orders Yet', value: 'noOrders' }
                ]
              },
              {
                id: 'status',
                label: 'Account Status',
                value: statusFilter,
                onChange: (val) => {
                  setStatusFilter(val);
                  setPage(0);
                },
                options: [
                  { label: 'All Statuses', value: 'all' },
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' }
                ]
              },
              {
                id: 'wallet',
                label: 'Wallet Balance',
                value: walletFilter,
                onChange: (val) => {
                  setWalletFilter(val);
                  setPage(0);
                },
                options: [
                  { label: 'All Wallets', value: 'all' },
                  { label: 'Has Balance (> ₹0)', value: 'hasWallet' },
                  { label: 'Zero Balance', value: 'zeroWallet' }
                ]
              }
            ]}
            quickFilters={{
              selected: orderFilter,
              onChange: (val) => {
                setOrderFilter(val);
                setPage(0);
              },
              options: [
                { label: 'All Customers', value: 'all', count: totalUsersCount },
                { label: 'With Orders', value: 'hasOrders', count: withOrdersCount, color: 'success' },
                { label: 'No Orders', value: 'noOrders', count: noOrdersCount }
              ]
            }}
            totalCount={totalUsersCount}
            filteredCount={filteredUsers.length}
            onResetFilters={() => {
              setSearchQuery('');
              setOrderFilter('all');
              setStatusFilter('all');
              setWalletFilter('all');
              setPage(0);
            }}
          />

          <Paper className="admin-table-paper">
            <TableContainer>
              {loading ? (
                <Box sx={{ p: 5, textAlign: 'center' }}>
                  <CircularProgress sx={{ color: '#6D1734' }} />
                </Box>
              ) : (
                <Table>
                  <TableHead className="admin-table-head">
                    <TableRow>
                      <TableCell className="admin-table-th">Customer</TableCell>
                      <TableCell className="admin-table-th">Contact</TableCell>
                      <TableCell className="admin-table-th">Orders Placed</TableCell>
                      <TableCell className="admin-table-th">Wallet Balance</TableCell>
                      <TableCell className="admin-table-th">Registered Date</TableCell>
                      <TableCell className="admin-table-th" align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <AdminTableEmptyState
                        colSpan={6}
                        title="No customers found"
                        subtitle="No customers match your search or filter criteria."
                        onReset={() => {
                          setSearchQuery('');
                          setOrderFilter('all');
                          setStatusFilter('all');
                          setWalletFilter('all');
                          setPage(0);
                        }}
                      />
                    ) : (
                      filteredUsers
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((user) => (
                          <TableRow 
                            key={user._id}
                            className="admin-table-row"
                            hover
                          >
                            <TableCell className="admin-table-cell">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <UserAvatar user={user} />
                                <Box>
                                  <Typography 
                                    variant="subtitle2" 
                                    sx={{ 
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                      color: '#2C1810',
                                      '&:hover': {
                                        color: '#6D1734',
                                        textDecoration: 'underline'
                                      }
                                    }}
                                    onClick={() => handleViewUserOrders(user)}
                                  >
                                    {user.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {user.email}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell className="admin-table-cell font-number">
                              {user.contact || user.phone || '—'}
                            </TableCell>
                            <TableCell className="admin-table-cell">
                              <Chip
                                label={`${user.orderCount || 0} Orders`}
                                color={user.orderCount > 0 ? 'success' : 'default'}
                                size="small"
                                className="font-number"
                                sx={{
                                  fontWeight: 600,
                                  ...(user.orderCount > 0 ? {
                                    backgroundColor: '#e6f4ea',
                                    color: '#1e4620',
                                    border: '1px solid #b7e1cd'
                                  } : {})
                                }}
                              />
                            </TableCell>
                            <TableCell className="admin-table-cell font-number" sx={{ fontWeight: 600, color: '#2C1810' }}>
                              ₹{new Intl.NumberFormat('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              }).format(user.walletBalance || 0)}
                            </TableCell>
                            <TableCell className="admin-table-cell font-number" sx={{ color: '#666' }}>
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : '—'}
                            </TableCell>
                            <TableCell className="admin-table-cell" align="right">
                              <Button
                                onClick={() => handleViewUserOrders(user)}
                                variant="outlined"
                                size="small"
                                disabled={!canRead(PERMISSIONS.USERS)}
                                sx={{ 
                                  mr: 1,
                                  borderColor: '#EDE2D2',
                                  color: '#6D1734',
                                  '&:hover': {
                                    borderColor: '#6D1734',
                                    bgcolor: 'rgba(109, 23, 52, 0.04)'
                                  }
                                }}
                              >
                                View Details
                              </Button>
                              <IconButton 
                                onClick={() => handleEdit(user)} 
                                color="primary" 
                                size="small"
                                disabled={!canWrite(PERMISSIONS.USERS)}
                                sx={{ color: '#6D1734' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                onClick={() => handleDelete(user._id)} 
                                color="error" 
                                size="small"
                                disabled={!canDelete(PERMISSIONS.USERS)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
            <TablePagination
              component="div"
              className="admin-pagination font-number"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </Paper>

          <Dialog 
            open={open} 
            onClose={handleClose} 
            maxWidth="sm" 
            fullWidth
            aria-labelledby="user-dialog-title"
          >
            <DialogTitle id="user-dialog-title">
              {editUser ? 'Edit User' : 'Add User'}
            </DialogTitle>
            <DialogContent>
              <Box component="form" sx={{ pt: 2 }}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  margin="normal"
                  required
                  error={!!errors.name}
                  helperText={errors.name}
                />

                <TextField
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
                />

                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  margin="normal"
                  error={!!errors.phone}
                  helperText={errors.phone}
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
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSubmit} variant="contained">
                {editUser ? 'Update User' : 'Add User'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={orderDialogOpen}
            onClose={handleCloseOrderDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <UserAvatar user={selectedUserOrders?.user} />
                <Box>
                  <Typography variant="h6">
                    {selectedUserOrders?.user?.name}'s Orders
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUserOrders?.user?.email}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              {selectedUserOrders?.orders.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                  No orders found for this user
                  </Typography>
                  ) : (
                    <List>
                      {selectedUserOrders?.orders.map((order, index) => (
                        <React.Fragment key={order._id}>
                          {index > 0 && <Divider />}
                          <ListItem alignItems="flex-start">
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="subtitle1">
                                    Order #{order._id}
                                  </Typography>
                                  <Chip 
                                    label={order.orderStatus}
                                    color={getOrderStatusColor(order.orderStatus)}
                                    size="small"
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.primary">
                                    Amount: ₹{new Intl.NumberFormat('en-IN', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    }).format(order.finalAmount || 0)}
                                  </Typography>
                                  <Typography variant="body2">
                                    Date: {new Date(order.createdAt).toLocaleDateString()}
                                  </Typography>
                                  <Typography variant="body2">
                                    Items: {order.items?.length || 0}
                                  </Typography>
                                  {order.shippingAddress && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                      Shipping: {order.shippingAddress.address}, 
                                      {order.shippingAddress.city}, 
                                      {order.shippingAddress.state} - 
                                      {order.shippingAddress.pincode}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        </React.Fragment>
                      ))}
                    </List>
                  )}
            </DialogContent>
            <Divider />
            <DialogTitle>
              Wallet Transactions
            </DialogTitle>
            <DialogContent>
              {walletLoading ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              ) : walletTransactions.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                  No wallet transactions found for this user
                </Typography>
              ) : (
                <Box>
                  {walletSummary && (
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                      <Chip label={`Total Credit: ₹${new Intl.NumberFormat('en-IN').format(walletSummary.totalCredit || 0)}`} color="success" variant="outlined" />
                      <Chip label={`Total Debit: ₹${new Intl.NumberFormat('en-IN').format(walletSummary.totalDebit || 0)}`} color="error" variant="outlined" />
                      <Chip label={`Net: ₹${new Intl.NumberFormat('en-IN').format(walletSummary.netAmount || 0)}`} color={(walletSummary.netAmount || 0) >= 0 ? 'success' : 'error'} />
                      <Chip label={`Completed: ${walletSummary.completedTransactions || 0}`} variant="outlined" />
                    </Box>
                  )}
                  <List>
                    {walletTransactions.map((tx, index) => {
                      const isCredit = (tx.type || '').toString().toLowerCase() === 'credit';
                      const amountLabel = `${isCredit ? '+' : '-'}₹${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(tx.amount || 0)}`;
                      return (
                        <React.Fragment key={tx._id || index}>
                          {index > 0 && <Divider />}
                          <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip label={(tx.type || 'TRANSACTION').toString().toUpperCase()} size="small" variant="outlined" />
                                    <Chip label={(tx.status || 'UNKNOWN').toString().toUpperCase()} color={getWalletStatusColor(tx.status)} size="small" />
                                  </Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: isCredit ? 'success.main' : 'error.main' }}>
                                    {amountLabel}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                                  <Box>
                                    <Typography variant="body2" color="text.primary">
                                      {tx.description || tx.note || '—'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '-'}
                                    </Typography>
                                  </Box>
                                  {tx.balanceAfter != null && (
                                    <Typography variant="body2" color="text.secondary">
                                      Balance After: ₹{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(tx.balanceAfter)}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        </React.Fragment>
                      );
                    })}
                  </List>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseOrderDialog}>Close</Button>
            </DialogActions>
          </Dialog>
        </>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            You don't have permission to view this page
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default memo(Users); 