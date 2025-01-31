import { messages } from "@Custom_message";
import { vehicle_sizeTypeModel } from "@models/index";
import { CustomError } from "@utils/errors";
import { identityGenerator } from "@utils/helpers";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

function add(body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language } = headers;
            var message: any = messages(language);
            body.lower_name = body.name.toLowerCase()
            body.ar_lower_name = body.ar_name.toLowerCase()
            body.lower_delivery_type_name = body.delivery_type_name.toLowerCase();
            // body.lower_delivery_type_ar_name = body.delivery_type_ar_name.toLowerCase();
            const data = await vehicle_sizeTypeModel.findOne({
                $or: [
                    {
                        lower_name: body.lower_name,
                        isDelete: false,
                    },
                    {
                        ar_lower_name: body.ar_lower_name,
                        isDelete: false,
                    },
                ],
            });

            if (data) {
                reject(
                    new CustomError(
                        message.alreadyExist,
                        StatusCodes.BAD_REQUEST
                    )
                )
            }
            else {
                const add = new vehicle_sizeTypeModel(body);
                const add1 = await add.save();
                resolve(add1);
            }
        } catch (err) {
            reject(err)
        }
    });
}

function edit(params: any, body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language } = headers;
            const message = messages(language);
            body.lower_name = body.name.toLowerCase()
            body.ar_lower_name = body.ar_name.toLowerCase()
            body.lower_delivery_type_name = body.delivery_type_name.toLowerCase();
            // body.lower_delivery_type_ar_name = body.delivery_type_ar_name.toLowerCase();
            const data = await vehicle_sizeTypeModel.findOne({
                $or: [
                    {
                        lower_name: body.lower_name,
                        isDelete: false,
                    },
                    {
                        ar_lower_name: body.ar_lower_name,
                        isDelete: false,
                    },
                ],
                _id: {
                    $ne: params?.id
                }
            });
            if (data) {
                reject(
                    new CustomError(
                        message.alreadyExist,
                        StatusCodes.BAD_REQUEST
                    )
                )
            }
            else {
                await vehicle_sizeTypeModel.findOneAndUpdate({ _id: params?.id, isDelete: false }, body);
                resolve({ success: true });
            }
        }
        catch (error) {
            reject(error);
        }
    })
}

function details(params: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language } = headers;
            var message: any = messages(language);
            const details = await vehicle_sizeTypeModel.findOne({ _id: params.id, isDelete: false },{lower_delivery_type_name:0, lower_name:0, ar_lower_name:0});
            resolve(details);
        } catch (err) {
            reject(err)
        }
    });
}

function list(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language } = headers;
            var message: any = messages(language);
            const { page = 1, perPage = 10, search, isActive } = query;
            let obj: any = {
                isDelete: false,
                // isActive: true 
            }
            if (search) {
                obj = {
                    ...obj,
                    name: { $regex: search, $options: 'i' }
                }
            }
            
            if (isActive === "Active") {
                obj = { ...obj, isActive: true }
            }
            else if (isActive === "InActive") {
                obj = { ...obj, isActive: false }
            }
            else if (isActive === "all") {
                obj = {
                    ...obj
                }
            }

            const [list, count] = await Promise.all([vehicle_sizeTypeModel.find(obj,{lower_name:0, lower_delivery_type_name:0, ar_lower_name:0}).sort({ createdAt: -1 }).skip((page * perPage) - perPage).limit(perPage), vehicle_sizeTypeModel.countDocuments(obj)]);
            resolve({ totalCount: count, list });
        } catch (err) {
            reject(err)
        }
    });
}

function updateStatus(params: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { isActive } = query;
            const updated_data = await vehicle_sizeTypeModel.findOneAndUpdate({ _id: params?.id, isDelete: false }, { isActive: isActive }, { new: true });
            resolve(updated_data);
        } catch (err) {
            reject(err)
        }
    });
}
function delete_delivery_type(params: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const updated_data = await vehicle_sizeTypeModel.updateOne({ _id: params.id }, { isDelete: true });
            resolve(updated_data);
        } catch (err) {
            reject(err)
        }
    });
}

export default {
    add,
    edit,
    details,
    list,
    updateStatus,
    delete_delivery_type
} as const;
