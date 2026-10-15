import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Edit, Delete, Add, Search } from '@mui/icons-material';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createBlog, getAllBlogs, updateBlog, deleteBlog } from '../api/blogApi';

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

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await getAllBlogs();
      setBlogs(data.blogs || data || []);
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

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
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
            Editorial & Heritage Journal
          </Typography>
          <Typography variant="body2" sx={{ color: '#7D7571' }}>
            Publish saree weaving chronicles, bridal styling guides, and temple jewellery journals
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => handleOpen()}
          sx={{
            borderRadius: 0,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontSize: '0.78rem',
            backgroundColor: '#6D1734',
            '&:hover': { backgroundColor: '#4A1025' }
          }}
        >
          New Article
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Search heritage articles and guides..."
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: '#6D1734' }} />
            </InputAdornment>
          ),
        }}
        sx={{ 
          mb: 3,
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-root': { borderRadius: 0 }
        }}
      />

      <TableContainer component={Paper} sx={{ borderRadius: 0, border: '1px solid #EDE2D2', boxShadow: 'none' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#FAF7F2' }}>
            <TableRow>
              <TableCell sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025', borderBottom: '1px solid #EDE2D2' }}>Cover</TableCell>
              <TableCell sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025', borderBottom: '1px solid #EDE2D2' }}>Article Title</TableCell>
              <TableCell sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025', borderBottom: '1px solid #EDE2D2' }}>Excerpt / Summary</TableCell>
              <TableCell sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025', borderBottom: '1px solid #EDE2D2' }}>Canonical URL</TableCell>
              <TableCell align="right" sx={{ fontFamily: '"Karla", sans-serif', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem', color: '#4A1025', borderBottom: '1px solid #EDE2D2' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredBlogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#7D7571' }}>
                  No editorial articles found
                </TableCell>
              </TableRow>
            ) : (
              filteredBlogs.map((blog) => (
                <TableRow key={blog._id} hover sx={{ '&:hover': { backgroundColor: '#FAF7F2' } }}>
                  <TableCell>
                    {blog.image && (
                      <img
                        src={blog.image}
                        alt={blog.title}
                        style={{ width: 80, height: 80, borderRadius: 0, objectFit: 'cover', border: '1px solid #EDE2D2' }}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#282321' }}>{blog.title}</TableCell>
                  <TableCell sx={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#7D7571' }}>
                    <div dangerouslySetInnerHTML={{ __html: blog.description }} />
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#6D1734' }}>{blog.canonicalUrl}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(blog)} color="primary" size="small">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(blog)} color="error" size="small">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
