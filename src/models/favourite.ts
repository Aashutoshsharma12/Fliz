import { model } from "mongoose";
import { Schema, Types } from "mongoose";

interface favourite {
    userId: any;
    type: string;
    equipmentId: any;
    vehicleId: any;
    companyId: any;
    status: boolean;
    isDelete: boolean;
}

const favSchema = new Schema<favourite>({
    userId: { type: Types.ObjectId, ref: "user_renter_delivery" },
    type: { type: String, required: true },  // vehicle, equipment , company
    equipmentId: { type: Types.ObjectId, ref: "equipment" },
    vehicleId: { type: Types.ObjectId, ref: "delivery_vehicle" },
    companyId: { type: Types.ObjectId, ref: "user_renter_delivery" },
    status: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false }
},
    {
        timestamps: true,
        versionKey: false
    }
);
const favModel = model<favourite>('fav_equipments_vehicles', favSchema);
export = favModel;