import { messages } from "@Custom_message";
import Joi, { required } from "joi"
import { loginSchema } from "./common";

const priceBreakingDetailsSchema = Joi.object({
    time: Joi.number().required(),
    minimumAmount: Joi.number().required(),
    dueAmountDays: Joi.number().required()
});

const addVehicleBasicDetailsSchema = Joi.object({
    type: Joi.string().required(),//Heavy,Medium,Light
    ar_type: Joi.string().required(),//Heavy,Medium,Light
    sizeType: Joi.string().required(),
    sizeTypeId: Joi.string().required(),
    ar_sizeType: Joi.string().required(),
    loadingCapacity: Joi.string().required(),
    loadingCapacityId: Joi.string().required(),
    priceInside_city_perDay: Joi.number().optional(),
    repeatingDeliveryAmount: Joi.number().optional(),
    priceInoutSide_city_perKm: Joi.number().required(),
    total_truckAvailable: Joi.number().required(),
    isRepeatingDelivery: Joi.boolean().optional(),
    // repeatingDeliveryAmount: Joi.when('isRepeatingDelivery', {
    //     is: true,
    //     then: Joi.number().required(),
    //     otherwise: Joi.number().optional()
    // }),
    // priceInside_city_perDay: Joi.when('isRepeatingDelivery', {
    //     is: false,
    //     then: Joi.number().required(),
    //     otherwise: Joi.number().optional()
    // }),
    isPriceBreaking: Joi.boolean().optional(),
    priceBreaking_details: Joi.when('isPriceBreaking', {
        is: true,
        then: priceBreakingDetailsSchema.required(),
        otherwise: priceBreakingDetailsSchema.optional()
    }),
    vehicle_engineMake: Joi.string().min(2).optional().allow(''),
    ar_vehicle_engineMake: Joi.string().min(2).optional().allow(''),
    vehicle_engineModel: Joi.string().min(2).optional().allow(''),
    ar_vehicle_engineModel: Joi.string().min(2).optional().allow(''),
    specifications: Joi.array().optional(),
    isOil_coolant: Joi.boolean().optional()
});

const editVehicleBasicDetailsSchema = Joi.object({
    vehicleId: Joi.string().min(24).required()
        .messages({
            'string.min': messages("en").invalidMongoId.replace('{{key}}', 'vehicleId')
        }),
    sizeType: Joi.string().required(),
    sizeTypeId: Joi.string().required(),
    ar_sizeType: Joi.string().required(),
    type: Joi.string().required(),//Heavy,Medium,Light
    ar_type: Joi.string().required(),
    loadingCapacity: Joi.string().required(),
    loadingCapacityId: Joi.string().required(),
    // priceInside_city_perDay: Joi.number().optional(),
    // repeatingDeliveryAmount: Joi.number().optional(),
    priceInoutSide_city_perKm: Joi.number().required(),
    total_truckAvailable: Joi.number().required(),
    isRepeatingDelivery: Joi.boolean().optional(),
    repeatingDeliveryAmount: Joi.when('isRepeatingDelivery', {
        is: true,
        then: Joi.number().required(),
        otherwise: Joi.number().optional()
    }),
    priceInside_city_perDay: Joi.when('isRepeatingDelivery', {
        is: false,
        then: Joi.number().required(),
        otherwise: Joi.number().optional()
    }),
    isPriceBreaking: Joi.boolean().optional(),
    priceBreaking_details: Joi.when('isPriceBreaking', {
        is: true,
        then: priceBreakingDetailsSchema.required(),
        otherwise: priceBreakingDetailsSchema.optional()
    }),
    vehicle_engineMake: Joi.string().min(2).optional().allow(''),
    ar_vehicle_engineMake: Joi.string().min(2).optional().allow(''),
    vehicle_engineModel: Joi.string().min(2).optional().allow(''),
    ar_vehicle_engineModel: Joi.string().min(2).optional().allow(''),
    specifications: Joi.array().optional(),
    isOil_coolant: Joi.boolean().optional(),
});

const editVehicleMediaDetailsSchema = Joi.object({
    vehicleId: Joi.string().min(24).required()
        .messages({
            'string.min': messages("en").invalidMongoId.replace('{{key}}', 'vehicleId')
        }),
    imagesUrl: Joi.array().min(1).max(8).required(),
    videoUrl: Joi.string().optional().allow(''),
    termsUrl: Joi.string().required(),
    contractUrl: Joi.string().required(),
    isApproved: Joi.boolean().optional()
});

const addressDetailsSchema = Joi.object({
    addressId: Joi.string().min(24).optional().allow(''),
    availableTruck: Joi.number().required(),
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

const editVehicleAddressDetailsSchema = Joi.object({
    vehicleId: Joi.string().min(24).required()
        .messages({
            'string.min': messages("en").invalidMongoId.replace('{{key}}', 'vehicleId')
        }),
    addressDetails: Joi.array().items(addressDetailsSchema).min(1).required()
});

const deleteImageSchema = Joi.object({
    vehicleId: Joi.string().min(24).required()
        .messages({
            'string.min': messages("en").invalidMongoId.replace('{{key}}', 'vehicleId')
        }),
    image_videosId: Joi.array().min(1).required()
});

const deleteAddressSchema = Joi.object({
    vehicleId: Joi.string().min(24).required()
        .messages({
            'string.min': messages("en").invalidMongoId.replace('{{key}}', 'vehicleId')
        }),
    addressId: Joi.string().min(24).required()
        .messages({
            'string.min': messages("en").invalidMongoId.replace('{{key}}', 'addressId')
        })
});

export {
    addVehicleBasicDetailsSchema,
    editVehicleBasicDetailsSchema,
    editVehicleMediaDetailsSchema,
    editVehicleAddressDetailsSchema,
    deleteImageSchema,
    deleteAddressSchema
}