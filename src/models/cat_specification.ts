import mongoose, { Schema, model } from "mongoose";

interface cat_specification {
    catId: any;
    keyName: string;
    ar_keyName: String;
    lower_keyName: String;
    ar_lower_keyName: String;
    isDelete: boolean;
    type: string;
}

const cat_specificationSchema = new Schema<cat_specification>(
    {
        catId: { type: mongoose.Types.ObjectId, ref: 'category', required: true },
        keyName: { type: String, required: true, trim: true },
        ar_keyName: { type: String, required: true, trim: true },
        lower_keyName: { type: String },
        ar_lower_keyName: { type: String },
        type: { type: String, },  // Input field and dropdown
        isDelete: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false }
);

export const cat_specificationModel = model<cat_specification>("cat_specification", cat_specificationSchema);

interface cat_specification_values {
    catId: any;
    keyId: any;
    keyValue: string;
    ar_keyValue: string;
    lower_keyValue: string;
    ar_lower_keyValue: string;
    isDelete: boolean;
}

const cat_specification_valuesSchema = new Schema<cat_specification_values>(
    {
        catId: { type: mongoose.Types.ObjectId, ref: 'category', required: true },
        keyId: { type: mongoose.Types.ObjectId, ref: 'cat_specification', required: true },
        keyValue: { type: String },
        ar_keyValue: { type: String },
        lower_keyValue: { type: String },
        ar_lower_keyValue: { type: String },
        isDelete: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false }
);

export const cat_specification_valuesModel = model<cat_specification_values>("cat_specification_values", cat_specification_valuesSchema);
