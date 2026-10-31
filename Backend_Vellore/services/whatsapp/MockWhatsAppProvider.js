import { v4 as uuidv4 } from 'uuid';
import IWhatsAppProvider from './IWhatsAppProvider.js';
import { maskPhoneNumber } from '../../utils/phoneUtils.js';

export class MockWhatsAppProvider extends IWhatsAppProvider {
  constructor(config = {}) {
    super();
    this.name = 'MockWhatsAppProvider (Sandbox)';
  }

  isConfigured() {
    return true;
  }

  async sendTemplate({ to, templateName, language = 'en', bodyParams = [] }) {
    const mockId = `wamid.MOCK_${Date.now()}_${uuidv4().substring(0, 8)}`;
    console.log(`[WHATSAPP SANDBOX MOCK] 📩 Template: "${templateName}" (${language}) -> To: ${maskPhoneNumber(to)}`);
    console.log(`[WHATSAPP SANDBOX MOCK] Parameters:`, bodyParams);

    return {
      success: true,
      providerMessageId: mockId,
      rawResponse: {
        messaging_product: 'whatsapp',
        contacts: [{ input: to, wa_id: to.replace('+', '') }],
        messages: [{ id: mockId, message_status: 'accepted' }],
        mock: true,
      },
    };
  }

  async sendDocumentTemplate({ to, templateName, language = 'en', documentUrl, mediaId, filename, bodyParams = [] }) {
    const mockId = `wamid.MOCK_DOC_${Date.now()}_${uuidv4().substring(0, 8)}`;
    console.log(`[WHATSAPP SANDBOX MOCK] 📄 Document Template: "${templateName}" -> To: ${maskPhoneNumber(to)}`);
    console.log(`[WHATSAPP SANDBOX MOCK] Attached File: ${filename || 'Invoice.pdf'} (URL: ${documentUrl ? 'Signed' : 'MediaId'})`);
    console.log(`[WHATSAPP SANDBOX MOCK] Parameters:`, bodyParams);

    return {
      success: true,
      providerMessageId: mockId,
      rawResponse: {
        messaging_product: 'whatsapp',
        contacts: [{ input: to, wa_id: to.replace('+', '') }],
        messages: [{ id: mockId, message_status: 'accepted' }],
        mock: true,
      },
    };
  }

  async uploadMedia(buffer, mimeType, filename) {
    const mockMediaId = `media_mock_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    console.log(`[WHATSAPP SANDBOX MOCK] 📎 Uploaded Media: ${filename} (${mimeType}) -> Media ID: ${mockMediaId}`);
    return { mediaId: mockMediaId };
  }

  verifyWebhookSignature(rawBody, signatureHeader) {
    // In sandbox mock mode, accept mock signatures or valid tokens
    return true;
  }

  parseWebhook(payload) {
    // Normalized Mock Webhook parser
    if (!payload) return [];
    if (payload.type === 'status_update') return [payload];
    if (payload.type === 'inbound_message') return [payload];
    return [];
  }
}

export default MockWhatsAppProvider;
