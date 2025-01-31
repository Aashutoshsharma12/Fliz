import { Schema, model } from "mongoose";

interface user {
  uniqueId: string;
  role: string;
  isBusiness: boolean;
  name: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  address: string;
  addressLine1: string;
  addressLine2: string;
  lat: string;
  long: string;
  country: string;
  zipcode: string;
  state: string;
  city: string;
  company_description: string;
  ar_company_description: string;
  password: string;
  image: string;
  bannerImage: string;
  certificate_achievement: any;
  company_license_frontSide: string;
  company_license_backSide: string;
  driving_license_frontSide: string;
  driving_license_backSide: string;
  truck_license_frontSide: string;
  truck_license_backSide: string;
  // catId: any;
  // subCatId: any;
  // sub_subCatId: any;
  online: boolean;
  isNotification: boolean;
  isTerm_condition: boolean;
  isVerified: boolean,
  isDelete: boolean;
  isActive: boolean;
}

const user_renter_deliverySchema = new Schema<user>(
  {
    uniqueId: { type: String, default: "" },
    role: { type: String, default: "user" }, //renter_user,delivery_user,user
    isBusiness: { type: Boolean, default: false },
    name: { type: String, required: true },   // Company Name
    email: { type: String, default: "", trim: true, lowercase: true },
    countryCode: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    addressLine1: { type: String, default: "" },
    addressLine2: { type: String, default: "" },
    lat: { type: String, required: true },
    long: { type: String, required: true },
    country: { type: String, required: true },
    zipcode: { type: String },
    state: { type: String, required: true },
    city: { type: String, required: true },
    company_description: { type: String, required: false },
    ar_company_description: { type: String, required: false },
    password: { type: String, required: true },
    image: { type: String, default: "" },
    bannerImage: { type: String, default: "" },
    certificate_achievement: { type: Array },
    company_license_frontSide: { type: String, default: "" },
    company_license_backSide: { type: String, default: "" },
    driving_license_frontSide: { type: String, default: "" },
    driving_license_backSide: { type: String, default: "" },
    truck_license_frontSide: { type: String, default: "" },
    truck_license_backSide: { type: String, default: "" },
    // catId: [],
    // subCatId: [],
    // sub_subCatId: [],
    isNotification: { type: Boolean, default: false },
    isTerm_condition: { type: Boolean, default: true },
    online: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
user_renter_deliverySchema.index({ phoneNumber: 1, isDelete: 1 });
user_renter_deliverySchema.index({ name: 1, isDelete: 1, role: 1 });
user_renter_deliverySchema.index(
  { role: 1, countryCode: 1, phoneNumber: 1 },
  { unique: true, partialFilterExpression: { isDelete: { $eq: false } } }
);
const user_renter_delivery_Model = model<user>(
  "user_renter_delivery",
  user_renter_deliverySchema
);
export = user_renter_delivery_Model;
