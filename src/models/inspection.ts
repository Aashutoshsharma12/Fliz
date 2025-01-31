import { Schema, Types, model } from "mongoose";

interface inspection {
    uniqueId: string;
    title: string;
    lower_title: string;
    ar_title: string;
    ar_lower_title: string;
    isActive: boolean;
    isDelete: boolean;
    role: string;
}

const inspectionSchema = new Schema<inspection>(
    {
        uniqueId: { type: String },
        title: { type: String, required: true },
        lower_title: { type: String },
        ar_title: { type: String, required: true },
        ar_lower_title: { type: String },
        isActive: { type: Boolean, default: true },
        isDelete: { type: Boolean, default: false },
        role: {type: String, enum:["user", "company"], required:true}, 
    },
    { timestamps: true, versionKey: false }
);

inspectionSchema.index(
    { lower_title: 1,role:1 },
    { partialFilterExpression: { isDelete: { $eq: false } } }
);
inspectionSchema.index(
    { ar_lower_title: 1,role:1 },
    { partialFilterExpression: { isDelete: { $eq: false } } }
);
inspectionSchema.index(
    { lower_title: 1, ar_lower_title: 1,role:1 },
    { partialFilterExpression: { isDelete: { $eq: false } } }
);

const inspectionModel = model<inspection>("inspection", inspectionSchema);
export = inspectionModel;
