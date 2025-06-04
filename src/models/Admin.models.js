import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false, // Exclude password from queries by default
  },
  isSuperAdmin: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true
});

// Pre-save middleware to ensure only one admin can exist
adminSchema.pre('save', async function(next) {
  // If this is a new admin (not updating existing one)
  if (this.isNew) {
    const existingAdmin = await this.constructor.findOne({});
    if (existingAdmin) {
      const error = new Error('Only one admin account is allowed. Admin already exists.');
      error.name = 'SingleAdminError';
      return next(error);
    }
  }
  next();
});

// Static method to get the single admin
adminSchema.statics.getSingleAdmin = async function() {
  return await this.findOne({}).select('+password');
};

// Static method to check if admin exists
adminSchema.statics.adminExists = async function() {
  const count = await this.countDocuments({});
  return count > 0;
};

// Static method to create or update admin (for seeding purposes)
adminSchema.statics.createOrUpdateAdmin = async function(adminData) {
  const existingAdmin = await this.findOne({});
  
  if (existingAdmin) {
    // Update existing admin
    Object.assign(existingAdmin, adminData);
    return await existingAdmin.save();
  } else {
    // Create new admin
    return await this.create(adminData);
  }
};

// Prevent multiple admins from being created via insertMany
adminSchema.pre('insertMany', async function(next, docs) {
  const existingAdmin = await this.findOne({});
  if (existingAdmin && docs.length > 0) {
    const error = new Error('Only one admin account is allowed. Admin already exists.');
    error.name = 'SingleAdminError';
    return next(error);
  }
  if (docs.length > 1) {
    const error = new Error('Cannot create multiple admin accounts. Only one admin is allowed.');
    error.name = 'SingleAdminError';
    return next(error);
  }
  next();
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

export default Admin;
