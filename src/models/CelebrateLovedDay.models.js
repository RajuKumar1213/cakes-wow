import mongoose from 'mongoose';

const CelebrateLoveDaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
  },
  productCount: {
    type: Number,
    default: 0,
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

// Create indexes
CelebrateLoveDaySchema.index({ sortOrder: 1 });
CelebrateLoveDaySchema.index({ isActive: 1 });
CelebrateLoveDaySchema.index({ slug: 1 });

const CelebrateLovedDay = mongoose.models.CelebrateLovedDay || mongoose.model('CelebrateLovedDay', CelebrateLoveDaySchema);

export default CelebrateLovedDay;
