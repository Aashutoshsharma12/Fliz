import { string } from "joi";
import mongoose, { model, Schema } from "mongoose";

interface user_notification {
    notificationId: any,
    userId: any,
    role: string,
    sentTo:any;
    sendTime: string,
    sendDate: string,
    readStatus: boolean,
    isDelete: Boolean,
}

const user_notificationSchema = new Schema<user_notification>({
    notificationId:{type:mongoose.Types.ObjectId,ref:'user_renter_delivery'},
    userId:{type:mongoose.Types.ObjectId,ref:'user_renter_delivery'},
    role: { type: String, required: true},
    sentTo: { type: String, required: false},
    sendTime: { type: String, required: false }, // HH : mm 
    sendDate: { type: String, required: false }, // YYYY-MM-DD
    readStatus: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false }
}, {
    timestamps: true,
    versionKey: false
});

user_notificationSchema.index({isDelete:1,userId:1})
const user_notificationModel = model<user_notification>("user_notification", user_notificationSchema);
export = user_notificationModel