/**
 * =========================================================================
 * SINGLE SOURCE OF TRUTH FOR FRONTEND URLs (LOCAL vs LIVE SWITCH)
 * =========================================================================
 * 
 * To switch between LIVE and LOCAL:
 * Option 1: Set VITE_ENV_MODE in Frontend_Vellore/.env ('live' or 'local')
 * Option 2: Or simply change DEFAULT_ENV_MODE below ('live' or 'local')
 *
 * All frontend API calls, images, admin dashboard links, and storefront links
 * automatically adapt from this single file!
 */

// Set to 'live' for Production, or 'local' for Local Development
const DEFAULT_ENV_MODE = 'live'; // 'live' | 'local'

export const ENV_MODE = (
  (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_ENV_MODE) ||
  (typeof process !== 'undefined' && process?.env?.VITE_ENV_MODE) ||
  DEFAULT_ENV_MODE
).toLowerCase();

const URL_PROFILES = {
  local: {
    API_URL: 'http://localhost:5000/api',
    SERVER_URL: 'http://localhost:5000',
    STOREFRONT_URL: 'http://localhost:3000',
  },
  live: {
    API_URL: 'https://api.shrideepalayasilks.com/api',
    SERVER_URL: 'https://api.shrideepalayasilks.com',
    STOREFRONT_URL: 'https://shrideepalayasilks.com',
  },
};

const activeProfile = URL_PROFILES[ENV_MODE] || URL_PROFILES.live;

export const API_URL = activeProfile.API_URL;
export const SERVER_URL = activeProfile.SERVER_URL;
export const STOREFRONT_URL = activeProfile.STOREFRONT_URL;

export default {
  ENV_MODE,
  API_URL,
  SERVER_URL,
  STOREFRONT_URL,
};
