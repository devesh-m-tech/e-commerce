import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      default: "Exclusive Offer",
      trim: true,
    },
    badge: {
      type: String,
      default: "Special Silk Courtesy",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat", "free_shipping"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    usedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
