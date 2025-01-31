import { messages } from "@Custom_message";
import equipment_addressModel from "@models/equipment_address";
import equipmentModel from "@models/equipment";
import equipment_mediaModel from "@models/equipment_media";
import { CustomError } from "@utils/errors";
import { identityGenerator } from "@utils/helpers";
import { StatusCodes } from "http-status-codes";
import moment from "moment-timezone";
import mongoose, { Types } from "mongoose";
import equipment_specificationModel from "@models/equipment_specification";
import { object } from "joi";

let add_specification = async (specifications: any, equipmentId: any) => {
    let obj: any = {
        equipmentId: equipmentId
    }
    for (let data of specifications) {
        obj = {
            ...obj,
            keyId: data.keyId,
            keyType: data.keyType,
            keyValue: data.keyValue ? data.keyValue : "",
            isDelete: data.isDelete
        }
        if (data.keyType == 'dropdown') {
            obj.keyValueId = data.keyValueId
        } else {
            delete obj.keyValueId
        }
        if (data._id && data._id != '')
            await equipment_specificationModel.updateOne({ _id: data._id }, obj);
        else
            await equipment_specificationModel.create(obj);
    }
}

function addEquipment_basicDetails(body: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { specifications } = body;
            const count = await equipmentModel.countDocuments();
            const obj = {
                ...body,
                companyProviderId: userId,
                isBasicDetails: true,
                uniqueId: identityGenerator("renter_equipment", count)
            }
            const add = await equipmentModel.create(obj);
            if (add) {
                if (specifications && specifications.length) {
                    add_specification(specifications, add._id)
                }
            }
            resolve(add);
        } catch (err) {
            reject(err)
        }
    });
}

function editEquipment_basicDetails(body: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const message = messages(language);
            const { isPriceBreaking, specifications } = body;
            if (isPriceBreaking == false) {
                body.priceBreaking_details = {
                    time: '',
                    minimumAmount: 0,
                    dueAmount: 0
                }
            }
            const obj = {
                ...body,
                companyProviderId: userId,
            }
            const check_equipment = await equipmentModel.findOne({ _id: body.equipmentId, companyProviderId: userId, isDelete: false }, { companyProviderId: 1 });
            if (check_equipment) {
                await equipmentModel.updateOne({ _id: body.equipmentId }, obj);
                if (specifications && specifications.length) {
                    add_specification(specifications, body.equipmentId)
                }
                resolve({ success: true });
            } else {
                reject(new CustomError(message.noDatafound, StatusCodes.BAD_REQUEST));
            }
        } catch (err) {
            reject(err)
        }
    });
}

function addEditEquipment_mediaDetails(body: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const message = messages(language);
            const { imagesUrl = [], videoUrl, termsUrl, contractUrl, equipmentId, isApproved } = body;
            if (imagesUrl.length) {
                imagesUrl.forEach(async (item: any) => {
                    if (item._id && item._id != '' && item._id != undefined && item._id != null) {
                        await equipment_mediaModel.updateOne({ _id: item._id, isDelete: false }, { equipment_imageUrl: item.equipment_imageUrl });
                    } else {
                        const obj: any = {
                            equipmentId: equipmentId,
                            isMediaDetails: true,
                            companyProviderId: userId
                        }
                        const count = await equipment_mediaModel.countDocuments({ media_type: 'image' })
                        obj.equipment_imageUrl = item.equipment_imageUrl
                        obj.media_type = 'image'
                        obj.uniqueId = identityGenerator("equipment_media", count)
                        await equipment_mediaModel.create(obj);
                    }
                });
            }
            if (videoUrl && videoUrl != '' && videoUrl != undefined && videoUrl != null) {
                const check_Video = await equipment_mediaModel.findOne({ equipmentId: equipmentId, isDelete: false, media_type: 'video' });
                if (check_Video) {
                    await equipment_mediaModel.updateOne({ _id: check_Video._id, isDelete: false }, { equipment_videoUrl: videoUrl });
                } else {
                    const obj: any = {
                        equipmentId: equipmentId,
                        isMediaDetails: true,
                        companyProviderId: userId
                    }
                    const count = await equipment_mediaModel.countDocuments({ media_type: 'video' })
                    obj.equipment_videoUrl = videoUrl
                    obj.media_type = 'video'
                    obj.uniqueId = identityGenerator("equipment_media", count)
                    await equipment_mediaModel.create(obj);
                }
            }
            if (termsUrl && termsUrl != '' && termsUrl != undefined && termsUrl != null) {
                const check_termUrl = await equipment_mediaModel.findOne({ equipmentId: equipmentId, isDelete: false, media_type: 'termsUrl' });
                if (check_termUrl) {
                    await equipment_mediaModel.updateOne({ _id: check_termUrl._id, isDelete: false }, { equipment_termsUrl: termsUrl });
                } else {
                    const obj: any = {
                        equipmentId: equipmentId,
                        companyProviderId: userId
                    }
                    const count = await equipment_mediaModel.countDocuments()
                    obj.equipment_termsUrl = termsUrl
                    obj.media_type = 'termsUrl'
                    obj.uniqueId = identityGenerator("equipment_media", count)
                    await equipment_mediaModel.create(obj);
                }
            }
            if (contractUrl && contractUrl != '' && contractUrl != undefined && contractUrl != null) {
                const check_contractUrl = await equipment_mediaModel.findOne({ equipmentId: equipmentId, isDelete: false, media_type: 'contractUrl' });
                if (check_contractUrl) {
                    await equipment_mediaModel.updateOne({ _id: check_contractUrl._id, isDelete: false }, { equipment_contractUrl: contractUrl });
                } else {
                    const obj: any = {
                        equipmentId: equipmentId,
                        companyProviderId: userId
                    }
                    const count = await equipment_mediaModel.countDocuments()
                    obj.equipment_contractUrl = contractUrl
                    obj.media_type = 'contractUrl'
                    obj.uniqueId = identityGenerator("equipment_media", count)
                    await equipment_mediaModel.create(obj);
                }
            }
            let equip_obj: any = {
                isMediaDetails: true
            }
            if (isApproved) {
                equip_obj = {
                    ...equip_obj,
                    isApproved: isApproved
                }
            }
            await equipmentModel.updateOne({ _id: equipmentId }, equip_obj);
            resolve({ success: true });
        } catch (err) {
            reject(err)
        }
    });
}

function addEditEquipment_addressDetails(body: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const message = messages(language);
            const { addressDetails = [], equipmentId } = body;
            if (addressDetails.length) {
                const total_selectEquipment = addressDetails.reduce((total: any, detail: any) => total + detail.availableEquipment, 0);
                const check_totalEquipments: any = await equipmentModel.findOne({ _id: equipmentId }, { total_equipmentAvailable: 1 });
                const total_equipmentAvailable = check_totalEquipments ? check_totalEquipments.total_equipmentAvailable : 0
                if (total_equipmentAvailable < total_selectEquipment) {
                    reject(new CustomError(message.maxEquipmentCount.replace('{{totalEquipments}}', check_totalEquipments.total_equipmentAvailable).replace('{{selectedEquipment}}', total_selectEquipment), StatusCodes.BAD_REQUEST))
                } else {
                    addressDetails.forEach(async (item: any) => {
                        if (item.addressId && item.addressId != '' && item.addressId != undefined && item.addressId != null) {
                            const data12 = await equipment_addressModel.updateOne({ _id: item.addressId }, item);
                        } else {
                            const obj: any = {
                                equipmentId: equipmentId,
                                companyProviderId: userId,
                                ...item
                            }
                            const count = await equipment_addressModel.countDocuments();
                            obj.uniqueId = identityGenerator("equipment_address", count)
                            await equipment_addressModel.create(obj);
                        }
                    });
                    await equipmentModel.updateOne({ _id: equipmentId }, { isaddressDetails: true });
                    resolve({ success: true });
                }
            } else {
                reject(new CustomError(message.addressRequired, StatusCodes.BAD_REQUEST));
            }
        } catch (err) {
            reject(err)
        }
    });
}

function delete_address(body: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { addressId, equipmentId } = body;
            await equipment_addressModel.updateMany({ _id: addressId, equipmentId: equipmentId, companyProviderId: userId }, { isDelete: true });
            resolve({ success: true });
        } catch (err) {
            reject(err)
        }
    });
}

function delete_images_videos(body: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { image_videosId, equipmentId } = body;
            await equipment_mediaModel.updateMany({ _id: image_videosId, equipmentId: equipmentId, media_type: { $in: ["image", "video"] }, companyProviderId: userId }, { isDelete: true });
            // deleteImage_from_S3Bucket(image_videosId, 'equipment')
            resolve({ success: true });
        } catch (err) {
            reject(err)
        }
    });
}

function equipmentDetails(params: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en', timezone = 'Asia/Calcutta' } = headers;
            const currentDate = moment().tz(timezone).format('YYYY-MM-DD')
            const message = messages(language);
            const order_message = message.not_allowed_delete_equip_vehicle.replace("{{type}}", 'equipment')
            const details: any = await equipmentModel.aggregate([
                {
                    $match: { companyProviderId: new Types.ObjectId(userId), _id: new Types.ObjectId(params.id), isDelete: false }
                },
                {
                    $lookup: {
                        from: 'equipment_medias',
                        localField: '_id',
                        foreignField: 'equipmentId',
                        as: 'mediaDetails',
                        pipeline: [
                            {
                                $match: { isDelete: false }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'equipment_addresses',
                        localField: '_id',
                        foreignField: 'equipmentId',
                        as: 'addressDetails',
                        pipeline: [
                            {
                                $match: { isDelete: false }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: "categoryId",
                        foreignField: "_id",
                        as: "categoryDetails",
                        pipeline: [
                            {
                                $addFields: {
                                    name: {
                                        $cond: {
                                            if: { $eq: [language, 'ar'] },
                                            then: '$ar_name',
                                            else: '$name'
                                        }
                                    },
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'sub_categories',
                        localField: "subCategoryId",
                        foreignField: "_id",
                        as: "subCategoryDetails",
                        pipeline: [
                            {
                                $addFields: {
                                    name: {
                                        $cond: {
                                            if: { $eq: [language, 'ar'] },
                                            then: '$ar_name',
                                            else: '$name'
                                        }
                                    },
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'sub_subcategories',
                        localField: "sub_subCategoryId",
                        foreignField: "_id",
                        as: "sub_subCategoryDetails",
                        pipeline: [
                            {
                                $addFields: {
                                    name: {
                                        $cond: {
                                            if: { $eq: [language, 'ar'] },
                                            then: '$ar_name',
                                            else: '$name'
                                        }
                                    },
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'bookings',
                        localField: "_id",
                        foreignField: "equipmentId",
                        as: "total_bookedEquipment",
                        pipeline: [
                            {
                                // $match: { isDelete: false, paymentStatus: 'paid', bookingStatus: { $nin: ['Pending', 'Cancelled', 'Completed'] } }
                                $match: { isDelete: false, paymentStatus: 'paid', order_startDate: { $lte: currentDate }, order_endDate: { $gte: currentDate }, bookingStatus: { $nin: ['Pending', 'Cancelled', 'Completed'] } }
                            },
                            {
                                $group: {
                                    _id: "$equipmentId",
                                    chosen_equipment: { $sum: "$chosen_equipment" }
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$total_bookedEquipment",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'equipment_specifications',
                        localField: "_id",
                        foreignField: "equipmentId",
                        as: "specifications",
                        pipeline: [
                            {
                                $match: {
                                    isDelete: false
                                }
                            },
                            {
                                $lookup: {
                                    from: "cat_specifications",
                                    foreignField: "_id",
                                    localField: "keyId",
                                    as: "keyDetails",
                                    pipeline: [
                                        {
                                            $project: {
                                                keyName: {
                                                    $cond: {
                                                        if: { $eq: [language, "ar"] },
                                                        then: "$ar_keyName",
                                                        else: "$keyName"
                                                    }
                                                }
                                            }
                                        },
                                    ]
                                }
                            },
                            {
                                $unwind: {
                                    path: "$keyDetails",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $lookup: {
                                    from: "cat_specification_values",
                                    foreignField: "_id",
                                    localField: "keyValueId",
                                    as: "keyValueDetails",
                                    pipeline: [
                                        {
                                            $project: {
                                                keyValue: {
                                                    $cond: {
                                                        if: { $eq: [language, "ar"] },
                                                        then: "$ar_keyValue",
                                                        else: "$keyValue"
                                                    }
                                                },
                                                isDelete: 1
                                            }
                                        },
                                    ]
                                }
                            },
                            {
                                $unwind: {
                                    path: "$keyValueDetails",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $project: {
                                    keyValue: 1,
                                    keyType: 1,
                                    keyValueDetails: "$keyValueDetails.keyValue",
                                    keyDetails: "$keyDetails.keyName",
                                    keyId: 1,
                                    keyValueId: 1,
                                    keyValue_status: "$keyValueDetails.isDelete"
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        any_order_running: {
                            $cond: {
                                if: { $gt: ['$total_bookedEquipment.chosen_equipment', 0] },
                                then: true,
                                else: false
                            }
                        },
                        order_message: order_message,
                        equipment_engineMake: {
                            $cond: {
                                if: { $eq: [language, 'ar'] },
                                then: '$ar_equipment_engineMake',
                                else: '$equipment_engineMake'
                            }
                        },
                        equipment_engineModel: {
                            $cond: {
                                if: { $eq: [language, 'ar'] },
                                then: '$ar_equipment_engineModel',
                                else: '$equipment_engineModel'
                            }
                        }
                    }
                },
                {
                    $project: {
                        total_bookedEquipment: 0
                    }
                }
            ]
            );
            resolve(details);
        } catch (err) {
            reject(err)
        }
    });
}

function equipmentList(query: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en', timezone = 'Asia/Calcutta' } = headers;
            const { page = 1, perPage = 10, search } = query;
            const message = messages(language);
            const order_message = message.not_allowed_delete_equip_vehicle.replace("{{type}}", 'equipment')
            let condition: any = {
                companyProviderId: new Types.ObjectId(userId),
                isDelete: false
            }
            const currentDate = moment().tz(timezone).format('YYYY-MM-DD')
            if (search) {
                condition = {
                    ...condition,
                    $or: [
                        {
                            equipmentName: { $regex: search, $options: 'i' }
                        },
                        {
                            ar_equipmentName: { $regex: search, $options: 'i' }
                        }
                    ]
                }
            }
            const [list, count] = await Promise.all([
                equipmentModel.aggregate([
                    {
                        $match: condition
                    },
                    {
                        $lookup: {
                            from: 'equipment_medias',
                            localField: '_id',
                            foreignField: 'equipmentId',
                            as: 'mediaDetails',
                            pipeline: [
                                {
                                    $match: { isDelete: false, media_type: 'image' }
                                },
                                {
                                    $project: {
                                        equipment_imageUrl: 1,
                                        media_type: 1
                                    }
                                },
                                {
                                    $limit: 1
                                }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: 'bookings',
                            localField: "_id",
                            foreignField: "equipmentId",
                            as: "total_bookedEquipment",
                            pipeline: [
                                {
                                    // $match: { isDelete: false, paymentStatus: 'paid', bookingStatus: { $nin: ['Pending', 'Cancelled', 'Completed'] } }
                                    $match: { isDelete: false, paymentStatus: 'paid', order_startDate: { $lte: currentDate }, order_endDate: { $gte: currentDate }, bookingStatus: { $nin: ['Pending', 'Cancelled', 'Completed'] } }
                                },
                                {
                                    $group: {
                                        _id: "$equipmentId",
                                        chosen_equipment: { $sum: "$chosen_equipment" }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: "$total_bookedEquipment",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $addFields: {
                            equipmentName: {
                                $cond: {
                                    if: { $eq: [language, 'ar'] },
                                    then: '$ar_equipmentName',
                                    else: '$equipmentName'
                                }
                            }
                        }
                    },
                    {
                        $addFields: {
                            "available_equipments": {
                                $subtract: ["$total_equipmentAvailable", { $ifNull: ["$total_bookedEquipment.chosen_equipment", 0] }]
                            },
                            "operational_equipments": { $ifNull: ['$total_bookedEquipment.chosen_equipment', 0] }
                        }
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $project: {
                            available_equipments: {
                                $cond: {
                                    if: { $lt: ["$available_equipments", 0] },
                                    then: 0,
                                    else: "$available_equipments"
                                }
                            },
                            any_order_running: {
                                $cond: {
                                    if: { $gt: ['$operational_equipments', 0] },
                                    then: true,
                                    else: false
                                }
                            },
                            order_message: order_message,
                            uniqueId: 1,
                            companyProviderId: 1,
                            isBasicDetails: 1,
                            isMediaDetails: 1,
                            isaddressDetails: 1,
                            equipmentName: 1,
                            equipmentPrice_perDay: 1,
                            total_equipmentAvailable: 1,
                            operational_equipments: 1,

                            mediaDetails: 1,
                            total_equipment_addresses: 1
                        }
                    },
                    {
                        $skip: (Number(page) * Number(perPage)) - Number(perPage)
                    },
                    {
                        $limit: Number(perPage)
                    }
                ]
                ),
                equipmentModel.aggregate([
                    {
                        $lookup: {
                            from: 'equipment_medias',
                            localField: '_id',
                            foreignField: 'equipmentId',
                            as: 'mediaDetails',
                            pipeline: [
                                {
                                    $match: { isDelete: false }
                                }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: 'equipment_addresses',
                            localField: '_id',
                            foreignField: 'equipmentId',
                            as: 'addressDetails',
                            pipeline: [
                                {
                                    $match: { isDelete: false }
                                }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: 'categories',
                            localField: "categoryId",
                            foreignField: "_id",
                            as: "categoryDetails"
                        }
                    },
                    {
                        $lookup: {
                            from: 'sub_categories',
                            localField: "sub_categoryId",
                            foreignField: "_id",
                            as: "subCategoryDetails"
                        }
                    },
                    {
                        $lookup: {
                            from: 'sub_subcategories',
                            localField: "sub_subCategoryId",
                            foreignField: "_id",
                            as: "sub_subCategoryDetails"
                        }
                    },
                    {
                        $match: condition
                    },
                    {
                        $count: "totalCount"
                    }
                ]
                )
            ]);
            resolve({ itemList: list, totalCount: count.length ? count[0].totalCount : 0 });
        } catch (err) {
            reject(err)
        }
    });
}

function deleteEquipment(params: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        let session: any
        try {
            session = await mongoose.startSession();
            session.startTransaction();  // Start the transaction
            const { language = 'en', timezone = 'Asia/Calcutta' } = headers;
            const message = messages(language);
            const currentDate = moment().tz(timezone).format('YYYY-MM-DD')
            const checkDetails: any = await equipmentModel.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId(params.id), companyProviderId: new Types.ObjectId(userId), isDelete: false
                    }
                },
                {
                    $lookup: {
                        from: 'equipment_medias',
                        localField: '_id',
                        foreignField: 'equipmentId',
                        as: 'mediaDetails',
                        pipeline: [
                            {
                                $match: { isDelete: false }
                            },
                            {
                                $count: "totalCount"
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'equipment_addresses',
                        localField: '_id',
                        foreignField: 'equipmentId',
                        as: 'addressDetails',
                        pipeline: [
                            {
                                $match: { isDelete: false }
                            },
                            {
                                $count: "totalCount"
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'bookings',
                        localField: "_id",
                        foreignField: "equipmentId",
                        as: "total_bookedEquipment",
                        pipeline: [
                            {
                                // $match: { isDelete: false, paymentStatus: 'paid', bookingStatus: { $nin: ['Pending', 'Cancelled', 'Completed'] } }
                                $match: { isDelete: false, paymentStatus: 'paid', order_startDate: { $lte: currentDate }, order_endDate: { $gte: currentDate }, bookingStatus: { $nin: ['Pending', 'Cancelled', 'Completed'] } }
                            },
                            {
                                $group: {
                                    _id: "$equipmentId",
                                    chosen_equipment: { $sum: "$chosen_equipment" }
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$total_bookedEquipment",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        any_order_running: {
                            $cond: {
                                if: { $gt: ['$total_bookedEquipment.chosen_equipment', 0] },
                                then: true,
                                else: false
                            }
                        },
                    }
                }
            ]);
            if (checkDetails) {
                if (checkDetails.length) {
                    if (checkDetails[0].any_order_running == false) {
                        if (checkDetails[0].mediaDetails.length) {
                            const delete_media = await equipment_mediaModel.updateMany({ equipmentId: checkDetails[0]._id, isDelete: false }, { isDelete: true });
                            if (delete_media.modifiedCount == 0) {
                                throw new CustomError(message.somethingwrong, StatusCodes.BAD_REQUEST);
                            }
                            // const image_videoList = checkDetails[0].mediaDetails
                            // deleteImages_from_S3Bucket(image_videosId,'equipment')

                        }
                        if (checkDetails[0].addressDetails.length) {
                            const delete_address = await equipment_addressModel.updateMany({ equipmentId: checkDetails[0]._id, isDelete: false }, { isDelete: true });
                            if (delete_address.modifiedCount == 0) {
                                throw new CustomError(message.somethingwrong, StatusCodes.BAD_REQUEST);
                            }
                        }
                        const delete_equipment1 = await equipmentModel.updateOne({ _id: checkDetails[0]._id, isDelete: false }, { isDelete: true });
                        if (delete_equipment1.modifiedCount == 0) {
                            throw new CustomError(message.somethingwrong, StatusCodes.BAD_REQUEST);
                        }
                        await session.commitTransaction();
                        resolve({ success: true });
                    } else {
                        reject(new CustomError(message.not_allowed_delete_equip_vehicle.replace('{{type}}', 'equipment'), StatusCodes.BAD_REQUEST));
                    }
                }
            } else {
                throw new CustomError(message.noDatafound, StatusCodes.NOT_FOUND);
            }
        } catch (err) {
            if (session) {
                await session.abortTransaction();
            }
            reject(err)
        }
    });
}

export default {
    addEquipment_basicDetails,
    editEquipment_basicDetails,
    addEditEquipment_mediaDetails,
    addEditEquipment_addressDetails,
    delete_images_videos,
    delete_address,
    equipmentDetails,
    equipmentList,
    deleteEquipment
} as const;