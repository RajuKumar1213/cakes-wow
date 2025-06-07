import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  receiverName: {
    type: String,
    required: true,
    trim: true
  },
  prefix: {
    type: String,
    required: true,
    enum: ['Mr.', 'Ms.', 'Mrs.', 'Dr.'],
    default: 'Mr.'
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  pinCode: {
    type: String,
    required: true,
    trim: true
  },
  fullAddress: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  alternatePhoneNumber: {
    type: String,
    trim: true,
    default: ''
  },
  addressType: {
    type: String,
    required: true,
    enum: ['Home', 'Office', 'Others'],
    default: 'Home'
  }
}, {
  timestamps: true
});

const UserSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true // Allows multiple users with no email
  },
  address: {
    type: [AddressSchema],
    default: []
  }
});

// Update the updatedAt field before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Clear existing model if it exists to avoid conflicts
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model('User', UserSchema);