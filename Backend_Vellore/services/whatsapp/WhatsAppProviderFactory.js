import MetaCloudApiProvider from './MetaCloudApiProvider.js';
import MockWhatsAppProvider from './MockWhatsAppProvider.js';

let cachedProvider = null;

export const getWhatsAppProvider = () => {
  if (cachedProvider) return cachedProvider;

  const providerType = (process.env.WHATSAPP_PROVIDER || 'cloud_api').toLowerCase();
  const token = process.env.WHATSAPP_ACCESS_TOKEN || '';
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

  // Use Mock if explicitly configured or using dummy placeholders
  const isDummy =
    providerType === 'mock' ||
    !token ||
    !phoneId ||
    token.includes('DUMMY') ||
    phoneId.includes('DUMMY') ||
    token.length < 15;

  if (isDummy) {
    console.log('[WhatsApp Factory] Initializing in Sandbox / Mock Mode (Dummy credentials active).');
    cachedProvider = new MockWhatsAppProvider();
  } else {
    console.log('[WhatsApp Factory] Initializing Meta WhatsApp Business Cloud API Provider.');
    cachedProvider = new MetaCloudApiProvider();
  }

  return cachedProvider;
};

export const resetWhatsAppProvider = () => {
  cachedProvider = null;
};

export default {
  getWhatsAppProvider,
  resetWhatsAppProvider,
};
