import { Schema, Types, model } from "mongoose";

interface delivery_vehicle {
    uniqueId: string;
    company_deliveryId: any;
    isBasicDetails: boolean;
    isMediaDetails: boolean;
    isaddressDetails: boolean;
    type: string;              //Heavy,Medium,Light 
    ar_type: string;              //Heavy,Medium,Light 
    sizeTypeId: any;
    sizeType: string;
    ar_sizeType: string;
    loadingCapacity: String;
    loadingCapacityId: any;
    priceInside_city_perDay: number;   //In SAR
    priceInoutSide_city_perKm: number; //In SAR
    total_truckAvailable: number;
    operational_trucks: number;
    isRepeatingDelivery: boolean;
    repeatingDeliveryAmount: number;
    isPriceBreaking: boolean;
    priceBreaking_details: any;
    vehicle_engineMake: string;
    ar_vehicle_engineMake: string;
    vehicle_engineModel: string;
    ar_vehicle_engineModel: string;
    isOil_coolant: boolean;
    isApproved: boolean;
    isActive: boolean;
    isDelete: boolean;
    vehicleCommission: number;   //Admin Commission Percentage for a Specific Vehicle
}

const delivery_vehicleSchema = new Schema<delivery_vehicle>({
    uniqueId: { type: String },
    company_deliveryId: { type: Types.ObjectId, ref: "user_renter_delivery", required: true },
    isBasicDetails: { type: Boolean, default: false },
    isMediaDetails: { type: Boolean, default: false },
    isaddressDetails: { type: Boolean, default: false },
    type: { type: String, required: true },
    ar_type: { type: String, required: true },
    sizeTypeId: { type: Types.ObjectId, ref: "sizeType", required: true },
    sizeType: { type: String, required: true },
    ar_sizeType: { type: String, required: true },
    loadingCapacity: { type: String, required: true },
    loadingCapacityId: { type: Types.ObjectId, ref: "capacity", required: true },
    priceInside_city_perDay: { type: Number, required: false },
    priceInoutSide_city_perKm: { type: Number, required: true },
    total_truckAvailable: { type: Number, default: 0 },
    operational_trucks: { type: Number, default: 0 },
    isRepeatingDelivery: { type: Boolean, default: false },
    repeatingDeliveryAmount: { type: Number },
    isPriceBreaking: { type: Boolean, default: false },
    priceBreaking_details: {
        time: { type: Number, default: 0 },
        minimumAmount: { type: Number, default: 0 }, //In SAR
        dueAmountDays: { type: Number, default: 0 }    //In SAR
    },
    vehicle_engineMake: { type: String, required: false },
    ar_vehicle_engineMake: { type: String, required: false },
    vehicle_engineModel: { type: String, required: false },
    ar_vehicle_engineModel: { type: String, required: false },
    isOil_coolant: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    vehicleCommission: { type: Number, default: 0, required: false }   //Admin Commission Percentage for a Specific Vehicle
},
    {
        timestamps: true,
        versionKey: false
    });

delivery_vehicleSchema.index({ isDelete: 1, type: 1, ar_type: 1 })
delivery_vehicleSchema.index({ isDelete: 1, _id: 1 })

const delivery_vehicleModel = model<delivery_vehicle>('delivery_vehicle', delivery_vehicleSchema);
export = delivery_vehicleModel;