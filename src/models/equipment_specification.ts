import mongoose, { Schema, model } from "mongoose";

interface equipment_specification {
    equipmentId: any;
    keyId: any;
    keyValueId: any;
    keyType: string;
    keyValue: string;
    isDelete: boolean;
}

const equipment_specificationSchema = new Schema<equipment_specification>(
    {
        equipmentId: { type: mongoose.Types.ObjectId, ref: 'equipment', required: true },
        keyId: { type: mongoose.Types.ObjectId, ref: 'cat_specification', required: true },
        keyValueId: { type: mongoose.Types.ObjectId, ref: 'cat_specification_values', required: false },
        keyType: { type: String, },  // input and dropdown
        keyValue: { type: String, },
        isDelete: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false }
);

const equipment_specificationModel = model<equipment_specification>("equipment_specification", equipment_specificationSchema);
export = equipment_specificationModel;