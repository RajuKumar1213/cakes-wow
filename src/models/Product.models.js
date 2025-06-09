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
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    default: '',
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
  }],
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  }],
  tags: [{
    type: String,
    trim: true,
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
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  stockQuantity: {
    type: Number,
    default: 100,
    min: 0,
  },
  minimumOrderQuantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  preparationTime: {
    type: String,
    default: '4-6 hours', // Delivery preparation time
  },
  ingredients: [{
    type: String,
    trim: true,
  }],
  allergens: [{
    type: String,
    trim: true,
  }],
  nutritionalInfo: {
    calories: Number,
    protein: String,
    carbs: String,
    fat: String,
  },
  metaTitle: String,
  metaDescription: String,
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes for better performance
productSchema.index({ isAvailable: 1, slug: 1 }); // Compound index for product page queries
productSchema.index({ categories: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isAvailable: 1 });
productSchema.index({ isBestseller: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
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

// Prevent warnings in browser environment
if (typeof window === 'undefined' && !process.emitWarning) {
  process.emitWarning = () => {};
}

export default mongoose.models.Product || mongoose.model('Product', productSchema);
