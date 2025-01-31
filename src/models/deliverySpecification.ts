import mongoose, { Schema, model } from "mongoose";

interface delivery_specification {
    vehicleType: string;
    keyName: string;
    ar_keyName: String;
    lower_keyName: String;
    ar_lower_keyName: String;
    isDelete: boolean;
    type: string;
}

const delivery_specificationSchema = new Schema<delivery_specification>(
    {
        vehicleType: { type: String, required: true }, // Heavy, Medium, Light
        keyName: { type: String, required: true, trim: true },
        ar_keyName: { type: String, required: true, trim: true },
        lower_keyName: { type: String },
        ar_lower_keyName: { type: String },
        type: { type: String, },  // Input field and dropdown
        isDelete: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false }
);

export const delivery_specificationModel = model<delivery_specification>("delivery_specification", delivery_specificationSchema);

interface delivery_specification_values {
    vehicleType: string;
    keyId: any;
    keyValue: string;
    ar_keyValue: string;
    lower_keyValue: string;
    ar_lower_keyValue: string;
    isDelete: boolean;
}

const delivery_specification_valuesSchema = new Schema<delivery_specification_values>(
    {
        vehicleType: { type: String, required: true }, // Heavy, Medium, Light
        keyId: { type: mongoose.Types.ObjectId, ref: 'delivery_specification', required: true },
        keyValue: { type: String },
        ar_keyValue: { type: String },
        lower_keyValue: { type: String },
        ar_lower_keyValue: { type: String },
        isDelete: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false }
);

export const delivery_specification_valuesModel = model<delivery_specification_values>("delivery_specification_values", delivery_specification_valuesSchema);
