import { messages } from "@Custom_message";
import { CustomError } from "@utils/errors";
import { StatusCodes } from "http-status-codes";
import { any, boolean } from "joi";
import { Schema, Types, model } from "mongoose";
const pickupAddressSchema = new Schema({
  address: { type: String, default: "" },
  addressLine1: { type: String, default: "" },
  addressLine2: { type: String, default: "" },
  location: {
    type: {
      type: String,
      enum: ["Point"], // 'location.type' must be 'Point'
      default: "Point",
    },
    coordinates: {
      type: [Number], //long, lat
    },
  },
  country: { type: String, default: "" },
  zipcode: { type: String, default: "" },
  state: { type: String, default: "" },
  city: { type: String, default: "" },
});

interface booking {
  orderId: string;
  userId: any;
  userLocation: any;
  type: string; // equipment,vehicle
  companyProviderId: any;
  user_receive_orderOtp: string;
  vehicleId: any;
  equipmentId: any;
  vehicleDetails: any;
  equipmentDetails: any;
  chosen_equipment: number;
  order_startDate: string;
  order_startTime: string;
  order_startTimeStamp: number;
  order_endDate: string;
  order_endTime: string;
  order_endTimeStamp: number;
  pickup_addressDetails: any;
  delivery_addressDetails: any;
  transport_cost: number; //In SAR
  vat_tax: number;
  vat_tax_percentage: number;
  totalAmount: number;
  paidAmount: number; //In SAR (All Tax Included)
  remaining_amount: number;
  isPriceBreaking: boolean;
  priceBreaking_details: any;
  bookingStatus: string; // Pending (default) , Cancelled (By User/Company) , Confirmed (By User/Company) , Accepted (By Company), Completed
  cancelReason: string;
  ar_cancelReason: string;
  equipment_inspectionDetails: any;
  user_equipment_inspectionDetails: any,
  bookingStatus_withReason: any;
  paymentMethod: string;
  paymentStatus: string; // unpaid ,paid 
  full_paymentStatus: boolean;
  admin_commission_percentage: number;
  admin_commission_amount: number;
  vendor_amount: number;
  isRating: boolean;
  paymentDate: string;
  paymentTime: string;
  setTimeOut: Boolean;
  setTimeOut_timeStamp: number;
  bookingDate: string;
  bookingTime: string;
  isActive: boolean;
  isDelete: boolean;
}

const bookingSchema = new Schema<booking>(
  {
    orderId: { type: String },
    userId: { type: Types.ObjectId, ref: "user_renter_delivery" },
    userLocation: {
      address: { type: String, default: "" },
      addressLine1: { type: String, default: "" },
      addressLine2: { type: String, default: "" },
      location: {
        type: {
          type: String,
          enum: ["Point"], // 'location.type' must be 'Point'
          default: "Point",
        },
        coordinates: {
          type: [Number], //long, lat
        },
      },
      country: { type: String, default: "" },
      zipcode: { type: String, default: "" },
      state: { type: String, default: "" },
      city: { type: String, default: "" },
    },
    companyProviderId: { type: Types.ObjectId, ref: "user_renter_delivery" },
    user_receive_orderOtp: { type: String, default: "" },
    type: { type: String }, // equipment,vehicle
    vehicleId: { type: Types.ObjectId, ref: "delivery_vehicle" },
    vehicleDetails: {
      with_equipment: { type: Boolean, default: false },
      equipmentOrderId: { type: Types.ObjectId, ref: 'booking' },
      vehicleType: { type: String },
      ar_vehicleType: { type: String }, //Heavy, Medium and Light
      vehicleSize: { type: String },
      ar_vehicleSize: { type: String },
      loadWeight: { type: String },
      priceOutSide_city_perKm: { type: Number, default: 0 },
      priceInside_city_perDay: { type: Number },
      isPriceBreaking: { type: Boolean, default: false },
      priceBreakupTime: { type: Number, default: 0 },
      repeatingDelivery: { type: Boolean, default: false },
      minimumAmountPay: { type: Number },
      technicalSpecification: []
    },
    equipmentId: { type: Types.ObjectId, ref: "equipment" },
    equipmentDetails: {
      vehicleAvailable: { type: Boolean, default: false },
      vehicleOrderId: { type: String, default: '' },
      equipmentReceiveOrder_otp: { type: String, default: "" },
      equipmentName: { type: String },
      ar_equipmentName: { type: String },
      day_cost: { type: Number, default: 0 },
      isPriceBreaking: { type: Boolean, default: false },
      priceBreakupTime: { type: Number, default: 0 },
      deliveryIncluded: { type: Boolean, default: false },
      technicalSpecification: [],
      equipmentLocation: {
        address: { type: String },
        addressLine1: { type: String, default: "" },
        addressLine2: { type: String, default: "" },
        location: {
          type: {
            type: String,
            enum: ["Point"], // 'location.type' must be 'Point'
            default: "Point",
          },
          coordinates: {
            type: [Number], //long, lat
          },
        },
        country: { type: String },
        zipcode: { type: String },
        state: { type: String },
        city: { type: String },
      },
    },
    chosen_equipment: { type: Number, default: 0 },
    order_startDate: { type: String },
    order_startTime: { type: String },
    order_startTimeStamp: { type: Number, default: 0 },
    order_endDate: { type: String },
    order_endTime: { type: String },
    order_endTimeStamp: { type: Number, default: 0 },
    equipment_inspectionDetails: [],
    user_equipment_inspectionDetails: [],
    pickup_addressDetails: {
      type: pickupAddressSchema,
      default: {},
    },
    delivery_addressDetails: {
      address: { type: String, required: true },
      addressLine1: { type: String, default: "" },
      addressLine2: { type: String, default: "" },
      location: {
        type: {
          type: String,
          enum: ["Point"], // 'location.type' must be 'Point'
          default: "Point",
        },
        coordinates: {
          type: [Number], //long, lat
          default: true,
        },
      },
      country: { type: String, required: true },
      zipcode: { type: String, required: false },
      state: { type: String, required: true },
      city: { type: String, required: true },
    },
    transport_cost: { type: Number, default: 0 }, //In SAR  Equipment/Vehicle
    vat_tax: { type: Number, default: 0 },  // vat tax amount
    vat_tax_percentage: { type: Number, default: 0 },
    admin_commission_percentage: { type: Number, default: 0 },
    admin_commission_amount: { type: Number, default: 0 },
    vendor_amount: { type: Number, default: 0 },
    totalAmount: { type: Number, require: true },
    paidAmount: { type: Number, default: 0 }, //In SAR (All Tax Included)
    remaining_amount: { type: Number, default: 0 },
    isPriceBreaking: { type: Boolean, default: false },
    priceBreaking_details: [
      {
        amount: { type: Number, default: 0 },
        paymentNumber: { type: Number, default: 0 },
        paid: { type: Boolean, default: false },
        paymentDate: { type: String, default: "" },
        paymentTime: { type: String, default: "" },
      },
    ],
    bookingStatus: { type: String, default: "Pending" }, // Equipment status : Pending (default) , Cancelled (By User/Company) , Confirmed (By User/Company), Accepted (By Company),Picked, On the way, Reached, Delivered, Completed
    bookingStatus_withReason: [                          // Transport status : Pending (default) , Cancelled (By User/Company) , Confirmed (By User/Company) , Accepted (By Company), Going to pickup, Reached on equipment location, Picked, On the way, Reached, Delivered, Completed   
      {
        reason: { type: String, default: "" },
        status: { type: String, default: "Pending" },
        actionBy: { type: String, default: "user" }, // user,company
        date: { type: String }, //format "YYYY-MM-DD" Ex: 2024-12-12
        time: { type: String }, // Format "HH:mm" Ex: 13:09
      },
    ],
    paymentMethod: { type: String }, // Credit Card, Debit Card
    paymentStatus: { type: String, default: "unpaid" }, // unpaid ,paid 
    full_paymentStatus: { type: Boolean, default: false },
    isRating: { type: Boolean, default: false },
    paymentDate: { type: String },
    paymentTime: { type: String },
    setTimeOut: { type: Boolean, default: false },
    setTimeOut_timeStamp: { type: Number },
    bookingDate: { type: String },
    bookingTime: { type: String },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

bookingSchema.index({ userId: 1, isDelete: 1, equipmentId: 1 });
bookingSchema.index({ isDelete: 1, equipmentId: 1 });
bookingSchema.index({ isDelete: 1, bookingStatus: 1 });
bookingSchema.index({ userId: 1, isDelete: 1, equipmentId: 1, bookingStatus: 1 })
bookingSchema.index({ userId: 1, isDelete: 1, vehicleId: 1 });
bookingSchema.index({ userId: 1, isDelete: 1, vehicleId: 1, bookingStatus: 1 })

const bookingModel = model<booking>("booking", bookingSchema);
export = bookingModel;
