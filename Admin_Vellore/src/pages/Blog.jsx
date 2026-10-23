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
  CircularProgress,
  InputAdornment,
  TablePagination,
  Tooltip,
  Avatar,
} from '@mui/material';
import { Edit, Delete, Add, Search } from '@mui/icons-material';
import ArticleIcon from '@mui/icons-material/Article';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createBlog, getAllBlogs, updateBlog, deleteBlog } from '../api/blogApi';
import AdminPageHeader from '../components/common/AdminPageHeader';
import AdminTableToolbar from '../components/common/AdminTableToolbar';
import AdminTableEmptyState from '../components/common/AdminTableEmptyState';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    canonicalUrl: '',
    metaKeywords: '',
    metaTitle: '',
    metaDescription: '',
    image: null,
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await getAllBlogs();
      const rawBlogs = Array.isArray(data?.blogs)
        ? data.blogs
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setBlogs(rawBlogs);
    } catch (error) {
      toast.error(error.message || 'Error fetching blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      if (file) {
        setFormData({ ...formData, image: file });
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleOpen = (blog = null) => {
    if (blog) {
      setFormData({
        title: blog.title,
        description: blog.description,
        canonicalUrl: blog.canonicalUrl,
        metaKeywords: blog.metaKeywords || '',
        metaTitle: blog.metaTitle || '',
        metaDescription: blog.metaDescription || '',
        image: null,
      });
      setPreviewUrl(blog.image);
      setSelectedBlog(blog);
    } else {
      setFormData({
        title: '',
        description: '',
        canonicalUrl: '',
        metaKeywords: '',
        metaTitle: '',
        metaDescription: '',
        image: null,
      });
      setPreviewUrl('');
      setSelectedBlog(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      title: '',
      description: '',
      canonicalUrl: '',
      metaKeywords: '',
      metaTitle: '',
      metaDescription: '',
      image: null,
    });
    setPreviewUrl('');
    setSelectedBlog(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.canonicalUrl) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!selectedBlog && !formData.image) {
      toast.error('Please upload an image');
      return;
    }

    try {
      setIsUploading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('canonicalUrl', formData.canonicalUrl);
      formDataToSend.append('metaKeywords', formData.metaKeywords);
      formDataToSend.append('metaTitle', formData.metaTitle);
      formDataToSend.append('metaDescription', formData.metaDescription);

      if (formData.image && formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
      }

      if (selectedBlog) {
        const response = await updateBlog(selectedBlog._id, formDataToSend);
        toast.success(response.message || 'Blog updated successfully');
      } else {
        const response = await createBlog(formDataToSend);
        toast.success(response.message || 'Blog created successfully');
      }

      handleClose();
      await fetchBlogs();
    } catch (error) {
      toast.error(error.message || 'Error saving blog');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = (blog) => {
    setSelectedBlog(blog);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await deleteBlog(selectedBlog._id);
      toast.success(response.message || 'Blog deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedBlog(null);
      fetchBlogs();
    } catch (error) {
      toast.error(error.message || 'Error deleting blog');
    }
  };

  const safeBlogs = Array.isArray(blogs) ? blogs : [];
  const filteredBlogs = useMemo(() => {
    return safeBlogs.filter((blog) => {
      const q = (searchQuery || '').toLowerCase();
      const title = (blog?.title || '').toLowerCase();
      const desc = (blog?.description || '').toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
  }, [safeBlogs, searchQuery]);

  const paginatedBlogs = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredBlogs.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredBlogs, page, rowsPerPage]);

  const handleExportToExcel = () => {
    const exportData = safeBlogs.map((b) => ({
      ID: b._id,
      Title: b.title,
      CanonicalUrl: b.canonicalUrl || '',
      MetaTitle: b.metaTitle || '',
      CreatedDate: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Articles');
    XLSX.writeFile(wb, `heritage_articles_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  };

  return (
    <Box className="admin-page-container">
      <AdminPageHeader
        title="Editorial & Heritage Journal"
        subtitle="Publish saree weaving chronicles, bridal styling guides, and temple jewellery journals"
        icon={ArticleIcon}
        badges={[
          { label: `Total Articles: ${safeBlogs.length}`, color: 'default' },
        ]}
        onExport={handleExportToExcel}
        primaryAction={{
          label: 'New Article',
          icon: <Add />,
          onClick: () => handleOpen(),
        }}
      />

      <AdminTableToolbar
        searchPlaceholder="Search heritage articles by title or excerpt..."
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPage(0);
        }}
        totalCount={safeBlogs.length}
        filteredCount={filteredBlogs.length}
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
                <TableCell className="admin-table-th" width="100px">Cover</TableCell>
                <TableCell className="admin-table-th">Article Title</TableCell>
                <TableCell className="admin-table-th">Excerpt / Summary</TableCell>
                <TableCell className="admin-table-th">Canonical URL</TableCell>
                <TableCell className="admin-table-th" align="right" width="120px">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress sx={{ color: '#6D1734' }} />
                  </TableCell>
                </TableRow>
              ) : paginatedBlogs.length === 0 ? (
                <AdminTableEmptyState
                  colSpan={5}
                  title="No editorial articles found"
                  subtitle="No articles match your search criteria."
                  onReset={() => {
                    setSearchQuery('');
                    setPage(0);
                  }}
                />
              ) : (
                paginatedBlogs.map((blog) => (
                  <TableRow key={blog._id} className="admin-table-row" hover>
                    <TableCell className="admin-table-cell">
                      {blog.image ? (
                        <Avatar
                          src={blog.image}
                          alt={blog.title}
                          variant="rounded"
                          sx={{ width: 60, height: 60, border: '1px solid #EDE2D2', bgcolor: '#FAF7F2' }}
                        />
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 60, height: 60, bgcolor: 'rgba(109,23,52,0.1)', color: '#6D1734' }}>
                          <ArticleIcon />
                        </Avatar>
                      )}
                    </TableCell>
                    <TableCell className="admin-table-cell" sx={{ fontWeight: 600, color: '#282321' }}>
                      {blog.title}
                    </TableCell>
                    <TableCell className="admin-table-cell" sx={{ maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#7D7571' }}>
                      <div dangerouslySetInnerHTML={{ __html: blog.description }} />
                    </TableCell>
                    <TableCell className="admin-table-cell font-number" sx={{ fontSize: '0.8rem', color: '#6D1734' }}>
                      {blog.canonicalUrl || '-'}
                    </TableCell>
                    <TableCell className="admin-table-cell" align="right">
                      <Tooltip title="Edit Article">
                        <IconButton onClick={() => handleOpen(blog)} sx={{ color: '#6D1734' }} size="small">
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Article">
                        <IconButton onClick={() => handleDeleteClick(blog)} color="error" size="small">
                          <Delete fontSize="small" />
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
          count={filteredBlogs.length}
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
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 640,
            bgcolor: 'background.paper',
            boxShadow: '0 8px 32px rgba(109,23,52,0.12)',
            p: 4,
            borderRadius: 0,
            border: '1px solid #EDE2D2',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          <Typography 
            variant="h5" 
            mb={2}
            sx={{ 
              fontFamily: '"Playfair Display", Georgia, serif', 
              fontWeight: 700, 
              color: '#6D1734',
              borderBottom: '1px solid #EDE2D2',
              pb: 1.5
            }}
          >
            {selectedBlog ? 'Edit Journal Article' : 'Compose Journal Article'}
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Title" name="title" value={formData.title} onChange={handleInputChange} margin="normal" required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }} />

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025' }}>
              Article Body
            </Typography>
            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Write your heritage chronicle or styling guide here..."
              style={{ height: 200, marginBottom: 50 }}
            />

            <TextField
              fullWidth
              label="Canonical URL"
              name="canonicalUrl"
              value={formData.canonicalUrl}
              onChange={handleInputChange}
              margin="normal"
              required
              placeholder="https://example.com/blog/title"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            />
            <TextField fullWidth label="Meta Keywords" name="metaKeywords" value={formData.metaKeywords} onChange={handleInputChange} margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }} />
            <TextField fullWidth label="Meta Title" name="metaTitle" value={formData.metaTitle} onChange={handleInputChange} margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }} />
            <TextField fullWidth label="Meta Description" name="metaDescription" value={formData.metaDescription} onChange={handleInputChange} margin="normal" multiline rows={2} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }} />

            <Box mt={2}>
              <Input type="file" name="image" onChange={handleInputChange} style={{ display: 'none' }} id="image-upload" accept="image/*" />
              <label htmlFor="image-upload">
                <Button 
                  variant="outlined" 
                  fullWidth 
                  component="span"
                  sx={{
                    borderRadius: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderColor: '#EDE2D2',
                    color: '#6D1734'
                  }}
                >
                  {formData.image || previewUrl ? 'Change Cover Image' : 'Upload Cover Image'}
                </Button>
              </label>
              {(previewUrl || formData.image) && (
                <Box mt={2} display="flex" justifyContent="center">
                  <img
                    src={previewUrl || (formData.image ? URL.createObjectURL(formData.image) : '')}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: 220, objectFit: 'contain', border: '1px solid #EDE2D2' }}
                  />
                </Box>
              )}
            </Box>

            <Box mt={3} display="flex" justifyContent="flex-end" gap={1.5} pt={2} borderTop="1px solid #EDE2D2">
              <Button 
                onClick={handleClose}
                sx={{
                  borderRadius: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#7D7571'
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={isUploading}
                sx={{
                  borderRadius: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  backgroundColor: '#6D1734',
                  '&:hover': { backgroundColor: '#4A1025' }
                }}
              >
                {isUploading ? 'Publishing...' : selectedBlog ? 'Update Article' : 'Publish Article'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 0, border: '1px solid #EDE2D2' } }}
      >
        <DialogTitle sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: '#6D1734' }}>Confirm Deletion</DialogTitle>
        <DialogContent sx={{ color: '#282321' }}>Are you sure you want to permanently delete "{selectedBlog?.title}"?</DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #EDE2D2' }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ borderRadius: 0, color: '#7D7571' }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 0 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Blog;
