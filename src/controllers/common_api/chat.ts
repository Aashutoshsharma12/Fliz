import bookingModel from "@models/booking";
import chat_messageModal from "@models/chat_message";
import moment from 'moment-timezone'
import mongoose from "mongoose";

function setTime_out(userId: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { orderId, hours, minutes } = query;
            const now = moment();
            console.log('Current Timestamp:', now.valueOf());
            // Add hour and minutes
            const futureMoment = now.add(Number(hours), 'hour').add(Number(minutes), 'minutes');
            const update_orderDetails = await bookingModel.findOneAndUpdate({ _id: orderId, companyProviderId: userId, bookingStatus: 'Pending', setTimeOut: false }, { setTimeOut: true, setTimeOut_timeStamp: futureMoment.valueOf() }, { new: true, select: 'setTimeOut_timeStamp setTimeOut bookingStatus' });
            resolve(update_orderDetails);
        } catch (err) {
            reject(err);
        }
    });
}

function messageList(orderId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const cond = {
                orderId: new mongoose.Types.ObjectId(orderId),
                isDelete: false
            }
            const orderDetails = await bookingModel.findOne({ _id: orderId }, { bookingStatus: 1, setTimeOut: 1, setTimeOut_timeStamp: 1 }).populate({ path: "companyProviderId userId", select: 'name ar_company_description company_description bannerImage image online' });
            const list = await chat_messageModal.aggregate([
                {
                    $match: cond
                },
                {
                    $lookup: {
                        from: "user_renter_deliveries",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userDetails",
                        pipeline: [
                            {
                                $project: {
                                    name: 1, image: 1, online: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        userDetails: {
                            $cond: {
                                if: { $eq: [{ $size: "$userDetails" }, 0] },
                                then: {},
                                else: { $arrayElemAt: ["$userDetails", 0] }
                            }
                        }
                    }
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
                                    name: 1, image: 1, online: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        companyDetails: {
                            $cond: {
                                if: { $eq: [{ $size: "$companyDetails" }, 0] },
                                then: {},
                                else: { $arrayElemAt: ["$companyDetails", 0] }
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        foreignField: "_id",
                        localField: "orderId",
                        from: "bookings",
                        as: "orderDetails",
                        pipeline: [
                            {
                                $project: {
                                    setTimeOut: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        orderDetails: {
                            $cond: {
                                if: { $eq: [{ $size: "$orderDetails" }, 0] },
                                then: {},
                                else: { $arrayElemAt: ["$orderDetails", 0] }
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        date: { $toDate: '$date' },
                    }
                },
                {
                    $group: {
                        _id: {
                            day: {
                                $dateToString: {
                                    format: '%Y-%m-%d', // Format the date as YYYY-MM-DD
                                    date: '$date'
                                }
                            }
                        },
                        messageList: { $push: "$$ROOT" } // Use $push to collect messages
                    }
                },
                {
                    $unwind: "$messageList" // Unwind to access individual messages
                },
                {
                    $sort: {
                        "messageList.time": 1 // Sort messages by time within each month
                    }
                },
                {
                    $group: {
                        _id: "$_id.day",
                        messageList: { $push: "$messageList" } // Re-group messages by month
                    }
                },
                {
                    $sort: {
                        "_id": 1,
                    }
                },
            ]);
            resolve({ messageList: list, companyDetails: orderDetails });
        } catch (err) {
            reject(err)
        }
    });
}

function update_messageStatus(userId: any, orderId: any, sendTo: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const cond = {
                orderId: orderId,
                sendTo: sendTo,
                readStatus: false
            }
            await chat_messageModal.updateMany(cond, { readStatus: true });
            let un_read_chat_messages_obj: any = {
                readStatus: false, sendTo: sendTo,
            }
            if (sendTo == 'company') {
                un_read_chat_messages_obj = {
                    ...un_read_chat_messages_obj,
                    companyProviderId: userId
                }
            } else {
                un_read_chat_messages_obj = {
                    ...un_read_chat_messages_obj,
                    userId: userId
                }
            }
            const un_readCount = await chat_messageModal.countDocuments(un_read_chat_messages_obj)
            resolve({ success: true, un_read_messageCount: un_readCount });
        } catch (err) {
            reject(err);
        }
    });
}

function update_messageStatus_during_online(messageId: any, sendTo: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const cond = {
                orderId: messageId, //orderId
                sendTo: sendTo,
                readStatus: false
            }
            const update = await chat_messageModal.findOneAndUpdate(cond, { readStatus: true }, { new: true, fields: { readStatus: 1, orderId: 1 } });
            resolve(update);
        } catch (err) {
            reject(err);
        }
    });
}

function user_companyList(userId: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { role = 'user', page = 1, perPage = 10, search } = query;
            let cond: any = {
                isDelete: false
            }
            let search_cond: any = {}
            if (role == 'user') {  //user , company
                cond = {
                    ...cond,
                    userId: new mongoose.Types.ObjectId(userId)
                }
                if (search) {
                    search_cond = {
                        ...search_cond,
                        $or: [
                            {
                                orderId: { $regex: search, $options: 'i' }
                            },
                            {
                                companyName: { $regex: search, $options: 'i' }
                            }
                        ]
                    }
                }
            } else {
                cond = {
                    ...cond,
                    companyProviderId: new mongoose.Types.ObjectId(userId)
                }
                if (search) {
                    search_cond = {
                        ...search_cond,
                        $or: [
                            {
                                orderId: { $regex: search, $options: 'i' }
                            },
                            {
                                userName: { $regex: search, $options: 'i' }
                            }
                        ]
                    }
                }
            }
            const [list, count] = await Promise.all([
                bookingModel.aggregate([
                    {
                        $match: cond
                    },
                    {
                        $lookup: {
                            foreignField: "_id",
                            localField: "companyProviderId",
                            as: "companyDetails",
                            from: "user_renter_deliveries",
                            pipeline: [
                                {
                                    $project: { name: 1, image: 1, bannerImage: 1, online: 1 }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: "$companyDetails"
                    },
                    {
                        $lookup: {
                            foreignField: "_id",
                            localField: "userId",
                            as: "userDetails",
                            from: "user_renter_deliveries",
                            pipeline: [
                                {
                                    $project: { name: 1, image: 1, online: 1 }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: "$userDetails"
                    },
                    {
                        $addFields: {
                            companyName: "$companyDetails.name",
                            companyImage: "$companyDetails.image",
                            companyBannerImage: "$companyDetails.bannerImage",
                            companyOnline: { $ifNull: ["$companyDetails.online", false] },
                            userName: "$userDetails.name",
                            userImage: "$userDetails.image",
                            userOnline: { $ifNull: ["$userDetails.online", false] }
                        }
                    },
                    {
                        $match: search_cond
                    },
                    {
                        $lookup: {
                            from: "chat_messages",
                            localField: "_id",
                            foreignField: "orderId",
                            as: "un_readMessagesCount",
                            pipeline: [
                                {
                                    $match: { sendTo: role, readStatus: false }
                                },
                                {
                                    $count: "totalCount"
                                }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "chat_messages",
                            localField: "_id",
                            foreignField: "orderId",
                            as: "chatMessages_details",
                            pipeline: [
                                // {
                                //     $match: {
                                //         sendTo: role
                                //     }
                                // },
                                {
                                    $sort: {
                                        createdAt: -1
                                    }
                                },
                                {
                                    $project: {
                                        message: 1,
                                        messageType: 1,
                                        time: 1,
                                        date: 1
                                    }
                                },
                                {
                                    $limit: 1
                                }
                            ]
                        }
                    },
                    {
                        $project: {
                            companyName: 1,
                            companyImage: 1,
                            companyBannerImage: 1,
                            userName: 1,
                            userImage: 1,
                            orderId: 1,
                            userOnline: 1,
                            companyOnline: 1,
                            un_readMessagesCount: {
                                $cond: {
                                    if: { $eq: [{ $size: "$un_readMessagesCount" }, 0] },
                                    then: 0,
                                    else: { $arrayElemAt: ["$un_readMessagesCount.totalCount", 0] }
                                }
                            },
                            latestMessage: {
                                $cond: {
                                    if: { $eq: [{ $size: "$chatMessages_details" }, 0] },
                                    then: {},
                                    else: { $arrayElemAt: ["$chatMessages_details", 0] }
                                }
                            },
                            createdAt: -1
                        }
                    },
                    // {
                    //     $match: { latestMessage: { $ne: {} } }
                    // },
                    {
                        $sort: { "latestMessage.date": -1, "latestMessage.time": -1, createdAt: -1 }
                    }
                    // {
                    //     $skip: Number(perPage * page) - Number(perPage)
                    // },
                    // {
                    //     $limit: Number(perPage)
                    // }
                ]),
                bookingModel.aggregate([
                    {
                        $match: cond
                    },
                    {
                        $lookup: {
                            foreignField: "_id",
                            localField: "companyProviderId",
                            as: "companyDetails",
                            from: "user_renter_deliveries",
                            pipeline: [
                                {
                                    $project: { name: 1, image: 1, bannerImage: 1, online: 1 }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: "$companyDetails"
                    },
                    {
                        $lookup: {
                            foreignField: "_id",
                            localField: "userId",
                            as: "userDetails",
                            from: "user_renter_deliveries",
                            pipeline: [
                                {
                                    $project: { name: 1, image: 1, online: 1 }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: "$userDetails"
                    },
                    {
                        $addFields: {
                            companyName: "$companyDetails.name",
                            companyImage: "$companyDetails.image",
                            companyBannerImage: "$companyDetails.bannerImage",
                            companyOnline: "$companyDetails.online",
                            userName: "$userDetails.name",
                            userImage: "$userDetails.image",
                            userOnline: "$userDetails.online"
                        }
                    },
                    {
                        $match: search_cond
                    },
                    {
                        $count: "totalCount"
                    }
                ])
            ]);
            resolve({ itemList: list, count: count.length ? count[0].totalCount : 0 });
        } catch (err) {
            reject(err)
        }
    });
}

export default {
    setTime_out,
    messageList,
    update_messageStatus,
    update_messageStatus_during_online,
    user_companyList
} as const;