import mongoose, { Schema, model } from "mongoose";
interface user_visit {
    userId: any;
    companyProviderId: any;
    isDelete?: boolean;
    isActive?: boolean;
}

const user_visitSchema = new Schema<user_visit>(
    {
        userId: { type: mongoose.Types.ObjectId, required: true, ref: "" },
        companyProviderId: { type: mongoose.Types.ObjectId, required: true, ref: "" },
        isDelete: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const user_visitModal = model<user_visit>("user_visit", user_visitSchema);
export = user_visitModal;
