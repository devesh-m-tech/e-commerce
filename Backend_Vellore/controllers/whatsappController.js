import { getWhatsAppProvider } from '../services/whatsapp/WhatsAppProviderFactory.js';
import WhatsAppMessage from '../models/WhatsAppMessage.js';
import { Order } from '../models/order.js';
import { User } from '../models/User.js';
import Setting from '../models/Setting.js';
import { enqueueWhatsAppMessage } from '../services/whatsapp/whatsappQueue.js';
import {
  generateInvoicePdfBuffer,
  saveInvoicePdfToDisk,
  verifySignedInvoiceUrl,
} from '../utils/invoicePdfGenerator.js';
import { normalizePhoneNumber, maskPhoneNumber } from '../utils/phoneUtils.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INVOICE_DIR = path.join(__dirname, '../uploads/invoices');

// ── 1. META WEBHOOK VERIFICATION (GET) ──
export const verifyWebhookHandshake = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'sds_whatsapp_verify_token_2026';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[WhatsApp Webhook] Handshake verified successfully with Meta!');
    return res.status(200).send(challenge);
  }

  console.warn('[WhatsApp Webhook] Handshake verification failed: Token mismatch.');
  return res.sendStatus(403);
};

// ── 2. META WEBHOOK EVENT LISTENER (POST) ──
export const handleWebhookEvents = async (req, res) => {
  // Always respond 200 immediately to acknowledge receipt per Meta Cloud API specs
  res.status(200).json({ status: 'received' });

  try {
    const provider = getWhatsAppProvider();
    const signature = req.headers['x-hub-signature-256'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    // Verify signature in production
    const isLocalMock = process.env.WHATSAPP_PROVIDER === 'mock';
    if (!isLocalMock && signature) {
      const isValid = provider.verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        console.warn('[WhatsApp Webhook] Invalid signature rejected.');
        return;
      }
    }

    const events = provider.parseWebhook(req.body);

    for (const evt of events) {
      if (evt.type === 'status_update') {
        const { providerMessageId, status, timestamp, errors } = evt;

        const updateData = { status };
        if (status === 'delivered') updateData.deliveredAt = timestamp || new Date();
        if (status === 'read') updateData.readAt = timestamp || new Date();
        if (status === 'failed') {
          updateData.failedAt = timestamp || new Date();
          if (errors && errors.length > 0) {
            updateData.errorCode = String(errors[0].code || 'WEBHOOK_FAILURE');
            updateData.errorMessage = errors[0].message || 'Delivery failure from Meta';
          }
        }

        await WhatsAppMessage.findOneAndUpdate(
          { providerMessageId },
          { $set: updateData }
        );
        console.log(`[WhatsApp Webhook] Status updated: ${providerMessageId} -> ${status}`);
      } else if (evt.type === 'inbound_message') {
        const { fromPhone, text } = evt;
        console.log(`[WhatsApp Webhook] Inbound message from ${maskPhoneNumber(fromPhone)}: "${text}"`);

        // Check for Opt-Out keywords: STOP, UNSUBSCRIBE, CANCEL
        const cleanText = (text || '').trim().toUpperCase();
        if (cleanText === 'STOP' || cleanText === 'UNSUBSCRIBE') {
          await User.findOneAndUpdate(
            { contact: fromPhone },
            { $set: { whatsappOptOutAt: new Date(), whatsappOptIn: false } }
          );
          console.log(`[WhatsApp Opt-Out] Customer ${maskPhoneNumber(fromPhone)} opted out.`);
        }
      }
    }
  } catch (err) {
    console.error('[WhatsApp Webhook] Event processing error:', err);
  }
};

// ── 3. SECURE INVOICE PDF DOWNLOAD (GET) ──
export const downloadInvoicePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const { token, expires, inv } = req.query;

    const order = await Order.findById(id).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify token or admin/user session
    const isTokenValid = token && expires && verifySignedInvoiceUrl(id, inv || order.invoiceNumber, token, expires);
    const isSessionValid = req.user && (String(req.user._id) === String(order.user) || req.user.role === 'admin' || req.user.role === 'super_admin');

    if (!isTokenValid && !isSessionValid) {
      return res.status(403).json({ message: 'Access denied or signature expired' });
    }

    // Check if cached on disk
    const invNumber = order.invoiceNumber || `SDS-INV-${order._id.toString().slice(-6).toUpperCase()}`;
    const safeFilename = `${invNumber.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
    const filePath = path.join(INVOICE_DIR, safeFilename);

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
      return fs.createReadStream(filePath).pipe(res);
    }

    // Otherwise generate on the fly
    const settings = await Setting.findOne();
    const buffer = await generateInvoicePdfBuffer(order, settings);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    res.setHeader('Content-Length', buffer.length);
    return res.end(buffer);
  } catch (err) {
    console.error('[Invoice Download] Error:', err);
    res.status(500).json({ message: 'Failed to generate invoice', error: err.message });
  }
};

// ── 4. ADMIN: GET WHATSAPP MESSAGE LOGS (GET) ──
export const getWhatsAppLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, eventType, search, startDate, endDate } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (eventType && eventType !== 'all') filter.eventType = eventType;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }

    if (search) {
      filter.$or = [
        { recipientPhone: { $regex: search, $options: 'i' } },
        { providerMessageId: { $regex: search, $options: 'i' } },
        { templateName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [logs, total] = await Promise.all([
      WhatsAppMessage.find(filter)
        .populate('orderId', 'invoiceNumber finalAmount orderStatus')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      WhatsAppMessage.countDocuments(filter),
    ]);

    res.json({
      success: true,
      logs,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── 5. ADMIN: EXPORT LOGS TO CSV ──
export const exportWhatsAppLogsCsv = async (req, res) => {
  try {
    const logs = await WhatsAppMessage.find().sort({ createdAt: -1 }).limit(1000);

    const headers = ['Message ID', 'Order ID', 'Event Type', 'Recipient', 'Status', 'Attempts', 'Error Code', 'Date'];
    const rows = logs.map((l) => [
      l.providerMessageId || l._id,
      l.orderId || '—',
      l.eventType,
      maskPhoneNumber(l.recipientPhone),
      l.status,
      l.attempts,
      l.errorCode || 'None',
      l.createdAt ? new Date(l.createdAt).toISOString() : '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="whatsapp-logs-${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── 6. ADMIN: RESEND MESSAGE ──
export const resendWhatsAppMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const originalMessage = await WhatsAppMessage.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Reset status to queued for worker to re-attempt
    originalMessage.status = 'queued';
    originalMessage.attempts = 0;
    originalMessage.errorCode = null;
    originalMessage.errorMessage = null;
    originalMessage.nextAttemptAt = new Date();
    await originalMessage.save();

    res.json({
      success: true,
      message: 'WhatsApp message re-queued for delivery',
      log: originalMessage,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── 7. ADMIN: SEND TEST MESSAGE ──
export const sendTestWhatsAppMessage = async (req, res) => {
  try {
    const { recipientPhone, testText } = req.body;

    const normalized = normalizePhoneNumber(recipientPhone);
    if (!normalized) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format' });
    }

    const job = await enqueueWhatsAppMessage({
      orderId: null,
      eventType: 'test_message',
      recipientPhone: normalized,
      customParams: {},
      forceResend: true,
    });

    res.json({
      success: true,
      message: `Test message enqueued for ${maskPhoneNumber(normalized)}`,
      jobId: job?._id,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── 8. ADMIN: GET WHATSAPP STATUS ──
export const getWhatsAppStatus = async (req, res) => {
  try {
    const settings = await Setting.findOne();
    const provider = getWhatsAppProvider();

    const isCloudApiConfigured = provider.isConfigured ? provider.isConfigured() : false;
    const providerType = process.env.WHATSAPP_PROVIDER || (isCloudApiConfigured ? 'cloud_api' : 'mock');

    res.json({
      success: true,
      status: {
        enabled: settings?.whatsappSettings?.enabled !== false,
        provider: providerType,
        isConfigured: isCloudApiConfigured,
        businessPhoneNumber: settings?.whatsappSettings?.businessPhoneNumber || '+91 94432 18920',
        ownerPhoneNumbers: settings?.whatsappSettings?.ownerPhoneNumbers || ['+91 94432 18920'],
        events: settings?.whatsappSettings?.events || {},
        sandboxMode: !isCloudApiConfigured,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── 9. ADMIN: RESEND ORDER INVOICE VIA WHATSAPP ──
export const resendOrderInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const { notifyOrderConfirmedWithInvoice } = await import('../services/whatsapp/whatsappNotifier.js');
    await notifyOrderConfirmedWithInvoice(order, order.user, true);

    res.json({
      success: true,
      message: 'WhatsApp invoice message queued for re-delivery',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  verifyWebhookHandshake,
  handleWebhookEvents,
  downloadInvoicePdf,
  getWhatsAppLogs,
  exportWhatsAppLogsCsv,
  resendWhatsAppMessage,
  sendTestWhatsAppMessage,
  getWhatsAppStatus,
  resendOrderInvoice,
};
