import mongoose from "mongoose";

const categoryShowcaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },    image: {
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
categoryShowcaseSchema.index({ sortOrder: 1, createdAt: 1 });

const CategoryShowcase = mongoose.models.CategoryShowcase || mongoose.model("CategoryShowcase", categoryShowcaseSchema);

export default CategoryShowcase;
