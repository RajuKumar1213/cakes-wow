/**
 * Generate a 6-digit OTP
 */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via SMS using Twilio (mock version for development)
 */
export async function sendOTP(phoneNumber, otp) {
  // For production, uncomment and configure Twilio
  /*
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  
  try {
    await client.messages.create({
      body: `Your Bakingo verification code is: ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    return { success: true };
  } catch (error) {
    console.error('SMS sending failed:', error);
    return { success: false, error: error.message };
  }
  */
  
  // Mock SMS service for development
  console.log(`📱 SMS sent to ${phoneNumber}: Your OTP is ${otp}`);
  return { success: true };
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phoneNumber) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phoneNumber.replace(/\s+/g, ''));
}

/**
 * Rate limiting store (in production, use Redis)
 */
const otpAttempts = new Map();

/**
 * Check rate limiting for OTP requests
 */
export function checkRateLimit(phoneNumber) {
  const now = Date.now();
  const key = `otp_${phoneNumber}`;
  const attempts = otpAttempts.get(key) || [];
  
  // Remove expired attempts (older than 1 hour)
  const validAttempts = attempts.filter(time => now - time < 3600000);
  
  if (validAttempts.length >= 5) {
    return {
      allowed: false,
      resetTime: Math.min(...validAttempts) + 3600000
    };
  }
  
  // Add current attempt
  validAttempts.push(now);
  otpAttempts.set(key, validAttempts);
  
  return { allowed: true };
}
