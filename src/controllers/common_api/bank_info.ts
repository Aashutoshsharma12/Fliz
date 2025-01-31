import { messages } from "@Custom_message";
import bankDetailsModel from "@models/bank_details";
import { CustomError } from "@utils/errors";
import { StatusCodes } from "http-status-codes";

function bankDetails(userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const message = messages(language);
            const details = await bankDetailsModel.findOne({ userId: userId, isDelete: false });
            resolve(details);
        } catch (err) {
            reject(err)
        }
    });
}

function addAndUpdate_bankDetails(body: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en'} = headers;
            var message: any = messages(language);
            body.userId = userId
            const update = await bankDetailsModel.findOneAndUpdate({ userId: userId, isDelete: false }, body, { new: true, upsert: true });
            resolve(update);
        } catch (err) {
            if (err.code == 11000) {
                reject(new CustomError(message.accountAlreadyExist, StatusCodes.BAD_REQUEST));
            }
            reject(err)
        }
    });
}

export default {
    bankDetails,
    addAndUpdate_bankDetails
} as const;