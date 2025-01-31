import { Schema, Types, model } from "mongoose";

interface vehicle_address {
    uniqueId: string;
    company_deliveryId: any;
    vehicleId: any;
    availableTruck: number;
    total_availableTruck: number;
    operational_truck: number;
    address: string,
    addressLine1: string,
    addressLine2: string,
    // lat: number,
    // long: number,
    location: any,
    country: string,
    zipcode: string,
    state: string,
    city: string,
    isActive: boolean;
    isDelete: boolean;
}

const vehicle_addressSchema = new Schema<vehicle_address>({
    uniqueId: { type: String },
    company_deliveryId: { type: Types.ObjectId, ref: 'user_renter_delivery', required: true },
    vehicleId: { type: Types.ObjectId, ref: 'delivery_vehicle', required: true },
    availableTruck: { type: Number, required: true },
    total_availableTruck: { type: Number },
    operational_truck: { type: Number, default: 0 },
    address: { type: String, required: true },
    addressLine1: { type: String, default: '' },
    addressLine2: { type: String, default: '' },
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
    // lat: { type: Number, required: true },
    // long: { type: Number, required: true },
    country: { type: String, required: true },
    zipcode: { type: String, required: false },
    city: { type: String, required: true },
    state: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
},
    {
        timestamps: true,
        versionKey: false
    }
);
vehicle_addressSchema.index({ location: '2dsphere' }); // For geospatial queries
vehicle_addressSchema.index({ "company_deliveryId": 1, "vehicleId": 1, "isDelete": 1 });
vehicle_addressSchema.index({ "vehicleId": 1 });
vehicle_addressSchema.index({ "company_deliveryId": 1 });
const vehicle_addressModel = model<vehicle_address>('vehicle_address', vehicle_addressSchema);
export = vehicle_addressModel;