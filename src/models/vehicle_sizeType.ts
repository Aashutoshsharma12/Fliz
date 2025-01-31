import { Schema, model } from "mongoose";

interface sizeType {
    uniqueId: string;
    name: any;
    lower_name: any;
    ar_name: any;
    ar_lower_name: any;
    delivery_type_name: string,
    delivery_type_ar_name: string,
    lower_delivery_type_name: string,
    lower_delivery_type_ar_name: string,
    image: string;
    isActive: boolean;
    isDelete: boolean;
}

const sizeTypeSchema = new Schema<sizeType>(
    {
        uniqueId: { type: String },
        name: { type: String, required: true, trim: true },
        delivery_type_name: { type: String, enum: ["Heavy", "Light", "Medium"], required: true },
        delivery_type_ar_name: { type: String, required: false },
        lower_delivery_type_name: { type: String, required: true, lowercase: true },
        lower_delivery_type_ar_name: { type: String, required: false, lowercase: true },
        image: { type: String },
        lower_name: { type: String },
        ar_name: { type: String, required: true, trim: true },
        ar_lower_name: { type: String },
        isActive: { type: Boolean, default: true },
        isDelete: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false }
);

sizeTypeSchema.index({ lower_name: 1, ar_lower_name: 1, isDelete: 1 });
// sizeTypeSchema.index(
//     { lower_name: 1 },
//     { unique: true, partialFilterExpression: { isDelete: { $eq: false } } }
// );
// sizeTypeSchema.index(
//     { lower_name: 1, ar_lower_name: 1 },
//     { unique: true, partialFilterExpression: { isDelete: { $eq: false } } }
// );

const Delivery_typeModel = model<sizeType>("sizeType", sizeTypeSchema);
export = Delivery_typeModel;
