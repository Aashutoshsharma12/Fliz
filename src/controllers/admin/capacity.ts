import { messages } from "@Custom_message";
import { capacityModel, categoryModel } from "@models/index";
import user_renter_delivery_Model from "@models/user";
import { CustomError } from "@utils/errors";
import { identityGenerator } from "@utils/helpers";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";

function add(body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language } = headers;
            var message: any = messages(language);
            body.lower_capacity = body.capacity.toLowerCase()
            body.lower_ar_capacity = body.ar_capacity.toLowerCase()
            const count = await capacityModel.countDocuments();
            body.uniqueId = identityGenerator('capacity', count)
            const check = await capacityModel.findOne({
                $or:[
                    {
                        isDelete:false,
                        lower_capacity:body.lower_capacity,
                    },
                    {
                        isDelete:false,
                        lower_ar_capacity:body.lower_ar_capacity
                    }
                ]
            })
            if(check){
                reject(new CustomError(message.alreadyExist, StatusCodes.BAD_REQUEST));
            }else{
                const add = await capacityModel.create(body);
                // const add1 = await add.save()
                resolve(add);
            }           
        } catch (err) {
            reject(err)
        }
    });
}

function edit(body: any, params: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language } = headers;
            var message: any = messages(language);
            body.lower_capacity = body.capacity.toLowerCase()
            body.lower_ar_capacity = body.ar_capacity.toLowerCase()
            const check = await capacityModel.findOne({
                $or: [
                    {
                        isDelete: false,
                        lower_capacity:body.lower_capacity
                    },
                    {
                        isDelete: false,
                        lower_ar_capacity:body.lower_ar_capacity
                    }
                ],
                _id: {
                    $ne: params.id
                }
        })
        if(check){
            reject(new CustomError(message.alreadyExist, StatusCodes.BAD_REQUEST));
        }else{
            const updated_data = await capacityModel.findByIdAndUpdate({ _id: params.id, isDelete: false }, body, { new: true });
            resolve(updated_data);
        }
        } catch (err) {
            reject(err)
        }
    });
}

function details(params: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language } = headers;
            var message: any = messages(language);
            const details = await capacityModel.findOne({ _id: params?.id, isDelete: false },{lower_capacity:0, lower_ar_capacity:0});
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
            const { page = 1, perPage = 10, capacity, isActive } = query;
            let obj: any = {
                isDelete: false,
                // isActive: true 
            }
            if (capacity && capacity !== "" && capacity !== null) {
                obj = {
                    ...obj,
                    $or: [
                        { capacity: { $regex: capacity, $options: "i" } },
                        { ar_capacity: { $regex: capacity, $options: "i" } }
                    ]
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
            const [list, count] = await Promise.all([capacityModel.find(obj,{lower_capacity:0, lower_ar_capacity:0}).sort({ createdAt: -1 }).skip((page * perPage) - perPage).limit(perPage), capacityModel.countDocuments(obj)]);
            resolve({ list, totalCount: count });
        } catch (err) {
            reject(err)
        }
    });
}

function updateStatus(params: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const { language } = headers;
        const message = messages(language);
        try {
            const { isActive } = query;
            const updated_data = await capacityModel.findOneAndUpdate({ _id: new Types.ObjectId(params?.id), isDelete: false }, { isActive: isActive }, { new: true });
            if (updated_data) {
                resolve({ success: true })
            }
            else {
                reject(
                    new CustomError(
                        message.noDatafoundWithID,
                        StatusCodes.BAD_REQUEST
                    )
                );
            }
        } catch (err) {
            reject(err)
        }
    });
}

function delete_capacity(params: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const { language } = headers;
        const message = messages(language);
        try {
            const updated_data = await capacityModel.findOneAndUpdate({ _id: params?.id, isDelete: false }, { isDelete: true }, { new: true });
            if (updated_data) {
                resolve({ success: true })
            }
            else {
                reject(
                    new CustomError(
                        message.noDatafoundWithID,
                        StatusCodes.BAD_REQUEST
                    )
                );
            }
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
    delete_capacity
} as const;
