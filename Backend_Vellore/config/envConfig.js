/**
 * =========================================================================
 * SINGLE SOURCE OF TRUTH FOR BACKEND URLs (LOCAL vs LIVE SWITCH)
 * =========================================================================
 * 
 * To switch between LIVE and LOCAL:
 * Option 1: Set APP_ENV_MODE in Backend_Vellore/.env ('live' or 'local')
 * Option 2: Or change DEFAULT_ENV_MODE below ('live' or 'local')
 *
 * All Backend services (PDF invoice links, WhatsApp notification URLs,
 * SEO canonicals, CORS origins, email templates) automatically adapt!
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Change to 'live' for Production, or 'local' for Local Development
const DEFAULT_ENV_MODE = 'live'; // 'live' | 'local'

export const ENV_MODE = (process.env.APP_ENV_MODE || DEFAULT_ENV_MODE).toLowerCase();

const URL_PROFILES = {
  local: {
    API_BASE_URL: 'http://localhost:5000',
    STOREFRONT_URL: 'http://localhost:3000',
    ALLOWED_ORIGINS: [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'https://shrideepalayasilks.com',
      'https://www.shrideepalayasilks.com',
      'https://api.shrideepalayasilks.com',
      'https://api.shreedeepalayasilks.com',
    ],
  },
  live: {
    API_BASE_URL: 'https://api.shrideepalayasilks.com',
    STOREFRONT_URL: 'https://shrideepalayasilks.com',
    ALLOWED_ORIGINS: [
      'https://shrideepalayasilks.com',
      'https://www.shrideepalayasilks.com',
      'https://api.shrideepalayasilks.com',
      'https://shreedeepalayasilks.com',
      'https://www.shreedeepalayasilks.com',
      'https://api.shreedeepalayasilks.com',
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
    ],
  },
};

const activeProfile = URL_PROFILES[ENV_MODE] || URL_PROFILES.live;

export const API_BASE_URL = activeProfile.API_BASE_URL;
export const STOREFRONT_URL = activeProfile.STOREFRONT_URL;
export const ALLOWED_ORIGINS = activeProfile.ALLOWED_ORIGINS;

export default {
  ENV_MODE,
  API_BASE_URL,
  STOREFRONT_URL,
  ALLOWED_ORIGINS,
};
