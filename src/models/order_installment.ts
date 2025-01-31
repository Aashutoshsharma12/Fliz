import mongoose, { Schema, model } from "mongoose";
interface order_installment {
    uniqueId: string;
    userId: any;
    companyProviderId: any
    orderId: any;
    totalAmount: number;
    paidAmount: number;
    paymentStatus: string;
    type: string;
    date: string;
    time: string;
    confirmBookingStatus: boolean;
    isDelete: boolean;
}

const order_installmentSchema = new Schema<order_installment>(
    {
        uniqueId: { type: String, required: true },
        userId: { type: mongoose.Types.ObjectId, ref: "user_renter_delivery", required: true },
        companyProviderId: { type: mongoose.Types.ObjectId, ref: "user_renter_delivery", required: true },
        orderId: { type: mongoose.Types.ObjectId, ref: "booking", required: true },
        totalAmount: { type: Number, required: true },
        paidAmount: { type: Number, required: true },
        paymentStatus: { type: String, default: 'unpaid' }, // paid, unpaid
        type: { type: String, default: 'installment' }, // down_payment, installment (Note : Now down_payment is the first installment) 
        date: { type: String },
        time: { type: String },
        confirmBookingStatus: { type: Boolean, default: false },
        isDelete: { type: Boolean, default: false }
    },
    {
        timestamps: true,
        versionKey: false
    }
);
order_installmentSchema.index({ userId: 1, isDelete: 1, paymentStatus: 1, confirmBookingStatus: 1 })
const order_installmentModal = model<order_installment>("order_installment", order_installmentSchema);
export = order_installmentModal;
