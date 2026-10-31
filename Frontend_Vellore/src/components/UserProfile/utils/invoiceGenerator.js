import { transformImageUrl } from "../../../APi/utils";

export const FALLBACK_PRODUCT_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%238C6D3E%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20style%3D%22background%3A%23faf8f5%22%3E%3Crect%20width%3D%2218%22%20height%3D%2218%22%20x%3D%223%22%20y%3D%223%22%20rx%3D%222%22%20ry%3D%222%22%2F%3E%3Ccircle%20cx%3D%228.5%22%20cy%3D%228.5%22%20r%3D%221.5%22%2F%3E%3Cpath%20d%3D%22m21%2015-5-5L5%2021%22%2F%3E%3C%2Fsvg%3E";

export const getItemImageUrl = (item) => {
  if (!item) return "";

  let raw = "";

  if (item.comboImage) {
    raw = item.comboImage;
  } else if (item.image) {
    raw = item.image;
  } else if (item.variantId?.image) {
    raw = item.variantId.image;
  } else if (item.product) {
    const p = item.product;
    if (Array.isArray(p.pImage) && p.pImage.length > 0) {
      raw = p.pImage[0];
    } else if (typeof p.pImage === "string" && p.pImage.trim()) {
      raw = p.pImage.split(",")[0].trim();
    } else if (p.pImage && typeof p.pImage === "object") {
      raw = p.pImage.url || p.pImage.path || p.pImage.src || "";
    } else if (Array.isArray(p.images) && p.images.length > 0) {
      raw = p.images[0];
    } else if (p.image) {
      raw = p.image;
    }
  }

  if (typeof raw === "object" && raw !== null) {
    raw = raw.url || raw.path || raw.src || "";
  }

  if (typeof raw === "string" && raw.includes(",") && !raw.startsWith("http") && !raw.startsWith("data:")) {
    raw = raw.split(",")[0].trim();
  }

  return raw ? transformImageUrl(raw) : "";
};

export const formatProfessionalDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const numberFormat = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const getVoucherAmount = (order) =>
  order?.discount || order?.kaitCoinsUsed || 0;

export const getDisplayPaymentMethod = (order) =>
  order?.paymentMethod || "RAZORPAY / ONLINE";

export const getDisplayPaymentStatus = (order) =>
  order?.paymentStatus || "PAID";

export const getStageDate = (order, stage) => {
  if (!order) return null;
  if (stage === "ORDER PLACED") return order.createdAt;
  if (stage === "PACKED") {
    if (["PACKED", "DISPATCHED", "DELIVERED"].includes(order.orderStatus)) {
      return order.updatedAt || order.createdAt;
    }
  }
  if (stage === "DISPATCHED") {
    if (["DISPATCHED", "DELIVERED"].includes(order.orderStatus)) {
      return order.updatedAt || order.createdAt;
    }
  }
  if (stage === "DELIVERED") {
    if (order.orderStatus === "DELIVERED") {
      return order.updatedAt || order.createdAt;
    }
  }
  if (stage === "CANCELLED") {
    if (order.orderStatus === "CANCELLED") {
      return order.updatedAt || order.createdAt;
    }
  }
  return null;
};

export const generateAndPrintInvoice = (order) => {
  if (!order) return;

  const sellingPrice =
    order.items?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0) || 0;

  const listingPrice =
    order.items?.reduce((sum, item) => {
      const mrp =
        item.variantId?.previousPrice ||
        item.product?.pPreviousPrice ||
        item.product?.pMrp ||
        item.price ||
        0;
      return sum + mrp * (item.quantity || 1);
    }, 0) || sellingPrice;

  const totalDiscount = Math.max(0, listingPrice - sellingPrice);
  const voucherAmount = getVoucherAmount(order);

  const invoiceHtml = `<!DOCTYPE html>
<html>
  <head>
    <title>Tax Invoice - ${order._id}</title>
    <meta charset="UTF-8">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #1a1a1a;
        background: #fff;
        padding: 30px;
        line-height: 1.5;
      }
      .invoice-card {
        max-width: 820px;
        margin: 0 auto;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 36px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
        padding-bottom: 20px;
        border-bottom: 2px solid #6D1734;
      }
      .brand-title {
        font-family: 'Playfair Display', Georgia, serif;
        color: #6D1734;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }
      .brand-tagline {
        font-size: 11px;
        color: #8C6D3E;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .invoice-meta {
        text-align: right;
      }
      .invoice-meta h1 {
        font-size: 20px;
        color: #6D1734;
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .invoice-meta p {
        font-size: 12px;
        color: #6b7280;
      }
      .address-container {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 20px;
        margin-bottom: 28px;
        background: #faf8f5;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid #f0eae1;
      }
      .addr-box h3 {
        font-size: 12px;
        font-weight: 700;
        margin-bottom: 8px;
        color: #6D1734;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .addr-box p {
        font-size: 12px;
        color: #374151;
        margin-bottom: 3px;
      }
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 24px;
      }
      .items-table th {
        background: #6D1734;
        color: #fff;
        text-align: left;
        padding: 10px 14px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .items-table td {
        padding: 10px 14px;
        font-size: 12px;
        border-bottom: 1px solid #e5e7eb;
        vertical-align: middle;
      }
      .items-table tr:nth-child(even) td {
        background: #fdfcfb;
      }
      .text-right { text-align: right !important; }
      .text-center { text-align: center !important; }
      .item-img-cell {
        width: 64px;
        text-align: center;
        padding: 8px !important;
      }
      .item-thumb-box {
        width: 50px;
        height: 50px;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid #e5e7eb;
        background: #faf8f5;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        vertical-align: middle;
      }
      .item-thumb-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .item-desc-cell {
        vertical-align: middle;
      }
      .item-title {
        font-weight: 600;
        color: #111827;
        font-size: 13px;
        line-height: 1.4;
      }
      .item-brand {
        font-size: 11px;
        color: #8C6D3E;
        font-weight: 600;
        margin-top: 2px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .item-variant {
        font-size: 11px;
        color: #6b7280;
        margin-top: 2px;
      }
      .summary-wrapper {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 28px;
      }
      .summary-table {
        width: 320px;
      }
      .summary-table td {
        padding: 6px 12px;
        font-size: 13px;
        color: #374151;
      }
      .summary-table .total-row {
        border-top: 2px solid #6D1734;
        font-weight: 700;
        font-size: 16px;
        color: #6D1734;
        background: #faf8f5;
      }
      .discount-txt {
        color: #059669;
        font-weight: 600;
      }
      .footer {
        margin-top: 36px;
        padding-top: 16px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
        font-size: 11px;
        color: #6b7280;
      }
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        body { padding: 0; background: #fff; }
        .invoice-card { border: none; padding: 10px; max-width: 100%; }
        .item-thumb-box {
          border: 1px solid #d1d5db !important;
          background: #faf8f5 !important;
        }
        .item-thumb-img {
          print-color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="invoice-card">
      <div class="header">
        <div>
          <h2 class="brand-title">Shri Deepaalaya Silks</h2>
          <div class="brand-tagline">Authentic Handcrafted Elegance · Vellore</div>
        </div>
        <div class="invoice-meta">
          <h1>Tax Invoice</h1>
          <p>Generated: ${formatProfessionalDate(new Date())}</p>
        </div>
      </div>

      <div class="address-container">
        <div class="addr-box">
          <h3>Sold By</h3>
          <p><strong>Shri Deepaalaya Silks</strong></p>
          <p>Anna Salai, Vellore, Tamil Nadu - 632001</p>
          <p>GSTIN: 33AABCXXXXX</p>
        </div>
        <div class="addr-box">
          <h3>Shipping Address</h3>
          <p><strong>${order.shippingAddress?.name || "Customer"}</strong></p>
          <p>${order.shippingAddress?.address || order.shippingAddress?.street || ""}</p>
          <p>${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} - ${order.shippingAddress?.pincode || ""}</p>
          <p>Phone: ${order.shippingAddress?.mobile || order.shippingAddress?.contact || "N/A"}</p>
        </div>
        <div class="addr-box">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> #${order._id?.toUpperCase()}</p>
          <p><strong>Date:</strong> ${formatProfessionalDate(order.createdAt)}</p>
          <p><strong>Status:</strong> ${order.orderStatus || "CONFIRMED"}</p>
          <p><strong>Payment:</strong> ${getDisplayPaymentMethod(order)} (${getDisplayPaymentStatus(order)})</p>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th width="5%" class="text-center">#</th>
            <th width="12%" class="text-center">Image</th>
            <th>Item Description</th>
            <th class="text-right" width="16%">Price</th>
            <th class="text-right" width="10%">Qty</th>
            <th class="text-right" width="18%">Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            ?.map((item, idx) => {
              const imgUrl = getItemImageUrl(item) || FALLBACK_PRODUCT_IMAGE;
              const productName = item.product?.pName || item.comboName || "Product";
              const brand = item.product?.pBrand;
              const safeAlt = (productName || "").replace(/"/g, "&quot;");
              return `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td class="item-img-cell">
                <div class="item-thumb-box">
                  <img
                    src="${imgUrl}"
                    alt="${safeAlt}"
                    class="item-thumb-img"
                    loading="eager"
                    onerror="this.onerror=null; this.src='${FALLBACK_PRODUCT_IMAGE}';"
                  />
                </div>
              </td>
              <td class="item-desc-cell">
                <div class="item-title">${productName}</div>
                ${brand ? `<div class="item-brand">${brand}</div>` : ""}
                ${item.variantValue ? `<div class="item-variant">Variant: ${item.variantValue}</div>` : ""}
              </td>
              <td class="text-right">${numberFormat(item.price)}</td>
              <td class="text-right">${item.quantity || 1}</td>
              <td class="text-right" style="font-weight: 600;">${numberFormat((item.price || 0) * (item.quantity || 1))}</td>
            </tr>
          `;
            })
            .join("")}
        </tbody>
      </table>

      <div class="summary-wrapper">
        <table class="summary-table">
          <tr>
            <td>Items Subtotal</td>
            <td class="text-right">${numberFormat(sellingPrice)}</td>
          </tr>
          <tr>
            <td>Platform Fee</td>
            <td class="text-right">${numberFormat(order.platformFee || 0)}</td>
          </tr>
          <tr>
            <td>Shipping Fee</td>
            <td class="text-right">${numberFormat(order.shippingCharges || 0)}</td>
          </tr>
          ${
            totalDiscount > 0
              ? `
          <tr>
            <td>Discount Saved</td>
            <td class="text-right discount-txt">-${numberFormat(totalDiscount)}</td>
          </tr>`
              : ""
          }
          ${
            voucherAmount > 0
              ? `
          <tr>
            <td>Wallet / Voucher Applied</td>
            <td class="text-right discount-txt">-${numberFormat(voucherAmount)}</td>
          </tr>`
              : ""
          }
          <tr class="total-row">
            <td>Total Paid</td>
            <td class="text-right">${numberFormat(order.finalAmount || 0)}</td>
          </tr>
        </table>
      </div>

      <div class="footer">
        <p>This is a computer-generated tax invoice. No physical signature required.</p>
        <p style="margin-top: 4px; font-weight: 600; color: #6D1734;">Thank you for shopping with Shri Deepaalaya Silks!</p>
      </div>
    </div>
    <script>
      (function() {
        var printed = false;
        function doPrint() {
          if (printed) return;
          printed = true;
          window.__invoicePrinted = true;
          setTimeout(function() {
            window.print();
          }, 250);
        }

        function checkImages() {
          var images = Array.prototype.slice.call(document.images);
          if (images.length === 0) {
            doPrint();
            return;
          }
          var pending = images.length;
          function onComplete() {
            pending--;
            if (pending <= 0) {
              doPrint();
            }
          }
          images.forEach(function(img) {
            if (img.complete) {
              onComplete();
            } else {
              img.addEventListener('load', onComplete);
              img.addEventListener('error', onComplete);
            }
          });
          // Safety timeout in case images take long or hang
          setTimeout(doPrint, 1500);
        }

        if (document.readyState === 'complete') {
          checkImages();
        } else {
          window.addEventListener('load', checkImages);
        }
      })();
    </script>
  </body>
</html>`;

  const invoiceWindow = window.open("", "_blank");
  if (invoiceWindow) {
    invoiceWindow.document.write(invoiceHtml);
    invoiceWindow.document.close();
    invoiceWindow.focus();
    // Safety fallback in case child script is delayed or blocked
    setTimeout(() => {
      try {
        if (!invoiceWindow.__invoicePrinted) {
          invoiceWindow.print();
        }
      } catch (e) {
        // Ignore cross-window errors
      }
    }, 1800);
  }
};
