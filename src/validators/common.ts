import { messages } from "@Custom_message";
import Joi from "joi";
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
const company_license_frontSide = Joi.string()
const company_license_backSide = Joi.string()
const driving_license_frontSide = Joi.string()
const driving_license_backSide = Joi.string()
const truck_license_frontSide = Joi.string()
const truck_license_backSide = Joi.string()
const company_description = Joi.string()

const signUpSchema = Joi.object({
  name: Joi.string().required().min(3),
  email: Joi.string().email({ minDomainSegments: 2 }).optional().allow(""),
  countryCode: Joi.string().required(),
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
  image: Joi.string().optional().allow(""),
  isBusiness: Joi.boolean().optional(),
  role: Joi.string().required().valid("user", "renter_user", "delivery_user"),
  address: Joi.string().required(),
  addressLine1: Joi.string().optional().allow(""),
  addressLine2: Joi.string().optional().allow(""),
  lat: Joi.string().required(),
  long: Joi.string().required(),
  country: Joi.string().required(),
  zipcode: Joi.string().optional().allow(""),
  state: Joi.string().required(),
  city: Joi.string().required(),
  company_description: Joi.when('role', {
    is: 'user',
    then: company_description.optional().allow(''),
    otherwise: company_description.required()
  }),
  password: Joi.string()
    .required()
    .pattern(
      new RegExp(
        // "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$"
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#.\\-:_/])[A-Za-z\\d@$!%*?&#.\\-:_/]{8,}$"
      )
    )
    .messages({
      "string.pattern.base":
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
  company_license_frontSide: Joi.when('role', {
    is: 'user',
    then: company_license_frontSide.optional().allow(''),
    otherwise: company_license_frontSide.required()
  }),
  company_license_backSide: Joi.when('role', {
    is: 'user',
    then: company_license_backSide.optional().allow(''),
    otherwise: company_license_backSide.required()
  }),
  driving_license_frontSide: Joi.when('role', {
    is: 'user',
    then: driving_license_frontSide.optional().allow(''),
    otherwise: driving_license_frontSide.required()
  }),
  driving_license_backSide: Joi.when('role', {
    is: 'user',
    then: driving_license_backSide.optional().allow(''),
    otherwise: driving_license_backSide.required()
  }),
  truck_license_frontSide: Joi.when('role', {
    is: 'user',
    then: truck_license_frontSide.optional().allow(''),
    otherwise: truck_license_frontSide.required()
  }),
  truck_license_backSide: Joi.when('role', {
    is: 'user',
    then: truck_license_backSide.optional().allow(''),
    otherwise: truck_license_backSide.required()
  })
});

const loginSchema = Joi.object({
  countryCode: Joi.string().required(),
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
  password: Joi.string().required(),
  role: Joi.string().optional().valid("user", "renter_user", "delivery_user"),
});

const detailsInfoSchema = Joi.object({
  countryCode: Joi.string().required(),
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
  role: Joi.string().optional().allow('', null),
});

const forgotSchema1 = Joi.object({
  // userId: Joi.string()
  //   .min(24)
  //   .required()
  //   .messages({
  //     "string.min": messages("en").invalidMongoId.replace("{{key}}", "userId"),
  //   }),
  role: Joi.string().optional().allow('', null),
  countryCode: Joi.string().required(),
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
  newPassword: Joi.string()
    .required()
    .pattern(
      new RegExp(
        // "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$"
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#.\\-:_/])[A-Za-z\\d@$!%*?&#.\\-:_/]{8,}$"
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
        // "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$"
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#.\\-:_/])[A-Za-z\\d@$!%*?&#.\\-:_/]{8,}$"
      )
    )
    .messages({
      "string.pattern.base":
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  role: Joi.string().required(),
  newPassword: Joi.string()
    .required()
    .pattern(
      new RegExp(
        // "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$"
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#.\\-:_/])[A-Za-z\\d@$!%*?&#.\\-:_/]{8,}$"
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
        // "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$"
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#.\\-:_/])[A-Za-z\\d@$!%*?&#.\\-:_/]{8,}$"
      )
    )
    .messages({
      "string.pattern.base":
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().required().min(2),
  email: Joi.string().email({ minDomainSegments: 2 }).optional().allow(""),
  countryCode: Joi.string().required(),
  image: Joi.string().optional().allow(""),
  bannerImage: Joi.string().optional().allow(""),
  isBusiness: Joi.boolean().optional(),
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
  role: Joi.string().required().valid("renter_user", "delivery_user"),
  address: Joi.string().required(),
  addressLine1: Joi.string().optional().allow(""),
  addressLine2: Joi.string().optional().allow(""),
  lat: Joi.string().required(),
  long: Joi.string().required(),
  country: Joi.string().required(),
  zipcode: Joi.string().optional().allow(""),
  state: Joi.string().required(),
  city: Joi.string().required(),
  company_description: Joi.string().required(),
  company_license_frontSide: Joi.string().optional().allow(""),
  company_license_backSide: Joi.string().optional().allow(""),
  driving_license_frontSide: Joi.string().optional().allow(""),
  driving_license_backSide: Joi.string().optional().allow(""),
  truck_license_frontSide: Joi.string().optional().allow(""),
  truck_license_backSide: Joi.string().optional().allow(""),
});
const updateNotificationSchema = Joi.object({
  isNotification: Joi.boolean().required(),
});
const delete_certificateSchema = Joi.object({
  certificate_achievement: Joi.string().required(),
});
const sendOtpSchema = Joi.object({
  countryCode: Joi.string().required(),
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
    })
});
const verifyOtpSchema = Joi.object({
  token: Joi.string().required(),
  otp: Joi.number().required()
});
const addBankDetailsSchema = Joi.object({
  role: Joi.string().required().valid("user", "renter_user", "delivery_user"),
  bankName: Joi.string().required().min(2),
  accountNumber: Joi.string().required().min(2),
  IFSC_code: Joi.string().required().min(2),
  accountName: Joi.string().required().min(2),
  countryCode: Joi.string().required(),
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
  email: Joi.string().email({ minDomainSegments: 2 }).optional().allow(""),
});
const startDate = Joi.string();
const endDate = Joi.string()

const dashboardSchema = Joi.object({
  type: Joi.string().required().valid('date', 'weekly', 'monthly', 'yearly'),
  startDate: Joi.when('type', {
    is: 'yearly',
    then: startDate.forbidden(),
    otherwise: startDate.required()
  }),
  endDate: Joi.when('type', {
    is: 'yearly',
    then: endDate.forbidden(),
    otherwise: endDate.required()
  })
}).custom((value, helpers) => {
  // Check if startDate is less than endDate
  if (value.startDate && value.endDate && new Date(value.startDate) >= new Date(value.endDate)) {
    return helpers.error('startDate.less'); // Trigger a validation error
  }
  return value; // Return the validated value if no error
}).messages({
  'startDate.less': 'Start date must be less than end date.' // Custom message for date comparison error
});

const setTime_outSchema = Joi.object({
  orderId: Joi.string()
    .min(24)
    .required()
    .messages({
      "string.min": messages("en").invalidMongoId.replace("{{key}}", "orderId"),
    }),
  hours: Joi.number().required(),
  minutes: Joi.number().required()
});


const generateInvoiceSchema = Joi.object({
  orderId: Joi.string()
    .min(24)
    .required()
    .messages({
      "string.min": messages("en").invalidMongoId.replace("{{key}}", "orderId"),
    }),
  transactionId: Joi.string().required(),
  paymentMethod: Joi.string().required(),
  note: Joi.string().optional().allow('', null)
});

const saveCardSchema = Joi.object({
  cardNumber: Joi.number().required(),
  expiryMonth: Joi.number().required(),
  expiryYear: Joi.number().required(),
  cvv: Joi.number().required(),
  cardHolderName: Joi.string().required(),
  addressLine1: Joi.string().optional().allow(''),
  addressLine2: Joi.string().optional().allow(''),
  city: Joi.string().required(),
  state: Joi.string().required(),
  postalCode: Joi.string().optional().allow(''),
  country: Joi.string().required()
});
const createCustomerchema = Joi.object({
  amount: Joi.number().required(),
  payment_method: Joi.string().required(),
  description: Joi.string().optional().allow(''),
  name: Joi.string().required(),
  email: Joi.string().optional(),
  phoneNumber: Joi.string().required(),
  orderId: Joi.string().required()
});

const uploadImageSchema = Joi.object({
  type: Joi.string().required().valid('Vehicles_company', 'Renting_company', 'Users', 'Equipments', 'Vehicles', 'Chat', 'Category', 'Sub-category', 'Sub-sub-category', 'Delivery-size-type', 'Notifications', 'Query'),
});

const raise_querySchema = Joi.object({
  orderId: Joi.string()
    .min(24)
    .required()
    .messages({
      "string.min": messages("en").invalidMongoId.replace("{{key}}", "orderId"),
    }),
  title: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.string().optional().allow('')
});


export {
  signUpSchema,
  loginSchema,
  detailsInfoSchema,
  forgotSchema1,
  changePasswordSchema,
  updateProfileSchema,
  updateNotificationSchema,
  addBankDetailsSchema,
  dashboardSchema,
  setTime_outSchema,
  generateInvoiceSchema,
  sendOtpSchema,
  verifyOtpSchema,
  saveCardSchema,
  createCustomerchema,
  uploadImageSchema,
  delete_certificateSchema,
  raise_querySchema
};
