import mongoose from "mongoose";

const heroBannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: false,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    alt: {
      type: String,
      required: true,
      trim: true,
    },
    href: {
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

// Create index for sorting
heroBannerSchema.index({ sortOrder: 1, createdAt: 1 });

const HeroBanner = mongoose.models.HeroBanner || mongoose.model("HeroBanner", heroBannerSchema);

export default HeroBanner;
