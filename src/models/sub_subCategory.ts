import { Schema, Types, model } from "mongoose";

interface sub_subCategory {
  uniqueId: string;
  categoryId: any;
  subCategoryId: any;
  name: any;
  lower_name: any;
  ar_name: any;
  ar_lower_name: any;
  image: string;
  isActive: boolean;
  isDelete: boolean;
}
const sub_subCategorySchema = new Schema<sub_subCategory>(
  {
    uniqueId: { type: String },
    categoryId: { type: Types.ObjectId, required: true },
    subCategoryId: { type: Types.ObjectId, required: true },
    name: { type: String, required: true, trim: true },
    image: { type: String },
    lower_name: { type: String },
    ar_name: { type: String, required: true, trim: true },
    ar_lower_name: { type: String },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const sub_subCategoryModel = model<sub_subCategory>(
  "sub_subCategory",
  sub_subCategorySchema
);
export = sub_subCategoryModel;
