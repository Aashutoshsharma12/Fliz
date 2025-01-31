import { messages } from "@Custom_message";
import Joi, { number } from "joi";
const customJoi = Joi.extend((joi) => ({
  type: "phoneNumber",
  base: joi.string(),
  messages: {
    "phoneNumber.base": "Phone Number should contain only digits",
  },
  rules: {
    digitsOnly: {
      validate(value, helpers) {
        if (value !== "" && !/^[0-9]+$/.test(value)) {
          return helpers.error("phoneNumber.base");
        }
        return value;
      },
    },
  },
}));
const updateProfileSchema = Joi.object({
  name: Joi.string().required().min(2),
  email: Joi.string().email({ minDomainSegments: 2 }).optional().allow(""),
  countryCode: Joi.string().required(),
  image: Joi.string().optional().allow(""),
  phoneNumber: customJoi
    .phoneNumber()
    .min(3)
    .max(20)
    .required()
    .digitsOnly()
    .messages({
      "string.empty": "Phone Number cannot be an empty field",
      "string.min": "Phone Number should have a minimum length of {#limit}",
      "string.max": "Phone Number should have a maximum length of {#limit}",
      "any.required": "Phone Number is a required field",
      "phoneNumber.base": "Phone Number should contain only digits",
    }),
  role: Joi.string().required().valid("user"),
  address: Joi.string().required(),
  addressLine1: Joi.string().optional().allow(""),
  addressLine2: Joi.string().optional().allow(""),
  lat: Joi.string().required(),
  long: Joi.string().required(),
  country: Joi.string().required(),
  zipcode: Joi.string().optional().allow(""),
  state: Joi.string().required(),
  city: Joi.string().required(),
});

/**
 * Booking Validators
 */
const location = Joi.object({
  type: Joi.string().required().valid("Point"),
  coordinates: Joi.array().items(Joi.number()).min(2).max(2).required(),
});
const isPriceBreaking = Joi.boolean().required();
const priceBreakupTime = Joi.number().required();
const priceBreaking_details = Joi.array().items(
  Joi.object({
    amount: Joi.number().required(),
    paymentNumber: Joi.number().required(),
    paid: Joi.boolean().required(),
    paymentDate: Joi.string().required(),
    paymentTime: Joi.string().optional().allow(''),
  })
);
// const technicalSpecification = Joi.object({
//   operatingWeight: Joi.number().optional().allow(''),
//   engineMake: Joi.string().optional().allow(''),
//   ar_engineMake: Joi.string().optional().allow(''),
//   engineModel: Joi.string().optional().allow(''),
//   ar_engineModel: Joi.string().optional().allow(''),
//   enginePower: Joi.number().optional(),
//   fuelCapacity: Joi.number().optional(),
//   maxDigDepth: Joi.number().optional(),
//   swingSpeed: Joi.number().optional(),
// });

const equipmentLocation = Joi.object({
  address: Joi.string().required(),
  addressLine1: Joi.string().optional().allow(""),
  addressLine2: Joi.string().optional().allow(""),
  location: location.required(),
  country: Joi.string().required(),
  zipcode: Joi.string().optional().allow("", null),
  state: Joi.string().required(),
  city: Joi.string().required(),
});
const equipmentDetails = Joi.object({
  equipmentName: Joi.string().required(),
  ar_equipmentName: Joi.string().required(),
  day_cost: Joi.number().required(),
  isPriceBreaking: isPriceBreaking.required(),
  priceBreakupTime: Joi.when("isPriceBreaking", {
    is: true,
    then: priceBreakupTime.required(),
    otherwise: priceBreakupTime.optional(),
  }),
  isRepeatingDelivery: Joi.boolean().required(),
  deliveryIncluded: Joi.boolean().optional(),
  technicalSpecification: Joi.array().optional(),
  equipmentLocation: equipmentLocation.required(),
});

const equipmentOrderId = Joi.string();
// const technicalSpecification_forVehicle = Joi.object({
//   engineMake: Joi.string().optional().allow(''),
//   ar_engineMake: Joi.string().optional().allow(''),
//   engineModel: Joi.string().optional().allow(''),
//   ar_engineModel: Joi.string().optional().allow(''),
//   enginePower: Joi.number().optional(),
//   fuelCapacity: Joi.number().optional(),
//   total_cylinders: Joi.number().optional(),
//   wheelBase: Joi.number().optional(),
//   width: Joi.number().optional(),
//   isOil_coolant: Joi.boolean().required(),
// });
const vehicleDetails = Joi.object({
  with_equipment: Joi.boolean().required(),
  equipmentOrderId: Joi.when('with_equipment', {
    is: true,
    then: equipmentOrderId.required(),
    otherwise: equipmentOrderId.optional()
  }),
  vehicleType: Joi.string().required(),
  ar_vehicleType: Joi.string().required(),
  vehicleSize: Joi.string().required(),
  ar_vehicleSize: Joi.string().required(),
  loadWeight: Joi.string().required(),
  priceOutSide_city_perKm: Joi.number().required(),
  priceInside_city_perDay: Joi.number().required(),
  isRepeatingDelivery: Joi.boolean().required(),
  isPriceBreaking: isPriceBreaking.required(),
  priceBreakupTime: Joi.when("isPriceBreaking", {
    is: true,
    then: priceBreakupTime.required(),
    otherwise: priceBreakupTime.optional(),
  }),
  deliveryIncluded: Joi.boolean().optional(),
  technicalSpecification: Joi.array().required()
});

const pickup_addressDetails = Joi.object({
  address: Joi.string().required(),
  addressLine1: Joi.string().optional().allow(""),
  addressLine2: Joi.string().optional().allow(""),
  location: location.required(),
  country: Joi.string().required(),
  zipcode: Joi.string().optional().allow("", null),
  state: Joi.string().required(),
  city: Joi.string().required(),
});
const delivery_addressDetails = Joi.object({
  address: Joi.string().required().messages({
    "string.base": "Delivery Address should be a type of text",
    "string.empty": "Delivery Address cannot be an empty field",
    "any.required": "Delivery Address is a required field",
  }),
  addressLine1: Joi.optional().allow(""),
  addressLine2: Joi.optional().allow(""),
  location: location.required(),
  country: Joi.string().required().messages({
    "string.base": "Delivery Country should be a type of text",
    "string.empty": "Delivery Country cannot be an empty field",
    "any.required": "Delivery Country is a required field",
  }),
  zipcode: Joi.string().optional().allow(""),
  state: Joi.string().required().messages({
    "string.base": "Delivery State should be a type of text",
    "string.empty": "Delivery State cannot be an empty field",
    "any.required": "Delivery State is a required field",
  }),
  city: Joi.string().required().messages({
    "string.base": "Delivery City should be a type of text",
    "string.empty": "Delivery City cannot be an empty field",
    "any.required": "Delivery City is a required field",
  }),
});
const vehicleId = Joi.string()
  .min(24)
  .messages({
    "string.min": messages("en").invalidMongoId.replace("{{key}}", "vehicleId"),
  });
const equipmentId = Joi.string()
  .min(24)
  .messages({
    "string.min": messages("en").invalidMongoId.replace(
      "{{key}}",
      "equipmentId"
    ),
  });
const bookingSchema = Joi.object({
  type: Joi.string().required().valid("vehicle", "equipment"),
  isPriceBreaking: Joi.boolean().required(),
  companyProviderId: Joi.string()
    .min(24)
    .required()
    .messages({
      "string.min": messages("en").invalidMongoId.replace(
        "{{key}}",
        "companyProviderId"
      ),
    }),
  vehicleId: Joi.when("type", {
    is: "vehicle",
    then: vehicleId.required(),
    otherwise: vehicleId.optional(),
  }),
  equipmentId: Joi.when("type", {
    is: "equipment",
    then: equipmentId.required(),
    otherwise: equipmentId.optional(),
  }),
  equipmentDetails: Joi.when("type", {
    is: "equipment",
    then: equipmentDetails.required(),
    otherwise: equipmentDetails.optional(),
  }),
  vehicleDetails: Joi.when("type", {
    is: "vehicle",
    then: vehicleDetails.required(),
    otherwise: vehicleDetails.optional(),
  }),
  chosen_equipment: Joi.number().required(),
  order_startDate: Joi.string().required(),
  order_startTime: Joi.string().required(),
  order_endDate: Joi.string().required(),
  order_endTime: Joi.string().required(),
  transport_cost: Joi.number().required(),
  vat_tax: Joi.number().required(),
  vat_tax_percentage: Joi.number().required(),
  totalAmount: Joi.number().required(),
  remaining_amount: Joi.number().required(),
  paidAmount: Joi.number().required(),
  pickup_addressDetails: Joi.when("type", {
    is: "vehicle",
    then: pickup_addressDetails.required(),
    otherwise: pickup_addressDetails.optional(),
  }),
  delivery_addressDetails: delivery_addressDetails.required(),
  priceBreaking_details: Joi.when("isPriceBreaking", {
    is: true,
    then: priceBreaking_details.required(),
    otherwise: priceBreaking_details.optional(),
  })
});

const reason = Joi.string().required();
const ar_reason = Joi.string().required();
const otp = Joi.string().required();

const order_statusSchema = Joi.object({
  status: Joi.string().required().valid('Cancelled', 'Confirmed', 'On the way', 'Reached', 'Delivered', 'Completed'),
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
    is: "Reached",
    then: otp.required(),
    otherwise: otp.optional().allow('', null),
  })
});

const ratingSchema = Joi.object({
  companyProviderId: Joi.string()
    .min(24).required()
    .messages({
      "string.min": messages("en").invalidMongoId.replace(
        "{{key}}",
        "companyProviderId"
      )
    }),
  rating: Joi.number().required(),
  review: Joi.string().optional().allow('', null),
  ar_review: Joi.string().optional().allow('', null),

});

const favSchema = Joi.object({
  type: Joi.string().required().valid("vehicle", "equipment", "company"),
  equipmentId: Joi.string()
    .min(24)
    .optional()
    .messages({
      "string.min": messages("en").invalidMongoId.replace(
        "{{key}}",
        "equipmentId"
      ),
    })
    .when("type", { is: "equipment", then: Joi.required() }),
  vehicleId: Joi.string()
    .min(24)
    .optional()
    .messages({
      "string.min": messages("en").invalidMongoId.replace(
        "{{key}}",
        "vehicleId"
      ),
    })
    .when("type", { is: "vehicle", then: Joi.required() }),
  companyId: Joi.string()
    .min(24)
    .optional()
    .messages({
      "string.min": messages("en").invalidMongoId.replace(
        "{{key}}",
        "companyId"
      ),
    })
    .when("type", { is: "company", then: Joi.required() }),
  status: Joi.boolean().required(),
});
const price_Breaking_details = Joi.object({
  time: Joi.number().required(),
  dueAmountDays: Joi.number().required(),
  minimumAmount: Joi.number().required(),
})
const orderCalculationSchema = Joi.object({
  bookingType: Joi.string().required().valid("vehicle", "equipment"),
  perWeek_price: Joi.when('bookingType', {
    is: "equipment",
    then: Joi.number().required(),
    otherwise: Joi.number().optional()
  }),
  perMonth_price: Joi.number().optional(),
  three_month_price: Joi.number().optional(),
  six_month_price: Joi.number().optional(),
  perYear_price: Joi.number().optional(),
  isPriceBreaking: Joi.boolean().required(),
  priceBreaking_details: Joi.when('isPriceBreaking', {
    is: true,
    then: price_Breaking_details.required(),
    otherwise: price_Breaking_details.optional()
  }),
  bookingDays: Joi.number().required(),
  total_booked_equipment_vehicle: Joi.number().required(),
  tax: Joi.number().required(),
  outSide_theCity: Joi.boolean().required(),
  perKm_price: Joi.when('outSide_theCity', {
    is: true,
    then: Joi.number().required(),
    otherwise: Joi.number().optional()
  }),
  distance: Joi.when('outSide_theCity', {
    is: true,
    then: Joi.number().required(),
    otherwise: Joi.number().optional()
  }),
  repeatedDelivery: Joi.boolean().required(),
  repeatedDelivery_fixedCost: Joi.when('repeatedDelivery', {
    is: true,
    then: Joi.number().required(),
    otherwise: Joi.number().optional()
  }),
  total_repeatedDelivery: Joi.when('repeatedDelivery', {
    is: true,
    then: Joi.number().required(),
    otherwise: Joi.number().optional()
  }),
  perDay_price: Joi.when('outSide_theCity', {
    is: true,
    then: Joi.number().optional(),
    otherwise: Joi.when('repeatedDelivery', {
      is: true,
      then: Joi.number().optional(),
      otherwise: Joi.number().required()
    })
  }),
  paymentCount: Joi.number().optional()
});
export { updateProfileSchema, bookingSchema, order_statusSchema, favSchema, ratingSchema, orderCalculationSchema };