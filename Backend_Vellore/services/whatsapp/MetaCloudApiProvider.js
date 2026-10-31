import crypto from 'crypto';
import IWhatsAppProvider from './IWhatsAppProvider.js';

export class MetaCloudApiProvider extends IWhatsAppProvider {
  constructor(config = {}) {
    super();
    this.accessToken = config.accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = config.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.businessAccountId = config.businessAccountId || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    this.appSecret = config.appSecret || process.env.WHATSAPP_APP_SECRET;
    this.apiVersion = config.apiVersion || process.env.WHATSAPP_API_VERSION || 'v21.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  }

  /**
   * Check if credentials look configured
   */
  isConfigured() {
    return Boolean(
      this.accessToken &&
      this.phoneNumberId &&
      !this.accessToken.includes('DUMMY') &&
      !this.phoneNumberId.includes('DUMMY')
    );
  }

  /**
   * Send Template Message (Utility / Marketing / Alert)
   */
  async sendTemplate({ to, templateName, language = 'en', bodyParams = [] }) {
    // Strip leading '+' for Meta API (Meta expects e.g. 919876543210)
    const recipient = String(to).replace(/^\+/, '');

    const components = [];
    if (Array.isArray(bodyParams) && bodyParams.length > 0) {
      components.push({
        type: 'body',
        parameters: bodyParams.map((val) => ({
          type: 'text',
          text: String(val || ''),
        })),
      });
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language,
        },
        components,
      },
    };

    return this._postMessages(payload);
  }

  /**
   * Send Template Message with DOCUMENT Header (Invoice PDF)
   */
  async sendDocumentTemplate({ to, templateName, language = 'en', documentUrl, mediaId, filename, bodyParams = [] }) {
    const recipient = String(to).replace(/^\+/, '');

    const components = [];

    // Header component: Document
    const headerParam = {
      type: 'document',
    };

    if (mediaId) {
      headerParam.document = {
        id: mediaId,
        filename: filename || 'Invoice.pdf',
      };
    } else if (documentUrl) {
      headerParam.document = {
        link: documentUrl,
        filename: filename || 'Invoice.pdf',
      };
    } else {
      throw new Error('Either mediaId or documentUrl must be provided for document template');
    }

    components.push({
      type: 'header',
      parameters: [headerParam],
    });

    // Body parameters
    if (Array.isArray(bodyParams) && bodyParams.length > 0) {
      components.push({
        type: 'body',
        parameters: bodyParams.map((val) => ({
          type: 'text',
          text: String(val || ''),
        })),
      });
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language,
        },
        components,
      },
    };

    return this._postMessages(payload);
  }

  /**
   * Upload media to Meta Cloud API
   */
  async uploadMedia(buffer, mimeType, filename) {
    if (!this.phoneNumberId) throw new Error('WHATSAPP_PHONE_NUMBER_ID is not configured');

    const formData = new FormData();
    const blob = new Blob([buffer], { type: mimeType });
    formData.append('file', blob, filename);
    formData.append('type', mimeType);
    formData.append('messaging_product', 'whatsapp');

    const url = `${this.baseUrl}/${this.phoneNumberId}/media`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error?.message || 'Meta Media Upload Failed');
      err.metaError = data.error;
      throw err;
    }

    return { mediaId: data.id };
  }

  /**
   * Internal helper to POST to Graph API messages endpoint
   */
  async _postMessages(payload) {
    if (!this.phoneNumberId) throw new Error('WHATSAPP_PHONE_NUMBER_ID is not configured');

    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      const code = data.error?.code;
      const subcode = data.error?.error_subcode;
      const message = data.error?.message || 'Meta Cloud API Error';

      const error = new Error(`Meta API [${code}/${subcode}]: ${message}`);
      error.code = code;
      error.subcode = subcode;
      error.metaError = data.error;

      // Classify permanent vs transient errors
      // Permanent: 131026 (receiver not opted in), 132000 (template not found), 131047 (more than 24h)
      const permanentCodes = [131026, 132000, 132001, 100, 190];
      error.isTransient = !permanentCodes.includes(code);

      throw error;
    }

    const messageId = data.messages?.[0]?.id;
    return {
      success: true,
      providerMessageId: messageId,
      rawResponse: data,
    };
  }

  /**
   * Verify HMAC SHA256 signature from X-Hub-Signature-256
   */
  verifyWebhookSignature(rawBody, signatureHeader) {
    if (!this.appSecret || !signatureHeader) return false;

    try {
      const parts = signatureHeader.split('=');
      if (parts.length !== 2 || parts[0] !== 'sha256') return false;

      const expectedHmac = crypto
        .createHmac('sha256', this.appSecret)
        .update(rawBody)
        .digest('hex');

      return crypto.timingSafeEqual(Buffer.from(parts[1]), Buffer.from(expectedHmac));
    } catch (e) {
      return false;
    }
  }

  /**
   * Parse incoming Meta Webhook payload into normalized events
   */
  parseWebhook(payload) {
    const events = [];

    if (!payload || payload.object !== 'whatsapp_business_account') {
      return events;
    }

    const entries = payload.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field !== 'messages') continue;
        const val = change.value || {};

        // Status updates (sent, delivered, read, failed)
        if (Array.isArray(val.statuses)) {
          for (const s of val.statuses) {
            events.push({
              type: 'status_update',
              providerMessageId: s.id,
              recipientPhone: s.recipient_id ? `+${s.recipient_id}` : null,
              status: s.status, // 'sent', 'delivered', 'read', 'failed'
              timestamp: new Date(parseInt(s.timestamp, 10) * 1000),
              errors: s.errors || [],
            });
          }
        }

        // Inbound Customer Messages
        if (Array.isArray(val.messages)) {
          for (const m of val.messages) {
            events.push({
              type: 'inbound_message',
              providerMessageId: m.id,
              fromPhone: `+${m.from}`,
              messageType: m.type, // 'text', 'button', etc.
              text: m.text?.body || m.button?.text || '',
              timestamp: new Date(parseInt(m.timestamp, 10) * 1000),
            });
          }
        }
      }
    }

    return events;
  }
}

export default MetaCloudApiProvider;
