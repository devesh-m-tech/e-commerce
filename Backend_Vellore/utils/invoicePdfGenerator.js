import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure invoice directory exists
const INVOICE_DIR = path.join(__dirname, '../uploads/invoices');
if (!fs.existsSync(INVOICE_DIR)) {
  fs.mkdirSync(INVOICE_DIR, { recursive: true });
}

const INVOICE_SIGNING_SECRET = process.env.INVOICE_URL_SIGNING_SECRET || 'sds_invoice_jwt_signing_secret_2026';
const INVOICE_URL_TTL_SECONDS = parseInt(process.env.INVOICE_URL_TTL_SECONDS || '86400', 10); // 24 hours

/**
 * Format Indian Currency INR (₹)
 */
export const formatCurrencyINR = (amount) => {
  const num = Number(amount) || 0;
  return 'Rs. ' + num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

/**
 * Generate Secure Signed URL for Invoice Download
 */
export const generateSignedInvoiceUrl = (orderId, invoiceNumber) => {
  const expires = Math.floor(Date.now() / 1000) + INVOICE_URL_TTL_SECONDS;
  const data = `${orderId}:${invoiceNumber}:${expires}`;
  const signature = crypto.createHmac('sha256', INVOICE_SIGNING_SECRET).update(data).digest('hex');

  const baseUrl = process.env.VITE_SERVER_URL || process.env.SERVER_URL || 'http://localhost:5000';
  return `${baseUrl}/api/orders/${orderId}/invoice/download?token=${signature}&expires=${expires}&inv=${encodeURIComponent(invoiceNumber)}`;
};

/**
 * Verify Signed URL Signature
 */
export const verifySignedInvoiceUrl = (orderId, invoiceNumber, token, expires) => {
  if (!token || !expires || !invoiceNumber) return false;
  const now = Math.floor(Date.now() / 1000);
  if (now > parseInt(expires, 10)) {
    return false; // Expired
  }

  const data = `${orderId}:${invoiceNumber}:${expires}`;
  const expectedSignature = crypto.createHmac('sha256', INVOICE_SIGNING_SECRET).update(data).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedSignature));
};

/**
 * Generate a Branded PDF Document for an Order
 */
export const generateInvoicePdfBuffer = async (order, settings = null) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 40,
        size: 'A4',
        info: {
          Title: `Invoice - ${order.invoiceNumber || order._id}`,
          Author: 'Shri Deepaalaya Silks',
          Subject: 'Tax Invoice & Order Receipt',
        },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const store = settings?.storeDetails || {
        storeName: 'Shri Deepaalaya Silks',
        legalName: 'Shri Deepaalaya Silks Pvt Ltd',
        tagline: 'Heritage of Pure Silk & Traditional Weaves',
        gstin: '33AAECS1234F1Z8',
        phone: '+91 94432 18920',
        email: 'care@shrideepaalayasilks.com',
        address: {
          street: 'No. 42, Katpadi Main Road, Silk Paradise Complex',
          city: 'Vellore',
          state: 'Tamil Nadu',
          pincode: '632004',
          country: 'India',
        },
      };

      // ── COLOR PALETTE ──
      const MAROON = '#6D1734';
      const GOLD = '#C5A15A';
      const CHARCOAL = '#241D17';
      const LIGHT_BG = '#FBF9F5';
      const BORDER_COLOR = '#EAE4D9';

      // ── HEADER ──
      doc.rect(40, 40, 515, 80).fill(LIGHT_BG);

      // Gold Top Accent Line
      doc.rect(40, 40, 515, 3).fill(GOLD);

      // Brand Title
      doc
        .fillColor(MAROON)
        .font('Helvetica-Bold')
        .fontSize(20)
        .text('SHRI DEEPAALAYA SILKS', 55, 52);

      doc
        .fillColor(GOLD)
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('HERITAGE OF PURE SILK · VELLORE', 55, 75);

      doc
        .fillColor(CHARCOAL)
        .font('Helvetica')
        .fontSize(7.5)
        .text(`${store.address?.street}, ${store.address?.city}, ${store.address?.state} - ${store.address?.pincode}`, 55, 88)
        .text(`GSTIN: ${store.gstin} | Contact: ${store.phone}`, 55, 99);

      // Invoice Badge on Top Right
      doc
        .fillColor(MAROON)
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('TAX INVOICE', 400, 52, { align: 'right' });

      doc
        .fillColor(CHARCOAL)
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text(`Inv No: ${order.invoiceNumber || `SDS-INV-${order._id.toString().slice(-6).toUpperCase()}`}`, 400, 72, { align: 'right' })
        .font('Helvetica')
        .fontSize(8)
        .text(`Date: ${new Date(order.invoiceGeneratedAt || order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 400, 85, { align: 'right' })
        .text(`Order ID: #${order._id}`, 400, 97, { align: 'right' });

      // ── BILLING & SHIPPING DETAILS ──
      const yDetails = 135;
      doc.rect(40, yDetails, 250, 85).stroke(BORDER_COLOR);
      doc.rect(305, yDetails, 250, 85).stroke(BORDER_COLOR);

      // Bill To Header
      doc.rect(40, yDetails, 250, 18).fill(MAROON);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8).text('BILLED TO', 50, yDetails + 5);

      // Ship To Header
      doc.rect(305, yDetails, 250, 18).fill(MAROON);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8).text('SHIPPED TO', 315, yDetails + 5);

      const recipientName = order.shippingAddress?.name || 'Customer';
      const addressLine = order.shippingAddress?.address || order.shippingAddress?.street || 'Customer Address';
      const cityStatePin = `${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}`;
      const contactPhone = order.shippingAddress?.contact || '—';

      doc
        .fillColor(CHARCOAL)
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text(recipientName, 50, yDetails + 24)
        .font('Helvetica')
        .fontSize(8)
        .text(addressLine, 50, yDetails + 36, { width: 230 })
        .text(cityStatePin, 50, yDetails + 56)
        .text(`Phone: ${contactPhone}`, 50, yDetails + 68);

      doc
        .fillColor(CHARCOAL)
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text(recipientName, 315, yDetails + 24)
        .font('Helvetica')
        .fontSize(8)
        .text(addressLine, 315, yDetails + 36, { width: 230 })
        .text(cityStatePin, 315, yDetails + 56)
        .text(`Payment: ${order.paymentMethod} (${order.paymentStatus})`, 315, yDetails + 68);

      // ── ITEMS TABLE ──
      let yTable = 235;

      // Table Header
      doc.rect(40, yTable, 515, 20).fill(LIGHT_BG).stroke(BORDER_COLOR);
      doc
        .fillColor(MAROON)
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('S.NO', 48, yTable + 6)
        .text('DESCRIPTION / PRODUCT', 85, yTable + 6)
        .text('QTY', 340, yTable + 6, { align: 'center', width: 30 })
        .text('UNIT PRICE', 385, yTable + 6, { align: 'right', width: 70 })
        .text('TOTAL', 475, yTable + 6, { align: 'right', width: 70 });

      yTable += 20;

      // Line Items
      const items = Array.isArray(order.items) ? order.items : [];
      items.forEach((item, idx) => {
        const pName = item.product?.pName || item.pName || item.name || 'Silk Sarees / Apparel';
        const qty = item.quantity || 1;
        const unitPrice = item.price || item.pPrice || Math.round((order.totalAmount || 0) / (items.length || 1));
        const total = qty * unitPrice;

        doc.rect(40, yTable, 515, 22).stroke(BORDER_COLOR);

        doc
          .fillColor(CHARCOAL)
          .font('Helvetica')
          .fontSize(8)
          .text(String(idx + 1), 50, yTable + 6)
          .font('Helvetica-Bold')
          .text(pName.substring(0, 48), 85, yTable + 6, { width: 245 })
          .font('Helvetica')
          .text(String(qty), 340, yTable + 6, { align: 'center', width: 30 })
          .text(formatCurrencyINR(unitPrice), 385, yTable + 6, { align: 'right', width: 70 })
          .font('Helvetica-Bold')
          .text(formatCurrencyINR(total), 475, yTable + 6, { align: 'right', width: 70 });

        yTable += 22;
      });

      // ── SUMMARY & TOTALS ──
      yTable += 10;
      const subtotal = order.totalAmount || order.finalAmount || 0;
      const shipping = order.shippingCharges || 0;
      const discount = order.discount || 0;
      const grandTotal = order.finalAmount || (subtotal + shipping - discount);

      // Terms on the Left
      doc.rect(40, yTable, 280, 85).fill(LIGHT_BG).stroke(BORDER_COLOR);
      doc
        .fillColor(MAROON)
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('DECLARATION & GUARANTEE', 50, yTable + 8);

      doc
        .fillColor(CHARCOAL)
        .font('Helvetica')
        .fontSize(7)
        .text('• Certified Pure Handloom Silk with authentic Silk Mark assurance.', 50, yTable + 22, { width: 260 })
        .text('• All prices are inclusive of applicable GST taxes.', 50, yTable + 34, { width: 260 })
        .text('• For questions or support, contact care@shrideepaalayasilks.com.', 50, yTable + 46, { width: 260 })
        .text('• Computer generated invoice. No signature required.', 50, yTable + 58, { width: 260 });

      // Calculation Box on the Right
      const yCalc = yTable;
      doc.rect(330, yCalc, 225, 85).stroke(BORDER_COLOR);

      const writeCalcLine = (label, value, y, isBold = false) => {
        doc
          .fillColor(isBold ? MAROON : CHARCOAL)
          .font(isBold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(isBold ? 9.5 : 8)
          .text(label, 340, y)
          .text(value, 465, y, { align: 'right', width: 80 });
      };

      writeCalcLine('Subtotal:', formatCurrencyINR(subtotal), yCalc + 8);
      writeCalcLine('Shipping Charges:', shipping === 0 ? 'FREE' : formatCurrencyINR(shipping), yCalc + 22);
      if (discount > 0) {
        writeCalcLine('Discount Applied:', `- ${formatCurrencyINR(discount)}`, yCalc + 36);
      } else {
        writeCalcLine('GST (Included):', '5% / 12%', yCalc + 36);
      }

      // Grand Total Highlight
      doc.rect(330, yCalc + 55, 225, 30).fill(MAROON);
      doc
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('GRAND TOTAL:', 340, yCalc + 64)
        .text(formatCurrencyINR(grandTotal), 445, yCalc + 64, { align: 'right', width: 100 });

      // ── FOOTER ──
      const yFooter = 750;
      doc.rect(40, yFooter, 515, 1).fill(GOLD);
      doc
        .fillColor(CHARCOAL)
        .font('Helvetica')
        .fontSize(7.5)
        .text(
          'Thank you for celebrating South Indian Handloom & Pure Silk Heritage with Shri Deepaalaya Silks!',
          40,
          yFooter + 8,
          { align: 'center', width: 515 }
        )
        .fillColor(GOLD)
        .fontSize(7)
        .text('Vellore, Tamil Nadu · Official WhatsApp Support: +91 94432 18920', 40, yFooter + 20, {
          align: 'center',
          width: 515,
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Generate and save PDF to disk
 */
export const saveInvoicePdfToDisk = async (order, settings = null) => {
  const buffer = await generateInvoicePdfBuffer(order, settings);
  const invNumber = order.invoiceNumber || `SDS-INV-${order._id.toString().slice(-6).toUpperCase()}`;
  const safeFilename = `${invNumber.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
  const filePath = path.join(INVOICE_DIR, safeFilename);

  await fs.promises.writeFile(filePath, buffer);
  return {
    filename: safeFilename,
    filePath,
    buffer,
  };
};

export default {
  generateInvoicePdfBuffer,
  saveInvoicePdfToDisk,
  generateSignedInvoiceUrl,
  verifySignedInvoiceUrl,
  formatCurrencyINR,
};
