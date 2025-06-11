/**
 * Generate a 6-digit OTP
 */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Normalize phone number to consistent format
 */
export function normalizePhoneNumber(phoneNumber) {
  if (!phoneNumber) return null;
  
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/[^\d]/g, "");
  
  // Handle different formats:
  // +91XXXXXXXXXX -> XXXXXXXXXX
  // 91XXXXXXXXXX -> XXXXXXXXXX  
  // XXXXXXXXXX -> XXXXXXXXXX
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }
  
  // Ensure it's a 10-digit Indian mobile number
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return cleaned;
  }
  
  return null;
}

/**
 * Send OTP via WhatsApp using WATI API
 */
export async function sendOTP(phoneNumber, otp) {
  try {
    console.log(`🔄 Attempting to send OTP to ${phoneNumber}`);
    
    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!normalizedPhone) {
      console.error(`❌ Invalid phone number format: ${phoneNumber}`);
      return {
        success: false,
        error: 'Invalid phone number format'
      };
    }

    console.log(`📱 Normalized phone: ${normalizedPhone}, OTP: ${otp}`);

    // Validate environment variables
    if (!process.env.WATI_API_ENDPOINT || !process.env.WATI_ACCESS_TOKEN) {
      console.error('❌ WATI API credentials not configured');
      return {
        success: false,
        error: 'WhatsApp API not configured'
      };
    }

    // Generate unique broadcast name with timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.]/g, "")
      .slice(0, 14);
    const broadcastName = `otp_login_${timestamp}`;

    const whatsappData = {
      template_name: process.env.WHATSAPP_LOGIN_TEMPLATE || "otp_template",
      broadcast_name: broadcastName,
      parameters: [
        {
          name: "1",
          value: otp,
        },
      ],
    };

    console.log(`📤 Sending WhatsApp request with data:`, {
      template: whatsappData.template_name,
      broadcast: broadcastName,
      phone: normalizedPhone,
      otp: otp
    });

    const response = await fetch(
      `${process.env.WATI_API_ENDPOINT}/api/v1/sendTemplateMessage?whatsappNumber=${normalizedPhone}`,
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

    console.log(`📡 WhatsApp API Response:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ WhatsApp API error:", response.status, errorText);
      return {
        success: false,
        error: `WhatsApp API failed with status ${response.status}: ${errorText}`,
      };
    }

    const result = await response.json();
    console.log(`✅ WhatsApp OTP sent successfully to ${normalizedPhone}`);
    console.log(`📊 Response:`, result);

    return { 
      success: true, 
      data: result,
      normalizedPhone 
    };
  } catch (error) {
    console.error("❌ WhatsApp OTP sending failed:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phoneNumber) {
  const normalized = normalizePhoneNumber(phoneNumber);
  return normalized !== null;
}

/**
 * Rate limiting store (in production, use Redis)
 */
const otpAttempts = new Map();

/**
 * Check rate limiting for OTP requests
 */
export function checkRateLimit(phoneNumber) {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  if (!normalizedPhone) return { allowed: false };

  const now = Date.now();
  const key = `otp_${normalizedPhone}`;
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

/**
 * Verify OTP with enhanced debugging and validation
 */
export async function verifyOTPRobust(phoneNumber, otp, OtpModel) {
  try {
    console.log(`🔍 Starting OTP verification for phone: ${phoneNumber}, OTP: ${otp}`);
    
    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!normalizedPhone) {
      console.error(`❌ Invalid phone number format: ${phoneNumber}`);
      return {
        success: false,
        error: 'Invalid phone number format'
      };
    }

    console.log(`📱 Normalized phone: ${normalizedPhone}`);

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      console.error(`❌ Invalid OTP format: ${otp}`);
      return {
        success: false,
        error: 'OTP must be 6 digits'
      };
    }

    // Find all OTP records for this phone (for debugging)
    const allOtpRecords = await OtpModel.find({ phoneNumber: normalizedPhone }).sort({ createdAt: -1 });
    console.log(`📋 Found ${allOtpRecords.length} OTP records for ${normalizedPhone}:`, 
      allOtpRecords.map(record => ({
        otp: record.otp,
        createdAt: record.createdAt,
        isUsed: record.isUsed,
        attempts: record.attempts,
        age: Math.floor((Date.now() - record.createdAt.getTime()) / 1000)
      }))
    );

    // Find the specific OTP record
    const otpRecord = await OtpModel.findOne({ 
      phoneNumber: normalizedPhone, 
      otp: otp,
      isUsed: false
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      console.error(`❌ OTP record not found for phone: ${normalizedPhone}, OTP: ${otp}`);
      
      // Check if there's a used OTP with same code
      const usedOtp = await OtpModel.findOne({ 
        phoneNumber: normalizedPhone, 
        otp: otp,
        isUsed: true
      });
      
      if (usedOtp) {
        console.error(`❌ OTP already used: ${otp}`);
        return {
          success: false,
          error: 'OTP has already been used'
        };
      }
      
      return {
        success: false,
        error: 'Invalid or expired OTP'
      };
    }

    console.log(`✅ Found OTP record:`, {
      otp: otpRecord.otp,
      createdAt: otpRecord.createdAt,
      attempts: otpRecord.attempts,
      isUsed: otpRecord.isUsed,
      ageSeconds: Math.floor((Date.now() - otpRecord.createdAt.getTime()) / 1000)
    });

    // Check attempts limit
    if (otpRecord.attempts >= 3) {
      console.error(`❌ Too many verification attempts for OTP: ${otp}`);
      await OtpModel.deleteOne({ _id: otpRecord._id });
      return {
        success: false,
        error: 'Too many verification attempts. Please request a new OTP.'
      };
    }

    // Check if OTP is expired (10 minutes)
    const now = new Date();
    const otpAge = now - otpRecord.createdAt;
    const maxAge = 10 * 60 * 1000; // 10 minutes
    
    console.log(`⏰ OTP age: ${Math.floor(otpAge / 1000)} seconds, Max age: ${maxAge / 1000} seconds`);
    
    if (otpAge > maxAge) {
      console.error(`❌ OTP expired: age ${Math.floor(otpAge / 1000)} seconds`);
      await OtpModel.deleteOne({ _id: otpRecord._id });
      return {
        success: false,
        error: 'OTP has expired. Please request a new one.'
      };
    }

    // Mark OTP as used
    await OtpModel.updateOne(
      { _id: otpRecord._id },
      { 
        $set: { isUsed: true },
        $inc: { attempts: 1 }
      }
    );

    console.log(`✅ OTP verified successfully for ${normalizedPhone}`);
    
    return {
      success: true,
      normalizedPhone
    };

  } catch (error) {
    console.error('❌ Error in OTP verification:', error);
    return {
      success: false,
      error: 'Internal server error during OTP verification'
    };
  }
}
