import { resolveClientEndpointParameters } from "@aws-sdk/client-s3/dist-types/endpoint/EndpointParameters";
import { messages } from "@Custom_message";
import { cat_specification_valuesModel, cat_specificationModel } from "@models/cat_specification";
import equipment_specificationModel from "@models/equipment_specification";
import { CustomError } from "@utils/errors";
import { StatusCodes } from "http-status-codes";



function add_Specification(body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const { language } = headers;
        const message = messages(language);
        try {
            body.lower_keyName = body.keyName.toLowerCase()
            body.ar_lower_keyName = body.ar_keyName.toLowerCase()
            const check = await cat_specificationModel.findOne({
                $or: [
                    {
                        isDelete: false,
                        catId: body.catId,
                        lower_keyName: body.lower_keyName
                    },
                    {
                        isDelete: false,
                        catId: body.catId,
                        ar_lower_keyName: body.ar_lower_keyName
                    }
                ]
            })
            if (check) {
                reject(new CustomError(message.alreadyExist, StatusCodes.BAD_REQUEST));
            } else {
                const add = await cat_specificationModel.create(body)
                resolve(add)
            }
        } catch (error) {
            reject(error)
        }
    })
}

function list_Specification(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const page = parseInt(query?.page) || 1;
            const perPage = parseInt(query?.perPage) || 10;
            const skip = (page - 1) * perPage;
            const { search, catId } = query;
            var obj: any = { isDelete: false }

            if (catId && catId !== "" && catId !== null) {
                obj.catId = catId
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
            const [listSpecification, totalDocument] = await Promise.all([cat_specificationModel.find(obj).sort({ createdAt: -1 }).skip(skip).limit(perPage), cat_specificationModel.countDocuments(obj)])
            resolve({ listSpecification, totalDocument })
        } catch (error) {
            reject(error)
        }
    })
}

function edit_Specification(body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const { language } = headers;
        const message = messages(language);
        try {
            const id = body.id
            body.lower_keyName = body.keyName.toLowerCase()
            body.ar_lower_keyName = body.ar_keyName.toLowerCase()
            const check = await cat_specificationModel.findOne({
                $or: [
                    {
                        isDelete: false,
                        catId: body.catId,
                        lower_keyName: body.lower_keyName,
                    },
                    {
                        isDelete: false,
                        catId: body.catId,
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
                const updated = await cat_specificationModel.findByIdAndUpdate({ _id: id }, body, { new: true })
                resolve(updated)
            }
        } catch (error) {
            reject(error)
        }
    })
}


function delete_Specification(params: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const { language } = headers;
        const message = messages(language);
        try {
            const { id } = params;
            const specification = await cat_specificationModel.findOne({
                _id: id,
                isDelete: false,
            });
            if (!specification) {
                reject(new CustomError(message.noDatafound, StatusCodes.NOT_FOUND));
            } else {
                await cat_specificationModel.findByIdAndUpdate(id, { isDelete: true }, { new: true });
                await equipment_specificationModel.updateMany({ keyId: id }, { isDelete: true });
                await cat_specification_valuesModel.updateMany({ keyId: id }, { isDelete: true })
                resolve({ success: true });
            }
        } catch (error) {
            reject(error);
        }
    });
}

function details_specification(params: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { id } = params;
            const findDataById = await cat_specificationModel.findOne({
                _id: id,
                isDelete: false,
            });
            resolve(findDataById);
        } catch (error) {
            reject(error);
        }
    });
}


export default {
    add_Specification,
    edit_Specification,
    delete_Specification,
    list_Specification,
    details_specification
} as const;