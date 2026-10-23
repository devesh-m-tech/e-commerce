import { Setting } from "../models/Setting.js";
import { AdminActivity } from "../models/AdminActivity.js";

// Helper to get or initialize default settings
const getOrCreateDefaultSettings = async () => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = new Setting();
    await settings.save();
  }
  return settings;
};

// GET /api/settings - Full settings for Admin
export const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateDefaultSettings();
    return res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
      error: error.message
    });
  }
};

// GET /api/settings/public - Public storefront configuration
export const getPublicSettings = async (req, res) => {
  try {
    const settings = await getOrCreateDefaultSettings();
    return res.status(200).json({
      success: true,
      data: {
        storeDetails: settings.storeDetails,
        orderRules: {
          minOrderAmount: settings.orderRules.minOrderAmount,
          freeShippingThreshold: settings.orderRules.freeShippingThreshold,
          enableCod: settings.orderRules.enableCod,
          maxCodLimit: settings.orderRules.maxCodLimit,
          codHandlingFee: settings.orderRules.codHandlingFee
        },
        exchangePolicy: settings.exchangePolicy,
        taxCurrency: settings.taxCurrency,
        storeOperations: settings.storeOperations
      }
    });
  } catch (error) {
    console.error("Error fetching public settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch storefront settings",
      error: error.message
    });
  }
};

// PUT /api/settings - Update settings (Admin only)
export const updateSettings = async (req, res) => {
  try {
    let settings = await getOrCreateDefaultSettings();

    const {
      storeDetails,
      orderRules,
      exchangePolicy,
      taxCurrency,
      loyaltyWallet,
      inventoryAlerts,
      invoicingAndNotifications,
      storeOperations
    } = req.body;

    if (storeDetails) {
      settings.storeDetails = { ...settings.storeDetails.toObject(), ...storeDetails };
    }
    if (orderRules) {
      settings.orderRules = { ...settings.orderRules.toObject(), ...orderRules };
    }
    if (exchangePolicy) {
      settings.exchangePolicy = { ...settings.exchangePolicy.toObject(), ...exchangePolicy };
    }
    if (taxCurrency) {
      settings.taxCurrency = { ...settings.taxCurrency.toObject(), ...taxCurrency };
    }
    if (loyaltyWallet) {
      settings.loyaltyWallet = { ...settings.loyaltyWallet.toObject(), ...loyaltyWallet };
    }
    if (inventoryAlerts) {
      settings.inventoryAlerts = { ...settings.inventoryAlerts.toObject(), ...inventoryAlerts };
    }
    if (invoicingAndNotifications) {
      settings.invoicingAndNotifications = {
        ...settings.invoicingAndNotifications.toObject(),
        ...invoicingAndNotifications
      };
    }
    if (storeOperations) {
      settings.storeOperations = { ...settings.storeOperations.toObject(), ...storeOperations };
    }

    if (req.user) {
      settings.updatedBy = {
        adminId: req.user._id,
        adminName: req.user.name || req.user.email || "Admin",
        updatedAt: new Date()
      };
    }

    const updated = await settings.save();

    // Log admin activity
    try {
      if (req.user) {
        await new AdminActivity({
          admin: req.user._id,
          action: "UPDATE",
          entityType: "SETTINGS",
          details: "Updated Store & E-Commerce configuration parameters",
          ipAddress: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
          userAgent: req.headers["user-agent"] || "AdminPortal"
        }).save();
      }
    } catch (actErr) {
      console.warn("Could not record settings AdminActivity:", actErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Store configuration updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update settings",
      error: error.message
    });
  }
};

// POST /api/settings/reset - Reset to factory defaults
export const resetSettings = async (req, res) => {
  try {
    await Setting.deleteMany({});
    const newSettings = new Setting({
      updatedBy: {
        adminId: req.user?._id,
        adminName: req.user?.name || "Admin",
        updatedAt: new Date()
      }
    });
    await newSettings.save();

    return res.status(200).json({
      success: true,
      message: "Settings reset to default configuration successfully",
      data: newSettings
    });
  } catch (error) {
    console.error("Error resetting settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset settings",
      error: error.message
    });
  }
};
