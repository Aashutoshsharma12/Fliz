import { Schema, model } from "mongoose";
interface room {
  roomId: String;
  room_creater: String;
  roomType: string;
}

const roomSchema = new Schema<room>(
  {
    roomId: { type: String, required: true },   // orderId
    room_creater: { type: String, required: true }, // company,user
    roomType: { type: String, default: "chat" } // chat, query
  },
  { timestamps: true }
);

const chat_roomModal = model<room>("chat_room", roomSchema);
export = chat_roomModal;
