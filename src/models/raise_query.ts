import mongoose, { Schema, model } from "mongoose";
interface raise_query {
    userId: any;
    orderId: any;
    ticketId: string;
    title: string;
    description: string;
    image: string;
    status: string;
    isDelete?: boolean;
}

const raise_querySchema = new Schema<raise_query>(
    {
        userId: { type: mongoose.Types.ObjectId, required: true, ref: 'user_renter_delivery' },
        orderId: { type: mongoose.Types.ObjectId, required: true, ref: 'booking' },
        ticketId: { type: String },
        title: { type: String, required: true },
        description: { type: String, required: true },
        image: { type: String },
        status: { type: String, default: 'pending' }, //pending,resolve
        isDelete: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const raise_queryModal = model<raise_query>("raise_query", raise_querySchema);
export = raise_queryModal;
