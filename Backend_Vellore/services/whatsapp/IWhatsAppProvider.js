/**
 * WhatsApp Provider Interface Contract
 */
export class IWhatsAppProvider {
  /**
   * Send a pre-approved template message
   * @param {Object} options
   * @param {string} options.to - E.164 phone number (e.g. +919876543210)
   * @param {string} options.templateName - Approved template name
   * @param {string} options.language - Language code (e.g. 'en', 'ta')
   * @param {Array<string>} options.bodyParams - Ordered parameter values for {{1}}, {{2}}, etc.
   */
  async sendTemplate(options) {
    throw new Error('sendTemplate must be implemented by provider');
  }

  /**
   * Send a template message with a DOCUMENT header (e.g. invoice PDF)
   * @param {Object} options
   * @param {string} options.to - E.164 phone number
   * @param {string} options.templateName - Approved template name
   * @param {string} options.language - Language code
   * @param {string} [options.documentUrl] - Signed HTTPS URL to PDF
   * @param {string} [options.mediaId] - Meta media ID
   * @param {string} options.filename - e.g. SDS_INV_2026_001.pdf
   * @param {Array<string>} options.bodyParams - Ordered parameters
   */
  async sendDocumentTemplate(options) {
    throw new Error('sendDocumentTemplate must be implemented by provider');
  }

  /**
   * Upload media file (PDF/Image) to provider endpoint to obtain mediaId
   * @param {Buffer} buffer
   * @param {string} mimeType
   * @param {string} filename
   */
  async uploadMedia(buffer, mimeType, filename) {
    throw new Error('uploadMedia must be implemented by provider');
  }

  /**
   * Verify HMAC signature of incoming webhooks
   * @param {Buffer|string} rawBody
   * @param {Object} headers
   */
  verifyWebhookSignature(rawBody, headers) {
    throw new Error('verifyWebhookSignature must be implemented by provider');
  }

  /**
   * Parse incoming webhook payload into normalized status or inbound message events
   * @param {Object} payload
   */
  parseWebhook(payload) {
    throw new Error('parseWebhook must be implemented by provider');
  }
}

export default IWhatsAppProvider;
