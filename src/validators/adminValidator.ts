import { messages } from "@Custom_message";
import Joi from "joi";
import { startTimer } from "winston";

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


const adminSignup = Joi.object({
  username: Joi.string().required().min(3),
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string()
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#_])[A-Za-z\\d@$!%*?&#_]{8,}$"
      )
    )
    .messages({
      "string.pattern.base":
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
  contact_number: customJoi
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
});

const adminLogin = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string().required(),
});


const taxSchema = Joi.object({
  tax: Joi.number().required(),
});

const changeAdminPassValidation = Joi.object({
  current_password: Joi.string()
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#_])[A-Za-z\\d@$!%*?&#_]{8,}$"
      )
    )
    .messages({
      "string.pattern.base":
        "Current-Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
    }),

  new_password: Joi.string()
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#_])[A-Za-z\\d@$!%*?&#_]{8,}$"
      )
    )
    .messages({
      "string.pattern.base":
        "New-Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
  confirm_new_password: Joi.string().valid(Joi.ref('new_password')).messages({ "any.only": "Both Password must be same" })
});

const forgotPassValidation = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string()
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#_])[A-Za-z\\d@$!%*?&#_]{8,}$"
      )
    )
    .messages({
      "string.pattern.base":
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
  confirmPassword: Joi.string()
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#_])[A-Za-z\\d@$!%*?&#_]{8,}$"
      )
    )
    .messages({
      "string.pattern.base":
        "Confirm Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
});

const addCategoryValidator = Joi.object({
  name: Joi.string().required().min(3),
  image: Joi.string().allow(""),
  isActive: Joi.boolean().required(),
  ar_name: Joi.string().min(3),
});

const updateCategoryValidator = Joi.object({
  name: Joi.string().required().min(3),
  image: Joi.string().allow(""),
  ar_name: Joi.string().required().min(3),
  isActive: Joi.boolean().required(),
});

const sub_sub__CategoryValidator = Joi.object({
  name: Joi.string().required().min(3),
  subCategoryId: Joi.string().hex().length(24).required(),
  categoryId: Joi.string().hex().length(24).required(),
  image: Joi.string().allow(""),
  ar_name: Joi.string().required().min(3),
  isActive: Joi.boolean().required()
});

const list_sub_CategoryValidator = Joi.object({
  categoryId: Joi.string().hex().length(24).required(),
  page: Joi.number(),
  perPage: Joi.number(),
  nameMatched: Joi.string().allow(""),
  isActive: Joi.string()
});

const list_sub_sub__CategoryValidator = Joi.object({
  categoryId: Joi.string().hex().length(24).required(),
  subCategoryId: Joi.string().hex().length(24).required(),
  page: Joi.number(),
  perPage: Joi.number(),
  nameMatched: Joi.string().allow(""),
  isActive: Joi.string()
});

const list_sub_category_for_Dropdown_Validator = Joi.object({
  categoryId: Joi.string().hex().length(24).required(),
});
const list_sub_sub_category_for_Dropdown_Validator = Joi.object({
  categoryId: Joi.string().hex().length(24).required(),
  subCategoryId: Joi.string().hex().length(24).required(),
});

const statusValidator = Joi.object({
  isActive: Joi.boolean().required(),
});

const excelData_subCat = Joi.object({
  categoryId: Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'categoryId')
    })
});

const excelData_subsubCat = Joi.object({
  categoryId: Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'categoryId')
    }),
  subCategoryId: Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'subCategoryId')
    }),
});


const addSub_CategoryValidator = Joi.object({
  name: Joi.string().required().min(3),
  categoryId: Joi.string().hex().length(24),
  image: Joi.string().allow(""),
  ar_name: Joi.string().required().min(3),
  isActive: Joi.boolean().required(),
});

const updateSub_CategoryValidator = Joi.object({
  name: Joi.string().required().min(3),
  categoryId: Joi.string().hex().length(24),
  image: Joi.string().allow(""),
  ar_name: Joi.string().required().min(3),
  isActive: Joi.boolean().required(),
});

const updateSub_Sub_CategoryValidator = Joi.object({
  name: Joi.string().required().min(3),
  categoryId: Joi.string().hex().length(24),
  subCategoryId: Joi.string().hex().length(24),
  image: Joi.string().allow(""),
  ar_name: Joi.string().required().min(3),
  isActive: Joi.boolean().required(),
});

const addEngine_companySchema = Joi.object({
  name: Joi.string().required(),
  ar_name: Joi.string().required(),
  role: Joi.string().required().valid("renter_user", "delivery_user"),
  isActive: Joi.boolean().required(),
});

const getEngine_companySchema = Joi.object({
  role: Joi.string().required().valid("renter_user", "delivery_user", "all"),
  page: Joi.number(),
  perPage: Joi.number(),
  nameMatched: Joi.string().allow(""),
  isActive: Joi.string()
});

const updateStatusEngine_companySchema = Joi.object({
  isActive: Joi.boolean().required(),
});

const add_engine_model_Validator = Joi.object({
  engine_companyId: Joi.string().hex().length(24).required(),
  name: Joi.string().required(),
  ar_name: Joi.string().required(),
  isActive: Joi.boolean().required(),
});

const edit_engine_model_Validator = Joi.object({
  engine_companyId: Joi.string().hex().length(24).required(),
  name: Joi.string().required(),
  ar_name: Joi.string().required(),
  isActive: Joi.boolean().required(),
});

const list_engine_model_Validator = Joi.object({
  engine_companyId: Joi.string().hex().length(24).required(),
  page: Joi.number(),
  perPage: Joi.number(),
  nameMatched: Joi.string().allow(""),
  isActive: Joi.string()
});

const EnginePower_Validator = Joi.object({
  name: Joi.number().required(),
  type: Joi.string().valid("hp"),
  isActive: Joi.boolean().required(),
});

const fuelCapacityValidator = Joi.object({
  name: Joi.number().required(),
  isActive: Joi.boolean().required(),
});

const breakOutValidator = Joi.object({
  name: Joi.number().required(),
  isActive: Joi.boolean().required(),
});

const machine_weight_Validator = Joi.object({
  name: Joi.number().required(),
  isActive: Joi.boolean().required(),
});

const maxCutEdge_Validator = Joi.object({
  name: Joi.number().required(),
  type: Joi.string().valid("mm"),
  isActive: Joi.boolean().required(),
});
const rear_Swing_Validator = Joi.object({
  name: Joi.number().required(),
  type: Joi.string().valid("mm"),
  isActive: Joi.boolean().required(),
});
const swing_Validator = Joi.object({
  name: Joi.number().required(),
  type: Joi.string().valid("mm"),
  isActive: Joi.boolean().required(),

});

const listDelivery_Vehicle = Joi.object({
  company_deliveryId: Joi.string().hex().length(24).required(),
  page: Joi.number(),
  perPage: Joi.number(),
  type: Joi.string().allow(""),
  isActive: Joi.string()
});

const listDelivery_Equipment = Joi.object({
  companyProviderId: Joi.string().hex().length(24).required(),
  page: Joi.number(),
  perPage: Joi.number(),
  nameMatched: Joi.string().allow(""),
  catId: Joi.string().min(24).optional()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'categoryId')
    }),
  isActive: Joi.string()
})

const add_deliveryTypeValidator = Joi.object({
  name: Joi.string().required().min(3),
  delivery_type_name: Joi.string().required().valid("Heavy", "Light", "Medium"),
  delivery_type_ar_name: Joi.string().optional().allow(''),
  image: Joi.string().required(),
  ar_name: Joi.string().required().min(3),
  isActive: Joi.boolean().required(),
});
const edit_vehicleSizeTypeValidator = Joi.object({
  sizeTypeId: Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'sizeTypeId')
    }),
  name: Joi.string().required().min(3),
  image: Joi.string().allow(""),
  ar_name: Joi.string().required().min(3),
  isActive: Joi.boolean().required(),

});
const add_capacityValidator = Joi.object({
  capacity: Joi.string().required(),
  ar_capacity: Joi.string().required(),
  isActive: Joi.boolean().required(),
  image:Joi.string().optional()
});
const update_statuscapacityValidator = Joi.object({
  isActive: Joi.boolean().required(),
});
const update_status_sizeTypeValidator = Joi.object({
  isActive: Joi.boolean().required(),
  sizeTypeId: Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'capacityId')
    }),
});
const add_instructionValidator = Joi.object({
  title: Joi.string().required().min(3),
  ar_title: Joi.string().required().min(3),
  isActive: Joi.boolean().required(),

});
const edit_instructionValidator = Joi.object({
  instructionId: Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'instructionId')
    }),
  title: Joi.string().required().min(3),
  ar_title: Joi.string().required().min(3),
  isActive: Joi.boolean().required(),
});
const update_status_instructionValidator = Joi.object({
  isActive: Joi.boolean().required(),
  instructionId: Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'instructionId')
    }),
});
const roleValidator = Joi.object({
  role: Joi.string().valid("user", "renter_user", "delivery_user").required(),
  page: Joi.number(),
  perPage: Joi.number(),
  toDate: Joi.date(),
  fromDate: Joi.date(),
  nameMatched: Joi.string().allow(""),
  isActive: Joi.string()
})

const priceBreakingDetailsSchema = Joi.object({
  time: Joi.number().required(),
  minimumAmount: Joi.number().required(),
  dueAmountDays: Joi.number().required()
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
const editEquipmentMediaDetailsSchema = Joi.object({
  imagesUrl: Joi.array().min(1).max(8).required(),
  videoUrl: Joi.string().optional().allow(''),
  termsUrl: Joi.string().required(),
  contractUrl: Joi.string().required()
});

const editEquipmentBasicDetailsSchema = Joi.object({
  equipmentId: Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'equipmentId')
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
  equipmentPrice_1_week: Joi.number().required(),
  equipmentPrice_1_month: Joi.number().required(),
  equipmentPrice_3_month: Joi.number().required(),
  equipmentPrice_6_month: Joi.number().required(),
  equipmentPrice_1_year: Joi.number().required(),
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
  equipment_enginePower: Joi.string().optional().allow(''),
  equipment_fuelCapacity: Joi.string().optional().allow(''),
  equipment_machineWeight: Joi.string().optional().allow(''),
  equipment_maximumCutting_height: Joi.string().optional().allow(''),
  equipment_rear_swingRadius: Joi.string().optional().allow(''),
  equipment_swingSpped: Joi.string().optional().allow(''),
  equipment_breakout_force: Joi.string().optional().allow(''),
  isBoom_swingAngle: Joi.boolean().optional(),
  isMinimum_groundClearance: Joi.boolean().optional(),
  mediaDetails: editEquipmentMediaDetailsSchema.required(),
  addressDetails: Joi.array().items(addressDetailsSchema).min(1).required()
});

const vehicle_addressDetailsSchema = Joi.object({
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

const editVehicleMediaDetailsSchema = Joi.object({
  imagesUrl: Joi.array().min(1).max(8).required(),
  videoUrl: Joi.string().optional().allow(''),
  termsUrl: Joi.string().required(),
  contractUrl: Joi.string().required(),
  isApproved: Joi.boolean().optional()
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
  loadingCapacity: Joi.number().required(),
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
  vehicle_enginePower: Joi.number().optional(),
  vehicle_fuelCapacity: Joi.number().optional(),
  vehicle_total_cylinders: Joi.number().optional(),
  vehicle_wheelBase: Joi.number().optional(),
  vehicle_width: Joi.number().optional(),
  isOil_coolant: Joi.boolean().optional(),
  addressDetails: Joi.array().items(vehicle_addressDetailsSchema).min(1).required(),
  mediaDetails: editVehicleMediaDetailsSchema.required()
});


const addCylinderValidator = Joi.object({
  name: Joi.number().required(),
  isActive: Joi.boolean().required()
})

const addWheelValidator = Joi.object({
  name: Joi.number().required(),
  isActive: Joi.boolean().required(),
})

const addTruck_WidthValidator = Joi.object({
  name: Joi.number().required(),
  isActive: Joi.boolean().required(),
})

const vehicleaddressDetailsSchema = Joi.object({
  addressId: Joi.string().min(24).optional().allow(''),
  availableTruck: Joi.number().required(),
  address: Joi.string().required(),
  addressLine1: Joi.string().optional().allow(''),
  addressLine2: Joi.string().optional().allow(''),
  lat: Joi.string().required(),
  long: Joi.string().required(),
  country: Joi.string().required(),
  zipcode: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required()
});

const editVehicleAddressDetailsSchema = Joi.object({
  vehicleId: Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'vehicleId')
    }),
  companyProviderId: Joi.string().hex().min(24).required(),

  addressDetails: Joi.array().items(vehicleaddressDetailsSchema).min(1).required()
});


const array = ["all", "user", "renter_user", "delivery_user", "alluser", "allrenter_user", "alldelivery_user"];
const phoneNumber = Joi.string()
const countryCode = Joi.string()
const sentTo = Joi.string()
const addNotificationValidator = Joi.object({
  title: Joi.string().required(),
  ar_title: Joi.string().required(),
  description: Joi.string().required(),
  ar_description: Joi.string().required(),
  image: Joi.string().optional().allow(''),
  role: Joi.string().valid("Single", "Bulk").required(),
  phoneNumber: Joi.when('role', {
    is: 'Bulk',
    then: phoneNumber.optional().allow(''),
    otherwise: phoneNumber.required()
  }),
  countryCode: Joi.when('role', {
    is: 'Bulk',
    then: countryCode.optional().allow(''),
    otherwise: countryCode.required()
  }),
  sentTo: Joi.when('role', {
    is: 'Bulk',
    then: sentTo.required().valid('all', 'alluser', 'allrenter', 'alldelivery'),
    otherwise: sentTo.required().valid('user', 'renter_user', 'delivery_user')
  })
});

const addEditVersion = Joi.object({
  androidVersion: Joi.string().required(),
  iosVersion: Joi.string().required(),
  versionStatus_android: Joi.string().required().valid("normal", "force"),
  versionStatus_ios: Joi.string().required().valid("normal", "force")
})

const updateUserValidator = Joi.object({
  name: Joi.string().required().min(3),
  image: Joi.string().allow(""),
  email: Joi.string().required(),
  address: Joi.string().required(),
  addressLine1: Joi.string().required(),
  addressLine2: Joi.string().required()
})

const verifyUserValidator = Joi.object({
  isVerified: Joi.boolean().required()
})

const userDetailsValidator = Joi.object({
  role: Joi.string().required().valid("user", "renter_user", "delivery_user"),
  fromDate: Joi.string().optional(),
  toDate: Joi.string().optional(),
  page: Joi.number(),
  perPage: Joi.number(),
  orderType: Joi.string().valid("renter", "delivery", "all"),
  vehicleType: Joi.string().valid("Heavy", "Medium", "Light"),
  nameMatched: Joi.string().allow(""),
  bookingStatus: Joi.string().valid("Pending", "Cancelled", "Completed", "Confirmed", "Accepted"),
  isActive: Joi.string().valid("Active", "InActive", "all")
})

const add_Order_Cancel_Reason = Joi.object({
  title: Joi.string().required(),
  ar_title: Joi.string().required(),
  role: Joi.string().required().valid("user", "company"),
  isActive: Joi.boolean().required()
})

const equipmentVerification = Joi.object({
  equipmentId: Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'equipmentId')
    }),
  approve: Joi.boolean().required()
});
const equipment_mediaDelete = Joi.object({
  equipmentId: Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'equipmentId')
    }),
  image_videosId: Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'image_videosId')
    })
});

const equipment_addressDelete = Joi.object({
  equipmentId: Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'equipmentId')
    }),
  addressId: Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'addressId')
    })
});

const deliveryVerification = Joi.object({
  deliveryId: Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'deliveryId')
    }),
  approve: Joi.boolean().required()
});

// )const orderList = Joi.object({
//  bookingStatus:Joi.string().required().valid("Pending", "Cancelled", "Confirmed", "Accepted", "On the way", "Reached", "Delivered", "Completed")
// }

const deleteNotification_Schema = Joi.object({
  id: Joi.string().min(24).required().messages({
    "string.min": messages("en").invalidMongoId.replace("{{key}}", "id"),
  }),
})

const FAQ_Schema = Joi.object({
  que: Joi.string().optional(),
  ans: Joi.string().optional(),
  ar_que: Joi.string().optional(),
  ar_ans: Joi.string().optional(),
  isActive: Joi.boolean().optional()
});

const faqStatus_Schema = Joi.object({
  isActive: Joi.boolean().required(),
  id: Joi.string().min(24).required().messages({
    "string.min": messages("en").invalidMongoId.replace("{{key}}", "id"),
  }),
});

const userRenterDelivery_schema = Joi.object({
  userId: Joi.string().min(24).messages({ "string.min": messages("en").invalidMongoId.replace("{{key}}", "userId") }),
  role: Joi.string().optional()
})

const loadType_Schema = Joi.object({
  title: Joi.string().required(),
  ar_title: Joi.string().required(),
  isActive: Joi.boolean().optional()
})

const loadTypeStatusChange_Schema = Joi.object({
  isActive: Joi.boolean().required(),
  id: Joi.string().min(24).required().messages({
    "string.min": messages("en").invalidMongoId.replace("{{key}}", "id"),
  })
})

const vehicle_mediaDelete = Joi.object({
  vehicleId: Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'vehicleId')
    }),
  image_videosId: Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'image_videosId')
    })
});

const vehicle_addressDelete = Joi.object({
  vehicleId: Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'vehicleId')
    }),
  addressId: Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'addressId')
    })
});

const commissionSchema = Joi.object({
  equipmentId: Joi.string().min(24).optional()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'equipmentId')
    }),
  vehicleId: Joi.string().min(24).optional()
  .messages({
    'string.min': messages("en").invalidMongoId.replace('{{key}}', 'vehicleId')
  }),
  equipmentCommission: Joi.number().optional(),
  vehicleCommission: Joi.number().optional()
})
  .or('equipmentId', 'vehicleId') 
  .and('equipmentId', 'equipmentCommission') 
  .and('vehicleId', 'vehicleCommission'); 


  const cat_addSpecificationSchema = Joi.object({
    catId:Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'catId')
    }),
    keyName:Joi.string().required(),
    ar_keyName: Joi.string().required(),
    type:Joi.string().required().valid('input', 'dropdown')
  })

  const cat_editSpecificationSchema = Joi.object({
    id:Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'id')
    }),
    catId:Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'catId')
    }),
    keyName:Joi.string().required(),
    ar_keyName: Joi.string().required(),
    type:Joi.string().required().valid('input', 'dropdown')
  })

  const addSpecificationValue_Schema = Joi.object({
    catId:Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'catId')
    }),
    keyId:Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'keyId')
    }),
    keyValue:Joi.string().required(),
    ar_keyValue:Joi.string().required()
  })

  const editSpecificationValue_Schema = Joi.object({
    catId:Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'catId')
    }),
    keyId:Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'keyId')
    }),
    keyValue:Joi.string().required(),
    ar_keyValue:Joi.string().required(),
    mongoId:Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'mongoId')
    }),
  })

  const add_deliverySpecification_Schema = Joi.object({
    vehicleType:Joi.string().required().valid('Heavy','Medium','Light'),
    keyName:Joi.string().required(),
    ar_keyName: Joi.string().required(),
    type:Joi.string().required().valid('input', 'dropdown')
  })

  const edit_deliverySpecification_Schema = Joi.object({
    id:Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'id')
    }),
    vehicleType:Joi.string().required().valid('Heavy','Medium','Light'),
    keyName:Joi.string().required(),
    ar_keyName: Joi.string().required(),
    type:Joi.string().required().valid('input', 'dropdown')
  })

  const addDeliverySpecificationValue_Schema = Joi.object({
    vehicleType:Joi.string().required().valid('Heavy','Medium','Light'),
    keyId:Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'keyId')
    }),
    keyValue:Joi.string().required(),
    ar_keyValue:Joi.string().required()
  })

  const editDeliverySpecificationValue_Schema = Joi.object({
    vehicleType:Joi.string().required().valid('Heavy','Medium','Light'),
    keyId:Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'keyId')
    }),
    keyValue:Joi.string().required(),
    ar_keyValue:Joi.string().required(),
    mongoId:Joi.string().min(24).required()
    .messages({
      'string.min': messages("en").invalidMongoId.replace('{{key}}', 'mongoId')
    }),
  })


  
export {
  editDeliverySpecificationValue_Schema,
  addDeliverySpecificationValue_Schema,
  edit_deliverySpecification_Schema,
  add_deliverySpecification_Schema,
  editSpecificationValue_Schema,
  addSpecificationValue_Schema,
  cat_addSpecificationSchema,
  cat_editSpecificationSchema,
  excelData_subsubCat,
  excelData_subCat,
  loadTypeStatusChange_Schema,
  loadType_Schema,
  userRenterDelivery_schema,
  faqStatus_Schema,
  FAQ_Schema,
  adminSignup,
  adminLogin,
  changeAdminPassValidation,
  forgotPassValidation,
  addSub_CategoryValidator,
  sub_sub__CategoryValidator,
  addCategoryValidator,
  updateCategoryValidator,
  updateSub_CategoryValidator,
  updateSub_Sub_CategoryValidator,
  list_sub_sub__CategoryValidator,
  list_sub_CategoryValidator,
  list_sub_category_for_Dropdown_Validator,
  list_sub_sub_category_for_Dropdown_Validator,
  statusValidator,
  addEngine_companySchema,
  getEngine_companySchema,
  updateStatusEngine_companySchema,
  add_engine_model_Validator,
  edit_engine_model_Validator,
  list_engine_model_Validator,
  EnginePower_Validator,
  fuelCapacityValidator,
  breakOutValidator,
  machine_weight_Validator,
  maxCutEdge_Validator,
  rear_Swing_Validator,
  swing_Validator,
  listDelivery_Vehicle,
  listDelivery_Equipment,
  add_deliveryTypeValidator,
  add_capacityValidator,
  update_statuscapacityValidator,
  edit_vehicleSizeTypeValidator,
  update_status_sizeTypeValidator,
  add_instructionValidator,
  edit_instructionValidator,
  update_status_instructionValidator,
  roleValidator,
  editEquipmentBasicDetailsSchema,
  editVehicleBasicDetailsSchema,
  editVehicleAddressDetailsSchema,
  addCylinderValidator,
  addWheelValidator,
  addTruck_WidthValidator,
  addNotificationValidator,
  addEditVersion,
  updateUserValidator,
  verifyUserValidator,
  userDetailsValidator,
  add_Order_Cancel_Reason,
  equipmentVerification,
  deliveryVerification,
  deleteNotification_Schema,
  equipment_mediaDelete,
  equipment_addressDelete,
  vehicle_mediaDelete,
  vehicle_addressDelete,
  taxSchema,
  commissionSchema
};
