// Apply mongoose fix for Vercel deployment
import "@/lib/mongoose-fix";
import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // Document expires after 5 minutes (300 seconds)
  }
});

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema);