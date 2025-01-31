import { messages } from "@Custom_message";
import bookingModel from "@models/booking";
import chat_messageModal from "@models/chat_message";
import delivery_vehicleModel from "@models/delivery_vehicle";
import equipmentModel from "@models/equipment";
import order_installmentModal from "@models/order_installment";
import rating_reviewsModal from "@models/rating_review";
import user_renter_delivery_Model from "@models/user";
import { CustomError } from "@utils/errors";
import { generateOtp, identityGenerator } from "@utils/helpers";
import { sendNotificationToSpecificDevice } from "@utils/notification";
import { StatusCodes } from "http-status-codes";
import moment from "moment-timezone";
import mongoose, { Types } from "mongoose";

/***
 * Add Booking Installment And Downpayment
 */
const create_installments = async (body: any) => {
  try {
    const installment_obj = {
      userId: body.userId,
      companyProviderId: body.companyProviderId,
      orderId: body.orderId,
      uniqueId: identityGenerator('installment', 1),
      totalAmount: body.totalAmount,
      paidAmount: body.paidAmount,
      paymentStatus: 'unpaid',
      confirmBookingStatus: false,
      type: "down_payment",  //(Note : Now down_payment is the first installment)
      date: moment().tz(body.timezone).format('YYYY-MM-DD'),
      time: moment().tz(body.timezone).format('HH:mm'),
    }
    await order_installmentModal.create(installment_obj);
    if (body.isPriceBreaking === true) {
      const priceBreaking_details = body.priceBreaking_details;
      const add_parrallel = priceBreaking_details.forEach(async (item: any) => {
        installment_obj.type = "installment"
        installment_obj.paidAmount = item.amount
        installment_obj.paymentStatus = 'unpaid'
        installment_obj.date = item.paymentDate
        installment_obj.time = item.paymentTime
        return await order_installmentModal.create(installment_obj);
      });
      const data = await Promise.all(add_parrallel);
      return data;
    }
    return {};
  } catch (err) {
    return err;
  }
}

function create_booking(body: any, userId: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { language = "en", timezone = 'Asia/Calcutta' } = headers;
      const { order_endDate, order_endTime, order_startDate, order_startTime, type, totalAmount } = body;
      const message = messages(language);
      let userLocation: any = {};
      const order_startTimeString = `${order_startDate}T${order_startTime}:00`; // Adding seconds as 00
      const order_startdateObject = new Date(order_startTimeString);
      const order_endTimeString = `${order_endDate}T${order_endTime}:00`; // Adding seconds as 00
      const order_enddateObject = new Date(order_endTimeString);
      const currentDate = moment().tz(timezone).format("YYYY-MM-DD");
      const currentTime = moment().tz(timezone).format("HH:mm");
      const count = await bookingModel.countDocuments();
      const userDetails = await user_renter_delivery_Model.findOne(
        { _id: userId, isDelete: false },
        {
          address: 1,
          addressLine1: 1,
          addressLine2: 1,
          long: 1,
          lat: 1,
          zipcode: 1,
          country: 1,
          state: 1,
          city: 1,
        }
      );
      if (userDetails) {
        userLocation = {
          ...userLocation,
          address: userDetails.address,
          addressLine1: userDetails.addressLine1
            ? userDetails.addressLine1
            : "",
          addressLine2: userDetails.addressLine2
            ? userDetails.addressLine2
            : "",
          location: {
            type: "Point",
            coordinates: [userDetails.long, userDetails.lat],
          },
          country: userDetails.country,
          zipcode: userDetails.zipcode ? userDetails.zipcode : "",
          state: userDetails.state,
          city: userDetails.city,
        };
      } else {
        reject(
          new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );
      }
      const obj = {
        ...body,
        userId: userId,
        orderId: identityGenerator("order", count),
        bookingStatus_withReason: [
          {
            date: currentDate,
            time: currentTime,
          },
        ],
        paymentStatus: "unpaid",
        bookingDate: currentDate,
        bookingTime: currentTime,
        userLocation: userLocation,
        order_startTimeStamp: order_startdateObject.getTime(),
        order_endTimeStamp: order_enddateObject.getTime(),
        tempHeaders: language, // Include the language in the object
      };
      if (type === 'vehicle') {
        // obj['vehicleDetails.technicalSpecification.no_ofCylinder'] = total_cylinders
        const vehicleDetails = await delivery_vehicleModel.findById(body.vehicleId, { vehicleCommission: 1 })
        const admin_commission_percentage = vehicleDetails ? vehicleDetails.vehicleCommission : 0
        obj.admin_commission_percentage = admin_commission_percentage
        obj.vehicleDetails.technicalSpecification.no_ofCylinder = body.vehicleDetails.technicalSpecification.total_cylinders
        const admin_amount = totalAmount * admin_commission_percentage / 100
        const vendor_amount = totalAmount - admin_amount
        obj.admin_commission_amount = admin_amount
        obj.vendor_amount = vendor_amount
      } else {
        const equipmentDetails = await equipmentModel.findById(body.equipmentId, { equipmentCommission: 1 })
        const admin_commission_percentage = equipmentDetails ? equipmentDetails.equipmentCommission : 0
        obj.admin_commission_percentage = admin_commission_percentage
        const admin_amount = totalAmount * admin_commission_percentage / 100
        const vendor_amount = totalAmount - admin_amount
        obj.admin_commission_amount = admin_amount
        obj.vendor_amount = vendor_amount
      }
      const create_booking = await bookingModel.create(obj);
      if (create_booking) {
        if (type === 'vehicle' && body.with_equipment == true && body.equipmentOrderId && body.equipmentOrderId != '') {
          await bookingModel.updateOne({ _id: body.equipmentOrderId }, { 'equipmentDetails.vehicleOrderId': create_booking._id, 'equipmentDetails.vehicleAvailable': true })
        }
        let obj_installment = {
          userId: userId,
          companyProviderId: body.companyProviderId,
          orderId: create_booking._id,
          totalAmount: body.totalAmount,
          paidAmount: body.paidAmount,
          isPriceBreaking: body.isPriceBreaking,
          priceBreaking_details: body.priceBreaking_details,
          timezone: timezone
        }
        await create_installments(obj_installment);
      }
      resolve(create_booking);
    } catch (err) {
      reject(err);
    }
  });
}


function updateBooking(body: any, params: any, userId: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { language = "en", timezone = 'Asia/Calcutta' } = headers;
      const { order_endDate, order_endTime, order_startDate, order_startTime } =
        body;
      const message = messages(language);
      const create_booking = await bookingModel.updateOne(
        { _id: params.id },
        body
      );
      resolve(create_booking);
    } catch (err) {
      reject(err);
    }
  });
}

function bookingDetails(params: any, userId: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { language = 'en' } = headers;
      const bookingDetails = await bookingModel.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            _id: new mongoose.Types.ObjectId(params.id),
            isDelete: false
          }
        },
        {
          $lookup: {
            foreignField: "_id",
            localField: "companyProviderId",
            as: "companyDetails",
            from: "user_renter_deliveries",
            pipeline: [
              {
                $project: {
                  name: 1,
                  company_description: 1,
                  image: 1
                }
              }
            ]
          }
        },
        {
          $unwind: {
            path: "$companyDetails",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "bookings",  // Referencing the same collection
            localField: "vehicleDetails.equipmentOrderId", // Field from the current document
            foreignField: "_id", // Field from the documents in the same collection to join with
            as: "equipmentOrder_Details",
            pipeline: [
              {
                $lookup: {
                  foreignField: "equipmentId",
                  localField: "equipmentId",
                  as: 'equipment_mediaDetails1',
                  from: "equipment_medias",
                  pipeline: [
                    {
                      $match: { isDelete: false, media_type: "image" }
                    },
                    {
                      $project: { media_type: 1, equipment_imageUrl: 1 }
                    },
                    {
                      $limit: 1
                    }
                  ]
                }
              },
              {
                $unwind: {
                  path: "$equipment_mediaDetails1",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $addFields: {
                  "equipmentDetails.equipmentImage": "$equipment_mediaDetails1.equipment_imageUrl"
                }
              },
              {
                $lookup: {
                  foreignField: "companyProviderId",
                  localField: "companyProviderId",
                  as: "equipment_companyratingDetails",
                  from: "rating_reviews",
                  pipeline: [
                    {
                      $group: {
                        _id: '$companyProviderId',
                        averageRating: { $avg: "$rating" }
                      }
                    }
                  ]
                }
              },
              {
                $unwind: {
                  path: "$equipment_companyratingDetails",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $project: { equipmentDetails: 1, equipment_companyratingDetails: 1 }
              }
            ]
          }
        },
        {
          $lookup: {
            from: "rating_reviews",  // Referencing the same collection
            localField: "_id", // Field from the current document
            foreignField: "orderId", // Field from the documents in the same collection to join with
            as: "rating_reviewDetails",
            pipeline: [
              {
                $addFields: {
                  review: {
                    $cond: {
                      if: { $eq: [language, 'ar'] },
                      then: '$ar_review',
                      else: '$review'
                    }
                  }
                }
              },
              {
                $project: { rating: 1, review: 1 }
              }
            ]
          }
        },
        {
          $lookup: {
            foreignField: "orderId",
            localField: "_id",
            as: "installmentDetails",
            from: "order_installments",
            pipeline: [
              {
                $match: { confirmBookingStatus: true, isDelete: false, paymentStatus: "unpaid", type: 'installment' }
              },
              {
                $sort: { date: 1 }
              },
              {
                $project: {
                  type: 1,
                  date: 1,
                  time: 1,
                  confirmBookingStatus: 1,
                  totalAmount: 1,
                  paidAmount: 1,
                  orderId: 1,
                  paymentStatus: 1
                }
              }
            ]
          }
        },
        {
          $lookup: {
            foreignField: "equipmentId",
            localField: "equipmentId",
            as: 'equipment_mediaDetails',
            from: "equipment_medias",
            pipeline: [
              {
                $facet: {
                  equipmentImage: [
                    {
                      $match: { isDelete: false, media_type: "image" }
                    },
                    {
                      $project: { media_type: 1, equipment_imageUrl: 1 }
                    },
                    {
                      $limit: 1
                    }
                  ],
                  equipmentAll_medias: [
                    {
                      $match: { isDelete: false, media_type: { $in: ['image', 'video'] } }
                    },
                    {
                      $project: { media_type: 1, equipment_imageUrl: 1, equipment_videoUrl: 1 }
                    },
                  ]
                }
              }
            ]
          }
        },
        {
          $unwind: {
            path: "$equipment_mediaDetails",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            foreignField: "vehicleId",
            localField: "vehicleId",
            as: 'vehicle_mediaDetails',
            from: "vehicle_medias",
            pipeline: [
              {
                $facet: {
                  vehilceImage: [
                    {
                      $match: { isDelete: false, media_type: "image" }
                    },
                    {
                      $project: { media_type: 1, vehicle_imageUrl: 1 }
                    },
                    {
                      $limit: 1
                    }
                  ],
                  vehicleAll_medias: [
                    {
                      $match: { isDelete: false, media_type: { $in: ['image', 'video'] } }
                    },
                    {
                      $project: { media_type: 1, vehicle_imageUrl: 1, vehicle_videoUrl: 1 }
                    },
                  ]
                }
              }
            ]
          }
        },
        {
          $unwind: {
            path: "$vehicle_mediaDetails",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            localField: "equipmentId",
            foreignField: "equipmentId",
            as: "fav_equipment",
            from: "fav_equipments_vehicles",
            pipeline: [
              {
                $match: { userId: new mongoose.Types.ObjectId(userId), type: "equipment", status: true }
              }
            ]
          }
        },
        {
          $lookup: {
            localField: "vehicleId",
            foreignField: "vehicleId",
            as: "fav_vehicle",
            from: "fav_equipments_vehicles",
            pipeline: [
              {
                $match: { userId: new mongoose.Types.ObjectId(userId), type: "vehicle", status: true }
              }
            ]
          }
        },
        {
          $lookup: {
            localField: "equipmentId",
            foreignField: "_id",
            as: "equipment_Details",
            from: "equipment",
            pipeline: [
              {
                $lookup: {
                  foreignField: "companyProviderId",
                  localField: "companyProviderId",
                  as: "equipment_companyratingDetails",
                  from: "rating_reviews",
                  pipeline: [
                    {
                      $group: {
                        _id: '$companyProviderId',
                        averageRating: { $avg: "$rating" }
                      }
                    }
                  ]
                }
              },
              {
                $unwind: {
                  path: "$equipment_companyratingDetails",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $project: {
                  equipment_companyratingDetails: 1
                }
              }
            ]
          }
        },
        {
          $unwind: {
            path: "$equipment_Details",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            localField: "vehicleId",
            foreignField: "_id",
            as: "vehicle_Details",
            from: "delivery_vehicles",
            pipeline: [
              {
                $lookup: {
                  foreignField: "companyProviderId",
                  localField: "company_deliveryId",
                  as: "vehicle_companyratingDetails",
                  from: "rating_reviews",
                  pipeline: [
                    {
                      $group: {
                        _id: '$companyProviderId',
                        averageRating: { $avg: "$rating" }
                      }
                    }
                  ]
                }
              },
              {
                $unwind: {
                  path: "$vehicle_companyratingDetails",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $project: {
                  vehicle_companyratingDetails: 1
                }
              }
            ]
          }
        },
        {
          $unwind: {
            path: "$vehicle_Details",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            foreignField: "orderId",
            localField: "_id",
            as: "un_read_chat_messages",
            from: "chat_messages",
            pipeline: [
              {
                $match: { readStatus: false, sendFrom: 'company', isDelete: false }
              },
              {
                $count: "totalCount"
              }
            ]
          }
        },
        {
          $addFields: {
            'companyName': "$companyDetails.name",
            'company_description': "$companyDetails.company_description",
            'companyImage': "$companyDetails.image",
            "equipmentDetails.equipmentName": {
              $cond: {
                if: { $eq: [language, 'ar'] },
                then: '$equipmentDetails.ar_equipmentName',
                else: '$equipmentDetails.equipmentName'
              }
            },
            "equipmentDetails.equipmentImage": {
              $cond: {
                if: { $eq: [{ $size: "$equipment_mediaDetails.equipmentImage" }, 0] },
                then: {},
                else: { $arrayElemAt: ["$equipment_mediaDetails.equipmentImage.equipment_imageUrl", 0] }
              }
            },
            'equipmentDetails.equipment_mediaDetails': "$equipment_mediaDetails.equipmentAll_medias",
            "vehicleDetails.vehicleImage": {
              $cond: {
                if: { $eq: [{ $size: "$vehicle_mediaDetails.vehilceImage" }, 0] },
                then: {},
                else: { $arrayElemAt: ["$vehicle_mediaDetails.vehilceImage.vehicle_imageUrl", 0] }
              }
            },
            'vehicleDetails.vehicle_mediaDetails': "$vehicle_mediaDetails.vehicleAll_medias",
            // "$vehicle_mediaDetails.equipment_imageUrl",
            // "vehicleDetails.vehicleImage": "$vehicle_mediaDetails.vehicle_imageUrl",
            "vehicleDetails.vehicleType": {
              $cond: {
                if: { $eq: [language, 'ar'] },
                then: '$vehicleDetails.ar_vehicleType',
                else: '$vehicleDetails.vehicleType'
              }
            },
            "vehicleDetails.vehicleSize": {
              $cond: {
                if: { $eq: [language, 'ar'] },
                then: '$vehicleDetails.ar_vehicleSize',
                else: '$vehicleDetails.vehicleSize'
              }
            },
            "equipmentDetails.company_rating": { $ifNull: ['$equipment_Details.equipment_companyratingDetails.averageRating', 0] },
            "vehicleDetails.company_rating": { $ifNull: ['$vehicle_Details_companyratingDetails.averageRating', 0] },
            "equipmentDetails.fav_equipment": {
              $cond: {
                if: { $eq: ['$fav_equipment', []] },
                then: false,
                else: true
              }
            },
            "equipmentDetails.technicalSpecification": {
              $map: {
                input: "$equipmentDetails.technicalSpecification",
                as: "spec",
                in: {
                  key: {
                    $cond: {
                      if: { $eq: [language, "ar"] }, // Compare language field in the document
                      then: "$$spec.ar_key",
                      else: "$$spec.key"
                    }
                  },
                  value: {
                    $cond: {
                      if: { $eq: [language, "ar"] },
                      then: "$$spec.ar_value",
                      else: "$$spec.value"
                    }
                  }
                }
              }
            },
            "vehicleDetails.fav_vehicle": {
              $cond: {
                if: { $eq: ['$fav_vehicle', []] },
                then: false,
                else: true
              }
            },
            "vehicleDetails.equipmentOrder_Details": {
              $cond: {
                if: { $eq: [{ $size: "$equipmentOrder_Details" }, 0] },
                then: {},
                else: { $arrayElemAt: ["$equipmentOrder_Details", 0] }
              }
            },
            "vehicleDetails.technicalSpecification": {
              $map: {
                input: "$vehicleDetails.technicalSpecification",
                as: "spec",
                in: {
                  key: {
                    $cond: {
                      if: { $eq: [language, "ar"] }, // Compare language field in the document
                      then: "$$spec.ar_key",
                      else: "$$spec.key"
                    }
                  },
                  value: {
                    $cond: {
                      if: { $eq: [language, "ar"] },
                      then: "$$spec.ar_value",
                      else: "$$spec.value"
                    }
                  }
                }
              }
            },
            rating_reviewDetails: {
              $cond: {
                if: { $eq: [{ $size: "$rating_reviewDetails" }, 0] },
                then: {},
                else: { $arrayElemAt: ["$rating_reviewDetails", 0] }
              }
            },
            isPending_installments: {
              $cond: {
                if: { $eq: [{ $size: "$installmentDetails" }, 0] },
                then: false,
                else: true
              }
            },
            un_read_chat_messages: {
              $cond: {
                if: { $eq: [{ $size: "$un_read_chat_messages" }, 0] },
                then: 0,
                else: { $arrayElemAt: ["$un_read_chat_messages.totalCount", 0] }
              }
            },
          }
        },
        {
          $project: {
            userLocation: 0,
            priceBreaking_details: 0,
            vehicle_mediaDetails: 0,
            equipment_mediaDetails: 0,
            equipment_Details: 0,
            vehicle_Details: 0,
            fav_equipment: 0,
            fav_vehicle: 0,
            companyDetails: 0,
            'equipmentDetails.ar_equipmentName': 0,
            'vehicleDetails.ar_vehicleSize': 0,
            'vehicleDetails.ar_vehicleType': 0,
            'equipmentDetails.technicalSpecification.ar_engineMake': 0,
            'equipmentDetails.technicalSpecification.ar_engineModel': 0
          }
        }
      ]);
      resolve(bookingDetails.length ? bookingDetails[0] : {});
    } catch (err) {
      reject(err);
    }
  });
}

function bookingList(query: any, userId: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { page = 1, perPage = 10, search, status } = query;
      const { language = 'en', timezone = 'Asia/Calcutta' } = headers;
      let obj: any = {
        userId: new Types.ObjectId(userId),
        isDelete: false,
        paymentStatus: { $ne: 'unpaid' },
        bookingStatus: { $in: ['Pending', 'Confirmed', 'Going to pickup', 'Reached on equipment location', 'Picked', 'On the way', 'Reached', 'Delivered'] }
      };
      if (search) {
        obj = {
          ...obj,
          orderId: { $regex: search, $options: "i" },
        };
      }
      if (status) {
        obj = {
          ...obj,
          bookingStatus: status,
        };
      }
      console.log(obj, "obj")
      const [bookingList, count] = await Promise.all([
        bookingModel.aggregate([
          {
            $match: obj,
          },
          {
            $lookup: {
              foreignField: "_id",
              localField: "companyProviderId",
              as: 'companyDetails',
              from: "user_renter_deliveries",
              pipeline: [
                {
                  $project: { name: 1, image: 1 }
                }
              ]
            }
          },
          {
            $unwind: {
              path: "$companyDetails",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              foreignField: "orderId",
              localField: "_id",
              as: 'installmentDetails',
              from: "order_installments",
              pipeline: [
                {
                  $match: {
                    isDelete: false, type: "installment", paymentStatus: "unpaid",
                    //  date: { $lte: moment().tz(timezone).format('YYYY-MM-DD') } 
                  }
                },
                {
                  $project: { totalAmount: 1, paidAmount: 1, paymentStatus: 1, type: 1, date: 1, time: 1, orderId: 1 }
                },
                {
                  $sort: { date: 1 }
                }
              ]
            }
          },
          {
            $lookup: {
              foreignField: "equipmentId",
              localField: "equipmentId",
              as: 'equipment_mediaDetails',
              from: "equipment_medias",
              pipeline: [
                {
                  $match: { isDelete: false, media_type: "image" }
                },
                {
                  $project: { media_type: 1, equipment_imageUrl: 1 }
                },
                {
                  $limit: 1
                }
              ]
            }
          },
          {
            $unwind: {
              path: "$equipment_mediaDetails",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              foreignField: "vehicleId",
              localField: "vehicleId",
              as: 'vehicle_mediaDetails',
              from: "vehicle_medias",
              pipeline: [
                {
                  $match: { isDelete: false, media_type: "image" }
                },
                {
                  $project: { media_type: 1, vehicle_imageUrl: 1 }
                },
                {
                  $limit: 1
                }
              ]
            }
          },
          {
            $unwind: {
              path: "$vehicle_mediaDetails",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              foreignField: "orderId",
              localField: "_id",
              as: "un_read_chat_messages",
              from: "chat_messages",
              pipeline: [
                {
                  $match: { readStatus: false, sendFrom: 'company', isDelete: false }
                },
                {
                  $count: "totalCount"
                }
              ]
            }
          },
          {
            $addFields: {
              un_read_chat_messages: {
                $cond: {
                  if: { $eq: [{ $size: "$un_read_chat_messages" }, 0] },
                  then: 0,
                  else: { $arrayElemAt: ["$un_read_chat_messages.totalCount", 0] }
                }
              }
            }
          },
          {
            $addFields: {
              "equipmentDetails.equipmentName": {
                $cond: {
                  if: { $eq: [language, 'ar'] },
                  then: '$equipmentDetails.ar_equipmentName',
                  else: '$equipmentDetails.equipmentName'
                }
              },
              "equipmentDetails.equipmentImage": '$equipment_mediaDetails.equipment_imageUrl',
              "vehicleDetails.vehicleImage": '$vehicle_mediaDetails.vehicle_imageUrl',
              "vehicleDetails.vehicleType": {
                $cond: {
                  if: { $eq: [language, 'ar'] },
                  then: '$vehicleDetails.ar_vehicleType',
                  else: '$vehicleDetails.vehicleType'
                }
              },
              "vehicleDetails.vehicleSize": {
                $cond: {
                  if: { $eq: [language, 'ar'] },
                  then: '$vehicleDetails.ar_vehicleSize',
                  else: '$vehicleDetails.vehicleSize'
                }
              },
              isPending_installments: {
                $cond: {
                  if: { $eq: [{ $size: "$installmentDetails" }, 0] },
                  then: false,
                  else: true
                }
              }
            },
          },
          {
            $project: { userLocation: 0, equipment_mediaDetails: 0, vehicle_mediaDetails: 0 }
          },
          { $sort: { createdAt: -1 } },
          {
            $skip: Number(page * perPage) - Number(perPage),
          },
          {
            $limit: Number(perPage),
          },
        ]),
        bookingModel.aggregate([
          {
            $match: obj,
          },
          {
            $count: "totalCount",
          },
        ]),
      ]);
      resolve({
        itemList: bookingList,
        totalCount: count.length ? count[0].totalCount : 0,
      });
    } catch (err) {
      reject(err);
    }
  });
}

/***
 * Cancel booking by user
 */

function cancelBooking(
  body: any,
  params: any,
  userId: any,
  headers: any
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { language = 'en', timezone = "Asia/Calcutta" } = headers;
      const message = messages(language);
      const bookingDetails = await bookingModel.findOne({ _id: params.id });
      if (bookingDetails) {
        if (bookingDetails.bookingStatus == "Cancelled") {
          reject(
            new CustomError(
              message.alreadyTakenAction.replace("{{action}}", "canceled"),
              StatusCodes.BAD_REQUEST
            )
          );
        } else {
          let bookingStatus = {
            reason: body.reason,
            status: "Cancelled",
            actionBy: "user",
            date: moment().tz(timezone).format("YYYY-MM-DD"),
            time: moment().tz(timezone).format("HH:mm"),
          };
          await bookingModel.updateOne(
            { _id: params.id },
            {
              bookingStatus: "Cancelled",
              $addToSet: { bookingStatus_withReason: bookingStatus },
            }
          );
          resolve({ success: true });
        }
      } else {
        reject(
          new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );
      }
    } catch (err) {
      reject(err);
    }
  });
}

/***
 * Update order status
 */

function update_orderStatus(userId: any, orderId: any, body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { language = 'en', timezone = "Asia/Calcutta" } = headers;
      const message = messages(language);
      const { actionBy, status, reason, otp, ar_reason } = body;
      const bookingDetails: any = await bookingModel.findOne({ _id: orderId });
      if (bookingDetails) {
        if (body.status == "Cancelled") {
          if (bookingDetails.bookingStatus == "Cancelled") {
            reject(
              new CustomError(
                message.alreadyTakenAction.replace("{{action}}", "cancelled"),
                StatusCodes.BAD_REQUEST
              )
            );
          } else {
            let bookingStatus = {
              reason: reason,
              status: "Cancelled",
              actionBy: actionBy,
              date: moment().tz(timezone).format("YYYY-MM-DD"),
              time: moment().tz(timezone).format("HH:mm"),
            };
            await bookingModel.updateOne(
              { _id: orderId },
              {
                bookingStatus: "Cancelled",
                cancelReason: reason,
                ar_cancelReason: ar_reason,
                $addToSet: { bookingStatus_withReason: bookingStatus },
              }
            );
            await chat_messageModal.updateMany({ orderId: orderId, readStatus: false }, { readStatus: true })
            const notificationObj = {
              userId: bookingDetails.userId,
              bookingStatus: body.status,
              orderId: bookingDetails.orderId,
              language: language,
              role: "user"
            }
            sendNotificationToSpecificDevice(notificationObj)
            resolve({ success: true });
          }
        } else {
          if (bookingDetails.bookingStatus == status) {
            reject(
              new CustomError(
                message.alreadyTakenAction_thisBooking.replace("{{action}}", status),
                StatusCodes.BAD_REQUEST
              )
            );
          } else {
            let update_obj: any = {
              bookingStatus: status
            }
            if (status == 'Confirmed') {
              await order_installmentModal.updateMany({ orderId: orderId, type: 'installment' }, { confirmBookingStatus: true })
              update_obj.user_receive_orderOtp = generateOtp()
              if (bookingDetails.vehicleDetails.with_equipment == true) {
                const equipmentReceiveOrder_otp = generateOtp()
                await bookingModel.updateOne({ _id: bookingDetails.vehicleDetails.equipmentOrderId }, { 'equipmentDetails.equipmentReceiveOrder_otp': equipmentReceiveOrder_otp });
              }
            }

            let bookingStatus = {
              status: status,
              actionBy: actionBy,
              date: moment().tz(timezone).format("YYYY-MM-DD"),
              time: moment().tz(timezone).format("HH:mm"),
            };
            await bookingModel.updateOne(
              { _id: orderId },
              {
                $set: update_obj,
                $addToSet: { bookingStatus_withReason: bookingStatus },
              }
            );
            const notificationObj = {
              userId: bookingDetails.userId,
              bookingStatus: body.status,
              orderId: bookingDetails.orderId,
              language: language,
              role: "user"
            }
            sendNotificationToSpecificDevice(notificationObj)
            resolve({ success: true });
          }
        }
      } else {
        reject(
          new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );
      }
    } catch (err) {
      reject(err);
    }
  });
}

function rating_reviews_on_order(userId: any, orderId: any, body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { language = 'en' } = headers;
      const message = messages(language);
      body.userId = userId;
      body.orderId = orderId;
      const check_rating = await rating_reviewsModal.findOne({ userId: userId, orderId: orderId });
      if (check_rating) {
        reject(new CustomError(message.already_give_rating, StatusCodes.BAD_REQUEST));
      } else {
        const add = await rating_reviewsModal.create(body);
        if (add) {
          await bookingModel.findOneAndUpdate({ _id: orderId }, { isRating: true });
          resolve(add);
        } else {
          reject(new CustomError(message.somethingwrong, StatusCodes.BAD_REQUEST));
        }
      }
    } catch (err) {
      reject(err)
    }
  });
}

function booked_equipmentList(userId: any, query: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { language = 'en' } = headers;
      const { page = 1, perPage = 10, search } = query;
      let cond = {
        isDelete: false,
        userId: new mongoose.Types.ObjectId(userId),
        paymentStatus: "paid",
        type: 'equipment',
        'vehicleDetails.with_equipment': false,
        'equipmentDetails.deliveryIncluded': false,
        'equipmentDetails.vehicleAvailable': false, // A vehicle booked for this equipment or not .
        bookingStatus: { $nin: ['Cancelled', 'Completed'] }
      }
      if (search) {
        cond = {
          ...cond,
          [language == 'ar' ? 'equipmentDetails.ar_equipmentName' : "equipmentDetails.equipmentName"]: { $regex: search, $options: 'i' }
        }
      }
      const [list] = await Promise.all([bookingModel.aggregate([
        {
          $match: cond
        },
        {
          $lookup: {
            foreignField: "_id",
            localField: "companyProviderId",
            from: "user_renter_deliveries",
            as: "companyDetails",
            pipeline: [
              {
                $project: {
                  name: 1,
                  image: 1
                }
              }
            ]
          }
        },
        {
          $addFields: {
            companyDetails: {
              $cond: {
                if: { $eq: [{ $size: '$companyDetails' }, 0] },
                then: {},
                else: { $arrayElemAt: ["$companyDetails", 0] }
              }
            }
          }
        },
        {
          $lookup: {
            foreignField: "equipmentId",
            localField: "equipmentId",
            from: "equipment_medias",
            as: "equipemntMedias",
            pipeline: [
              {
                $match: {
                  isDelete: false,
                  media_type: "image"
                }
              },
              {
                $limit: 1
              }
            ]
          }
        },
        {
          $addFields: {
            equipmentImage: {
              $cond: {
                if: { $eq: [{ $size: '$equipemntMedias' }, 0] },
                then: '',
                else: { $arrayElemAt: ["$equipemntMedias.equipment_imageUrl", 0] }
              }
            }
          }
        },
        {
          $addFields: {
            'equipmentDetails.equipmentName': {
              $cond: {
                if: { $eq: [language, 'ar'] },
                then: '$equipmentDetails.ar_equipmentName',
                else: '$equipmentDetails.equipmentName'
              }
            }
          }
        },
        {
          $addFields: {
            equipmentName: '$equipmentDetails.equipmentName'
          }
        },
        {
          $addFields: {
            equipmentLocation: '$equipmentDetails.equipmentLocation'
          }
        },
        {
          $project: {
            equipmentName: 1,
            chosen_equipment: 1,
            equipmentImage: 1,
            equipmentLocation: 1,
            companyDetails: 1,
            delivery_addressDetails: 1,
            pickup_addressDetails: 1
          }
        },
        {
          $sort: { createdAt: -1 },
        }
        // {
        //   $skip: Number(page * perPage) - Number(perPage)
        // },
        // {
        //   $limit: Number(perPage)
        // }
      ])
        // ,
        // bookingModel.aggregate([
        //   {
        //     $match: cond
        //   },
        //   {
        //     $count: "totalAmount"
        //   }
        // ])
      ]);
      resolve({ itemList: list });
    } catch (err) {
      reject(err)
    }
  });
}

function order_price_calculation(userId: any, body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { timezone = 'Asia/Calcutta' } = headers;
      const minimum_Installment_Amount: any = process.env.Minimum_Installment_Amount
      let { bookingType, bookingDays, isPriceBreaking = false, total_booked_equipment_vehicle,
        tax, outSide_theCity = false, perDay_price, perWeek_price, perMonth_price,
        three_month_price, six_month_price, perYear_price, perKm_price,
        repeatedDelivery = false, repeatedDelivery_fixedCost, total_repeatedDelivery,
        priceBreaking_details, perDay_km_limit = 30, distance, paymentCount } = body;
      let totalAmount: number = 0
      let totalAmount_withTax: number = 0
      let taxAmount: number = 0

      if (bookingType == 'equipment') {
        const price = calculateRentalPrice(bookingDays, total_booked_equipment_vehicle, perDay_price, perWeek_price, perMonth_price, three_month_price, six_month_price, perYear_price);
        totalAmount = Number(price)
        taxAmount = totalAmount * Number(tax) / 100
        totalAmount_withTax = totalAmount + taxAmount
      }

      if (bookingType == 'vehicle') {
        if (outSide_theCity === true && repeatedDelivery == false) {
          totalAmount = Number(perKm_price) * Number(total_booked_equipment_vehicle)
          totalAmount = totalAmount * (Number(bookingDays) * Number(perDay_km_limit))
          taxAmount = totalAmount * Number(tax) / 100
          totalAmount_withTax = totalAmount + taxAmount
        } else if (repeatedDelivery === true) {
          if (outSide_theCity === true) {
            totalAmount = Number(perKm_price) * Number(total_repeatedDelivery)
            totalAmount = totalAmount * Number(total_booked_equipment_vehicle) * (Number(bookingDays) * Number(perDay_km_limit))
            taxAmount = totalAmount * Number(tax) / 100
            totalAmount_withTax = totalAmount + taxAmount
          } else {
            totalAmount = Number(repeatedDelivery_fixedCost) * Number(total_repeatedDelivery)
            totalAmount = totalAmount * Number(total_booked_equipment_vehicle)
            taxAmount = totalAmount * Number(tax) / 100
            totalAmount_withTax = totalAmount + taxAmount
          }
        } else {
          totalAmount = Number(perDay_price) * Number(total_booked_equipment_vehicle)
          totalAmount = totalAmount * Number(bookingDays)
          taxAmount = totalAmount * Number(tax) / 100
          totalAmount_withTax = totalAmount + taxAmount
        }
      }

      let remainingAmount: number = 0
      let down_payent: number = 0
      let installment: any = []
      let installment_details: any = []
      if (isPriceBreaking === false) {
        remainingAmount = 0
        down_payent = totalAmount_withTax
      } else {
        let { time, minimumAmount, dueAmountDays } = priceBreaking_details
        let minimumAmount_inAmount: any
        minimumAmount_inAmount = totalAmount_withTax * minimumAmount / 100
        if (minimumAmount_inAmount == totalAmount_withTax || minimumAmount_inAmount <= Number(minimum_Installment_Amount)) {
          down_payent = totalAmount_withTax
          remainingAmount = totalAmount_withTax
          installment = [...installment]
        } else {
          down_payent = minimumAmount_inAmount
          remainingAmount = (Number(totalAmount_withTax) - Number(minimumAmount_inAmount));
          if (remainingAmount / (time - 1) >= Number(minimum_Installment_Amount)) {
            let installment_obj: any = {}
            //Provide installment to user

            for (let i = 0; i < Number(time - 1); i++) {
              installment_obj = {
                amount: parseFloat((remainingAmount / Number(i + 1)).toFixed(2)),
                paymentCount: i + 1
              }
              installment = [...installment, { ...installment_obj }]
            }

            // Toatal installment pay by User
            if (paymentCount && paymentCount > 0) {
              installment_details = [
                {
                  type: 'down_payment', //(Note : Now down_payment is the first installment)
                  paidAmount: minimumAmount_inAmount,
                  paymentStatus: "unpaid",
                  date: moment().tz(timezone).format('YYYY-MM-DD'),
                  time: moment().tz(timezone).format('HH:mm')
                }
              ]
              let installment_details_obj: any = {}
              for (let i = 0; i < Number(paymentCount - 1); i++) {
                const date = installment_details[i].date
                installment_details_obj = {
                  ...installment_details_obj,
                  type: 'installment',
                  paidAmount: parseFloat((remainingAmount / Number(paymentCount - 1)).toFixed(2)),
                  paymentStatus: 'unpaid',
                  date: moment(date).tz(timezone).add(Number(dueAmountDays), 'days').format('YYYY-MM-DD'),
                  time: moment().tz(timezone).format('HH:mm')
                }
                installment_details = [...installment_details, { ...installment_details_obj }]
              }
            }
          } else {
            down_payent = totalAmount_withTax
            remainingAmount = totalAmount_withTax
          }
        }
      }
      resolve({
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        tax: tax,
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        totalAmount_withTax: parseFloat(totalAmount_withTax.toFixed(2)),
        down_payent: parseFloat(down_payent.toFixed(2)),
        remainingAmount: parseFloat(remainingAmount.toFixed(2)),
        bookingDays: bookingDays,
        total_booked_equipment_vehicle: total_booked_equipment_vehicle,
        installments: installment,                             //For user App
        installment_details: installment_details              // For user website 
      })
    } catch (err) {
      reject(err)
    }
  });
}
const calculateRentalPrice = (bookingDays: any, total_booked_equipment_vehicle: any, perDay_price: any, perWeek_price: any, perMonth_price: any, per3Month_price: any, per6Month_price: any, perYear_price: any) => {
  let bookingDays_week_month_year = bookingDays
  let totalCost = 0
  if (!perYear_price && perYear_price != 0 && bookingDays >= 365) {
    const years = Math.floor(bookingDays / 365);
    totalCost += years * perYear_price;
    bookingDays %= 365;
  }
  if (per6Month_price && per6Month_price != 0 && bookingDays >= 180) {
    const sixMonths = Math.floor(bookingDays / 180);
    totalCost += sixMonths * per6Month_price;
    bookingDays %= 180;
  }
  if (per3Month_price && per3Month_price != 0 && bookingDays >= 90) {
    const threeMonths = Math.floor(bookingDays / 90);
    totalCost += threeMonths * per3Month_price;
    bookingDays %= 90;
  }
  if (perMonth_price && perMonth_price != 0 && bookingDays >= 30) {
    const months = Math.floor(bookingDays / 30);
    totalCost += months * perMonth_price;
    bookingDays %= 30;
  }
  if (perWeek_price && perWeek_price != 0 && bookingDays >= 7) {
    const weeks = Math.floor(bookingDays / 7);
    totalCost += weeks * perWeek_price;
    bookingDays %= 7;
  }
  if (bookingDays > 0) {
    totalCost += bookingDays * perDay_price;
  }
  return totalCost * total_booked_equipment_vehicle;
}

function order_installments(userId: any, orderId: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const list = await order_installmentModal.find({ orderId: orderId, type: "installment", confirmBookingStatus: true }, { totalAmount: 1, paidAmount: 1, paymentStatus: 1, type: 1, date: 1, time: 1 }).sort({ createdAt: 1 });
      resolve(list)
    } catch (err) {
      reject(err);
    }
  })
}

export default {
  create_booking,
  bookingDetails,
  bookingList,
  cancelBooking,
  updateBooking,
  update_orderStatus,
  rating_reviews_on_order,
  booked_equipmentList,
  order_price_calculation,
  order_installments
} as const;