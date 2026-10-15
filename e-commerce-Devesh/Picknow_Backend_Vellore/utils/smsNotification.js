import twilio from 'twilio';

const getTwilioClient = () => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_ACCOUNT_SID !== 'NEEDS_CLIENT_INPUT') {
    try {
      return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    } catch (e) {
      console.warn('[Notification Service] Twilio init warning:', e.message);
      return null;
    }
  }
  return null;
};

/**
 * Send SMS or WhatsApp notification to customer
 * @param {string} toPhone - Customer phone number (e.g. "+919876543210")
 * @param {string} message - Message body
 * @param {boolean} isWhatsApp - true to send via WhatsApp sandbox/API, false for regular SMS
 */
export const sendOrderAlert = async (toPhone, message, isWhatsApp = false) => {
  if (!toPhone) return;

  const client = getTwilioClient();
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;

  if (client && fromPhone && fromPhone !== 'NEEDS_CLIENT_INPUT') {
    try {
      const from = isWhatsApp ? `whatsapp:${fromPhone}` : fromPhone;
      let to = toPhone.startsWith('+') ? toPhone : `+91${toPhone}`;
      if (isWhatsApp) to = `whatsapp:${to}`;

      await client.messages.create({
        body: `[Shri Deepaalaya Silks] ${message}`,
        from,
        to,
      });
      console.log(`[Notification Service] ${isWhatsApp ? 'WhatsApp' : 'SMS'} sent to ${to}`);
    } catch (error) {
      console.warn(`[Notification Service] Failed to send SMS/WhatsApp to ${toPhone}:`, error.message);
    }
  } else {
    console.log(`[Notification Service] (Unconfigured/Dev mode) Notification for ${toPhone}: ${message}`);
  }
};
