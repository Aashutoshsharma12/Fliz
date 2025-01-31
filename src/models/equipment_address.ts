import { Schema, Types, model } from "mongoose";

interface equipment_address {
  uniqueId: string;
  companyProviderId: any;
  equipmentId: any;
  availableEquipment: number;
  address: string;
  addressLine1: string;
  addressLine2: string;
  location: any;
  country: string;
  zipcode: string;
  state: string;
  city: string;
  isActive: boolean;
  isDelete: boolean;
}

const equipment_addressSchema = new Schema<equipment_address>(
  {
    uniqueId: { type: String },
    companyProviderId: { type: Types.ObjectId, required: true },
    equipmentId: { type: Types.ObjectId, required: true },
    availableEquipment: { type: Number, required: true },
    address: { type: String, required: true },
    addressLine1: { type: String, default: "" },
    addressLine2: { type: String, default: "" },
    location: {
      type: {
        type: String,
        enum: ['Point'], // 'location.type' must be 'Point'
        default: 'Point'
      },
      coordinates: {
        type: [Number],   //lat , long
        required: true
      }
    },
    country: { type: String, required: true },
    zipcode: { type: String, required: false },
    city: { type: String, required: true },
    state: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
equipment_addressSchema.index({ location: '2dsphere' }); // For geospatial queries
equipment_addressSchema.index({ "companyProviderId": 1, "equipmentId": 1, "isDelete": 1 });
equipment_addressSchema.index({ "equipmentId": 1 });
equipment_addressSchema.index({ "companyProviderId": 1 });
const equipment_addressModel = model<equipment_address>('equipment_address', equipment_addressSchema);
export = equipment_addressModel;
