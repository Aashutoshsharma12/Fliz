import { Schema, model } from 'mongoose';

interface userSession {
  deviceType: string;
  deviceIp: string;
  timezone: string;
  language: string;
  currentVersion: string;
  deviceToken: string;
  role: String;
  isDelete: boolean,
  jwtToken: String,
  refreshToken: String;
  accessToken: String;
  guestToken:string;
  userId: String
}

const schema = new Schema<userSession>({
  deviceType: { type: String },
  deviceIp: { type: String },
  timezone: { type: String },
  language: { type: String, default: "en" },
  currentVersion: { type: String, default: '1.0.1' },
  deviceToken: { type: String },
  role: { type: String, default: "user" },
  refreshToken: { type: String },
  accessToken: { type: String },
  guestToken:{type:String},
  userId: { type: String, required: true },
  isDelete: { type: Boolean, default: false },
},
  {
    timestamps: true,
    versionKey: false
  });
schema.index({ jwtToken: 1 });
schema.index({ refreshToken: 1 });
schema.index({ accessToken: 1 });

const userSessionModel = model<userSession>('usersessions', schema);
export = userSessionModel