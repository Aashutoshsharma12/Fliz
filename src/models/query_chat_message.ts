import mongoose, { Schema, model } from "mongoose";
interface query_chat_message {
    companyProviderId: any;
    userId: any;
    orderId: any;
    queryId: any;
    message: string;
    messageType: string;
    sendFrom: string,
    sendTo: string,
    time: string;
    date: string;
    readStatus: boolean;
    currentTimezone: string;
    timeStamp: number;
    isDelete: boolean;
}

const query_chat_messageSchema = new Schema<query_chat_message>(
    {
        companyProviderId: { type: mongoose.Types.ObjectId, required: true },
        userId: { type: mongoose.Types.ObjectId, required: true },
        orderId: { type: mongoose.Types.ObjectId, required: true },  // Here OrderId works for both (orderId and roomId) 
        queryId: { type: mongoose.Types.ObjectId, required: true },
        message: { type: String, required: true },
        messageType: { type: String, required: true, default: 'text' }, // text,image
        sendFrom: { type: String, default: 'company' },
        sendTo: { type: String, default: 'user' },
        time: { type: String, required: true },
        date: { type: String, required: true },
        readStatus: { type: Boolean, default: false },
        currentTimezone: { type: String, required: false },
        timeStamp: { type: Number, required: true },
        isDelete: { type: Boolean, default: false }
    },
    { timestamps: true }
);

const query_chat_messageModal = model<query_chat_message>("query_chat_message", query_chat_messageSchema);
export = query_chat_messageModal;
