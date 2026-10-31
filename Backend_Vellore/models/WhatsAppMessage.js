import mongoose from 'mongoose';

const whatsAppMessageSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      index: true,
      default: null,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'order_confirmation_invoice',
        'order_shipped',
        'order_delivered',
        'order_cancelled',
        'refund_processed',
        'payment_pending_retry',
        'owner_new_order_alert',
        'test_message',
        'customer_inbound',
      ],
      index: true,
    },
    templateName: {
      type: String,
      required: true,
      default: 'generic_notification',
    },
    language: {
      type: String,
      default: 'en',
    },
    recipientPhone: {
      type: String,
      required: true,
      index: true,
    },
    providerMessageId: {
      type: String,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'sent', 'delivered', 'read', 'failed'],
      default: 'queued',
      index: true,
    },
    documentUrl: {
      type: String,
      default: null,
    },
    filename: {
      type: String,
      default: null,
    },
    mediaId: {
      type: String,
      default: null,
    },
    parameters: {
      type: [String],
      default: [],
    },
    errorCode: {
      type: String,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    nextAttemptAt: {
      type: Date,
      default: Date.now,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    provider: {
      type: String,
      default: 'cloud_api',
    },
    rawPayload: {
      type: Object,
      default: null,
    },
    rawResponse: {
      type: Object,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound indexes for fast admin querying
whatsAppMessageSchema.index({ status: 1, nextAttemptAt: 1 });
whatsAppMessageSchema.index({ createdAt: -1 });

export const WhatsAppMessage = mongoose.model('WhatsAppMessage', whatsAppMessageSchema);
export default WhatsAppMessage;
