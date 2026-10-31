import { enqueueWhatsAppMessage } from './whatsappQueue.js';
import { saveInvoicePdfToDisk, generateSignedInvoiceUrl } from '../../utils/invoicePdfGenerator.js';
import Setting from '../../models/Setting.js';

/**
 * 1. Order Confirmed + Invoice PDF Attachment (Main Transactional Trigger)
 */
export const notifyOrderConfirmedWithInvoice = async (order, customer = null, forceResend = false) => {
  try {
    if (!order) return;

    // Ensure invoice number exists
    if (!order.invoiceNumber) {
      const year = new Date().getFullYear();
      order.invoiceNumber = `SDS-INV-${year}-${order._id.toString().slice(-6).toUpperCase()}`;
      order.invoiceGeneratedAt = new Date();
      await order.save();
    }

    const settings = await Setting.findOne();

    // Generate & Save PDF to disk
    await saveInvoicePdfToDisk(order, settings);

    // Generate secure signed URL for WhatsApp to fetch the document
    const signedDocumentUrl = generateSignedInvoiceUrl(order._id, order.invoiceNumber);
    const invoiceFilename = `${order.invoiceNumber}.pdf`;

    // Customer recipient phone
    const recipientPhone = order.shippingAddress?.contact || customer?.contact;

    if (recipientPhone) {
      await enqueueWhatsAppMessage({
        orderId: order._id,
        customerId: customer?._id || order.user,
        eventType: 'order_confirmation_invoice',
        recipientPhone,
        customParams: {
          order,
          customerName: order.shippingAddress?.name || customer?.name,
        },
        documentUrl: signedDocumentUrl,
        filename: invoiceFilename,
        forceResend,
      });
    }

    // Also trigger Staff / Owner Alert
    await notifyOwnerNewOrder(order, customer, settings);
  } catch (err) {
    console.error('[WhatsApp Notifier] notifyOrderConfirmedWithInvoice error:', err);
  }
};

/**
 * 2. Owner Alert when new order is placed
 */
export const notifyOwnerNewOrder = async (order, customer = null, settings = null) => {
  try {
    const s = settings || (await Setting.findOne());
    const envOwners = process.env.WHATSAPP_OWNER_NUMBERS ? process.env.WHATSAPP_OWNER_NUMBERS.split(',') : [];
    const settingsOwners = s?.whatsappSettings?.ownerPhoneNumbers || [];
    const ownerList = [...new Set([...envOwners, ...settingsOwners])].map((p) => p.trim()).filter(Boolean);

    for (const ownerPhone of ownerList) {
      await enqueueWhatsAppMessage({
        orderId: order._id,
        customerId: null,
        eventType: 'owner_new_order_alert',
        recipientPhone: ownerPhone,
        customParams: {
          order,
          customerName: order.shippingAddress?.name || customer?.name || 'Customer',
        },
      });
    }
  } catch (err) {
    console.error('[WhatsApp Notifier] notifyOwnerNewOrder error:', err);
  }
};

/**
 * 3. Order Shipped / Dispatched
 */
export const notifyOrderShipped = async (order, trackingNumber, courierName = 'Express Courier') => {
  try {
    const recipientPhone = order.shippingAddress?.contact;
    if (!recipientPhone) return;

    await enqueueWhatsAppMessage({
      orderId: order._id,
      customerId: order.user,
      eventType: 'order_shipped',
      recipientPhone,
      customParams: {
        order,
        customerName: order.shippingAddress?.name,
        courier: courierName,
        trackingNumber: trackingNumber || order.trackingInfo?.trackingNumber,
      },
    });
  } catch (err) {
    console.error('[WhatsApp Notifier] notifyOrderShipped error:', err);
  }
};

/**
 * 4. Order Delivered
 */
export const notifyOrderDelivered = async (order) => {
  try {
    const recipientPhone = order.shippingAddress?.contact;
    if (!recipientPhone) return;

    await enqueueWhatsAppMessage({
      orderId: order._id,
      customerId: order.user,
      eventType: 'order_delivered',
      recipientPhone,
      customParams: {
        order,
        customerName: order.shippingAddress?.name,
      },
    });
  } catch (err) {
    console.error('[WhatsApp Notifier] notifyOrderDelivered error:', err);
  }
};

/**
 * 5. Order Cancelled
 */
export const notifyOrderCancelled = async (order) => {
  try {
    const recipientPhone = order.shippingAddress?.contact;
    if (!recipientPhone) return;

    await enqueueWhatsAppMessage({
      orderId: order._id,
      customerId: order.user,
      eventType: 'order_cancelled',
      recipientPhone,
      customParams: {
        order,
        customerName: order.shippingAddress?.name,
      },
    });
  } catch (err) {
    console.error('[WhatsApp Notifier] notifyOrderCancelled error:', err);
  }
};

/**
 * 6. Refund Processed
 */
export const notifyRefundProcessed = async (order, refundAmount) => {
  try {
    const recipientPhone = order.shippingAddress?.contact;
    if (!recipientPhone) return;

    await enqueueWhatsAppMessage({
      orderId: order._id,
      customerId: order.user,
      eventType: 'refund_processed',
      recipientPhone,
      customParams: {
        order,
        customerName: order.shippingAddress?.name,
        refundAmount,
      },
    });
  } catch (err) {
    console.error('[WhatsApp Notifier] notifyRefundProcessed error:', err);
  }
};

export default {
  notifyOrderConfirmedWithInvoice,
  notifyOwnerNewOrder,
  notifyOrderShipped,
  notifyOrderDelivered,
  notifyOrderCancelled,
  notifyRefundProcessed,
};
