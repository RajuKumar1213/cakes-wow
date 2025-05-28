import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  group: {
    type: String,
    required: true,
    enum: [
      'Trending Cakes',
      'By Type', 
      'By Flavours',
      'Theme Cakes',
      'Desserts',
      'Other Items'
    ],
  },
  type: {
    type: String,
    required: true,
    enum: ['Category', 'Theme', 'Dessert', 'Relationship', 'Occasion', 'Special'],
  },
  description: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Create compound index for better performance
categorySchema.index({ group: 1, sortOrder: 1 });
categorySchema.index({ slug: 1 });

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
