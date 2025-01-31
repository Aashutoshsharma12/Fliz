import { messages } from "@Custom_message";
import Joi from "joi"
import { loginSchema } from "./common";
const priceBreakingDetailsSchema = Joi.object({
    time: Joi.number().required(),
    minimumAmount: Joi.number().required(),
    dueAmountDays: Joi.number().required()
});
const addEquipmentBasicDetailsSchema = Joi.object({
    categoryId: Joi.string().min(24).required()
        .messages({
            'string.min': messages("en").invalidMongoId.replace('{{key}}', 'categoryId')
        }),
    subCategoryId: Joi.string().min(24).required()
        .messages({
            'string.min': messages("en").invalidMongoId.replace('{{key}}', 'subCategoryId')
        }),
    sub_subCategoryId: Joi.string().min(24).required()
        .messages({
            'string.min': messages("en").invalidMongoId.replace('{{key}}', 'sub_subCategoryId')
        }),
    equipmentName: Joi.string().required(),
    ar_equipmentName: Joi.string().required(),
    equipmentPrice_perDay: Joi.number().required(),
    equipmentPrice_1_week: Joi.number().optional(),
    equipmentPrice_1_month: Joi.number().optional(),
    equipmentPrice_3_month: Joi.number().optional(),
    equipmentPrice_6_month: Joi.number().optional(),
    equipmentPrice_1_year: Joi.number().optional(),
    specifications: Joi.array().optional(),
    total_equipmentAvailable: Joi.number().required(),
    isDeliveryInclude: Joi.boolean().optional(),
    isPriceBreaking: Joi.boolean().optional(),
    priceBreaking_details: Joi.when('isPriceBreaking', {
        is: true,
        then: priceBreakingDetailsSchema.required(),
        otherwise: priceBreakingDetailsSchema.optional()
    }),
    equipment_engineMake: Joi.string().min(2).optional().allow(''),
    ar_equipment_engineMake: Joi.string().min(2).optional().allow(''),
    equipment_engineModel: Joi.string().min(2).optional().allow(''),
    ar_equipment_engineModel: Joi.string().min(2).optional().allow(''),
    isBoom_swingAngle: Joi.boolean().optional(),
    isMinimum_groundClearance: Joi.boolean().optional()
});
const editEquipmentBasicDetailsSchema = Joi.object({
    equipmentId: Joi.string().min(24).required()
        .messages({
            'string.min': messages("en").invalidMongoId.replace('{{key}}', 'categoryId')
        }),
    categoryId: Joi.string().min(24).required()
        .messages({
            'string.min': messages("en").invalidMongoId.replace('{{key}}', 'categoryId')
        }),
    subCategoryId: Joi.string().min(24).required()
        .messages({
            'string.min': messages("en").invalidMongoId.replace('{{key}}', 'subCategoryId')
        }),
    sub_subCategoryId: Joi.string().min(24).required()
        .messages({
            'string.min': messages("en").invalidMongoId.replace('{{key}}', 'sub_subCategoryId')
        }),
    equipmentName: Joi.string().required(),
    ar_equipmentName: Joi.string().required(),
    equipmentPrice_perDay: Joi.number().required(),
    equipmentPrice_1_week: Joi.number().optional(),
    equipmentPrice_1_month: Joi.number().optional(),
    equipmentPrice_3_month: Joi.number().optional(),
    equipmentPrice_6_month: Joi.number().optional(),
    equipmentPrice_1_year: Joi.number().optional(),
    total_equipmentAvailable: Joi.number().required(),
    isDeliveryInclude: Joi.boolean().optional(),
    isPriceBreaking: Joi.boolean().optional(),
    priceBreaking_details: Joi.when('isPriceBreaking', {
        is: true,
        then: priceBreakingDetailsSchema.required(),
        otherwise: priceBreakingDetailsSchema.optional()
    }),
    equipment_engineMake: Joi.string().min(2).optional().allow(''),
    ar_equipment_engineMake: Joi.string().min(2).optional().allow(''),
    equipment_engineModel: Joi.string().min(2).optional().allow(''),
    ar_equipment_engineModel: Joi.string().min(2).optional().allow(''),
    specifications: Joi.array().optional(),
    isBoom_swingAngle: Joi.boolean().optional(),
    isMinimum_groundClearance: Joi.boolean().optional()
});
const editEquipmentMediaDetailsSchema = Joi.object({
    equipmentId: Joi.string().min(24).required()
        .messages({
            'string.min': messages("en").invalidMongoId.replace('{{key}}', 'categoryId')
        }),
    imagesUrl: Joi.array().min(1).max(8).required(),
    videoUrl: Joi.string().optional().allow(''),
    termsUrl: Joi.string().required(),
    contractUrl: Joi.string().required(),
    isApproved: Joi.boolean().optional()
});
const addressDetailsSchema = Joi.object({
    addressId: Joi.string().min(24).optional().allow(''),
    availableEquipment: Joi.number().required(),
    address: Joi.string().required(),
    addressLine1: Joi.string().optional().allow(''),
    addressLine2: Joi.string().optional().allow(''),
    location: Joi.object({
        type: Joi.string().required().valid('Point'),
        coordinates: Joi.array().required()
    }),
    country: Joi.string().required(),
    zipcode: Joi.string().optional().allow(''),
    city: Joi.string().required(),
    state: Joi.string().required()
});
const editEquipmentAddressDetailsSchema = Joi.object({
    equipmentId: Joi.string().min(24).required()
        .messages({
            'string.min': messages("en").invalidMongoId.replace('{{key}}', 'categoryId')
        }),
    addressDetails: Joi.array().items(addressDetailsSchema).min(1).required()
});
const deleteImageSchema = Joi.object({
    equipmentId: Joi.string().min(24).required()
        .messages({
            'string.min': messages("en").invalidMongoId.replace('{{key}}', 'equipmentId')
        }),
    image_videosId: Joi.array().min(1).required()
});
/**
 * For Equipment
 */
const reason = Joi.string().required();
const ar_reason = Joi.string().required();
const otp = Joi.string().required();
const order_statusSchema = Joi.object({
    status: Joi.string().required().valid('Cancelled', 'Confirmed', 'Picked', 'On the way', 'Reached', 'Delivered', 'Completed'),
    actionBy: Joi.string().required().valid('user', 'company'),
    reason: Joi.when("status", {
        is: "Cancelled",
        then: reason.required(),
        otherwise: reason.optional().allow('', null),
    }),
    ar_reason: Joi.when("status", {
        is: "Cancelled",
        then: ar_reason.required(),
        otherwise: ar_reason.optional().allow('', null),
    }),
    otp: Joi.when("status", {
        is: "Delivered",
        then: otp.required(),
        otherwise: otp.optional().allow('', null),
    })
});

/**
 * For Vehicle
 */
const order_status_vehicleSchema = Joi.object({
    status: Joi.string().required().valid('Cancelled', 'Confirmed', 'Going to pickup', 'Reached on equipment location', 'Picked', 'On the way', 'Reached', 'Delivered', 'Completed'),
    actionBy: Joi.string().required().valid('user', 'company'),
    reason: Joi.when("status", {
        is: "Cancelled",
        then: reason.required(),
        otherwise: reason.optional().allow('', null),
    }),
    ar_reason: Joi.when("status", {
        is: "Cancelled",
        then: ar_reason.required(),
        otherwise: ar_reason.optional().allow('', null),
    }),
    otp: Joi.when("status", {
        is: Joi.string().valid("Picked", "Delivered"),
        then: otp.required(),
        otherwise: otp.optional().allow('', null),
    })
});
// Equipment status : Pending (default) , Cancelled (By User/Company) , Confirmed (By User/Company), Accepted (By Company), On the way, Reached, Delivered, Completed
// Transport status : Pending (default) , Cancelled (By User/Company) , Confirmed (By User/Company) , Accepted (By Company), Going to pickup, Reached on equipment location, Picked, On the way, Reached, Delivered, Completed   

const equipment_order_inspectionSchema = Joi.object({
    role: Joi.string().required().valid('user', 'vehicle'),
    orderId: Joi.string().min(24).required()
        .messages({
            'string.min': messages("en").invalidMongoId.replace('{{key}}', 'orderId')
        }),
    inspectionDetails: Joi.array().min(1).required()
});
const deleteAddressSchema = Joi.object({
    equipmentId: Joi.string().min(24).required()
        .messages({
            'string.min': messages("en").invalidMongoId.replace('{{key}}', 'equipmentId')
        }),
    addressId: Joi.string().min(24).required()
        .messages({
            'string.min': messages("en").invalidMongoId.replace('{{key}}', 'addressId')
        })
});
export {
    addEquipmentBasicDetailsSchema,
    editEquipmentBasicDetailsSchema,
    editEquipmentMediaDetailsSchema,
    editEquipmentAddressDetailsSchema,
    deleteImageSchema,
    order_statusSchema,
    order_status_vehicleSchema,
    equipment_order_inspectionSchema,
    deleteAddressSchema
}