import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  group: string;
  type: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
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
      trim: true,
      // Removed enum restriction - now accepts any string
    },    type: {
      type: String,
      required: true,
      trim: true,
      // Removed enum restriction - now accepts any string
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

// Create compound index for better performance
categorySchema.index({ group: 1, sortOrder: 1 });
// Note: slug index is already created by unique: true constraint

export default mongoose.models.Category ||
  mongoose.model<ICategory>("Category", categorySchema);
