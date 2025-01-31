import { query_chat_messageModal, raise_queryModel } from "@models/index";
import mongoose from "mongoose";

function messageList(queryId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const cond = {
                queryId: new mongoose.Types.ObjectId(queryId),
                isDelete: false
            }
            let queryDetails: any = {}
            queryDetails = await raise_queryModel.findOne({ _id: queryId }).populate([{ path: "userId", select: "name online" }, { path: "orderId", select: "companyProviderId", populate: { path: "companyProviderId", select: "name online" } }]);
            if (queryDetails) {
                queryDetails = {
                    userName: queryDetails.userId.name,
                    userOnline: queryDetails.userId.online,
                    companyName: queryDetails.orderId.companyProviderId.name,
                    companyOnline: queryDetails.orderId.companyProviderId.online,
                    ticketId: queryDetails.ticketId,
                    title: queryDetails.title,
                    description: queryDetails.description,
                    status: queryDetails.status,
                    image: queryDetails.image ? queryDetails.status : ''
                }
            }
            const list = await query_chat_messageModal.aggregate([
                {
                    $match: cond
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
            resolve({ messageList: list, queryDetails: queryDetails });
        } catch (err) {
            reject(err)
        }
    });
}

function update_messageStatus(userId: any, queryId: any, sendTo: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const cond = {
                queryId: queryId,
                sendTo: sendTo,
                readStatus: false
            }
            await query_chat_messageModal.updateMany(cond, { readStatus: true });
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
            const un_readCount = await query_chat_messageModal.countDocuments(un_read_chat_messages_obj)
            resolve({ success: true, un_read_messageCount: un_readCount });
        } catch (err) {
            reject(err);
        }
    });
}

function update_messageStatus_during_online(queryId: any, sendTo: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const cond = {
                queryId: queryId, //queryId
                sendTo: sendTo,
                readStatus: false
            }
            const update = await query_chat_messageModal.findOneAndUpdate(cond, { readStatus: true }, { new: true, fields: { readStatus: 1, orderId: 1 } });
            resolve(update);
        } catch (err) {
            reject(err);
        }
    });
}

export default {
    messageList,
    update_messageStatus,
    update_messageStatus_during_online
} as const;