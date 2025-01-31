import { Schema, model } from "mongoose";
interface admin_data {
  username: String;
  email: String;
  password: String;
  contact_number: String;
  token?: String;
  tax: number;
  isDelete?: boolean;
  isActive?: boolean;
}

const adminSchema = new Schema<admin_data>(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    contact_number: { type: String, required: true },
    token: { type: String, default: "" },
    tax: { type: Number, default: 0 },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const adminauthModal = model<admin_data>("admin", adminSchema);
export = adminauthModal;
