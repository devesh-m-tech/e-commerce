import { Coupon } from "../models/Coupon.js";

// Initial boutique coupons matching https://shrideepalayasilks.com/deals
const DEFAULT_COUPONS = [
  {
    code: "DEEPAALAYA10",
    badge: "Special Silk Courtesy",
    title: "Flat 10% OFF",
    description: "Valid on all pure Kanchipuram & Banarasi silk orders above ₹9,999",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 9999,
    status: "active",
  },
  {
    code: "MUHURTHAM25",
    badge: "Bridal Trousseau",
    title: "25% Festive Offer",
    description: "Applied on complete bridal pattu saree & jewellery trousseau sets above ₹15,000",
    discountType: "percentage",
    discountValue: 25,
    minOrderValue: 15000,
    status: "active",
  },
  {
    code: "FIRSTSILK",
    badge: "Welcome Privilege",
    title: "₹500 OFF",
    description: "Save ₹500 on your first authentic handloom purchase above ₹2,999",
    discountType: "flat",
    discountValue: 500,
    minOrderValue: 2999,
    status: "active",
  },
  {
    code: "FREESHIP",
    badge: "Complimentary Delivery",
    title: "Free Air Shipping",
    description: "100% Insured express door delivery across 27,000+ Indian pincodes",
    discountType: "free_shipping",
    discountValue: 0,
    minOrderValue: 999,
    status: "active",
  },
];

// Helper to seed initial boutique coupons if collection is empty
const ensureSeedCoupons = async () => {
  try {
    const count = await Coupon.countDocuments();
    if (count === 0) {
      await Coupon.insertMany(DEFAULT_COUPONS);
      console.log("[Coupon Service] Initial boutique promo vouchers seeded successfully");
    }
  } catch (err) {
    console.error("[Coupon Service] Error seeding coupons:", err.message);
  }
};

// ── GET ACTIVE COUPONS (Public for Deals Page & Cart suggestions) ──
export const getActiveCoupons = async (req, res) => {
  try {
    await ensureSeedCoupons();
    const now = new Date();
    const coupons = await Coupon.find({
      status: "active",
      $or: [{ endDate: null }, { endDate: { $gte: now } }],
    }).sort({ minOrderValue: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    console.error("[Coupon Controller] getActiveCoupons error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch active coupons" });
  }
};

// ── APPLY COUPON (Validates code, min order, calculates discount) ──
export const applyCoupon = async (req, res) => {
  try {
    await ensureSeedCoupons();
    const { code, orderTotal = 0 } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ success: false, message: "Please provide a valid coupon code" });
    }

    const cleanCode = code.trim().toUpperCase();
    const subtotal = Number(orderTotal) || 0;

    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: `Invalid promo code "${cleanCode}". Please check and try again.`,
      });
    }

    if (coupon.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Promo code "${cleanCode}" is currently inactive.`,
      });
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return res.status(400).json({
        success: false,
        message: `Promo code "${cleanCode}" offer has not started yet.`,
      });
    }

    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return res.status(400).json({
        success: false,
        message: `Promo code "${cleanCode}" has expired.`,
      });
    }

    // Validate Minimum Order Value
    if (coupon.minOrderValue > 0 && subtotal < coupon.minOrderValue) {
      const diff = coupon.minOrderValue - subtotal;
      return res.status(400).json({
        success: false,
        message: `Coupon "${cleanCode}" requires a minimum order of ₹${coupon.minOrderValue.toLocaleString(
          "en-IN"
        )}. Add items worth ₹${diff.toLocaleString("en-IN")} more to apply.`,
        minOrderValue: coupon.minOrderValue,
        shortfall: diff,
      });
    }

    // Calculate Discount Amount
    let discountAmount = 0;
    let isFreeShipping = false;

    if (coupon.discountType === "percentage") {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && coupon.maxDiscount > 0) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else if (coupon.discountType === "flat") {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    } else if (coupon.discountType === "free_shipping") {
      discountAmount = 0;
      isFreeShipping = true;
    }

    return res.status(200).json({
      success: true,
      message: isFreeShipping
        ? `Promo code "${cleanCode}" applied! Free delivery granted.`
        : `Promo code "${cleanCode}" applied! You save ₹${discountAmount.toLocaleString("en-IN")}.`,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        title: coupon.title,
        badge: coupon.badge,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        freeShipping: isFreeShipping,
        minOrderValue: coupon.minOrderValue,
      },
    });
  } catch (error) {
    console.error("[Coupon Controller] applyCoupon error:", error);
    return res.status(500).json({ success: false, message: "Error validating promo code" });
  }
};

// ── GET ALL COUPONS (Admin) ──
export const getAllCoupons = async (req, res) => {
  try {
    await ensureSeedCoupons();
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    console.error("[Coupon Controller] getAllCoupons error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch coupons" });
  }
};

// ── CREATE COUPON (Admin) ──
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      title,
      badge,
      description,
      discountType = "percentage",
      discountValue = 0,
      minOrderValue = 0,
      maxDiscount = null,
      startDate = Date.now(),
      endDate = null,
      status = "active",
    } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ success: false, message: `Coupon code "${cleanCode}" already exists` });
    }

    const coupon = new Coupon({
      code: cleanCode,
      title: title || cleanCode,
      badge: badge || "Special Privilege",
      description: description || "",
      discountType,
      discountValue: Number(discountValue) || 0,
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      status: status || "active",
    });

    await coupon.save();

    return res.status(201).json({
      success: true,
      message: `Coupon "${cleanCode}" created successfully!`,
      coupon,
    });
  } catch (error) {
    console.error("[Coupon Controller] createCoupon error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create coupon" });
  }
};

// ── UPDATE COUPON (Admin) ──
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.code) {
      updateData.code = updateData.code.trim().toUpperCase();
      const existing = await Coupon.findOne({ code: updateData.code, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ success: false, message: `Another coupon with code "${updateData.code}" already exists` });
      }
    }

    if (updateData.discountValue !== undefined) updateData.discountValue = Number(updateData.discountValue);
    if (updateData.minOrderValue !== undefined) updateData.minOrderValue = Number(updateData.minOrderValue);
    if (updateData.maxDiscount !== undefined) updateData.maxDiscount = updateData.maxDiscount ? Number(updateData.maxDiscount) : null;

    const coupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.error("[Coupon Controller] updateCoupon error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update coupon" });
  }
};

// ── DELETE COUPON (Admin) ──
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" deleted successfully`,
    });
  } catch (error) {
    console.error("[Coupon Controller] deleteCoupon error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete coupon" });
  }
};
