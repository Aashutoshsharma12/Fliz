import { Schema, Types, model } from "mongoose";

interface capacity {
    uniqueId: string;
    capacity: string;
    ar_capacity: string;
    lower_capacity: string;
    lower_ar_capacity: string;
    type: string;
    isActive: boolean;
    isDelete: boolean;
    image:string
}

const capacitySchema = new Schema<capacity>(
    {
        uniqueId: { type: String },
        capacity: { type: String, required: true },
        lower_capacity: { type: String, required: true },
        ar_capacity: { type: String, required:true},
        lower_ar_capacity: { type: String, required:true},
        type: { type: String, default: "Ton" },
        isActive: { type: Boolean, default: true },
        isDelete: { type: Boolean, default: false },
        image: { type: String, required: false}
    },
    { timestamps: true, versionKey: false }
);
capacitySchema.index({ capacity: -1, isDelete: 1 })
capacitySchema.index(
    { capacity: 1 },
    { unique: true, partialFilterExpression: { isDelete: { $eq: false } } }
);
const capacityModel = model<capacity>("capacity", capacitySchema);
export = capacityModel;
