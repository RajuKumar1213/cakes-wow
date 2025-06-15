// Apply mongoose fix for Vercel deployment
import "@/lib/mongoose-fix";
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    min: 0,
  },
  discountedPrice: {
    type: Number,
    default: null,
    min: 0,
  },
  imageUrls: [{
    type: String,
    required: true,
  }],  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  }],
  weightOptions: [{
    weight: {
      type: String,
      required: true, // e.g., "500g", "1kg", "2kg"
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountedPrice: {
      type: Number,
      default: null,
      min: 0,
    },  }],
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isBestseller: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },  preparationTime: {
    type: String,
    default: '4-6 hours', // Delivery preparation time
  },
}, {
  timestamps: true,
});

// Indexes for better performance
productSchema.index({ isAvailable: 1, slug: 1 }); // Compound index for product page queries
productSchema.index({ categories: 1 });
productSchema.index({ price: 1 });
// Note: isAvailable index is covered by compound index above
productSchema.index({ isBestseller: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ createdAt: -1 }); // For sorting by newest
productSchema.index({ rating: -1, reviewCount: -1 }); // For sorting by popularity

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.discountedPrice && this.price > this.discountedPrice) {
    return Math.round(((this.price - this.discountedPrice) / this.price) * 100);
  }
  return 0;
});

// Virtual for final price
productSchema.virtual('finalPrice').get(function() {
  return this.discountedPrice || this.price;
});

// Ensure virtuals are included in JSON output
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
