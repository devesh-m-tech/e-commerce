import WhatsAppMessage from '../../models/WhatsAppMessage.js';
import Setting from '../../models/Setting.js';
import { getWhatsAppProvider } from './WhatsAppProviderFactory.js';
import { WHATSAPP_TEMPLATES } from './whatsappTemplates.js';
import { normalizePhoneNumber, maskPhoneNumber } from '../../utils/phoneUtils.js';
import { generateSignedInvoiceUrl } from '../../utils/invoicePdfGenerator.js';

let workerIntervalId = null;
let isProcessing = false;

/**
 * Enqueue a WhatsApp notification job
 */
export const enqueueWhatsAppMessage = async ({
  orderId,
  customerId = null,
  eventType,
  recipientPhone,
  customParams = {},
  documentUrl = null,
  filename = null,
  forceResend = false,
}) => {
  try {
    // 1. Check Master Settings
    const settings = await Setting.findOne();
    const isModuleEnabled = process.env.WHATSAPP_ENABLED === 'true' || settings?.whatsappSettings?.enabled !== false;

    if (!isModuleEnabled) {
      console.log(`[WhatsApp Queue] Module is disabled in settings. Skipping event: ${eventType}`);
      return null;
    }

    // Check specific event toggle
    if (settings?.whatsappSettings?.events && settings.whatsappSettings.events[eventType]?.enabled === false) {
      console.log(`[WhatsApp Queue] Event "${eventType}" is disabled in settings. Skipping.`);
      return null;
    }

    // 2. Normalize and validate recipient phone
    const normalizedPhone = normalizePhoneNumber(recipientPhone);
    if (!normalizedPhone) {
      console.warn(`[WhatsApp Queue] Invalid recipient phone number "${recipientPhone}". Cannot enqueue message.`);
      return null;
    }

    // 3. Resolve Template definition
    const templateDef = WHATSAPP_TEMPLATES[eventType];
    if (!templateDef && eventType !== 'test_message') {
      console.warn(`[WhatsApp Queue] Unknown template definition for event: ${eventType}`);
      return null;
    }

    const templateName = settings?.whatsappSettings?.events?.[eventType]?.templateName || templateDef?.templateName || eventType;

    // 4. Build parameters
    let params = [];
    if (templateDef?.buildParams) {
      params = templateDef.buildParams(customParams);
    }

    // 5. Idempotency Key
    const idempotencyKey = forceResend
      ? `${orderId || 'general'}_${eventType}_resend_${Date.now()}`
      : `${orderId || 'general'}_${eventType}`;

    // Check if message with idempotency key already exists
    const existing = await WhatsAppMessage.findOne({ idempotencyKey });
    if (existing) {
      console.log(`[WhatsApp Queue] Message with idempotency key "${idempotencyKey}" already exists (status: ${existing.status}). Skipping duplicate.`);
      return existing;
    }

    // 6. Create Message Record in 'queued' state
    const messageRecord = new WhatsAppMessage({
      orderId,
      customerId,
      eventType,
      templateName,
      language: templateDef?.language || 'en',
      recipientPhone: normalizedPhone,
      status: 'queued',
      documentUrl,
      filename,
      parameters: params,
      idempotencyKey,
      attempts: 0,
      maxAttempts: 3,
      nextAttemptAt: new Date(),
    });

    await messageRecord.save();
    console.log(`[WhatsApp Queue] Job enqueued: [${eventType}] -> ${maskPhoneNumber(normalizedPhone)} (ID: ${messageRecord._id})`);

    // Kick processor asynchronously immediately
    setImmediate(() => {
      processNextQueueBatch();
    });

    return messageRecord;
  } catch (err) {
    console.error('[WhatsApp Queue] Failed to enqueue message:', err);
    return null;
  }
};

/**
 * Process a single WhatsApp message
 */
export const processWhatsAppMessage = async (message) => {
  try {
    message.status = 'processing';
    message.attempts += 1;
    await message.save();

    const provider = getWhatsAppProvider();

    let result;
    if (message.documentUrl) {
      // Send document template (Invoice PDF)
      result = await provider.sendDocumentTemplate({
        to: message.recipientPhone,
        templateName: message.templateName,
        language: message.language,
        documentUrl: message.documentUrl,
        filename: message.filename || 'Invoice.pdf',
        bodyParams: message.parameters,
      });
    } else {
      // Send standard template
      result = await provider.sendTemplate({
        to: message.recipientPhone,
        templateName: message.templateName,
        language: message.language,
        bodyParams: message.parameters,
      });
    }

    message.status = 'sent';
    message.providerMessageId = result.providerMessageId;
    message.sentAt = new Date();
    message.rawResponse = result.rawResponse;
    message.errorCode = null;
    message.errorMessage = null;
    await message.save();

    console.log(`[WhatsApp Worker] ✅ Message Sent Successfully! ID: ${message.providerMessageId} to ${maskPhoneNumber(message.recipientPhone)}`);
    return true;
  } catch (error) {
    const isTransient = error.isTransient !== false;
    const canRetry = isTransient && message.attempts < message.maxAttempts;

    console.error(`[WhatsApp Worker] ❌ Delivery Error [Attempt ${message.attempts}/${message.maxAttempts}]:`, error.message);

    message.errorCode = error.code ? String(error.code) : 'DELIVERY_FAILED';
    message.errorMessage = error.message ? error.message.substring(0, 300) : 'Unknown error';

    if (canRetry) {
      // Exponential backoff: 5s, 15s, 45s
      const delayMs = Math.pow(3, message.attempts) * 5000;
      message.status = 'queued';
      message.nextAttemptAt = new Date(Date.now() + delayMs);
      console.log(`[WhatsApp Worker] Scheduling retry for job ${message._id} in ${delayMs / 1000}s`);
    } else {
      message.status = 'failed';
      message.failedAt = new Date();
      console.log(`[WhatsApp Worker] Job marked permanent FAILED: ${message._id}`);
    }

    await message.save();
    return false;
  }
};

/**
 * Process a batch of queued WhatsApp jobs
 */
export const processNextQueueBatch = async () => {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const now = new Date();
    const pendingMessages = await WhatsAppMessage.find({
      status: 'queued',
      nextAttemptAt: { $lte: now },
    })
      .sort({ createdAt: 1 })
      .limit(5);

    for (const msg of pendingMessages) {
      await processWhatsAppMessage(msg);
    }
  } catch (err) {
    console.error('[WhatsApp Worker] Batch processing error:', err);
  } finally {
    isProcessing = false;
  }
};

/**
 * Start Background Poller Worker (Interval: 4 seconds)
 */
export const startWhatsAppWorker = () => {
  if (workerIntervalId) return;
  console.log('[WhatsApp Worker] Background queue worker initialized (polling every 4s).');
  workerIntervalId = setInterval(processNextQueueBatch, 4000);
};

export const stopWhatsAppWorker = () => {
  if (workerIntervalId) {
    clearInterval(workerIntervalId);
    workerIntervalId = null;
  }
};

export default {
  enqueueWhatsAppMessage,
  processWhatsAppMessage,
  processNextQueueBatch,
  startWhatsAppWorker,
  stopWhatsAppWorker,
};
