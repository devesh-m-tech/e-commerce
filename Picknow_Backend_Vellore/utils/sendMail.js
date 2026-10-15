import nodemailer from 'nodemailer';

export const sendMail = async (emailData) => {
  if (!emailData || !emailData.to || !emailData.subject || !emailData.html) {
    console.warn('[Mail Service] Missing required email fields');
    return;
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromName = process.env.SMTP_FROM_NAME || 'Shri Deepaalaya Silks';
  const fromEmail = process.env.SMTP_FROM_EMAIL || user || 'care@shrideepaalayasilks.com';

  if (!user || user === 'NEEDS_CLIENT_INPUT' || !pass || pass === 'NEEDS_CLIENT_INPUT') {
    console.log(`[Mail Service] (Dev mode - SMTP credentials not set) Email to: ${emailData.to}, Subject: ${emailData.subject}`);
    return { messageId: 'simulated-dev-id-' + Date.now() };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[Mail Service] Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.warn('[Mail Service] Email sending failed (non-blocking):', error.message);
    return null;
  }
};

export default sendMail;