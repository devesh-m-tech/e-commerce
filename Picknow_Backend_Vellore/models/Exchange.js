import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const exchangeSchema = new mongoose.Schema(
  {
    orderId: {
      type: ObjectId,
      ref: "Order",
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    userId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    product: {
      type: ObjectId,
      ref: "products",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
      default: "",
    },
    variantId: {
      type: ObjectId,
      ref: "ProductVariant",
    },
    variantDetails: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    reason: {
      type: String,
      required: true,
    },
    requestedSizeOrItem: {
      type: String,
      default: "",
    },
    photos: {
      type: [String],
      default: [],
    },
    video: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    adminDecision: {
      decidedBy: {
        type: ObjectId,
        ref: "admin",
      },
      decidedByName: {
        type: String,
        default: "",
      },
      decidedAt: {
        type: Date,
      },
      rejectionReason: {
        type: String,
        default: "",
      },
      internalNote: {
        type: String,
        default: "",
      },
    },
    exchangeOrderStatus: {
      type: String,
      enum: [
        "PENDING_REVIEW",
        "APPROVED_PICKUP_SCHEDULED",
        "ITEM_RECEIVED",
        "REPLACEMENT_DISPATCHED",
        "COMPLETED",
        "REJECTED",
      ],
      default: "PENDING_REVIEW",
    },
    stockAdjusted: {
      type: Boolean,
      default: false,
    },
    history: [
      {
        status: { type: String },
        updatedAt: { type: Date, default: Date.now },
        note: { type: String },
        updatedBy: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const Exchange = mongoose.model("Exchange", exchangeSchema);
export default Exchange;
