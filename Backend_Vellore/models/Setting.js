import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    storeDetails: {
      storeName: { type: String, default: "Shri Deepaalaya Silks" },
      legalName: { type: String, default: "Shri Deepaalaya Silks Pvt Ltd" },
      tagline: { type: String, default: "Heritage of Pure Silk & Traditional Weaves" },
      gstin: { type: String, default: "33AAECS1234F1Z8" },
      pan: { type: String, default: "AAECS1234F" },
      phone: { type: String, default: "+91 94432 18920" },
      whatsapp: { type: String, default: "+91 98423 45678" },
      email: { type: String, default: "support@shrideepaalayasilks.com" },
      address: {
        street: { type: String, default: "No. 42, Katpadi Main Road, Silk Paradise Complex" },
        city: { type: String, default: "Vellore" },
        state: { type: String, default: "Tamil Nadu" },
        pincode: { type: String, default: "632004" },
        country: { type: String, default: "India" }
      },
      supportHours: { type: String, default: "Mon - Sat: 9:30 AM - 8:30 PM (IST)" }
    },
    orderRules: {
      minOrderAmount: { type: Number, default: 499 },
      freeShippingThreshold: { type: Number, default: 2999 },
      standardShippingFee: { type: Number, default: 120 },
      expressShippingFee: { type: Number, default: 250 },
      enableCod: { type: Boolean, default: true },
      maxCodLimit: { type: Number, default: 25000 },
      codHandlingFee: { type: Number, default: 50 },
      autoCancelUnpaidHours: { type: Number, default: 24 }
    },
    exchangePolicy: {
      enableExchange: { type: Boolean, default: true },
      exchangeWindowDays: { type: Number, default: 7 },
      requireUnboxingVideo: { type: Boolean, default: true },
      policyNotice: {
        type: String,
        default: "Exchanges accepted within 7 days of delivery with original tags, Silk Mark intact, and mandatory unboxing video."
      }
    },
    taxCurrency: {
      currencySymbol: { type: String, default: "₹" },
      currencyCode: { type: String, default: "INR" },
      silkGstRate: { type: Number, default: 5 },
      apparelGstRate: { type: Number, default: 12 },
      pricesInclusiveOfTax: { type: Boolean, default: true }
    },
    loyaltyWallet: {
      enabled: { type: Boolean, default: true },
      coinsRewardRatePercent: { type: Number, default: 1 },
      welcomeBonusCoins: { type: Number, default: 100 },
      coinRedemptionValueInr: { type: Number, default: 1 },
      maxRedemptionPercent: { type: Number, default: 20 },
      coinExpiryDays: { type: Number, default: 365 }
    },
    inventoryAlerts: {
      lowStockThreshold: { type: Number, default: 5 },
      allowBackorders: { type: Boolean, default: false },
      showUrgencyStockBadge: { type: Boolean, default: true }
    },
    invoicingAndNotifications: {
      invoicePrefix: { type: String, default: "SDS-INV-" },
      invoiceFooterNote: {
        type: String,
        default: "Pure Silk Mark Certified Genuine Handloom. Thank you for celebrating South Indian heritage with Shri Deepaalaya Silks!"
      },
      orderConfirmationSms: { type: Boolean, default: true },
      dispatchNotificationSms: { type: Boolean, default: true },
      deliveryConfirmationSms: { type: Boolean, default: true }
    },
    storeOperations: {
      maintenanceMode: { type: Boolean, default: false },
      maintenanceNotice: {
        type: String,
        default: "We are curating our newest bridal silk collection. Storefront will be back online shortly!"
      },
      announcementBarEnabled: { type: Boolean, default: true },
      announcementBarText: {
        type: String,
        default: "✨ Festive Silk Utsav: Get complimentary Pure Silk Mark pouch & free shipping on orders above ₹2,999!"
      },
      heroSection: {
        enableCustomBg: { type: Boolean, default: true },
        bgImage: {
          type: String,
          default: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85"
        },
        title: { type: String, default: "Nice Summer Collection" },
        subtitle: { type: String, default: "A Good Looking, Comfortable Traditional Collection" },
        tag: { type: String, default: "Handloom Heritage" }
      }
    },
    updatedBy: {
      adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
      adminName: { type: String },
      updatedAt: { type: Date, default: Date.now }
    }
  },
  { timestamps: true }
);

export const Setting = mongoose.model("Setting", settingSchema);
