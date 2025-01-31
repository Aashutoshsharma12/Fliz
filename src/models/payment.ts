import { required } from "joi";
import mongoose, { Schema, model } from "mongoose";
interface payment {
    userId: any;
    companyProviderId: any
    orderId: any;
    installmentId:any;
    invoiceNumber: string;
    transactionId: string;
    totalAmount: number;
    dueAmount: number;
    paidAmount: number;
    note: string;
    paymentStatus: string;
    paymentMethod:string;
    date: string;
    time: string;
    isDelete: boolean;
}

const paymentSchema = new Schema<payment>(
    {
        userId: { type: mongoose.Types.ObjectId, ref: "user_renter_deliveries", required: true },
        companyProviderId: { type: mongoose.Types.ObjectId, ref: "user_renter_deliveries", required: true },
        orderId: { type: mongoose.Types.ObjectId, ref: "booking", required: true },
        installmentId: { type: mongoose.Types.ObjectId, ref: "order_installment", required: true },
        invoiceNumber: { type: String, required: true },
        transactionId: { type: String, required: true },
        totalAmount: { type: Number, required: true },
        dueAmount: { type: Number, required: true },
        paidAmount: { type: Number, required: true },
        note: { type: String, default: '' },
        paymentMethod:{type: String, required:true},
        paymentStatus: { type: String, default: 'paid' }, // paid, unpaid
        date: { type: String },
        time: { type: String },
        isDelete: { type: Boolean, default: false }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const paymentModal = model<payment>("payment", paymentSchema);
export = paymentModal;
