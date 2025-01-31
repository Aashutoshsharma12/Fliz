import { Schema, Types, model } from "mongoose";

interface equipment_media {
    uniqueId: string;
    companyProviderId: any;
    equipmentId: any;
    media_type: string;
    equipment_imageUrl: string;  //max 8 images
    equipment_videoUrl: string;   //max 30 seconds
    equipment_termsUrl: string; //In PDF
    equipment_contractUrl: string; //In PDF
    isActive: boolean;
    isDelete: boolean;
}

const equipment_mediaSchema = new Schema<equipment_media>({
    uniqueId: { type: String },
    companyProviderId: { type: Types.ObjectId, required: true },
    equipmentId: { type: Types.ObjectId, required: true },
    media_type: { type: String, default: 'image' },  //image,video,termsUrl,contractUrl
    equipment_imageUrl: { type: String, default: '' },  //max 8 images
    equipment_videoUrl: { type: String, default: '' },   //max 30 seconds
    equipment_termsUrl: { type: String, default: '' }, //In PDF
    equipment_contractUrl: { type: String, default: '' }, //In PDF
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
},
    {
        timestamps: true,
        versionKey: false
    }
);
equipment_mediaSchema.index({"companyProviderId":1,"equipmentId":1,'isDelete':1});
equipment_mediaSchema.index({"equipmentId":1});
equipment_mediaSchema.index({"companyProviderId":1});
const equipment_mediaModel = model<equipment_media>('equipment_media', equipment_mediaSchema);
export = equipment_mediaModel;