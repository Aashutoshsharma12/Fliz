import { Schema, model } from "mongoose";

interface engine_company {
  uniqueId: string;
  name: string;
  lower_name: string;
  ar_name: string;
  ar_lower_name: string;
  role: string,
  isDelete: boolean;
  isActive: boolean;
}

const engine_companySchema = new Schema<engine_company>(
  {
    uniqueId: { type: String },
    name: { type: String, required: true, trim: true },
    lower_name: { type: String, trim: true },
    ar_name: { type: String, required: true, trim: true },
    ar_lower_name: { type: String, trim: true },
    role: { type: String, required: true, enum: ["renter_user", "delivery_user"] },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

engine_companySchema.index({ lower_name: 1, ar_lower_name: 1, isDelete: 1 });

const engine_companyModel = model<engine_company>(
  "engine_company",
  engine_companySchema
);
export = engine_companyModel;
