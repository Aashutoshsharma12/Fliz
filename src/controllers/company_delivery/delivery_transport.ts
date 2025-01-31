import { messages } from "@Custom_message";
import vehicle_addressModel from "@models/delivery_vehicleAddress";
import delivery_vehicleModel from "@models/delivery_vehicle";
import vehicle_mediaModel from "@models/delivery_vehicleMedia";
import { CustomError } from "@utils/errors";
import { identityGenerator } from "@utils/helpers";
import { StatusCodes } from "http-status-codes";
import mongoose, { Types } from "mongoose";
import moment from "moment-timezone";
import vehicle_specificationModel from "@models/delivery_vehicle_specification";

let add_specification = async (specifications: any, vehicleId: any) => {
    let obj: any = {
        vehicleId: vehicleId
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
            await vehicle_specificationModel.updateOne({ _id: data._id }, obj);
        else
            await vehicle_specificationModel.create(obj);
    }
}
function addVehicle_basicDetails(body: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { specifications } = body;
            const count = await delivery_vehicleModel.countDocuments();
            const obj = {
                ...body,
                company_deliveryId: userId,
                isBasicDetails: true,
                uniqueId: identityGenerator("delivery_vehicle", count)
            }
            const add = await delivery_vehicleModel.create(obj);
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

function editVehicle_basicDetails(body: any, userId: any, headers: any): Promise<any> {
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
                company_deliveryId: userId,
            }
            const check_vehicle = await delivery_vehicleModel.findOne({ _id: body.vehicleId, company_deliveryId: userId, isDelete: false }, { company_deliveryId: 1 });
            if (check_vehicle) {
                await delivery_vehicleModel.updateOne({ _id: body.vehicleId }, obj);
                if (specifications && specifications.length) {
                    add_specification(specifications, body.vehicleId)
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

function addEditVehicle_mediaDetails(body: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        let session: any
        try {
            session = await mongoose.startSession();
            session.startTransaction();
            const { language = 'en' } = headers;
            const message = messages(language);
            const { imagesUrl = [], videoUrl, termsUrl, contractUrl, vehicleId, isApproved } = body;
            if (Array.isArray(imagesUrl) && imagesUrl.length > 0) {
                const imageTask = imagesUrl.map(async (item: any) => {
                    if (item._id && item._id != '' && item._id != undefined && item._id != null) {
                        await vehicle_mediaModel.updateOne({ _id: item._id, isDelete: false }, { vehicle_imageUrl: item.vehicle_imageUrl });
                    } else {
                        const obj: any = {
                            vehicleId: vehicleId,
                            isMediaDetails: true,
                            company_deliveryId: userId
                        }
                        const count = await vehicle_mediaModel.countDocuments({ media_type: 'image' })
                        obj.vehicle_imageUrl = item.vehicle_imageUrl
                        obj.media_type = 'image'
                        obj.uniqueId = identityGenerator("vehicle_media", count)
                        await vehicle_mediaModel.create(obj);
                    }
                });
                await Promise.all(imageTask);
            }
            if (videoUrl && videoUrl != '' && videoUrl != undefined && videoUrl != null) {
                console.log(videoUrl, "eooee")
                const check_Video = await vehicle_mediaModel.findOne({ vehicleId: vehicleId, isDelete: false, media_type: 'video' });
                if (check_Video) {
                    await vehicle_mediaModel.updateOne({ _id: check_Video._id, isDelete: false }, { vehicle_videoUrl: videoUrl });
                } else {
                    const obj: any = {
                        vehicleId: vehicleId,
                        isMediaDetails: true,
                        company_deliveryId: userId
                    }
                    const count = await vehicle_mediaModel.countDocuments({ media_type: 'video' })
                    obj.vehicle_videoUrl = videoUrl
                    obj.media_type = 'video'
                    obj.uniqueId = identityGenerator("vehicle_media", count)
                    await vehicle_mediaModel.create(obj);
                }
            }
            if (termsUrl && termsUrl != '' && termsUrl != undefined && termsUrl != null) {
                const check_termUrl = await vehicle_mediaModel.findOne({ vehicleId: vehicleId, isDelete: false, media_type: 'termsUrl' });
                if (check_termUrl) {
                    await vehicle_mediaModel.updateOne({ _id: check_termUrl._id, isDelete: false }, { vehicle_termsUrl: termsUrl });
                } else {
                    const obj: any = {
                        vehicleId: vehicleId,
                        company_deliveryId: userId
                    }
                    const count = await vehicle_mediaModel.countDocuments()
                    obj.vehicle_termsUrl = termsUrl
                    obj.media_type = 'termsUrl'
                    obj.uniqueId = identityGenerator("vehicle_media", count)
                    await vehicle_mediaModel.create(obj);
                }
            }
            if (contractUrl && contractUrl != '' && contractUrl != undefined && contractUrl != null) {
                const check_contractUrl = await vehicle_mediaModel.findOne({ vehicleId: vehicleId, isDelete: false, media_type: 'contractUrl' });
                if (check_contractUrl) {
                    await vehicle_mediaModel.updateOne({ _id: check_contractUrl._id, isDelete: false }, { vehicle_contractUrl: contractUrl });
                } else {
                    const obj: any = {
                        vehicleId: vehicleId,
                        company_deliveryId: userId
                    }
                    const count = await vehicle_mediaModel.countDocuments()
                    obj.vehicle_contractUrl = contractUrl
                    obj.media_type = 'contractUrl'
                    obj.uniqueId = identityGenerator("vehicle_media", count)
                    await vehicle_mediaModel.create(obj);
                }
            }
            let vehicle_obj: any = {
                isMediaDetails: true
            }
            if (isApproved) {
                vehicle_obj = {
                    ...vehicle_obj,
                    isApproved: isApproved
                }
            }
            await delivery_vehicleModel.updateOne({ _id: vehicleId }, vehicle_obj);
            session.commitTransaction();
            resolve({ success: true });
        } catch (err) {
            if (session) {
                session.abortTransaction();
            }
            reject(err)
        }
    });
}

function addEditVehicle_addressDetails(body: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        let session: any
        try {
            session = await mongoose.startSession();
            session.startTransaction();
            const { language = 'en' } = headers;
            const message = messages(language);
            const { addressDetails = [], vehicleId } = body;
            if (addressDetails.length) {
                const total_selectVehicle = addressDetails.reduce((total: any, detail: any) => total + detail.availableTruck, 0);
                const check_totalVehicles: any = await delivery_vehicleModel.findOne({ _id: vehicleId }, { total_truckAvailable: 1 });
                const total_truckAvailable = check_totalVehicles ? check_totalVehicles.total_truckAvailable : 0
                if (total_truckAvailable < total_selectVehicle) {
                    reject(new CustomError(message.maxVehicleCount.replace('{{totalVehicles}}', check_totalVehicles.total_truckAvailable).replace('{{selectedVehicle}}', total_selectVehicle), StatusCodes.BAD_REQUEST))
                } else {
                    const updateTasks = addressDetails.map(async (item: any) => {
                        if (item.addressId && item.addressId != '' && item.addressId != undefined && item.addressId != null) {
                            await vehicle_addressModel.updateOne({ _id: item.addressId }, item);
                        } else {
                            const obj: any = {
                                vehicleId: vehicleId,
                                company_deliveryId: userId,
                                ...item
                            }
                            const count = await vehicle_addressModel.countDocuments();
                            obj.uniqueId = identityGenerator("vehicle_address", count)
                            await vehicle_addressModel.create(obj);
                        }
                    });
                    await Promise.all(updateTasks);
                    await delivery_vehicleModel.updateOne({ _id: vehicleId }, { isaddressDetails: true });
                    session.commitTransaction()
                    resolve({ success: true });
                }
            } else {
                throw new CustomError(message.addressRequired, StatusCodes.BAD_REQUEST);
            }
        } catch (err) {
            if (session) {
                session.abortTransaction();
            }
            reject(err)
        }
    });
}

function delete_images_videos(body: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { image_videosId, vehicleId } = body;
            await vehicle_mediaModel.updateMany({ _id: image_videosId, media_type: { $in: ["image", "video"] }, vehicleId: vehicleId, company_deliveryId: userId }, { isDelete: true });
            // deleteImage_from_S3Bucket(image_videosId,'vehicle')
            resolve({ success: true });
        } catch (err) {
            reject(err)
        }
    });
}

function delete_address(body: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { addressId, vehicleId } = body;
            await vehicle_addressModel.updateOne({ _id: addressId, vehicleId: vehicleId, company_deliveryId: userId }, { isDelete: true });
            resolve({ success: true });
        } catch (err) {
            reject(err)
        }
    });
}

function vehicleDetails(params: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en', timezone = 'Asia/Calcutta' } = headers;
            const currentDate = moment().tz(timezone).format('YYYY-MM-DD');
            const message = messages(language);
            const order_message = message.not_allowed_delete_equip_vehicle.replace("{{type}}", 'vehicle')
            const details = await delivery_vehicleModel.aggregate([
                {
                    $match: { company_deliveryId: new Types.ObjectId(userId), _id: new Types.ObjectId(params.id), isDelete: false }
                },
                {
                    $lookup: {
                        from: 'vehicle_medias',
                        localField: '_id',
                        foreignField: 'vehicleId',
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
                        from: 'vehicle_addresses',
                        localField: '_id',
                        foreignField: 'vehicleId',
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
                        from: 'bookings',
                        localField: "_id",
                        foreignField: "vehicleId",
                        as: "total_bookedVehilce",
                        pipeline: [
                            {
                                // $match: { isDelete: false, paymentStatus: 'paid', bookingStatus: { $nin: ['Pending', 'Cancelled', 'Completed'] } }
                                $match: { isDelete: false, paymentStatus: 'paid', order_startDate: { $lte: currentDate }, order_endDate: { $gte: currentDate }, bookingStatus: { $nin: ['Pending', 'Cancelled', 'Completed'] } }
                            },
                            {
                                $group: {
                                    _id: "$vehicleId",
                                    chosen_equipment: { $sum: "$chosen_equipment" }
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$total_bookedVehilce",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'vehilce_specifications',
                        localField: "_id",
                        foreignField: "vehicleId",
                        as: "specifications",
                        pipeline: [
                            {
                                $match: {
                                    isDelete: false
                                }
                            },
                            {
                                $lookup: {
                                    from: "delivery_specifications",
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
                                    from: "delivery_specification_values",
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
                                                }
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
                                    keyValueId: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        any_order_running: {
                            $cond: {
                                if: { $gt: ['$total_bookedVehilce.chosen_equipment', 0] },
                                then: true,
                                else: false
                            }
                        },
                        order_message: order_message,
                        type: {
                            $cond: {
                                if: { $eq: [language, 'ar'] },
                                then: '$ar_type',
                                else: '$type'
                            }
                        },
                        vehicle_engineMake: {
                            $cond: {
                                if: { $eq: [language, 'ar'] },
                                then: '$ar_vehicle_engineMake',
                                else: '$vehicle_engineMake'
                            }
                        },
                        vehicle_engineModel: {
                            $cond: {
                                if: { $eq: [language, 'ar'] },
                                then: '$ar_vehicle_engineModel',
                                else: '$vehicle_engineModel'
                            }
                        },
                    }
                },
                {
                    $project: {
                        total_bookedVehilce: 0
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

function vehicleDetails_web(params: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en', timezone = 'Asia/Calcutta' } = headers;
            const message = messages(language);
            const currentDate = moment().tz(timezone).format('YYYY-MM-DD')
            const order_message = message.not_allowed_delete_equip_vehicle.replace("{{type}}", 'vehicle')
            const details = await delivery_vehicleModel.aggregate([
                {
                    $match: { company_deliveryId: new Types.ObjectId(userId), _id: new Types.ObjectId(params.id), isDelete: false }
                },
                {
                    $lookup: {
                        from: 'vehicle_medias',
                        localField: '_id',
                        foreignField: 'vehicleId',
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
                        from: 'vehicle_addresses',
                        localField: '_id',
                        foreignField: 'vehicleId',
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
                        from: 'bookings',
                        localField: "_id",
                        foreignField: "vehicleId",
                        as: "total_bookedVehilce",
                        pipeline: [
                            {
                                // $match: { isDelete: false, paymentStatus: 'paid', bookingStatus: { $nin: ['Pending', 'Cancelled', 'Completed'] } }
                                $match: { isDelete: false, paymentStatus: 'paid', order_startDate: { $lte: currentDate }, order_endDate: { $gte: currentDate }, bookingStatus: { $nin: ['Pending', 'Cancelled', 'Completed'] } }
                            },
                            {
                                $group: {
                                    _id: "$vehicleId",
                                    chosen_equipment: { $sum: "$chosen_equipment" }
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$total_bookedVehilce",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'vehilce_specifications',
                        localField: "_id",
                        foreignField: "vehicleId",
                        as: "specifications",
                        pipeline: [
                            {
                                $match: {
                                    isDelete: false
                                }
                            },
                            {
                                $lookup: {
                                    from: "delivery_specifications",
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
                                    from: "delivery_specification_values",
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
                                if: { $gt: ['$total_bookedVehilce.chosen_equipment', 0] },
                                then: true,
                                else: false
                            }
                        },
                        order_message: order_message
                    }
                },
                {
                    $project: {
                        total_bookedVehilce: 0
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

function vehicleList(query: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en', timezone = 'Asia/Calcutta' } = headers;
            const message: any = messages(language);
            const { page = 1, perPage = 10, search } = query;
            let condition: any = {
                company_deliveryId: new Types.ObjectId(userId),
                isDelete: false
            }
            const currentDate = moment().tz(timezone).format('YYYY-MM-DD')
            const order_message = message.not_allowed_delete_equip_vehicle.replace("{{type}}", 'vehicle')
            if (search) {
                condition = {
                    ...condition,
                    type: { $regex: search, $options: 'i' }
                }
            }
            const [list, totalCount] = await Promise.all([
                delivery_vehicleModel.aggregate([
                    {
                        $match: condition
                    },
                    {
                        $lookup: {
                            from: 'vehicle_medias',
                            localField: '_id',
                            foreignField: 'vehicleId',
                            as: 'mediaDetails',
                            pipeline: [
                                {
                                    $match: { isDelete: false, media_type: 'image' }
                                },
                                {
                                    $project: {
                                        vehicle_imageUrl: 1,
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
                            from: 'vehicle_addresses',
                            localField: '_id',
                            foreignField: 'vehicleId',
                            as: 'addressDetails',
                            pipeline: [
                                {
                                    $match: { isDelete: false }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            type: {
                                $cond: {
                                    if: { $eq: [language, 'ar'] },
                                    then: '$ar_type',
                                    else: '$type'
                                }
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'bookings',
                            localField: "_id",
                            foreignField: "vehicleId",
                            as: "total_bookedVehicles",
                            pipeline: [
                                {
                                    // $match: { isDelete: false, paymentStatus: 'paid', bookingStatus: { $nin: ['Pending', 'Cancelled', 'Completed'] } }
                                    $match: { isDelete: false, paymentStatus: 'paid', order_startDate: { $lte: currentDate }, order_endDate: { $gte: currentDate }, bookingStatus: { $nin: ['Pending', 'Cancelled', 'Completed'] } }
                                },
                                {
                                    $group: {
                                        _id: "$vehicleId",
                                        chosen_equipment: { $sum: "$chosen_equipment" }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: "$total_bookedVehicles",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $addFields: {
                            "available_trucks": {
                                $subtract: ["$total_truckAvailable", { $ifNull: ["$total_bookedVehicles.chosen_equipment", 0] }]
                            },
                            "operational_trucks": { $ifNull: ['$total_bookedVehicles.chosen_equipment', 0] },
                            // order_message: message_order,
                        }
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $project: {
                            uniqueId: 1,
                            company_deliveryId: 1,
                            isBasicDetails: 1,
                            isMediaDetails: 1,
                            isaddressDetails: 1,
                            type: 1,
                            priceInside_city_perDay: 1,
                            priceInoutSide_city_perKm: 1,
                            total_truckAvailable: 1,
                            mediaDetails: 1,
                            available_trucks: {
                                $cond: {
                                    if: { $lt: ["$available_trucks", 0] },
                                    then: 0,
                                    else: "$available_trucks"
                                }
                            },
                            any_order_running: {
                                $cond: {
                                    if: { $gt: ['$operational_trucks', 0] },
                                    then: true,
                                    else: false
                                }
                            },
                            order_message: order_message,
                            operational_trucks: 1,
                            isRepeatingDelivery: 1,
                            repeatingDeliveryAmount: 1
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
                delivery_vehicleModel.aggregate([
                    {
                        $match: condition
                    },
                    {
                        $lookup: {
                            from: 'vehicle_medias',
                            localField: '_id',
                            foreignField: 'vehicleId',
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
                            from: 'vehicle_addresses',
                            localField: '_id',
                            foreignField: 'vehicleId',
                            as: 'addressDetails',
                            pipeline: [
                                {
                                    $match: { isDelete: false }
                                }
                            ]
                        }
                    },
                    {
                        $count: "totalCount"
                    }
                ]
                )
            ]);
            resolve({ itemList: list, totalCount: totalCount.length ? totalCount[0].totalCount : 0 });
        } catch (err) {
            reject(err)
        }
    });
}

function deleteVehicle(params: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        let session: any
        try {
            session = await mongoose.startSession();
            session.startTransaction();  // Start the transaction
            const { language = 'en', timezone = 'Asia/Calcutta' } = headers;
            const message = messages(language);
            const currentDate = moment().tz(timezone).format('YYYY-MM-DD')
            const checkDetails: any = await delivery_vehicleModel.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId(params.id), company_deliveryId: new Types.ObjectId(userId), isDelete: false
                    }
                },
                {
                    $lookup: {
                        from: 'vehicle_medias',
                        localField: '_id',
                        foreignField: 'vehicleId',
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
                // {
                //     $project:{
                //         ""
                //     }
                // }
                {
                    $lookup: {
                        from: 'vehicle_addresses',
                        localField: '_id',
                        foreignField: 'vehicleId',
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
                        foreignField: "vehicleId",
                        as: "total_bookedVehilce",
                        pipeline: [
                            {
                                // $match: { isDelete: false, paymentStatus: 'paid', bookingStatus: { $nin: ['Pending', 'Cancelled', 'Completed'] } }
                                $match: { isDelete: false, paymentStatus: 'paid', order_startDate: { $lte: currentDate }, order_endDate: { $gte: currentDate }, bookingStatus: { $nin: ['Pending', 'Cancelled', 'Completed'] } }
                            },
                            {
                                $group: {
                                    _id: "$vehicleId",
                                    chosen_equipment: { $sum: "$chosen_equipment" }
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$total_bookedVehilce",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        any_order_running: {
                            $cond: {
                                if: { $gt: ['$total_bookedVehilce.chosen_equipment', 0] },
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
                            const delete_media = await vehicle_mediaModel.updateMany({ vehicleId: checkDetails[0]._id, isDelete: false }, { isDelete: true });
                            if (delete_media.modifiedCount == 0) {
                                throw new CustomError(message.somethingwrong, StatusCodes.BAD_REQUEST);
                            }
                        }
                        if (checkDetails[0].addressDetails.length) {
                            const delete_address = await vehicle_addressModel.updateMany({ vehicleId: checkDetails[0]._id, isDelete: false }, { isDelete: true });
                            if (delete_address.modifiedCount == 0) {
                                throw new CustomError(message.somethingwrong, StatusCodes.BAD_REQUEST);
                            }
                        }
                        const delete_vehicle = await delivery_vehicleModel.updateOne({ _id: checkDetails[0]._id, isDelete: false }, { isDelete: true });
                        if (delete_vehicle.modifiedCount == 0) {
                            throw new CustomError(message.somethingwrong, StatusCodes.BAD_REQUEST);
                        }
                        await session.commitTransaction();
                        resolve({ success: true });
                    } else {
                        reject(new CustomError(message.not_allowed_delete_equip_vehicle.replace('{{type}}', 'vehicle'), StatusCodes.BAD_REQUEST));
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
    addVehicle_basicDetails,
    editVehicle_basicDetails,
    addEditVehicle_mediaDetails,
    addEditVehicle_addressDetails,
    delete_images_videos,
    delete_address,
    vehicleDetails,
    vehicleList,
    deleteVehicle,
    vehicleDetails_web
} as const;