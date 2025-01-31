import { Schema, Types, model } from "mongoose";

interface subCategory {
  uniqueId: string;
  categoryId: any;
  name: any;
  lower_name: any;
  ar_name: any;
  ar_lower_name: any;
  image: string;
  isActive: boolean;
  isDelete: boolean;
}

const subCategorySchema = new Schema<subCategory>(
  {
    uniqueId: { type: String },
    categoryId: { type: Types.ObjectId, required: true },
    name: { type: String, required: true, trim: true },
    image: { type: String },
    lower_name: { type: String, trim: true, lowercase: true },
    ar_name: { type: String, required: true, trim: true },
    ar_lower_name: { type: String, trim: true, lowercase: true },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const sub_categoryModel = model<subCategory>("sub_category", subCategorySchema);
export = sub_categoryModel;
