import { messages } from "@Custom_message";
import user_renter_delivery_Model from "@models/user";
import { CustomError } from "@utils/errors";
import { StatusCodes } from "http-status-codes";

function userDetails(userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en'} = headers;
            const message = messages(language);
            const details = await user_renter_delivery_Model.findOne({ _id: userId, isDelete: false }, { password: 0 });
            if (details) {
                resolve(details)
            } else {
                reject(new CustomError(message.noDatafound, StatusCodes.NOT_FOUND));
            }
        } catch (err) {
            reject(err)
        }
    });
}

function updateProfile(body: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en'} = headers;
            var message: any = messages(language);
            const { role } = body;
            const check = await user_renter_delivery_Model.findOne({ _id: userId, role: role, isDelete: false });
            if (check) {
                const update = await user_renter_delivery_Model.updateOne({ _id: userId, role: role, isDelete: false }, body);
                resolve(update);
            } else {
                reject(new CustomError(message.noDatafound, StatusCodes.NOT_FOUND));
            }

        } catch (err) {
            if (err.code == 11000) {
                reject(new CustomError(message.accountAlreadyExist, StatusCodes.BAD_REQUEST));
            }
            reject(err)
        }
    });
}

export default {
    userDetails,
    updateProfile
} as const;