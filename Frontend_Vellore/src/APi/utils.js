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

  // If it's a Cloudinary URL or Unsplash or any external URL, return directly
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:image')) {
    return imagePath;
  }

  const baseUrl = import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:5000';

  const cleanPath = imagePath.replace(/\\/g, '/');
  return cleanPath.startsWith('/') ? `${baseUrl}${cleanPath}` : `${baseUrl}/${cleanPath}`;
};
