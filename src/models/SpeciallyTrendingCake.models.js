import mongoose from "mongoose";

const SpeciallyTrendingCakeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    productSlug: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for better performance
SpeciallyTrendingCakeSchema.index({ sortOrder: 1, createdAt: -1 });
SpeciallyTrendingCakeSchema.index({ productSlug: 1 });
SpeciallyTrendingCakeSchema.index({ isActive: 1 });

const SpeciallyTrendingCake = mongoose.models.SpeciallyTrendingCake || mongoose.model("SpeciallyTrendingCake", SpeciallyTrendingCakeSchema);

export default SpeciallyTrendingCake;
