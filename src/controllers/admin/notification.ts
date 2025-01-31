import { messages } from "@Custom_message";
import notificationModel from "@models/notification";
import user_renter_delivery_Model from "@models/user";
import user_notificationModel from "@models/users_notifications";
import { CustomError } from "@utils/errors";
import { sendNotificationToSpecificDevice, sendNotificationToTopic } from "@utils/notification";
import { StatusCodes } from "http-status-codes";
import { boolean } from "joi";
import moment from "moment";
import mongoose from "mongoose";
const saveNotification_inUserSchema = async (body: any) => {
    const { role, sentTo } = body;
    if (role == 'Single') {
        await user_notificationModel.create(body);
    }
    if (role == 'Bulk') {
        let obj_cond: any = {
            isDelete: false
        }
        if (sentTo == 'alluser') {
            obj_cond.role = 'user'
        } else if (sentTo == 'allrenter') {
            obj_cond.role = 'renter_user'
        } else if (sentTo == 'alldelivery') {
            obj_cond.role = 'delivery_user'
        } else {
            obj_cond = {
                ...obj_cond
            }
        }
        const userList = await user_renter_delivery_Model.find(obj_cond, { role: 1 });
        if (userList.length) {
            userList.forEach(async (item: any) => {
                body.userId = item._id
                await user_notificationModel.create(body);
            });
        }
    }
}

function saveNotification(body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const { language = 'en', timezone = 'Asia/Calcutta' } = headers;
        const message = messages(language);
        try {
            body.sendTime = moment().tz(timezone).format("HH:mm");
            body.sendDate = moment().tz(timezone).format("YYYY-MM-DD");
            const { phoneNumber, sentTo, role, countryCode } = body
            if (role && role === "Bulk") {
                const data = await notificationModel.create(body);
                const data_obj = {
                    notificationId: data._id,
                    userId: data._id,
                    readStatus: false,
                    role: 'Bulk',
                    sentTo: sentTo,
                    sendTime: body.sendTime,
                    sendDate: body.sendDate
                }
                saveNotification_inUserSchema(data_obj)
                const notificationObj = {
                    title: body.title,
                    body: body.description
                }
                const topic = sentTo == 'all' ? 'All' : sentTo == 'alluser' ? 'All_users' : sentTo == 'allrenter' ? 'All_rentel_users' : 'All_delivery_users'
                sendNotificationToTopic(topic, notificationObj)
                resolve(data)
            }
            if (role && role === "Single") {
                var Condition = {
                    isDelete: false,
                    isActive: true,
                    phoneNumber: phoneNumber,
                    countryCode: countryCode,
                    role: sentTo
                }
                const contcVerification = await user_renter_delivery_Model.findOne(Condition, { phoneNumber: 1, countryCode: 1, role: 1 })
                if (contcVerification) {
                    body.userId = contcVerification._id
                    const data = await notificationModel.create(body);
                    if (data) {
                        const data_obj = {
                            notificationId: data._id,
                            userId: contcVerification._id,
                            readStatus: false,
                            role: 'Single',
                            sentTo: sentTo,
                            sendTime: body.sendTime,
                            sendDate: body.sendDate
                        }
                        saveNotification_inUserSchema(data_obj)
                        const notificationObj = {
                            userId: data_obj.userId,
                            title: body.title,
                            body: body.description,
                            role: "admin"
                        }
                        sendNotificationToSpecificDevice(notificationObj)
                        resolve(data);
                    } else {
                        reject(new CustomError(message.somethingwrong, StatusCodes.BAD_REQUEST))
                    }
                } else {
                    reject(new CustomError(message.invalidPhoneNumberORcountryCode, StatusCodes.BAD_REQUEST))
                }
            }
        }
        catch (error) {
            reject(error);
        }
    })
}

function listNotification(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { page, perPage, role, isActive, search, sentTo } = query;
            let condition: any = { isDelete: false };

            if (search && search !== " " && search !== null && search !== undefined) {
                condition = {
                    ...condition,
                    $or: [
                        { title: { $regex: search, $options: "i" } },
                        { ar_title: { $regex: search, $options: "i" } },
                        { description: { $regex: search, $options: "i" } },
                        { ar_description: { $regex: search, $options: "i" } }
                    ]
                }
            }
            if (sentTo && sentTo !== " " && sentTo !== null && sentTo !== undefined && sentTo !== "all") {
                condition = {
                    ...condition,
                    sentTo: sentTo
                }
            } else {
                condition = { ...condition }
            }

            if (isActive && isActive !== " " && isActive !== null) {
                condition = {
                    ...condition,
                    isActive: isActive
                }
            }
            const [data, count] = await Promise.all([notificationModel.find(condition).sort({ createdAt: -1 }).skip((page - 1) * perPage).limit(perPage), notificationModel.countDocuments(condition)]);
            console.log(data)
            resolve({ totalCount: count, data });
        }
        catch (error) {
            reject(error);
        }
    })
}

function deleteNotification(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const { language } = headers;
        const message = messages(language);
        try {
            const { id } = query
            console.log(id)
            const deletedNotification = await notificationModel.findOneAndUpdate(
                { _id: id, isDelete: false },
                { isDelete: true },
                { new: true }
            );
            if (deletedNotification) {
                resolve({ deletedNotification })
            }
            else {
                reject(
                    new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
                )
            }
        } catch (error) {
            reject(error);
        }
    })

}

export = { saveNotification, listNotification, deleteNotification } as const;


