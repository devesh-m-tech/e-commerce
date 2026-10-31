import express from 'express';
import {
  verifyWebhookHandshake,
  handleWebhookEvents,
  downloadInvoicePdf,
  getWhatsAppLogs,
  exportWhatsAppLogsCsv,
  resendWhatsAppMessage,
  sendTestWhatsAppMessage,
  getWhatsAppStatus,
  resendOrderInvoice,
} from '../controllers/whatsappController.js';
import verifyToken from '../utils/verifyToken.js';

const router = express.Router();

// ── Webhook Endpoints (Public with verification) ──
router.get('/webhooks/whatsapp', verifyWebhookHandshake);
router.post('/webhooks/whatsapp', express.raw({ type: 'application/json' }), handleWebhookEvents);

// ── Secure Invoice Download (Public signed URL or Authenticated session) ──
router.get('/orders/:id/invoice/download', downloadInvoicePdf);

// ── Admin Management Routes ──
router.get('/admin/whatsapp/status', verifyToken, getWhatsAppStatus);
router.get('/admin/whatsapp/logs', verifyToken, getWhatsAppLogs);
router.get('/admin/whatsapp/logs/export', verifyToken, exportWhatsAppLogsCsv);
router.post('/admin/whatsapp/resend/:messageId', verifyToken, resendWhatsAppMessage);
router.post('/admin/whatsapp/resend-order-invoice/:orderId', verifyToken, resendOrderInvoice);
router.post('/admin/whatsapp/test', verifyToken, sendTestWhatsAppMessage);

export default router;
