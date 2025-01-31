import { Schema, model } from "mongoose";

interface category {
  uniqueId: string;
  name: any;
  lower_name: any;
  ar_name: any;
  ar_lower_name: any;
  image: string;
  description: any;
  ar_description: any;
  isActive: boolean;
  isDelete: boolean;
}

const categorySchema = new Schema<category>(
  {
    uniqueId: { type: String },
    name: { type: String, required: true, trim: true },
    image: { type: String, },
    lower_name: { type: String },
    ar_name: { type: String, required: true, trim: true },
    ar_lower_name: { type: String },
    description: { type: String, trim: true },
    ar_description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Enable virtuals in JSON output
    toObject: { virtuals: true }
  } // Enable virtuals in Object output }
);
// Define a virtual field for `subcategories`
categorySchema.virtual("specifications", {
  ref: "cat_specification", // The model to use
  localField: "_id", // The field in the Category model
  foreignField: "catId", // The field in the Subcategory model
});

categorySchema.index({ lower_name: 1, ar_lower_name: 1, isDelete: 1 });
const categoryModel = model<category>("category", categorySchema);
export = categoryModel;
