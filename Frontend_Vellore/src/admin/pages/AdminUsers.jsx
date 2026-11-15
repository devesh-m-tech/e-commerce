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
  Avatar,
  Chip,
  InputAdornment,
  TablePagination,
  Tooltip,
  Checkbox,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import * as XLSX from 'xlsx';
import { PERMISSIONS, ACTIONS } from '../constants/permissions';
import usePermissions from '../hooks/usePermissions';
import { adminApi } from '../api/adminApi';
import { useSnackbar } from 'notistack';
import { getInitials } from '../utils/stringUtils';
import { getAvatarColor } from '../utils/colorUtils';
import { UserAvatar } from '../components/UserAvatar';
import AdminPageHeader from '../components/common/AdminPageHeader';
import AdminTableToolbar from '../components/common/AdminTableToolbar';
import AdminTableEmptyState from '../components/common/AdminTableEmptyState';

const AdminUsers = () => {
  const [adminUsers, setAdminUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);

  const { canRead, canWrite, canDelete, isSuperAdmin } = usePermissions();

  // Memoize permission check to prevent unnecessary re-renders
  const hasPermission = useMemo(() => {
    return canRead(PERMISSIONS.ADMIN_USERS) || isSuperAdmin;
  }, [canRead, isSuperAdmin]);

  // Memoize fetchAdminUsers function to prevent unnecessary re-renders
  const fetchAdminUsers = useCallback(async () => {
    if (!hasPermission) {
      enqueueSnackbar('You do not have permission to view admin users', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);
      const response = await adminApi.getAllAdmins();
      const rawAdmins = Array.isArray(response?.admins)
        ? response.admins
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setAdminUsers(rawAdmins);
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to fetch admin users', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [hasPermission, enqueueSnackbar]);

  // Only fetch admin users when permission changes
  useEffect(() => {
    if (hasPermission) {
      fetchAdminUsers();
    } else {
      setLoading(false);
    }
  }, [hasPermission, fetchAdminUsers]);

  // Memoize filtered users to prevent unnecessary recalculations
  const filteredUsers = useMemo(() => {
    const list = Array.isArray(adminUsers) ? adminUsers : [];
    const query = (searchQuery || '').toLowerCase().trim();
    return list.filter(user => {
      const matchesSearch = !query ||
        (user?.name || '').toLowerCase().includes(query) ||
        (user?.email || '').toLowerCase().includes(query) ||
        (user?.role || '').toLowerCase().includes(query);

      const matchesRole = roleFilter === 'all' || (user?.role || '').toLowerCase() === roleFilter.toLowerCase();
      const matchesStatus = statusFilter === 'all' || (user?.status || 'active').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [adminUsers, searchQuery, roleFilter, statusFilter]);

  const totalAdminCount = (adminUsers || []).length;
  const activeCount = useMemo(() => (adminUsers || []).filter(u => (u?.status || 'active').toLowerCase() === 'active').length, [adminUsers]);
  const superAdminCount = useMemo(() => (adminUsers || []).filter(u => u?.role === 'super_admin').length, [adminUsers]);
  const adminRoleCount = useMemo(() => (adminUsers || []).filter(u => u?.role === 'admin').length, [adminUsers]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleAdd = useCallback(() => {
    if (!canWrite(PERMISSIONS.ADMIN_USERS) && !isSuperAdmin) {
      enqueueSnackbar('You do not have permission to add admin users', { variant: 'error' });
      return;
    }

    setEditUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'admin',
      status: 'active'
    });
    setErrors({});
    setOpen(true);
  }, [canWrite, isSuperAdmin, enqueueSnackbar]);

  const handleEdit = useCallback((user) => {
    if (!canWrite(PERMISSIONS.ADMIN_USERS) && !isSuperAdmin) {
      enqueueSnackbar('You do not have permission to edit admin users', { variant: 'error' });
      return;
    }

    setEditUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      confirmPassword: '',
      role: user.role || 'admin',
      status: user.status || 'active'
    });
    setErrors({});
    setOpen(true);
  }, [canWrite, isSuperAdmin, enqueueSnackbar]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditUser(null);
    setErrors({});
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (!editUser && adminUsers.some(user => user.email === formData.email)) {
      newErrors.email = 'Email already exists';
    }

    if (!editUser) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, editUser, adminUsers]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!canWrite(PERMISSIONS.ADMIN_USERS) && !isSuperAdmin) {
      enqueueSnackbar('You do not have permission to perform this action', { variant: 'error' });
      return;
    }

    const { confirmPassword, ...userData } = formData;

    try {
      if (editUser) {
        const response = await adminApi.updateAdmin(editUser._id, userData);
        if (response.success) {
          enqueueSnackbar('Admin updated successfully', { variant: 'success' });
          fetchAdminUsers();
        }
      } else {
        const response = await adminApi.createAdmin(userData);
        if (response.success) {
          enqueueSnackbar('Admin created successfully', { variant: 'success' });
          fetchAdminUsers();
        }
      }
      handleClose();
    } catch (error) {
      enqueueSnackbar(error.message || 'Operation failed', { variant: 'error' });
    }
  }, [validateForm, canWrite, isSuperAdmin, formData, editUser, enqueueSnackbar, fetchAdminUsers, handleClose]);

  const handleDelete = useCallback(async (id) => {
    if (!canDelete(PERMISSIONS.ADMIN_USERS) && !isSuperAdmin) {
      enqueueSnackbar('You do not have permission to delete admin users', { variant: 'error' });
      return;
    }

    try {
      const user = adminUsers.find(u => u._id === id);
      const superAdmins = adminUsers.filter(u => u.role === 'super_admin');
      if (user.role === 'super_admin' && superAdmins.length === 1) {
        enqueueSnackbar('Cannot delete the last super admin', { variant: 'error' });
        return;
      }

      const response = await adminApi.deleteAdmin(id);
      if (response.success) {
        enqueueSnackbar('Admin deleted successfully', { variant: 'success' });
        fetchAdminUsers();
      }
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to delete admin', { variant: 'error' });
    }
  }, [canDelete, isSuperAdmin, adminUsers, enqueueSnackbar, fetchAdminUsers]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      [name]: undefined
    }));
  }, []);

  // Memoize role color function
  const getRoleColor = useCallback((role) => {
    switch (role) {
      case 'super_admin':
        return 'error';
      case 'admin':
        return 'primary';
      case 'sales_staff':
        return 'info';
      case 'inventory_staff':
        return 'warning';
      case 'exchange_staff':
        return 'secondary';
      default:
        return 'default';
    }
  }, []);

  const handleSavePermissions = useCallback(async (permissions) => {
    if (!selectedUser || selectedUser.role === 'super_admin') return;
    
    if (!canWrite(PERMISSIONS.ADMIN_USERS) && !isSuperAdmin) {
      enqueueSnackbar('You do not have permission to update permissions', { variant: 'error' });
      return;
    }

    try {
      // Format permissions as a plain object
      const formattedPermissions = {};
      Object.entries(permissions).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          formattedPermissions[key] = value;
        }
      });

      const response = await adminApi.updateAdmin(selectedUser._id, {
        ...selectedUser,
        permissions: formattedPermissions
      });

      if (response.success) {
        enqueueSnackbar('Permissions updated successfully', { variant: 'success' });
        fetchAdminUsers(); // Refresh the list
        
        // Update currentUser if needed
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser._id === selectedUser._id) {
          localStorage.setItem('currentUser', JSON.stringify({
            ...currentUser,
            permissions: formattedPermissions
          }));
        }
      }
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to update permissions', { variant: 'error' });
    }
    
    setPermissionDialogOpen(false);
  }, [selectedUser, canWrite, isSuperAdmin, enqueueSnackbar, fetchAdminUsers]);

  // Memoize export function
  const handleExportToExcel = useCallback(() => {
    if (!canRead(PERMISSIONS.ADMIN_USERS) && !isSuperAdmin) {
      enqueueSnackbar('You do not have permission to export admin users', { variant: 'error' });
      return;
    }

    // Prepare the data for export
    const exportData = (Array.isArray(adminUsers) ? adminUsers : []).map(user => ({
      'ID': user?._id || '',
      'Name': user?.name || '',
      'Email': user?.email || '',
      'Role': (user?.role || 'admin').split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      'Status': user?.status || 'active',
      'Created At': user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
      'Permissions': Object.entries(user?.permissions || {})
        .map(([module, actions]) => `${module}: ${(Array.isArray(actions) ? actions : []).join(', ')}`)
        .join(' | ')
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Admin Users');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `admin_users_list_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  }, [adminUsers, canRead, isSuperAdmin, enqueueSnackbar]);

  // Early return if no permission
  if (!hasPermission) {
    return (
      <Box>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            borderRadius: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <SecurityIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '0.5px' }}>
                Admin Users
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5, opacity: 0.8 }}>
                Manage administrator accounts and permissions
              </Typography>
            </Box>
          </Box>
        </Paper>
        <Alert severity="error" sx={{ mb: 2 }}>
          You do not have permission to view admin users.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="admin-page-container">
      <AdminPageHeader
        title="Admin Users & Access"
        subtitle="Manage administrator accounts, security roles, and granular module permissions"
        icon={AdminPanelSettingsIcon}
        badges={[
          { label: 'Total Admins', count: totalAdminCount },
          { label: 'Super Admins', count: superAdminCount, color: 'error' },
          { label: 'Admins', count: adminRoleCount, color: 'primary' },
          { label: 'Active', count: activeCount, color: 'success' }
        ]}
        onExport={canRead(PERMISSIONS.ADMIN_USERS) ? handleExportToExcel : undefined}
        exportLabel="Export to Excel"
        onPrimaryAction={canWrite(PERMISSIONS.ADMIN_USERS) ? handleAdd : undefined}
        primaryActionLabel="Add Admin User"
        primaryActionIcon={AddIcon}
      />

      <AdminTableToolbar
        searchPlaceholder="Search admin users by name, email, or role..."
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPage(0);
        }}
        filters={[
          {
            id: 'role',
            label: 'Role',
            value: roleFilter,
            onChange: (val) => {
              setRoleFilter(val);
              setPage(0);
            },
            options: [
              { label: 'All Roles', value: 'all' },
              { label: 'Super Admin', value: 'super_admin' },
              { label: 'Admin', value: 'admin' },
              { label: 'Inventory Staff', value: 'inventory_staff' },
              { label: 'Sales Staff', value: 'sales_staff' },
              { label: 'Exchange Staff', value: 'exchange_staff' }
            ]
          },
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
              { label: 'Inactive', value: 'inactive' }
            ]
          }
        ]}
        quickFilters={{
          selected: roleFilter,
          onChange: (val) => {
            setRoleFilter(val);
            setPage(0);
          },
          options: [
            { label: 'All', value: 'all', count: totalAdminCount },
            { label: 'Super Admin', value: 'super_admin', count: superAdminCount, color: 'error' },
            { label: 'Admin', value: 'admin', count: adminRoleCount, color: 'primary' }
          ]
        }}
        totalCount={totalAdminCount}
        filteredCount={filteredUsers.length}
        onResetFilters={() => {
          setSearchQuery('');
          setRoleFilter('all');
          setStatusFilter('all');
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
                  <TableCell className="admin-table-th">Admin User</TableCell>
                  <TableCell className="admin-table-th">Role</TableCell>
                  <TableCell className="admin-table-th">Status</TableCell>
                  <TableCell className="admin-table-th">Created At</TableCell>
                  <TableCell className="admin-table-th">Permissions</TableCell>
                  <TableCell className="admin-table-th" align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <AdminTableEmptyState
                    colSpan={6}
                    title="No admin users found"
                    subtitle="No admin users match your search or filter criteria."
                    onReset={() => {
                      setSearchQuery('');
                      setRoleFilter('all');
                      setStatusFilter('all');
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
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2C1810' }}>
                                {user.name}
                                {user.role === 'super_admin' && (
                                  <Tooltip title="Super Admin has full access to all features">
                                    <LockIcon 
                                      sx={{ 
                                        ml: 1, 
                                        fontSize: 16, 
                                        color: '#B23B3B',
                                        verticalAlign: 'middle'
                                      }} 
                                    />
                                  </Tooltip>
                                )}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell className="admin-table-cell">
                          <Chip
                            label={(user?.role || 'admin').split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                            color={getRoleColor(user?.role || 'admin')}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell className="admin-table-cell">
                          <Chip
                            label={user.status ? (user.status.charAt(0).toUpperCase() + user.status.slice(1)) : 'Active'}
                            color={user.status === 'active' ? 'success' : 'error'}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              ...(user.status === 'active' ? {
                                backgroundColor: '#e6f4ea',
                                color: '#1e4620',
                                border: '1px solid #b7e1cd'
                              } : {})
                            }}
                          />
                        </TableCell>
                        <TableCell className="admin-table-cell font-number" sx={{ color: '#666' }}>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : '—'}
                        </TableCell>
                        <TableCell className="admin-table-cell">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setSelectedUser(user);
                              setPermissionDialogOpen(true);
                            }}
                            disabled={!canWrite(PERMISSIONS.ADMIN_USERS)}
                            sx={{
                              borderColor: '#EDE2D2',
                              color: '#6D1734',
                              '&:hover': {
                                borderColor: '#6D1734',
                                bgcolor: 'rgba(109, 23, 52, 0.04)'
                              }
                            }}
                          >
                            Manage Permissions
                          </Button>
                        </TableCell>
                        <TableCell className="admin-table-cell" align="right">
                          <IconButton 
                            onClick={() => handleEdit(user)} 
                            color="primary" 
                            size="small"
                            disabled={!canWrite(PERMISSIONS.ADMIN_USERS)}
                            sx={{ color: '#6D1734' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDelete(user._id)} 
                            color="error" 
                            size="small"
                            disabled={
                              (user.role === 'super_admin' && 
                               adminUsers.filter(u => u.role === 'super_admin').length === 1) ||
                              !canDelete(PERMISSIONS.ADMIN_USERS)
                            }
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
        aria-labelledby="admin-dialog-title"
        disablePortal
      >
        <DialogTitle id="admin-dialog-title">
          {loading ? <CircularProgress size={24} /> : (editUser ? 'Edit Admin User' : 'Add Admin User')}
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
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required={!editUser}
              error={!!errors.password}
              helperText={editUser ? 'Leave blank to keep current password' : errors.password}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required={!editUser}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Role"
              >
                <MenuItem value="super_admin">Super Admin (Owner)</MenuItem>
                <MenuItem value="admin">Store Admin</MenuItem>
                <MenuItem value="sales_staff">Sales Staff</MenuItem>
                <MenuItem value="inventory_staff">Inventory Staff</MenuItem>
                <MenuItem value="exchange_staff">Exchange Staff</MenuItem>
              </Select>
            </FormControl>

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

      <PermissionDialog
        open={permissionDialogOpen}
        onClose={() => setPermissionDialogOpen(false)}
        user={selectedUser}
        onSave={handleSavePermissions}
      />
    </Box>
  );
};

const PermissionDialog = ({ open, onClose, user, onSave }) => {
  const [permissions, setPermissions] = useState(() => {
    if (user?.role === 'super_admin') {
      return Object.values(PERMISSIONS).reduce((acc, key) => ({
        ...acc,
        [key]: [ACTIONS.READ, ACTIONS.WRITE, ACTIONS.DELETE]
      }), {});
    }
    // Convert permissions to plain object if needed
    return user?.permissions || {};
  });

  useEffect(() => {
    if (user) {
      if (user.role === 'super_admin') {
        setPermissions(Object.values(PERMISSIONS).reduce((acc, key) => ({
          ...acc,
          [key]: [ACTIONS.READ, ACTIONS.WRITE, ACTIONS.DELETE]
        }), {}));
      } else {
        setPermissions(user.permissions || {});
      }
    }
  }, [user]);

  const handlePermissionChange = (module, action) => {
    if (user?.role === 'super_admin') return;

    setPermissions(prev => {
      const newPermissions = { ...prev };
      
      if (!Array.isArray(newPermissions[module])) {
        newPermissions[module] = [];
      }

      if (action === ACTIONS.READ) {
        if (newPermissions[module].includes(ACTIONS.READ)) {
          newPermissions[module] = [];
        } else {
          newPermissions[module] = [ACTIONS.READ];
        }
      } else {
        if (newPermissions[module].includes(action)) {
          newPermissions[module] = newPermissions[module].filter(a => a !== action);
        } else {
          if (!newPermissions[module].includes(ACTIONS.READ)) {
            newPermissions[module] = [ACTIONS.READ, action];
          } else {
            newPermissions[module] = [...newPermissions[module], action];
          }
        }
      }

      return newPermissions;
    });
  };

  const handleSave = () => {
    // Convert permissions to the correct format before saving
    const formattedPermissions = Object.entries(permissions).reduce((acc, [key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    onSave(formattedPermissions);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      aria-labelledby="permissions-dialog-title"
      keepMounted // Add this to help with focus management
    >
      <DialogTitle id="permissions-dialog-title" sx={{ 
        pb: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}>
        <SecurityIcon color="primary" />
        <Box>
          Manage Permissions - {user?.name}
          {user?.role === 'super_admin' && (
            <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
              Super Admin has full access to all features and cannot be modified
            </Typography>
          )}
          {user?.role !== 'super_admin' && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Configure access rights for different modules
            </Typography>
          )}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Module</TableCell>
                <TableCell align="center">Read</TableCell>
                <TableCell align="center">Write</TableCell>
                <TableCell align="center">Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.values(PERMISSIONS).map((module) => (
                <TableRow key={module}>
                  <TableCell>{module}</TableCell>
                  {Object.values(ACTIONS).map((action) => (
                    <TableCell key={action} align="center">
                      <Checkbox
                        checked={
                          user?.role === 'super_admin' || 
                          permissions[module]?.includes(action) || 
                          false
                        }
                        onChange={() => handlePermissionChange(module, action)}
                        disabled={
                          user?.role === 'super_admin' || 
                          (action !== ACTIONS.READ && !permissions[module]?.includes(ACTIONS.READ))
                        }
                        color={user?.role === 'super_admin' ? 'error' : 'primary'}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={user?.role === 'super_admin'}
        >
          Save Permissions
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminUsers; 