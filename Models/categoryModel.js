
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      minlength: [3, "Category name must be at least 3 characters"],
      maxlength: [50, "Category name must not exceed 50 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [5, "Description must be at least 5 characters"],
      maxlength: [200, "Description must not exceed 200 characters"],
    },
  },
  {
    timestamps: true,
    versionKey: false,

  }
);

// Index for better query performance
// categorySchema.index({ name: 1 }, { unique: true });

const categoryModel = mongoose.model("category", categorySchema);
export default categoryModel;