import { string } from "joi";
import mongoose, { model, Schema } from "mongoose";

interface notificationInterface {
    title: string,
    ar_title: string,
    description: string,
    ar_description: string,
    userId:any;
    image: any,
    role: string,
    sentTo: string,
    sendTime: string,
    sendDate: string,
    notification_readStatus:boolean;
    isActive: Boolean,
    isDelete: Boolean,
    phoneNumber:string,
    countryCode:string
}
// If the role is "Bulk," the "sentTo" key must be one of the following values: "all," "alluser," "allrenter," or "alldelivery."
// If the role is "Single," the "sentTo" key must be one of the following values: "user," "renter_user," or "delivery._user"

const notificationSchema = new Schema<notificationInterface>({
    title: { type: String, required: true },
    ar_title: { type: String, required: true },
    description: { type: String, required: true },
    ar_description: { type: String, required: true },
    userId:{type:mongoose.Types.ObjectId,ref:'user_renter_delivery'},
    image: { type: String },
    role: { type: String, required: true}, //Bulk , Single 
    sentTo: { type: String, required: false},   // all, alluser, allrenter, alldelivery // user, renter_user, delivery._user
    sendTime: { type: String, required: false }, // HH : mm 
    sendDate: { type: String, required: false }, // YYYY-MM-DD
    notification_readStatus: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    phoneNumber: { type: String },
    countryCode: { type: String } 

}, {
    timestamps: true,
    versionKey: false
});

notificationSchema.index({isDelete:1});
const notificationModel = model<notificationInterface>("notification", notificationSchema);
export = notificationModel