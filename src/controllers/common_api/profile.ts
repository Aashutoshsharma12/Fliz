import { messages } from "@Custom_message";
import user_renter_delivery_Model from "@models/user";
import { CustomError } from "@utils/errors";
import { StatusCodes } from "http-status-codes";

function userDetails(userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const message = messages(language);
            const details = await user_renter_delivery_Model.findOne({ _id: userId, isDelete: false }, { password: 0 });
            if (details) {
                resolve(details);
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
            const { language = 'en' } = headers;
            var message: any = messages(language);
            const { role, company_description } = body;
            body.ar_company_description = company_description
            const update = await user_renter_delivery_Model.findOneAndUpdate({ _id: userId, role: role, isDelete: false }, body, { new: true });
            resolve(update);
        } catch (err) {
            if (err.code == 11000) {
                reject(new CustomError(message.accountAlreadyExist, StatusCodes.BAD_REQUEST));
            }
            reject(err)
        }
    });
}

function update_certificates(body: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            var message: any = messages(language);
            const { certificate_achievement } = body;
            const updatedDetails = await user_renter_delivery_Model.findOneAndUpdate({ _id: userId, isDelete: false }, body, { new: true, select: '-password' });
            if (updatedDetails) {
                resolve(updatedDetails);
            } else {
                reject(new CustomError(message.noDatafound, StatusCodes.NOT_FOUND));
            }
        } catch (err) {
            reject(err)
        }
    });
}

function delete_certificates(body: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            var message: any = messages(language);
            const { certificate_achievement } = body;
            const updatedDetails = await user_renter_delivery_Model.findOneAndUpdate({ _id: userId, isDelete: false }, { $pull: { certificate_achievement: certificate_achievement } }, { new: true, select: '-password' });
            if (updatedDetails) {
                resolve(updatedDetails);
            } else {
                reject(new CustomError(message.noDatafound, StatusCodes.NOT_FOUND));
            }
        } catch (err) {
            reject(err)
        }
    });
}


function update_toggle(userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            var message: any = messages(language);
            const update = await user_renter_delivery_Model.findOne({ _id: userId, isDelete: false }, { isBusiness: 1 });
            if (update) {
                let status = false
                if (update.isBusiness === true) {
                    status = false
                } else {
                    status = true
                }
                await user_renter_delivery_Model.updateOne({ _id: userId }, { isBusiness: status });
                resolve({ success: true });
            }
            resolve(update)
        } catch (err) {
            reject(err);
        }
    });
}

export default {
    userDetails,
    updateProfile,
    update_certificates,
    delete_certificates,
    update_toggle
} as const;