// Dummy default address constant for local testing
export const DUMMY_DEFAULT_ADDRESS = {
  _id: "addr_demo_1",
  name: "Priya Sharma",
  mobile: "9876543210",
  pincode: "632001",
  street: "12, Nehru Street, Anna Salai",
  locality: "Gandhi Nagar",
  city: "Vellore",
  state: "Tamil Nadu",
  type: "Home",
  isDefault: true
};

// Ensure dummy credentials and address are always available locally (unless explicitly logged out)
export const ensureDemoCredentialsAndAddress = () => {
  if (typeof window === 'undefined') return;
  // If user explicitly logged out, do not auto-seed credentials or mock token
  if (localStorage.getItem('userLoggedOut') === 'true') {
    return;
  }
  try {
    // 1. Ensure token
    if (!localStorage.getItem('token')) {
      localStorage.setItem('token', 'mock_local_jwt_token_12345');
    }
    // 2. Ensure addresses in localStorage
    let addresses = [];
    try {
      const raw = localStorage.getItem('local_addresses') || localStorage.getItem('dummy_addresses');
      if (raw) addresses = JSON.parse(raw);
    } catch (e) { }
    if (!Array.isArray(addresses) || addresses.length === 0) {
      addresses = [DUMMY_DEFAULT_ADDRESS];
      localStorage.setItem('local_addresses', JSON.stringify(addresses));
      localStorage.setItem('dummy_addresses', JSON.stringify(addresses));
    }
    // 3. Ensure user object with addresses
    let user = null;
    try {
      const uRaw = localStorage.getItem('user');
      if (uRaw) user = JSON.parse(uRaw);
    } catch (e) { }
    if (!user) {
      user = {
        _id: 'user_demo_1',
        name: 'Priya Sharma',
        email: 'demo@shrideepaalaya.com',
        contact: '9876543210',
        walletBalance: 500,
        addresses: addresses
      };
      localStorage.setItem('user', JSON.stringify(user));
    } else if (!user.addresses || user.addresses.length === 0) {
      user.addresses = addresses;
      localStorage.setItem('user', JSON.stringify(user));
    }
  } catch (err) {
    console.warn("Could not seed local demo address:", err);
  }
};

// Immediately initialize local dummy address & credentials
ensureDemoCredentialsAndAddress();

// Get token from localStorage
export const getToken = () => {
  let token = localStorage.getItem('token');
  if (!token && localStorage.getItem('userLoggedOut') !== 'true') {
    ensureDemoCredentialsAndAddress();
    token = localStorage.getItem('token') || null;
  }
  return token || null;
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
  // Mock tokens (not standard JWT format) are always considered valid
  const parts = token.split('.');
  if (parts.length !== 3) return false; // non-JWT (demo/mock token) — treat as valid
  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp < Date.now() / 1000;
  } catch (error) {
    return false; // can't decode → treat as valid in demo mode
  }
};

export const transformImageUrl = (imagePath) => {
  if (!imagePath) return '';

  // If it's a Cloudinary URL, return it directly
  if (imagePath.includes('cloudinary.com')) {
    return imagePath;
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // For local files, construct the URL
  const baseUrl = 'http://localhost:3000 ';
  return imagePath.startsWith('/') ? `${baseUrl}${imagePath}` : `${baseUrl}/${imagePath}`;
};