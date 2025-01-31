import { messages } from "@Custom_message";
import OrderCancel_reasonModel from "@models/cancel_reason";
import { CustomError } from "@utils/errors";
import { StatusCodes } from "http-status-codes";

function addReason(body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language } = headers;
            const message = messages(language);
            let condition: any = { isDelete: false, role: body.role, title: body.title, ar_title: body.ar_title };
            const findReasonIfExist = await OrderCancel_reasonModel.findOne(condition)
            if (findReasonIfExist) {
                reject(
                    new CustomError(
                        message.alreadyExist,
                        StatusCodes.BAD_REQUEST
                    )
                );
            }
            else {
                const data = await OrderCancel_reasonModel.create(body);
                resolve(data);
            }
        }
        catch (error) {
            reject(error);
        }
    })
}

function listReason(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { isActive, role, search, page = 1, perPage = 10 } = query;
            let condition: any = { isDelete: false };
            if (isActive) {
                condition = { ...condition, isActive: isActive }
            }
            if (role) {
                condition = { ...condition, role: role }
            }
            
            if (search !== "" && search !== null && search !== undefined && search) {
                condition = { ...condition, title: { $regex: search, $options: "i" } }
            }

            const [count, data] = await Promise.all([OrderCancel_reasonModel.countDocuments(condition), OrderCancel_reasonModel.find(condition).sort({ createdAt: -1 }).skip((page - 1) * perPage).limit(perPage)])
            resolve({ totalDocument: count, data });
        }
        catch (error) {
            reject(error);
        }
    })
}

function detailsReason(params: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const { language } = headers;
        const message = messages(language);
        try {
            const { id } = params;
            const data = await OrderCancel_reasonModel.findOne({ _id: id, isDelete: false });
            resolve(data)
        }
        catch (error) {
            reject(error);
        }
    })
}

function editReason(params: any, body: any, headers: any): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
        const { language } = headers;
        const message = messages(language);
        try {
            const { id } = params;
            let condition: any = { isDelete: false, role: body.role, title: body?.title.trim(), ar_title: body?.ar_title.trim(), _id: { $ne: id } };
            const findIfExist = await OrderCancel_reasonModel.findOne(condition);
            if (findIfExist) {
                reject(
                    new CustomError(
                        message.alreadyExist,
                        StatusCodes.BAD_REQUEST
                    )
                );
            }
            else {
                const data = await OrderCancel_reasonModel.updateOne({ _id: id, isDelete: false }, body);
                if (data.modifiedCount) {
                    resolve({ success: true })
                }
                else {
                    reject(
                        new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
                    );
                }
            }
        }
        catch (error) {
            reject(error);
        }
    })
}
function deleteReason(params: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const { language } = headers;
        const message = messages(language);
        try {
            const { id } = params;
            const data = await OrderCancel_reasonModel.updateOne({ _id: id, isDelete: false }, { isDelete: true });
            if (data.modifiedCount) {
                resolve({ success: true })
            }
            else {
                reject(
                    new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
                );
            }
        }
        catch (error) {
            reject(error);
        }
    })
}
function changeStatus(params: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const { language } = headers;
        const message = messages(language);
        try {
            const { id } = params;
            const { isActive } = query;
            const data = await OrderCancel_reasonModel.updateOne({ _id: id, isDelete: false }, { isActive: isActive });
            if (data.modifiedCount) {
                resolve({ success: true })
            }
            else {
                reject(
                    new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
                );
            }
        }
        catch (error) {
            reject(error);
        }
    })
}

export default { addReason, editReason, listReason, detailsReason, deleteReason, changeStatus } as const;