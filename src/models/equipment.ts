import { Schema, Types, model } from "mongoose";

interface equipment {
  uniqueId: string;
  companyProviderId: any;
  isBasicDetails: boolean;
  isMediaDetails: boolean;
  isaddressDetails: boolean;
  categoryId: any;
  subCategoryId: any;
  sub_subCategoryId: any;
  equipmentName: string;
  ar_equipmentName: string;
  equipmentPrice_perDay: number;
  equipmentPrice_1_week: number;
  equipmentPrice_1_month: number;
  equipmentPrice_3_month: number;
  equipmentPrice_6_month: number;
  equipmentPrice_1_year: number;
  total_equipmentAvailable: number;
  operational_equipments: number;
  isDeliveryInclude: boolean;
  isPriceBreaking: boolean;
  priceBreaking_details: any;
  equipment_engineMake: string;
  ar_equipment_engineMake: string;
  equipment_engineModel: string;
  ar_equipment_engineModel: string;
  isBoom_swingAngle: boolean;
  isMinimum_groundClearance: boolean;
  isApproved: boolean;
  isActive: boolean;
  isDelete: boolean;
  equipmentCommission: number;   //Admin Commission Percentage for a Specific Equipment
}

const equipmentSchema = new Schema<equipment>(
  {
    uniqueId: { type: String },
    companyProviderId: { type: Types.ObjectId, required: true },
    isBasicDetails: { type: Boolean, default: false },
    isMediaDetails: { type: Boolean, default: false },
    isaddressDetails: { type: Boolean, default: false },
    categoryId: { type: Types.ObjectId, ref: "category", required: true },
    subCategoryId: { type: Types.ObjectId, ref: "sub_category", required: false },
    sub_subCategoryId: { type: Types.ObjectId, ref: "sub_subCategory", required: false },
    equipmentName: { type: String, required: true },
    ar_equipmentName: { type: String, required: true },
    equipmentPrice_perDay: { type: Number, default: 0 },
    equipmentPrice_1_week: { type: Number, default: 0 },
    equipmentPrice_1_month: { type: Number, default: 0 },
    equipmentPrice_3_month: { type: Number, default: 0 },
    equipmentPrice_6_month: { type: Number, default: 0 },
    equipmentPrice_1_year: { type: Number, default: 0 },
    total_equipmentAvailable: { type: Number, default: 0, required: true },
    operational_equipments: { type: Number, default: 0 },
    isDeliveryInclude: { type: Boolean, default: false },
    isPriceBreaking: { type: Boolean, default: false },
    priceBreaking_details: {
      time: { type: Number, default: 0 },
      minimumAmount: { type: Number, default: 0 },
      dueAmountDays: { type: Number, default: 0 }
    },
    equipment_engineMake: { type: String, required: false },
    ar_equipment_engineMake: { type: String, required: false },
    equipment_engineModel: { type: String, required: false },
    ar_equipment_engineModel: { type: String, required: false },
    isBoom_swingAngle: { type: Boolean, default: false },
    isMinimum_groundClearance: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    equipmentCommission: { type: Number, default: 0, required: false }  //Admin Commission Percentage for a Specific Equipment
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

equipmentSchema.index({ isDelete: 1, equipmentName: 1, ar_equipmentName: 1 })
equipmentSchema.index({ isDelete: 1, _id: 1 })

const equipmentModel = model<equipment>("equipment", equipmentSchema);
export = equipmentModel;
