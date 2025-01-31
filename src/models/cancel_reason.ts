import { Schema, model } from "mongoose";

interface OrderCancel_reason {
    title: String,
    ar_title: String,
    role: String,
    isActive: boolean,
    isDelete: boolean
}

const OrderCancel_reasonSchema = new Schema<OrderCancel_reason>({
    title: { type: String, required: true, trim: true },
    ar_title: { type: String, required: true, trim: true },
    role: { type: String, enum: ["user", "company"] },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false }
}, {
    timestamps: true,
    versionKey: false
})

const OrderCancel_reasonModel = model<OrderCancel_reason>('cancel_reason', OrderCancel_reasonSchema);
export = OrderCancel_reasonModel;