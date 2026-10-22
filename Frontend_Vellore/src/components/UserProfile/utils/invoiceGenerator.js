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
        padding: 12px 14px;
        font-size: 12px;
        border-bottom: 1px solid #e5e7eb;
        vertical-align: top;
      }
      .items-table tr:nth-child(even) td {
        background: #fdfcfb;
      }
      .text-right { text-align: right !important; }
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
        body { padding: 0; background: #fff; }
        .invoice-card { border: none; padding: 10px; max-width: 100%; }
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
            <th width="8%">#</th>
            <th>Item Description</th>
            <th class="text-right" width="16%">Price</th>
            <th class="text-right" width="10%">Qty</th>
            <th class="text-right" width="20%">Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            ?.map(
              (item, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>
                <div style="font-weight: 600; color: #111827;">${item.product?.pName || "Product"}</div>
                ${item.variantValue ? `<div style="font-size: 11px; color: #6b7280; margin-top: 2px;">Variant: ${item.variantValue}</div>` : ""}
              </td>
              <td class="text-right">${numberFormat(item.price)}</td>
              <td class="text-right">${item.quantity || 1}</td>
              <td class="text-right">${numberFormat((item.price || 0) * (item.quantity || 1))}</td>
            </tr>
          `
            )
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
  </body>
</html>`;

  const invoiceWindow = window.open("", "_blank");
  if (invoiceWindow) {
    invoiceWindow.document.write(invoiceHtml);
    invoiceWindow.document.close();
    invoiceWindow.focus();
    setTimeout(() => {
      invoiceWindow.print();
    }, 300);
  }
};
