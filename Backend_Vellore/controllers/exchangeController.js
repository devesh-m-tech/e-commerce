import Exchange from "../models/Exchange.js";
import { Order } from "../models/order.js";
import productModel from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
import { AdminActivity } from "../models/AdminActivity.js";
import { createNotification } from "./notificationController.js";
import { sendOrderAlert } from "../utils/smsNotification.js";
import sendMail from "../utils/sendMail.js";

// Customer: Submit an Exchange Request
export const createExchangeRequest = async (req, res) => {
  try {
    const {
      orderId,
      orderNumber,
      productId,
      variantId,
      reason,
      requestedSizeOrItem,
      photos = [],
      video,
      customerName,
      customerPhone,
      customerEmail
    } = req.body;

    if (!orderId && !orderNumber) {
      return res.status(400).json({ success: false, message: "Order number or Order ID is required" });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: "Reason for exchange is required" });
    }

    if (!video || !video.trim()) {
      return res.status(400).json({ success: false, message: "A video showing the issue/product is strictly required for exchange review" });
    }

    // Find the order
    const query = orderId ? { _id: orderId } : { _id: orderNumber };
    let order;
    try {
      order = await Order.findOne(query).populate("items.product");
    } catch (e) {
      order = await Order.findById(orderId).populate("items.product");
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found with provided ID" });
    }

    // Verify user authorization if logged in
    const userId = req.user ? req.user._id : order.user;
    if (req.user && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to request exchange for this order" });
    }

    // Check order delivery status
    if (order.orderStatus !== "DELIVERED") {
      return res.status(400).json({
        success: false,
        message: `Exchange requests can only be filed after order delivery. Current order status: ${order.orderStatus}`
      });
    }

    // Find item in order
    let targetItem = null;
    if (order.items && order.items.length > 0) {
      if (productId) {
        targetItem = order.items.find(i => {
          const pId = i.product?._id ? i.product._id.toString() : i.product?.toString();
          return pId === productId.toString();
        });
      }
      if (!targetItem) {
        targetItem = order.items[0]; // Default to first item if single product order
      }
    }

    const resolvedProduct = targetItem?.product?._id ? targetItem.product : (productId ? await productModel.findById(productId) : null);
    const prodName = resolvedProduct?.pName || targetItem?.product?.pName || targetItem?.name || "Ordered Product";
    const prodImg = (resolvedProduct?.pImage && resolvedProduct.pImage[0]) || targetItem?.image || "";

    // Check for existing pending exchange on this item
    const existing = await Exchange.findOne({
      orderId: order._id,
      product: resolvedProduct?._id || productId || order.items[0]?.product,
      status: { $in: ["PENDING", "APPROVED"] }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `An active exchange request (#${existing._id}) is already ${existing.status} for this product.`
      });
    }

    const exchange = new Exchange({
      orderId: order._id,
      orderNumber: order._id.toString().toUpperCase(),
      userId: userId,
      customerName: customerName || order.shippingAddress?.name || req.user?.name || "Customer",
      customerEmail: customerEmail || req.user?.email || "customer@example.com",
      customerPhone: customerPhone || order.shippingAddress?.contact || order.shippingAddress?.mobile || req.user?.mobile || "",
      product: resolvedProduct?._id || productId || order.items[0]?.product,
      productName: prodName,
      productImage: prodImg,
      variantId: variantId || targetItem?.variantId || null,
      variantDetails: requestedSizeOrItem || targetItem?.variantValue || "",
      quantity: targetItem?.quantity || 1,
      reason,
      requestedSizeOrItem: requestedSizeOrItem || "",
      photos: Array.isArray(photos) ? photos : [photos].filter(Boolean),
      video,
      status: "PENDING",
      exchangeOrderStatus: "PENDING_REVIEW",
      history: [
        {
          status: "PENDING",
          updatedAt: new Date(),
          note: `Exchange request initiated by customer: ${reason}`,
          updatedBy: "Customer"
        }
      ]
    });

    await exchange.save();

    // Alert Customer
    if (exchange.customerPhone) {
      sendOrderAlert(
        exchange.customerPhone,
        `Your exchange request for Order #${exchange.orderNumber} has been received. Our team will review your photos/video within 24-48 hours.`
      );
    }

    // In-app notification if user is authenticated
    if (req.user) {
      await createNotification({
        userId: req.user._id,
        title: "Exchange Request Submitted",
        message: `Your exchange request for Order #${exchange.orderNumber} is pending admin review.`,
        type: "ORDER",
        link: `/profile/orders`,
      }).catch(() => {});
    }

    res.status(201).json({
      success: true,
      message: "Exchange request submitted successfully. It will remain pending until store admin reviews the evidence.",
      exchange
    });
  } catch (error) {
    console.error("Error in createExchangeRequest:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to submit exchange request" });
  }
};

// Customer: Get My Exchanges
export const getUserExchanges = async (req, res) => {
  try {
    const exchanges = await Exchange.find({ userId: req.user._id })
      .populate("product")
      .populate("orderId")
      .sort("-createdAt");

    res.status(200).json({ success: true, exchanges });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching exchanges" });
  }
};

// Customer or Guest: Track Exchange by Order ID or Exchange ID
export const trackExchange = async (req, res) => {
  try {
    const { orderIdentifier } = req.params;
    let exchange = await Exchange.findOne({
      $or: [
        { orderNumber: orderIdentifier.toUpperCase() },
        { _id: orderIdentifier.match(/^[0-9a-fA-F]{24}$/) ? orderIdentifier : null }
      ]
    }).populate("product");

    if (!exchange) {
      return res.status(404).json({ success: false, message: "No exchange request found for this order" });
    }

    res.status(200).json({ success: true, exchange });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error tracking exchange" });
  }
};

// Admin / Staff: Get All Exchanges
export const getAllExchangesAdmin = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== "ALL") {
      filter.status = status.toUpperCase();
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { orderNumber: searchRegex },
        { customerName: searchRegex },
        { customerPhone: searchRegex },
        { customerEmail: searchRegex },
        { productName: searchRegex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Exchange.countDocuments(filter);
    const exchanges = await Exchange.find(filter)
      .populate("product")
      .populate("orderId")
      .sort("-createdAt")
      .skip(skip)
      .limit(parseInt(limit));

    // Stats count
    const pendingCount = await Exchange.countDocuments({ status: "PENDING" });
    const approvedCount = await Exchange.countDocuments({ status: "APPROVED" });
    const rejectedCount = await Exchange.countDocuments({ status: "REJECTED" });
    const completedCount = await Exchange.countDocuments({ status: "COMPLETED" });

    res.status(200).json({
      success: true,
      exchanges,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      },
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        completed: completedCount,
        total: total
      }
    });
  } catch (error) {
    console.error("Error in getAllExchangesAdmin:", error);
    res.status(500).json({ success: false, message: "Error fetching exchange requests" });
  }
};

// Admin / Staff: Approve or Reject Exchange Request
export const updateExchangeStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, internalNote, adjustStock = false } = req.body;

    if (!["APPROVED", "REJECTED", "COMPLETED", "CANCELLED"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    if (status === "REJECTED" && (!rejectionReason || !rejectionReason.trim())) {
      return res.status(400).json({ success: false, message: "A clear rejection reason must be provided when rejecting an exchange" });
    }

    const exchange = await Exchange.findById(id).populate("product");
    if (!exchange) {
      return res.status(404).json({ success: false, message: "Exchange request not found" });
    }

    const adminUser = req.user;
    const adminName = adminUser?.name || "Admin Staff";

    exchange.status = status;
    exchange.adminDecision = {
      decidedBy: adminUser?._id,
      decidedByName: adminName,
      decidedAt: new Date(),
      rejectionReason: status === "REJECTED" ? rejectionReason : "",
      internalNote: internalNote || ""
    };

    if (status === "APPROVED") {
      exchange.exchangeOrderStatus = "APPROVED_PICKUP_SCHEDULED";
      // Auto stock adjustment if requested
      if (adjustStock && !exchange.stockAdjusted) {
        if (exchange.product) {
          await productModel.findByIdAndUpdate(exchange.product._id || exchange.product, {
            $inc: { pStock: -exchange.quantity }
          });
        }
        exchange.stockAdjusted = true;
      }
    } else if (status === "REJECTED") {
      exchange.exchangeOrderStatus = "REJECTED";
    } else if (status === "COMPLETED") {
      exchange.exchangeOrderStatus = "COMPLETED";
    }

    exchange.history.push({
      status,
      updatedAt: new Date(),
      note: status === "REJECTED" ? `Rejected: ${rejectionReason}` : (internalNote || `Marked as ${status}`),
      updatedBy: adminName
    });

    await exchange.save();

    // Log admin activity for accountability (Requirement 2.F)
    try {
      await new AdminActivity({
        adminId: adminUser._id,
        action: "update",
        module: "order",
        details: `Exchange #${exchange._id} for Order #${exchange.orderNumber} ${status}. Decision: ${status === "REJECTED" ? rejectionReason : "Approved"}`,
      }).save();
    } catch (e) {}

    // Send WhatsApp / SMS update to customer
    if (exchange.customerPhone) {
      const msg = status === "APPROVED"
        ? `Your exchange request for Order #${exchange.orderNumber} has been APPROVED! Our team will contact you regarding pickup and replacement dispatch.`
        : `Your exchange request for Order #${exchange.orderNumber} was not approved. Reason: ${rejectionReason}`;
      sendOrderAlert(exchange.customerPhone, msg);
    }

    // In-app notification
    await createNotification({
      userId: exchange.userId,
      title: `Exchange Request ${status === "APPROVED" ? "Approved ✅" : "Rejected ❌"}`,
      message: status === "APPROVED"
        ? `Your exchange for Order #${exchange.orderNumber} has been approved.`
        : `Your exchange for Order #${exchange.orderNumber} was rejected: ${rejectionReason}`,
      type: "ORDER",
      link: `/profile/orders`,
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: `Exchange request ${status.toLowerCase()} successfully`,
      exchange
    });
  } catch (error) {
    console.error("Error in updateExchangeStatusAdmin:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update exchange status" });
  }
};

// Admin: Update Exchange Operational Workflow Status
export const updateExchangeWorkflowAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { exchangeOrderStatus, note } = req.body;

    const exchange = await Exchange.findById(id);
    if (!exchange) {
      return res.status(404).json({ success: false, message: "Exchange request not found" });
    }

    exchange.exchangeOrderStatus = exchangeOrderStatus;
    if (exchangeOrderStatus === "COMPLETED") {
      exchange.status = "COMPLETED";
    }

    exchange.history.push({
      status: exchangeOrderStatus,
      updatedAt: new Date(),
      note: note || `Exchange workflow status updated to ${exchangeOrderStatus}`,
      updatedBy: req.user?.name || "Admin Staff"
    });

    await exchange.save();

    res.status(200).json({ success: true, message: "Workflow status updated", exchange });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
