import mongoose, { Schema, model } from "mongoose";

interface vehicle_specification {
    vehicleId: any;
    keyId: any;
    keyValueId: any;
    keyType: any;
    keyValue: any;
    isDelete: boolean;
}

const vehicle_specificationSchema = new Schema<vehicle_specification>(
    {
        vehicleId: { type: mongoose.Types.ObjectId, ref: 'delivery_vehicle', required: true },
        keyId: { type: mongoose.Types.ObjectId, ref: 'cat_specification', required: true },
        keyValueId: { type: mongoose.Types.ObjectId, ref: 'cat_specification_values', required: false },
        keyType: { type: String, },  // input and dropdown
        keyValue: { type: String, },
        isDelete: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false }
);

const vehicle_specificationModel = model<vehicle_specification>("vehilce_specification", vehicle_specificationSchema);
export = vehicle_specificationModel;