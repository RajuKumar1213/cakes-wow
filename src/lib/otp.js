/**
 * Generate a 6-digit OTP
 */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via WhatsApp using WATI API
 */
export async function sendOTP(phoneNumber, otp) {
  try {
    // Clean phone number (remove any non-digit characters except +)
    const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, "");

    // Generate unique broadcast name with timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.]/g, "")
      .slice(0, 14);
    const broadcastName = `otp_login_${timestamp}`;

    const whatsappData = {
      template_name: process.env.WHATSAPP_LOGIN_TEMPLATE,
      broadcast_name: broadcastName,
      parameters: [
        {
          name: "1",
          value: otp,
        },
      ],
    };

    const response = await fetch(
      `${process.env.WATI_API_ENDPOINT}/api/v1/sendTemplateMessage?whatsappNumber=${cleanPhoneNumber}`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          Authorization: `${process.env.WATI_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(whatsappData),
      }
    );

    console.log(response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WhatsApp API error:", response.status, errorText);
      return {
        success: false,
        error: `WhatsApp API failed with status ${response.status}`,
      };
    }

    const result = await response.json();
    console.log(`📱 WhatsApp OTP sent to ${phoneNumber}: Success`);

    return { success: true, data: result };
  } catch (error) {
    console.error("WhatsApp OTP sending failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phoneNumber) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phoneNumber.replace(/\s+/g, ""));
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
  const validAttempts = attempts.filter((time) => now - time < 3600000);

  if (validAttempts.length >= 5) {
    return {
      allowed: false,
      resetTime: Math.min(...validAttempts) + 3600000,
    };
  }

  // Add current attempt
  validAttempts.push(now);
  otpAttempts.set(key, validAttempts);

  return { allowed: true };
}
