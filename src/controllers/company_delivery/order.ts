import { messages } from "@Custom_message";
import bookingModel from "@models/booking";
import chat_messageModal from "@models/chat_message";
import order_installmentModal from "@models/order_installment";
import user_renter_delivery_Model from "@models/user";
import { CustomError } from "@utils/errors";
import { generateOtp, verifyOtp } from "@utils/helpers";
import { sendNotificationToSpecificDevice } from "@utils/notification";
import { StatusCodes } from "http-status-codes";
import moment from "moment-timezone";
import mongoose from "mongoose";

function orderList(userId: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en', timezone = 'Asia/Calcutta' } = headers;
            const { page = 1, perPage = 10, search, status } = query;
            let condition: any = {
                companyProviderId: new mongoose.Types.ObjectId(userId),
                isDelete: false,
                isActive: true,
                type: "vehicle",
                paymentStatus: { $ne: 'unpaid' },
                bookingStatus: { $in: ['Pending', 'Cancelled', 'Confirmed', 'Going to pickup', 'Reached on equipment location', 'Picked', 'On the way', 'Reached', 'Delivered'] }
            };
            let activeOrder_count = {
                ...condition,
                bookingStatus: { $in: ['Pending', 'Confirmed', 'Going to pickup', 'Reached on equipment location', 'Picked', 'On the way', 'Reached'] }
            }
            if (search) {
                condition = {
                    ...condition,
                    $or: [
                        {
                            "vehicleDetails.vehicleType": {
                                $regex: search,
                                $options: "i",
                            },
                        },
                        {
                            "vehicleDetails.ar_vehicleType": {
                                $regex: search,
                                $options: "i",
                            },
                        },
                        {
                            orderId: {
                                $regex: search,
                                $options: "i",
                            },
                        },
                    ],
                };
            }
            if (status) {
                condition = {
                    ...condition,
                    bookingStatus: status == 'Active' ? { $in: ['Pending', 'Confirmed', 'Going to pickup', 'Reached on equipment location', 'Picked', 'On the way', 'Reached', 'Delivered'] } : status
                }
            }

            const orderList = await bookingModel.aggregate([
                {
                    $facet: {
                        data: [
                            {
                                $match: condition,
                            },
                            {
                                $lookup: {
                                    foreignField: "orderId",
                                    localField: "_id",
                                    as: 'installmentDetails',
                                    from: "order_installments",
                                    pipeline: [
                                        {
                                            $match: { isDelete: false, type: "installment", paymentStatus: "unpaid" }
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
                                    foreignField: "vehicleId",
                                    localField: "vehicleId",
                                    from: "vehicle_medias",
                                    as: "mediaDetails",
                                    pipeline: [
                                        {
                                            $match: {
                                                isDelete: false,
                                                isActive: true,
                                                media_type: "image",
                                            },
                                        },
                                        {
                                            $project: {
                                                vehicle_imageUrl: 1,
                                                media_type: 1,
                                            },
                                        },
                                        {
                                            $limit: 1,
                                        },
                                    ],
                                },
                            },
                            {
                                $lookup: {
                                    foreignField: "_id",
                                    localField: "equipmentOrderId",
                                    from: "booking",
                                    as: "equipmentOrder_Details"
                                },
                            },
                            {
                                $lookup: {
                                    foreignField: "orderId",
                                    localField: "_id",
                                    as: "un_read_chat_messages",
                                    from: "chat_messages",
                                    pipeline: [
                                        {
                                            $match: { readStatus: false, sendFrom: "user", isDelete: false }
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
                                    "loadType": {
                                        $cond: {
                                            if: { $eq: [language, "ar"] },
                                            then: "$ar_loadType",
                                            else: "$loadType",
                                        },
                                    },
                                    "vehicleDetails.vehicleType": {
                                        $cond: {
                                            if: { $eq: [language, "ar"] },
                                            then: "$vehicleDetails.ar_vehicleType",
                                            else: "$vehicleDetails.vehicleType",
                                        },
                                    },
                                    "vehicleDetails.vehicleSize": {
                                        $cond: {
                                            if: { $eq: [language, "ar"] },
                                            then: "$vehicleDetails.ar_vehicleSize",
                                            else: "$vehicleDetails.vehicleSize",
                                        },
                                    },
                                    "vehicleDetails.technicalSpecification.engineMake": {
                                        $cond: {
                                            if: { $eq: [language, "ar"] },
                                            then: "$vehicleDetails.technicalSpecification.ar_engineMake",
                                            else: "$vehicleDetails.technicalSpecification.engineMake",
                                        },
                                    },
                                    "vehicleDetails.technicalSpecification.engineModel": {
                                        $cond: {
                                            if: { $eq: [language, "ar"] },
                                            then: "$vehicleDetails.technicalSpecification.ar_engineModel",
                                            else: "$vehicleDetails.technicalSpecification.engineModel",
                                        },
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
                                $sort: { createdAt: -1 },
                            },
                            {
                                $project: {
                                    order_startTimeStamp: 0,
                                    order_endTimeStamp: 0,
                                    equipmentDetails: 0,
                                },
                            },
                            {
                                $skip: Number(page * perPage) - Number(perPage),
                            },
                            {
                                $limit: Number(perPage),
                            },
                        ],
                        count: [
                            {
                                $match: condition,
                            },
                            {
                                $count: "totalCount",
                            },
                        ],
                        activeOrder_count: [
                            {
                                $match: activeOrder_count,
                            },
                            {
                                $count: "totalCount",
                            },
                        ],
                    },
                },
            ]);
            resolve({
                itemList: orderList[0].data,
                count: orderList[0].count.length ? orderList[0].count[0].totalCount : 0,
                activeOrder_count: orderList[0].activeOrder_count.length ? orderList[0].activeOrder_count[0].totalCount : 0
            });
        } catch (err) {
            reject(err);
        }
    });
}

function orderDetails(userId: any, orderId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en', timezone = 'Asia/Calcutta' } = headers;
            const orderDetails = await bookingModel.aggregate([
                {
                    $match: {
                        companyProviderId: new mongoose.Types.ObjectId(userId),
                        type: 'vehicle',
                        _id: new mongoose.Types.ObjectId(orderId),
                    },
                },
                {
                    $lookup: {
                        foreignField: "orderId",
                        localField: "_id",
                        as: 'installmentDetails',
                        from: "order_installments",
                        pipeline: [
                            {
                                $match: { isDelete: false, type: "installment" }
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
                        foreignField: "vehicleId",
                        localField: "vehicleId",
                        from: "vehicle_medias",
                        as: "mediaDetails",
                        pipeline: [
                            {
                                $match: {
                                    isDelete: false,
                                    isActive: true,
                                    media_type: "image",
                                },
                            },
                            {
                                $project: {
                                    vehicle_imageUrl: 1,
                                    media_type: 1,
                                },
                            },
                            {
                                $limit: 1,
                            },
                        ],
                    },
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
                                    from: "equipment_medias",
                                    as: "equipmentMedias",
                                    pipeline: [
                                        {
                                            $match: { isDelete: false, media_type: 'image' }
                                        },
                                        {
                                            $project: {
                                                mediaType: 1, equipment_imageUrl: 1
                                            }
                                        },
                                        {
                                            $limit: 1
                                        }
                                    ]
                                }
                            },
                            {
                                $unwind: {
                                    path: "$equipmentMedias",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $project: {
                                    'equipment_imageUrl': "$equipmentMedias.equipment_imageUrl",
                                    equipmentDetails: 1
                                }
                            },
                        ]
                    },
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
                    $unwind: {
                        path: "$equipmentOrder_Details",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        foreignField: "orderId",
                        localField: "_id",
                        as: 'queries_details',
                        from: "raise_queries",
                        pipeline: [
                            {
                                $match: {
                                    isDelete: false
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
                        "equipmentOrder_Details.equipmentDetails.equipment_imageUrl": "$equipmentOrder_Details.equipment_imageUrl",
                        "rating_reviewDetails": {
                            $cond: {
                                if: { $eq: [{ $size: "$rating_reviewDetails" }, 0] },
                                then: {},
                                else: { $arrayElemAt: ["$rating_reviewDetails", 0] },
                            },
                        },
                        "loadType": {
                            $cond: {
                                if: { $eq: [language, "ar"] },
                                then: "$ar_loadType",
                                else: "$loadType",
                            },
                        },
                        "vehicleDetails.vehicleType": {
                            $cond: {
                                if: { $eq: [language, "ar"] },
                                then: "$vehicleDetails.ar_vehicleType",
                                else: "$vehicleDetails.vehicleType",
                            },
                        },
                        "vehicleDetails.vehicleSize": {
                            $cond: {
                                if: { $eq: [language, "ar"] },
                                then: "$vehicleDetails.ar_vehicleSize",
                                else: "$vehicleDetails.vehicleSize",
                            },
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
                        // isPending_installments: {
                        //     $cond: {
                        //         if: { $eq: [{ $size: "$installmentDetails" }, 0] },
                        //         then: false,
                        //         else: true
                        //     }
                        // },
                        isInquiry: {
                            $gt: [{ $size: "$queries_details" }, 0]
                        },
                        // vat_tax_percentage: 0
                    },
                },
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $project: {
                        order_startTimeStamp: 0,
                        order_endTimeStamp: 0,
                        equipmentDetails: 0,
                        queries_details: 0,
                        'equipmentOrder_Details.equipmentDetails.equipmentReceiveOrder_otp': 0,
                        'equipmentOrder_Details.equipmentDetails.technicalSpecification': 0,
                        'equipmentOrder_Details.equipmentDetails.equipmentLocation': 0,
                        'equipmentOrder_Details.equipment_imageUrl': 0
                    },
                },
            ]);
            resolve(orderDetails.length ? orderDetails[0] : {});
        } catch (err) {
            reject(err);
        }
    });
}
function update_orderStatus(userId: any, orderId: any, body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en', timezone = "Asia/Calcutta" } = headers;
            const message = messages(language);
            const { actionBy, status, reason, otp, ar_reason } = body;
            const bookingDetails: any = await bookingModel.findOne({ _id: orderId });
            let statusArray: any = ['Picked', 'On the way', 'Reached', 'Delivered', 'Completed']
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
                            role: "company"
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
                        if (status == 'Delivered') {
                            const role = 'vehicle_user'
                            const orderId1 = orderId
                            await verifyOtp(role, orderId1, otp, language)
                        }
                        if (status == 'Picked') {
                            const role = 'vehicle_equipment'
                            const orderId1 = orderId
                            await verifyOtp(role, orderId1, otp, language)
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
                        /***
                         * Also update equipment order status if deliveried by a vehicle 
                         */
                        if (bookingDetails.vehicleDetails.with_equipment == true && statusArray.includes(status)) {
                            await bookingModel.updateOne(
                                { _id: bookingDetails.vehicleDetails.equipmentOrderId },
                                {
                                    $set: { bookingStatus: status },
                                    $addToSet: { bookingStatus_withReason: bookingStatus },
                                }
                            );
                            if (status == 'Completed') {
                                await chat_messageModal.updateMany({ orderId: bookingDetails.vehicleDetails.equipmentOrderId, readStatus: false }, { readStatus: true })
                            }
                            const notificationObj = {
                                userId: bookingDetails.userId,
                                bookingStatus: body.status,
                                orderId: bookingDetails.orderId,
                                language: language,
                                role: "company"
                            }
                            sendNotificationToSpecificDevice(notificationObj)
                        }
                        if (status == 'Completed') {
                            await chat_messageModal.updateMany({ orderId: orderId, readStatus: false }, { readStatus: true })
                        }
                        const notificationObj = {
                            userId: bookingDetails.userId,
                            bookingStatus: body.status,
                            orderId: bookingDetails.orderId,
                            language: language,
                            role: "company"
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

function equipment_inspectionByTransporter(userId: any, body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { inspectionDetails, orderId, role } = body;
            let obj: any = {
                _id: orderId,
                // companyProviderId: userId,
                isDelete: false,
            }
            let update_obj = {}
            if (role == 'user') {
                obj = {
                    ...obj,
                    userId: userId,
                    bookingStatus: "Reached"
                }
                update_obj = {
                    ...update_obj,
                    user_equipment_inspectionDetails: inspectionDetails
                }
            }
            if (role == 'vehicle') {
                obj = {
                    ...obj,
                    bookingStatus: "Reached on equipment location",
                    companyProviderId: userId,
                }
                update_obj = {
                    ...update_obj,
                    equipment_inspectionDetails: inspectionDetails
                }
            }
            const checkAndupdate = await bookingModel.findOneAndUpdate(obj, { $set: update_obj }, { new: true, select: 'bookingStatus companyProviderId' })
            resolve(checkAndupdate);
        } catch (err) {
            reject(err)
        }
    });
}

export default {
    orderList,
    update_orderStatus,
    orderDetails,
    equipment_inspectionByTransporter
} as const;
