import { Schema, Types, model } from "mongoose";

interface vehicle_media {
    uniqueId: string;
    company_deliveryId: any;
    vehicleId: any;
    media_type: string;
    vehicle_imageUrl: string;  //max 8 images
    vehicle_videoUrl: string;   //max 30 seconds
    vehicle_termsUrl: string; //In PDF
    vehicle_contractUrl: string; //In PDF
    isActive: boolean;
    isDelete: boolean;
}

const vehicle_mediaSchema = new Schema<vehicle_media>({
    uniqueId: { type: String },
    company_deliveryId: { type: Types.ObjectId, ref: 'user_renter_delivery', required: true },
    vehicleId: { type: Types.ObjectId, ref: 'delivery_vehicle', required: true },
    media_type: { type: String, default: 'image' },  //image,video,contractUrl,termsUrl
    vehicle_imageUrl: { type: String, default: '' },  //max 8 images
    vehicle_videoUrl: { type: String, default: '' },   //max 30 seconds
    vehicle_termsUrl: { type: String, default: '' }, //In PDF
    vehicle_contractUrl: { type: String, default: '' }, //In PDF
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
},
    {
        timestamps: true,
        versionKey: false
    }
);
vehicle_mediaSchema.index({ "company_deliveryId": 1, "vehicleId": 1, "isDelete": 1 });
vehicle_mediaSchema.index({ "vehicleId": 1 });
vehicle_mediaSchema.index({ "company_deliveryId": 1 });
const vehicle_mediaModel = model<vehicle_media>('vehicle_media', vehicle_mediaSchema);
export = vehicle_mediaModel;