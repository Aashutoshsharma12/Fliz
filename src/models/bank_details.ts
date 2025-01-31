import { Schema, Types, model } from "mongoose";

interface bankDetails {
    userId: any;
    role: string;
    bankName: string;
    accountNumber: string;
    countryCode: string;
    phoneNumber: string;
    IFSC_code: string;
    accountName: string;
    email: string;
    isDelete: boolean;
    isActive: boolean;
}

const bankDetailsSchema = new Schema<bankDetails>({
    userId: { type: Types.ObjectId, ref: 'user_renter_delivery', required: true },
    role: { type: String, default: 'user' },  //renter_user,delivery_user,user
    bankName: { type: String, required: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    countryCode: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    accountNumber: { type: String, required: true },
    IFSC_code: { type: String, required: true },
    accountName: { type: String, required: true },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
},
    {
        timestamps: true,
        versionKey: false
    }
);
bankDetailsSchema.index({ userId: 1, role: 1, isDelete: 1 })
bankDetailsSchema.index({ userId: 1, isDelete: 1 })
const bankDetailsModel = model<bankDetails>('bankDetails', bankDetailsSchema);
export = bankDetailsModel;