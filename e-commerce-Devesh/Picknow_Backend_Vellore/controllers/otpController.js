import twilio from 'twilio';

// In-memory store for OTPs
const otpStore = {};

const getTwilioClient = () => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_ACCOUNT_SID !== 'NEEDS_CLIENT_INPUT') {
    return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  return null;
};

export const sendOtp = async (req, res) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber) {
    return res.status(400).json({ success: false, message: 'Mobile number is required' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
  otpStore[mobileNumber] = {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  };

  try {
    const client = getTwilioClient();
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (client && fromPhone && fromPhone !== 'NEEDS_CLIENT_INPUT') {
      await client.messages.create({
        body: `Your Shri Deepaalaya Silks verification code is ${otp}. Valid for 10 minutes.`,
        from: fromPhone,
        to: mobileNumber,
      });
      return res.status(200).json({ success: true, message: 'OTP sent successfully!' });
    } else {
      // In development or when Twilio not configured yet, log OTP and return success
      console.log(`[SMS Service] Simulated OTP for ${mobileNumber}: ${otp}`);
      return res.status(200).json({ 
        success: true, 
        message: 'OTP generated (Simulated in development mode)', 
        simulatedOtp: process.env.NODE_ENV === 'development' ? otp : undefined 
      });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    // Still store OTP in development fallback
    return res.status(200).json({ 
      success: true, 
      message: 'OTP generated with simulated delivery',
      simulatedOtp: process.env.NODE_ENV === 'development' ? otp : undefined 
    });
  }
};

export const verifyOtp = (req, res) => {
  const { mobileNumber, otp } = req.body;

  if (!mobileNumber || !otp) {
    return res.status(400).json({ success: false, message: 'Mobile number and OTP are required' });
  }

  const stored = otpStore[mobileNumber];
  if (!stored) {
    return res.status(400).json({ success: false, message: 'No OTP requested for this number' });
  }

  if (Date.now() > stored.expiresAt) {
    delete otpStore[mobileNumber];
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }

  if (stored.otp === otp.toString().trim()) {
    delete otpStore[mobileNumber];
    return res.status(200).json({ success: true, message: 'OTP verified successfully!' });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }
};