# Shri Deepaalaya Silks — WhatsApp Business Cloud API Integration Guide & Meta Templates

This document contains the exact templates for Meta Business Manager approval, webhook setup instructions, and guidance for transitioning from development (sandbox mock mode) to live production once client credentials arrive.

---

## 1. Meta Template Submission Matrix (Pre-Approved Format)

Submit each of the following templates in **Meta WhatsApp Business Manager** -> **Account Tools** -> **Message Templates**.

### 1. `sds_order_confirmed_v1` (Order Confirmation with Invoice PDF)
* **Category**: `UTILITY`
* **Language**: `English (US)` (`en_US`)
* **Header**: `Document` (Sample PDF required by Meta during review)
* **Body**:
```text
Vanakkam {{1}}! 🙏

Thank you for choosing Shri Deepaalaya Silks. Your order #{{2}} for {{3}} item(s) valued at ₹{{4}} has been confirmed.

Your official GST Tax Invoice has been attached above for your records. We are carefully inspecting and packaging your pure handloom silk piece.

We will share live dispatch and tracking details as soon as your parcel is on its way.
```
* **Footer**: `Pure Silk Mark Certified Genuine Handloom`
* **Buttons**:
  * Quick Reply: `Track My Order`
  * URL: `View Order` -> `https://www.shrideepaalayasilks.com/profile`

---

### 2. `sds_order_shipped_v1` (Order Dispatched with Courier Tracking)
* **Category**: `UTILITY`
* **Language**: `English (US)` (`en_US`)
* **Header**: None or Text: `Order Dispatched 🚚`
* **Body**:
```text
Vanakkam {{1}}! 📦

Delighted to inform you that your Shri Deepaalaya Silks order #{{2}} is on its way to you!

Carrier: {{3}}
Tracking / AWB: {{4}}

Track your authentic handloom delivery directly using the link below:
```
* **Footer**: `Shri Deepaalaya Silks — Vellore`
* **Buttons**:
  * URL: `Track Shipment` -> `https://www.shrideepaalayasilks.com/track/{{1}}` (dynamic tracking suffix)

---

### 3. `sds_order_delivered_v1` (Order Delivered Confirmation)
* **Category**: `UTILITY`
* **Language**: `English (US)` (`en_US`)
* **Header**: Text: `Package Delivered 🎉`
* **Body**:
```text
Vanakkam {{1}}! 🌸

Your Shri Deepaalaya Silks parcel for order #{{2}} has been successfully delivered to your doorstep.

We hope you cherish the rich drape, pure zari, and artisanal craftsmanship. Please check your Silk Mark tag inside.

If you have any queries or need draping advice, our boutique team is here to assist you!
```
* **Footer**: `Thank you for celebrating South Indian heritage with us.`
* **Buttons**:
  * Quick Reply: `Contact Boutique`
  * URL: `Review Quality` -> `https://www.shrideepaalayasilks.com/profile`

---

### 4. `sds_order_cancelled_v1` (Order Cancellation Notice)
* **Category**: `UTILITY`
* **Language**: `English (US)` (`en_US`)
* **Header**: Text: `Order Cancellation Notice`
* **Body**:
```text
Vanakkam {{1}},

Your order #{{2}} at Shri Deepaalaya Silks has been cancelled.

Reason: {{3}}

Any pre-paid online payment or wallet credits will be refunded to your original payment source within 5-7 working days. If this was not expected, please contact our helpline immediately.
```
* **Footer**: `Helpline: +91 94432 18920`
* **Buttons**:
  * Quick Reply: `Contact Support`

---

### 5. `sds_refund_processed_v1` (Refund Processed Alert)
* **Category**: `UTILITY`
* **Language**: `English (US)` (`en_US`)
* **Header**: Text: `Refund Processed 💳`
* **Body**:
```text
Vanakkam {{1}},

A refund of ₹{{2}} has been successfully processed for your order #{{3}}.

Payment Gateway: Razorpay
Credit Timeframe: 5 to 7 business days depending on your bank / UPI provider.

For reference or bank statement reconciliation, please save this confirmation.
```
* **Footer**: `Shri Deepaalaya Silks Accounts Team`

---

### 6. `sds_owner_new_order_v1` (Boutique Owner / Staff Alert)
* **Category**: `UTILITY`
* **Language**: `English (US)` (`en_US`)
* **Header**: Text: `🛍️ New Order Received!`
* **Body**:
```text
*Shri Deepaalaya Silks — Order Alert*

Order ID: #{{1}}
Customer: {{2}} ({{3}})
Items: {{4}}
Total Amount: ₹{{5}}

Please prepare the Silk Mark verification and handloom packaging for dispatch.
```
* **Footer**: `Automated SDS Internal System`
* **Buttons**:
  * URL: `Open Admin Portal` -> `http://localhost:5174/orders`

---

## 2. Meta Cloud API Configuration & Environment Setup

When the client provides their official credentials, simply replace the dummy values in `Backend_Vellore/.env`:

| Key in `.env` | Description | Example / Where to find in Meta |
| :--- | :--- | :--- |
| `WHATSAPP_ENABLED` | Master feature toggle | `true` |
| `WHATSAPP_PROVIDER` | Engine provider | `cloud_api` (or `mock` for testing) |
| `WHATSAPP_API_VERSION` | Meta Graph API Version | `v21.0` |
| `WHATSAPP_PHONE_NUMBER_ID` | Business Phone Number ID | Meta App Dashboard -> WhatsApp -> API Setup |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | WhatsApp Business Account (WABA) ID | Meta Business Manager -> WhatsApp Accounts |
| `WHATSAPP_ACCESS_TOKEN` | System User Permanent Access Token | Meta Business Manager -> System Users -> Generate Token (Permissions: `whatsapp_business_messaging`, `whatsapp_business_management`) |
| `WHATSAPP_APP_SECRET` | App Secret (Used for HMAC Webhook Verification) | Meta App Dashboard -> App Settings -> Basic -> App Secret |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Webhook verification token | Set any random secret, e.g. `sds_whatsapp_verify_token_2026` |
| `WHATSAPP_BUSINESS_PHONE` | Official Boutique WhatsApp Number | `+919443218920` |
| `WHATSAPP_OWNER_NUMBERS` | Comma-separated admin numbers for order alerts | `+919443218920, +919842345678` |
| `INVOICE_NUMBER_PREFIX` | Prefix for generated GST invoices | `SDS-INV-` |
| `INVOICE_URL_SIGNING_SECRET` | Secret key for signed invoice download URLs | Secure 32+ char random string |
| `INVOICE_URL_TTL_SECONDS` | Lifetime of signed invoice URL | `86400` (24 hours) |

---

## 3. Webhook Setup in Meta Developer Dashboard

1. In the Meta Developer Portal, navigate to **WhatsApp** -> **Configuration** -> **Webhook**.
2. **Callback URL**: `https://your-domain.com/api/webhooks/whatsapp`
3. **Verify Token**: Must match `WHATSAPP_WEBHOOK_VERIFY_TOKEN` in `.env`.
4. Click **Verify and Save**.
5. Under **Webhook fields**, subscribe to:
   * `messages` (Receives delivery receipts: `sent`, `delivered`, `read`, `failed`)
6. Meta will send real-time delivery callbacks signed with `X-Hub-Signature-256`, which our server automatically validates using `WHATSAPP_APP_SECRET`.

---

## 4. Sandbox Mock Mode (Zero-Error Local Development)

* While dummy values are present in `.env`, the system automatically defaults to `MockWhatsAppProvider`.
* In mock mode:
  1. PDF invoices are generated with the luxury Shri Deepaalaya Silks theme and Silk Mark logo.
  2. Signed download URLs are cryptographically generated and verified.
  3. Messages are queued, processed by the background worker, and recorded into MongoDB `whatsapp_messages` collection with generated mock WAMID IDs.
  4. Admin UI (`/whatsapp-logs`) displays status, filters, and allows CSV exports.
  5. Zero outbound HTTP requests fail or crash the server.
