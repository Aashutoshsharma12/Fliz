import { model, Schema } from "mongoose";
interface Version {
    androidVersion: String,
    iosVersion: String,
    versionStatus_android: Boolean,
    versionStatus_ios: Boolean,
    isActive: Boolean,
    isDelete: Boolean
}

const VersionSchema = new Schema<Version>({
    androidVersion: { type: String, required: true },
    iosVersion: { type: String, required: true },
    versionStatus_android: { type: String, requied: true, enum: ["normal", "force"] },
    versionStatus_ios:{type: String, requied: true, enum: ["normal", "force"]},
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false }

},
    {
        timestamps: true,
        versionKey: false
    })

VersionSchema.index({ _id: 1, isDelete: 1 })
VersionSchema.index({ _id: 1, isDelete: 1, versionStatus: 1 })


const versionModel = model<Version>("version", VersionSchema);
export = versionModel;