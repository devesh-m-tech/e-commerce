// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('token') || null;
};

// Check if user is logged in
export const checkUserAccess = () => {
  const token = getToken();
  if (!token) {
    throw new Error('Unauthorized access. Please login.');
  }
  return token;
};

// Set token in localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp < Date.now() / 1000;
  } catch (error) {
    return false;
  }
};

export const transformImageUrl = (imagePath) => {
  if (!imagePath) return '';

  if (typeof imagePath === 'object') {
    imagePath = imagePath.url || imagePath.path || imagePath.src || '';
  }
  if (typeof imagePath !== 'string' || !imagePath.trim()) return '';

  // If it's a Cloudinary URL or Unsplash or any external URL, return directly
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:image')) {
    return imagePath;
  }

  const baseUrl = import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')
    : (import.meta.env?.VITE_SERVER_URL || 'http://localhost:5000');

  // Normalize all backslashes to forward slashes
  let cleanPath = imagePath.replace(/\\/g, '/').trim();
  // Strip any redundant leading /uploads/ or uploads/
  cleanPath = cleanPath.replace(/^(\/?uploads\/)+/i, '');
  cleanPath = cleanPath.replace(/^\/+/, '');

  return `${baseUrl}/uploads/${cleanPath}`;
};
