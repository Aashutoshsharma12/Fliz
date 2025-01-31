import { Schema, model } from "mongoose";
interface guestUser {
  username: string;
  role:string;
  equipmentId:string;
  vehicleId:string;
  isDelete: boolean;
  isActive: boolean;
}

const guestUserSchema = new Schema<guestUser>(
  {
    username: { type: String, default:"guest" },
    role:{type:String,default:'guest_user'},
    equipmentId:{type:String},
    vehicleId:{type:String},
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const guestUserModal = model<guestUser>("guestUser", guestUserSchema);
export = guestUserModal;
