import { Schema, Types, model } from "mongoose";

interface engine_model {
  engine_companyId: any;
  uniqueId: string;
  name: string;
  lower_name: string;
  ar_name: string;
  ar_lower_name: string;
  role: string,
  enginePower: string; //hp
  fuelCapacity: string; //litres
  machineWeight: string; //KG
  maximum_cuttingHeight: string; //MM
  rear_swing_radius: string; //MM
  swingSpeed: string; //MM
  breakout_force: any; //LBS
  isDelete: boolean;
  isActive: boolean;
}

const engine_modelSchema = new Schema<engine_model>(
  {
    engine_companyId: { type: Types.ObjectId, required: true },
    uniqueId: { type: String },
    name: { type: String, required: true, trim: true },
    lower_name: { type: String, trim: true },
    ar_name: { type: String, required: true },
    ar_lower_name: { type: String },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
engine_modelSchema.index({ engine_companyId: 1, isDelete: 1 });
// engine_modelSchema.index({ engine_companyId: 1, lower_name: 1 });
// engine_modelSchema.index({ engine_companyId: 1, lower_ar_name: 1 });
// engine_modelSchema.pre("save", function (next) {
//   this.lower_name = this.name.toLowerCase();
//   this.lower_ar_name = this.ar_name.toLowerCase();
//   next();
// });
const engine_modelModel = model<engine_model>(
  "engine",
  engine_modelSchema
);
export = engine_modelModel;
