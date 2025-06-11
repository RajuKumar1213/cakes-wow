// Apply mongoose fix for Vercel deployment
import "@/lib/mongoose-fix";
import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    index: true // Add index for faster queries
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Increased to 10 minutes (600 seconds) for more reliability
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3 // Maximum 3 verification attempts
  },
  isUsed: {
    type: Boolean,
    default: false
  }
});

// Compound index for efficient queries
OtpSchema.index({ phoneNumber: 1, otp: 1 });
OtpSchema.index({ phoneNumber: 1, createdAt: -1 });

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema);