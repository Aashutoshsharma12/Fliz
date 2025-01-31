import { resolveClientEndpointParameters } from "@aws-sdk/client-s3/dist-types/endpoint/EndpointParameters";
import { messages } from "@Custom_message";
import { cat_specificationModel } from "@models/cat_specification";
import vehicle_specificationModel from "@models/delivery_vehicle_specification";
import { delivery_specificationModel } from "@models/deliverySpecification";
import { CustomError } from "@utils/errors";
import { StatusCodes } from "http-status-codes";


function add(body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const { language } = headers;
        const message = messages(language);
        try {
            body.lower_keyName = body.keyName.toLowerCase()
            body.ar_lower_keyName = body.ar_keyName.toLowerCase()
            const check = await delivery_specificationModel.findOne({
                $or: [
                    {
                        isDelete: false,
                        vehicleType: body.vehicleType,
                        lower_keyName: body.lower_keyName
                    },
                    {
                        isDelete: false,
                        vehicleType: body.vehicleType,
                        ar_lower_keyName: body.ar_lower_keyName
                    }
                ]
            })
            if (check) {
                reject(new CustomError(message.alreadyExist, StatusCodes.BAD_REQUEST));
            } else {
                const add = await delivery_specificationModel.create(body)
                resolve(add)
            }
        } catch (error) {
            reject(error)
        }
    })
}

function list(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const page = parseInt(query?.page) || 1;
            const perPage = parseInt(query?.perPage) || 10;
            const skip = (page - 1) * perPage;
            const { search, vehicleType } = query;
            var obj: any = { isDelete: false }

            if (vehicleType && vehicleType !== "" && vehicleType !== null) {
                obj.vehicleType = vehicleType
            }
            if (search && search !== "" && search !== null) {
                obj = {
                    ...obj,
                    $or: [
                        { keyName: { $regex: search, $options: "i" } },
                        { ar_keyName: { $regex: search, $options: "i" } }
                    ]
                }
            }
            const [listSpecification, totalDocument] = await Promise.all([delivery_specificationModel.find(obj,{lower_keyName:0, ar_lower_keyName:0}).sort({ createdAt: -1 }).skip(skip).limit(perPage), delivery_specificationModel.countDocuments(obj)])
            resolve({ listSpecification, totalDocument })
        } catch (error) {
            reject(error)
        }
    })
}

function edit(body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const { language } = headers;
        const message = messages(language);
        try {
            const id = body.id
            body.lower_keyName = body.keyName.toLowerCase()
            body.ar_lower_keyName = body.ar_keyName.toLowerCase()
            const check = await delivery_specificationModel.findOne({
                $or: [
                    {
                        isDelete: false,
                        vehicleType: body.vehicleType,
                        lower_keyName: body.lower_keyName,
                    },
                    {
                        isDelete: false,
                        vehicleType: body.vehicleType,
                        ar_lower_keyName: body.ar_lower_keyName,
                    }
                ],
                _id: {
                    $ne: id
                }
            })
            if (check) {
                reject(new CustomError(message.alreadyExist, StatusCodes.BAD_REQUEST))
            } else {
                const updated = await delivery_specificationModel.findByIdAndUpdate({ _id: id }, body, { new: true })
                resolve(updated)
            }
        } catch (error) {
            reject(error)
        }
    })
}


function Delete(params: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const { language } = headers;
        const message = messages(language);
        try {
            const { id } = params;
            const specification = await delivery_specificationModel.findOne({
                _id: id,
                isDelete: false,
            });
            if (!specification) {
                reject(new CustomError(message.noDatafound, StatusCodes.NOT_FOUND));
            } else {
                await delivery_specificationModel.findByIdAndUpdate(id, { isDelete: true }, { new: true });
                await vehicle_specificationModel.updateMany({ keyId: id, isDelete: false }, { isDelete: true })
                resolve({ success: true });
            }
        } catch (error) {
            reject(error);
        }
    });
}

function details(params: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const { language } = headers;
        const message = messages(language);
        try {
            const { id } = params;
            const findDataById = await delivery_specificationModel.findOne({
                _id: id,
                isDelete: false,
            },{lower_keyName:0, ar_lower_keyName:0});
            if (!findDataById) {
                reject(new CustomError(message.noDatafound, StatusCodes.NOT_FOUND));
            } else {
                resolve(findDataById);
            }

        } catch (error) {
            reject(error);
        }
    });
}

export default {
    add,
    edit,
    Delete,
    list,
    details
} as const;