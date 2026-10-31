/**
 * WhatsApp Template Registry and Parameter Builder
 * Maps events to pre-approved Meta WhatsApp Cloud API templates
 */

export const WHATSAPP_TEMPLATES = {
  order_confirmation_invoice: {
    templateName: 'order_confirmation_invoice',
    category: 'UTILITY',
    headerType: 'DOCUMENT',
    language: 'en',
    description: 'Order confirmed with attached invoice PDF',
    buildParams: ({ order, customerName }) => {
      const name = customerName || order.shippingAddress?.name || 'Customer';
      const orderId = order._id ? `#${order._id.toString().slice(-6).toUpperCase()}` : '#ORDER';
      const total = Number(order.finalAmount || order.totalAmount || 0).toLocaleString('en-IN');
      return [name, orderId, total];
    },
  },

  order_shipped: {
    templateName: 'order_shipped',
    category: 'UTILITY',
    headerType: 'TEXT',
    language: 'en',
    description: 'Order marked dispatched / shipped with courier tracking info',
    buildParams: ({ order, customerName, courier, trackingNumber, trackingUrl }) => {
      const name = customerName || order.shippingAddress?.name || 'Customer';
      const orderId = order._id ? `#${order._id.toString().slice(-6).toUpperCase()}` : '#ORDER';
      const courierName = courier || order.trackingInfo?.courierName || 'Express Courier';
      const trackingId = trackingNumber || order.trackingInfo?.trackingNumber || 'Available Shortly';
      const url = trackingUrl || `https://www.shrideepaalayasilks.com/order-tracking/${order._id}`;
      return [name, orderId, courierName, trackingId, url];
    },
  },

  order_delivered: {
    templateName: 'order_delivered',
    category: 'UTILITY',
    headerType: 'TEXT',
    language: 'en',
    description: 'Order delivery confirmation',
    buildParams: ({ order, customerName }) => {
      const name = customerName || order.shippingAddress?.name || 'Customer';
      const orderId = order._id ? `#${order._id.toString().slice(-6).toUpperCase()}` : '#ORDER';
      return [name, orderId];
    },
  },

  order_cancelled: {
    templateName: 'order_cancelled',
    category: 'UTILITY',
    headerType: 'TEXT',
    language: 'en',
    description: 'Order cancellation notification',
    buildParams: ({ order, customerName }) => {
      const name = customerName || order.shippingAddress?.name || 'Customer';
      const orderId = order._id ? `#${order._id.toString().slice(-6).toUpperCase()}` : '#ORDER';
      return [name, orderId];
    },
  },

  refund_processed: {
    templateName: 'refund_processed',
    category: 'UTILITY',
    headerType: 'TEXT',
    language: 'en',
    description: 'Refund initiation notice',
    buildParams: ({ order, customerName, refundAmount }) => {
      const name = customerName || order.shippingAddress?.name || 'Customer';
      const amount = Number(refundAmount || order.finalAmount || 0).toLocaleString('en-IN');
      const orderId = order._id ? `#${order._id.toString().slice(-6).toUpperCase()}` : '#ORDER';
      return [name, amount, orderId];
    },
  },

  payment_pending_retry: {
    templateName: 'payment_pending_retry',
    category: 'UTILITY',
    headerType: 'TEXT',
    language: 'en',
    description: 'Payment failure / retry link',
    buildParams: ({ order, customerName, retryUrl }) => {
      const name = customerName || order.shippingAddress?.name || 'Customer';
      const orderId = order._id ? `#${order._id.toString().slice(-6).toUpperCase()}` : '#ORDER';
      const url = retryUrl || `https://www.shrideepaalayasilks.com/payment?orderId=${order._id}`;
      return [name, orderId, url];
    },
  },

  owner_new_order_alert: {
    templateName: 'owner_new_order_alert',
    category: 'UTILITY',
    headerType: 'TEXT',
    language: 'en',
    description: 'Internal alert to shop owner when a new order is confirmed',
    buildParams: ({ order, customerName }) => {
      const orderId = order._id ? `#${order._id.toString().slice(-6).toUpperCase()}` : '#ORDER';
      const name = customerName || order.shippingAddress?.name || 'Customer';
      const total = Number(order.finalAmount || order.totalAmount || 0).toLocaleString('en-IN');
      const paymentMethod = order.paymentMethod || 'RAZORPAY';
      const adminUrl = `https://admin.shrideepaalayasilks.com/orders`;
      return [orderId, name, total, paymentMethod, adminUrl];
    },
  },
};

export default WHATSAPP_TEMPLATES;
