import { messages } from "@Custom_message";
import delivery_vehicleModel from "@models/delivery_vehicle";
import vehicle_addressModel from "@models/delivery_vehicleAddress";
import equipment_addressModel from "@models/equipment_address";
import equipmentModel from "@models/equipment";
import user_renter_delivery_Model from "@models/user";
import user_visitModal from "@models/user_visit";
import mongoose, { Types } from "mongoose";
const ObjectId = mongoose.Types.ObjectId
import categoryModel from "@models/category";
import guestUserModal from "@models/guest_user";
import userSessionModel from "@models/userSession";
import { generate_accessToken, generate_refreshToken } from "@utils/helpers";
import { CustomError } from "@utils/errors";
import { StatusCodes } from "http-status-codes";
import faqModel from "@models/faq";
import capacityModel from "@models/vehicle_capacity";
import { sub_categoryModel, sub_subCategoryModel, vehicle_sizeTypeModel } from "@models/index";
import bookingModel from "@models/booking";
import moment from "moment-timezone";

function create_guestUser(headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { timezone = 'Asia/Calcutta', devicetype, devicetoken, language = "en", currentversion, deviceip } = headers;
            const message = messages(language);
            const create_guestUser: any = await guestUserModal.create({});
            if (create_guestUser) {
                const session_Object = {
                    userId: create_guestUser._id,
                    timezone: timezone ? timezone : "Asia/Calcutta",
                    deviceType: devicetype ? devicetype : "ios",
                    deviceToken: devicetoken ? devicetoken : "",
                    deviceIp: deviceip ? deviceip : "",
                    language: language ? language : "en",
                    currentVersion: currentversion ? currentversion : "",
                    role: create_guestUser.role,
                    guestToken: generate_refreshToken(create_guestUser._id, create_guestUser.role)
                };
                await userSessionModel.create(session_Object);
                const responseObj = create_guestUser.toObject();
                responseObj.guestToken = session_Object.guestToken;
                resolve(responseObj);
            } else {
                reject(new CustomError(message.somethingwrong, StatusCodes.BAD_REQUEST));
            }
        } catch (err) {
            reject(err);
        }
    });
}

function add_guestUserActivity(userId: any, body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { timezone = 'Asia/Calcutta', language = "en" } = headers;
            const message = messages(language);
            const { equipmentId, vehicleId } = body;
            if (equipmentId) {
                body.vehicleId = ""
            }
            if (vehicleId) {
                body.equipmentId = ""
            }
            const details: any = await guestUserModal.findOneAndUpdate({ _id: userId }, body, { new: true });
            resolve(details);
        } catch (err) {
            reject(err);
        }
    });
}

function categoryList(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const { role, companyProviderId } = query;
            let cond = {
                isDelete: false,
                isActive: true
            }
            let equipment_cond: any = {
                ...cond,
                isApproved: true,
                isBasicDetails: true,
                isMediaDetails: true,
                isaddressDetails: true
            }
            let pipeline: any = [
                {
                    $match: cond
                },
            ]
            if (role == 'user') {
                if (companyProviderId) {
                    equipment_cond = {
                        ...equipment_cond,
                        companyProviderId: new mongoose.Types.ObjectId(companyProviderId)
                    }
                }
                pipeline = [...pipeline, ...[{
                    $lookup: {
                        foreignField: "categoryId",
                        localField: "_id",
                        from: "equipment",
                        as: "equipmentList",
                        pipeline: [
                            {
                                $match: equipment_cond
                            },
                            {
                                $group: {
                                    _id: "$companyProviderId"
                                }
                            },
                            {
                                $lookup: {
                                    foreignField: "_id",
                                    localField: "_id",
                                    as: "companyDetails",
                                    from: "user_renter_deliveries",
                                    pipeline: [
                                        {
                                            $match: cond
                                        }
                                    ]
                                }
                            },
                            {
                                $unwind: "$companyDetails"
                            }
                        ]
                    }
                },
                {
                    $match: {
                        "equipmentList": { $ne: [] }
                    }
                },]]
            }
            pipeline = [...pipeline, ...[{
                $project: {
                    name: {
                        $cond: {
                            if: { $eq: [language, 'ar'] },
                            then: '$ar_name',
                            else: '$name'
                        },
                    },
                    image: 1
                }
            }]]
            const list = await categoryModel.aggregate(pipeline);
            resolve(list);
        } catch (err) {
            reject(err)
        }
    });
}

function sub_categoryListByCatId_forDropdrown(params: any, query: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const { role, companyProviderId } = query;
            let cond = {
                categoryId: new Types.ObjectId(params.id),
                isDelete: false,
                isActive: true
            }
            let equipment_cond: any = {
                ...cond,
                isApproved: true,
                isBasicDetails: true,
                isMediaDetails: true,
                isaddressDetails: true
            }
            let pipeline: any = [
                {
                    $match: cond
                },
            ]
            if (role == 'user') {
                if (companyProviderId) {
                    equipment_cond = {
                        ...equipment_cond,
                        companyProviderId: new mongoose.Types.ObjectId(companyProviderId)
                    }
                }
                pipeline = [...pipeline, ...[
                    {
                        $lookup: {
                            foreignField: "subCategoryId",
                            localField: "_id",
                            from: "equipment",
                            as: "equipmentList",
                            pipeline: [
                                {
                                    $match: equipment_cond
                                },
                                {
                                    $group: {
                                        _id: "$companyProviderId"
                                    }
                                },
                                {
                                    $lookup: {
                                        foreignField: "_id",
                                        localField: "_id",
                                        as: "companyDetails",
                                        from: "user_renter_deliveries",
                                        pipeline: [
                                            {
                                                $match: {
                                                    isDelete: false,
                                                    isActive: true
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    $unwind: "$companyDetails"
                                }
                            ]
                        }
                    },
                    {
                        $match: {
                            "equipmentList": { $ne: [] }
                        }
                    }
                ]]
            }
            pipeline = [...pipeline, ...[{
                $project: {
                    name: {
                        $cond: {
                            if: { $eq: [language, 'ar'] },
                            then: '$ar_name',
                            else: '$name'
                        },
                    },
                    categoryId: 1,
                    image: 1
                }
            }]]
            const list = await sub_categoryModel.aggregate(pipeline);
            resolve(list);
        } catch (err) {
            reject(err)
        }
    });
}

function subSub_categoryListBySubCatId_forDropdrown(params: any, query: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const { role, companyProviderId } = query;
            let cond = {
                subCategoryId: new Types.ObjectId(params.id),
                isDelete: false,
                isActive: true
            }
            let equipment_cond: any = {
                ...cond,
                isApproved: true,
                isBasicDetails: true,
                isMediaDetails: true,
                isaddressDetails: true
            }
            let pipeline: any = [
                {
                    $match: cond
                },
            ]
            if (role == 'user') {
                if (companyProviderId) {
                    equipment_cond = {
                        ...equipment_cond,
                        companyProviderId: new mongoose.Types.ObjectId(companyProviderId)
                    }
                }
                pipeline = [...pipeline, ...[
                    {
                        $lookup: {
                            foreignField: "sub_subCategoryId",
                            localField: "_id",
                            from: "equipment",
                            as: "equipmentList",
                            pipeline: [
                                {
                                    $match: equipment_cond
                                },
                                {
                                    $group: {
                                        _id: "$companyProviderId"
                                    }
                                },
                                {
                                    $lookup: {
                                        foreignField: "_id",
                                        localField: "_id",
                                        as: "companyDetails",
                                        from: "user_renter_deliveries",
                                        pipeline: [
                                            {
                                                $match: {
                                                    isDelete: false,
                                                    isActive: true
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    $unwind: "$companyDetails"
                                }
                            ]
                        }
                    },
                    {
                        $match: {
                            "equipmentList": { $ne: [] }
                        }
                    }
                ]]
            }
            pipeline = [...pipeline, ...[{
                $project: {
                    name: {
                        $cond: {
                            if: { $eq: [language, 'ar'] },
                            then: '$ar_name',
                            else: '$name'
                        },
                    },
                    subCategoryId: 1,
                    image: 1
                }
            }]]
            const list = await sub_subCategoryModel.aggregate(pipeline);
            resolve(list);
        } catch (err) {
            reject(err)
        }
    });
}

/***
 * For Delivery add truck
 */
function vehicle_sizeTypeList(userId: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const { type = 'Heavy', company_deliveryId } = query;
            let cond = {
                isDelete: false,
                isActive: true,
                delivery_type_name: type

            }
            let vehicle_cond: any = {
                isDelete: false,
                isActive: true,
                isApproved: true,
                isBasicDetails: true,
                isMediaDetails: true,
                isaddressDetails: true
            }
            if (company_deliveryId) {
                vehicle_cond = {
                    ...vehicle_cond,
                    company_deliveryId: new mongoose.Types.ObjectId(company_deliveryId)
                }
            }
            const list = await vehicle_sizeTypeModel.aggregate([
                {
                    $match: cond
                },
                {
                    $lookup: {
                        foreignField: "sizeType",
                        localField: "name",
                        from: "delivery_vehicles",
                        as: "delivery_vehicleList",
                        pipeline: [
                            {
                                $match: vehicle_cond
                            },
                            {
                                $group: {
                                    _id: "$company_deliveryId"
                                }
                            },
                            {
                                $lookup: {
                                    foreignField: "_id",
                                    localField: "_id",
                                    as: "companyDetails",
                                    from: "user_renter_deliveries",
                                    pipeline: [
                                        {
                                            $match: {
                                                isDelete: false,
                                                isActive: true
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $unwind: "$companyDetails"
                            }
                        ]
                    }
                },
                {
                    $match: {
                        "delivery_vehicleList": { $ne: [] }
                    }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $project: {
                        delivery_vehicleList: 0
                    }
                }
            ]);
            resolve(list);
        } catch (err) {
            reject(err)
        }
    });
}

/***
 * For User Home Page 
 */
function vehicle_load_capacityList(userId: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const { role, type, sizeType, company_deliveryId } = query
            let cond = {
                isDelete: false,
                isActive: true
            }
            let vehicle_cond: any = {
                ...cond,
                isApproved: true,
                isBasicDetails: true,
                isMediaDetails: true,
                isaddressDetails: true,
                sizeType: sizeType,
                type: type
            }
            if (company_deliveryId) {
                vehicle_cond = {
                    ...vehicle_cond,
                    company_deliveryId: new mongoose.Types.ObjectId(company_deliveryId)
                }
            }
            let pipeline: any = [
                {
                    $match: cond
                },
                {
                    $lookup: {
                        foreignField: "loadingCapacity",
                        localField: "capacity",
                        from: "delivery_vehicles",
                        as: "delivery_vehicleList",
                        pipeline: [
                            {
                                $match: vehicle_cond
                            },
                            {
                                $group: {
                                    _id: "$company_deliveryId"
                                }
                            },
                            {
                                $lookup: {
                                    foreignField: "_id",
                                    localField: "_id",
                                    as: "companyDetails",
                                    from: "user_renter_deliveries",
                                    pipeline: [
                                        {
                                            $match: {
                                                isDelete: false,
                                                isActive: true
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $unwind: "$companyDetails"
                            }
                        ]
                    }
                },
                {
                    $match: {
                        "delivery_vehicleList": { $ne: [] }
                    }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $project: {
                        delivery_vehicleList: 0
                    }
                }
            ]
            const list = await capacityModel.aggregate(pipeline)
            resolve(list);
        } catch (err) {
            reject(err)
        }
    });
}

function renter_deliveryList(query: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const { perPage = 10, page = 1, type, sizeType, loadingCapacity, role = "delivery", catId, subCatId, sub_subCatId, location, startDate, endDate } = query;
            let cond: any = {
                isDelete: false,
                isActive: true,
                isApproved: true,
                isBasicDetails: true,
                isMediaDetails: true,
                isaddressDetails: true
            }
            if (role == 'delivery') {
                if (type && type != '' && type != null && type != undefined) {
                    cond.type = type
                }
                if (sizeType && sizeType != '' && sizeType != null && sizeType != undefined) {
                    cond[language == 'en' ? 'sizeType' : 'ar_sizeType'] = sizeType
                    // cond.sizeType = sizeType
                }
                if (loadingCapacity && loadingCapacity != '' && loadingCapacity != null && loadingCapacity != undefined) {
                    cond.loadingCapacity = loadingCapacity
                }
                const [list, count] = await Promise.all([
                    await user_renter_delivery_Model.aggregate([
                        {
                            $match: { role: 'delivery_user', isActive: true, isDelete: false, isVerified: true }
                        },
                        {
                            $lookup: {
                                localField: "_id",
                                foreignField: "company_deliveryId",
                                as: "vehicleList",
                                from: "delivery_vehicles",
                                pipeline: [
                                    {
                                        $match: cond
                                    }
                                ]
                            }
                        },
                        {
                            $lookup: {
                                localField: "_id",
                                foreignField: "companyProviderId",
                                as: "ratingDetails",
                                from: "rating_reviews",
                                pipeline: [
                                    {
                                        $group: {
                                            _id: '$companyProviderId',
                                            averageRating: { $avg: "$rating" }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $unwind: {
                                path: "$ratingDetails",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            // Add fields to count vehicles and check for priceBreakable
                            $addFields: {
                                vehicleCount: { $size: "$vehicleList" },  // Count total vehicles
                                priceBreakable: {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: "$vehicleList",
                                                    as: "vehicle",
                                                    cond: { $eq: ["$$vehicle.isPriceBreaking", true] }  // Filter vehicles with priceBreakable = true
                                                }
                                            }
                                        },
                                        0  // Check if the size is greater than 0
                                    ]
                                },
                                company_rating: { $ifNull: ['$ratingDetails.averageRating', 0] }
                            }
                        },
                        {
                            $match: {
                                vehicleCount: { $gt: 0 }
                            }
                        },
                        {
                            $project: {
                                ratingDetails: 0,
                                password: 0,
                                certificate_achievement: 0,
                                company_license_frontSide: 0,
                                company_license_backSide: 0,
                                driving_license_frontSide: 0,
                                driving_license_backSide: 0,
                                truck_license_frontSide: 0,
                                truck_license_backSide: 0,
                                isNotification: 0,
                                isTerm_condition: 0,
                                isDelete: 0,
                                isActive: 0,
                                createdAt: 0,
                                updatedAt: 0,
                                vehicleList: 0,
                                email: 0,
                                sub_subCatId: 0,
                                subCatId: 0,
                                catId: 0
                            }
                        },
                        {
                            $skip: Number(page * perPage) - Number(perPage)
                        },
                        {
                            $limit: Number(perPage)
                        }
                    ]),
                    await user_renter_delivery_Model.aggregate([
                        {
                            $match: { role: 'delivery_user', isActive: true, isDelete: false, isVerified: true }
                        },
                        {
                            $lookup: {
                                localField: "_id",
                                foreignField: "company_deliveryId",
                                as: "vehicleList",
                                from: "delivery_vehicles",
                                pipeline: [
                                    {
                                        $match: cond
                                    },
                                    {
                                        $count: "vehicleCount"
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                vehicleCount: { $arrayElemAt: ["$vehicleList.vehicleCount", 0] }
                            }
                        },
                        {
                            $match: {
                                vehicleCount: { $gt: 0 }
                            }
                        },
                        {
                            $count: "totalCount"
                        }
                    ])
                ])
                resolve({ itemList: list, totalCount: count.length ? count[0].totalCount : 0 });
            } else {
                if (catId && catId != '' && catId != null && catId != undefined) {
                    cond.categoryId = new ObjectId(catId)
                }
                if (subCatId && subCatId != '' && subCatId != null && subCatId != undefined) {
                    cond.subCategoryId = new ObjectId(subCatId)
                }
                if (sub_subCatId && sub_subCatId != '' && sub_subCatId != null && sub_subCatId != undefined) {
                    cond.sub_subCategoryId = new ObjectId(sub_subCatId)
                }
                let obj_cond: any = {
                    role: 'renter_user',
                    isActive: true,
                    isDelete: false,
                    isVerified: true
                }
                if (location) {
                    obj_cond = {
                        ...obj_cond,
                        $or: [
                            {
                                address: location
                            },
                            {
                                city: location
                            },
                            {
                                state: location
                            }
                        ]
                    }
                }
                let order_cond: any = {
                    isDelete: false,
                    paymentStatus: 'paid',
                    bookingStatus: { $nin: ['Cancelled', 'Completed', 'Pending'] }
                }
                if (startDate && endDate) {
                    order_cond = {
                        ...order_cond,
                        order_startDate: { $gte: startDate, $lte: endDate },
                        order_endDate: { $gte: startDate, $lte: endDate },
                    }
                }
                const pipeline_list = [
                    {
                        $match: obj_cond
                    },
                    {
                        $lookup: {
                            localField: "_id",
                            foreignField: "companyProviderId",
                            as: "equipmentList",
                            from: "equipment",
                            pipeline: [
                                {
                                    $match: cond
                                },
                                {
                                    $lookup: {
                                        localField: "_id",
                                        foreignField: "equipmentId",
                                        as: "orderList",
                                        from: "bookings",
                                        pipeline: [
                                            {
                                                $match: order_cond
                                            },
                                            {
                                                $group: {
                                                    _id: "$equipmentId",
                                                    totalBooked_equipments: { $sum: "$chosen_equipment" }
                                                }
                                            },
                                        ]
                                    },

                                },
                                {
                                    $addFields: {
                                        totalAvailableEquipments: {
                                            $subtract: ["$total_equipmentAvailable", { $sum: "$orderList.totalBooked_equipments" }]
                                        }
                                    }
                                },
                            ]
                        }
                    },
                    {
                        $addFields: {
                            totalAvailable_Equipments_quantity: {
                                $sum: "$equipmentList.totalAvailableEquipments"
                            }
                        }
                    },
                    // Conditionally add this match stage
                    ...(startDate && endDate ? [{
                        $match: {
                            totalAvailable_Equipments_quantity: { $gt: 0 }
                        }
                    }] : []),
                    {
                        $lookup: {
                            localField: "_id",
                            foreignField: "companyProviderId",
                            as: "ratingDetails",
                            from: "rating_reviews",
                            pipeline: [
                                {
                                    $group: {
                                        _id: '$companyProviderId',
                                        averageRating: { $avg: "$rating" }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: "$ratingDetails",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        // Add fields to count vehicles and check for priceBreakable
                        $addFields: {
                            equipmentCount: { $size: "$equipmentList" },  // Count total vehicles
                            priceBreakable: {
                                $gt: [
                                    {
                                        $size: {
                                            $filter: {
                                                input: "$equipmentList",
                                                as: "equipment",
                                                cond: { $eq: ["$$equipment.isPriceBreaking", true] }  // Filter equipments with priceBreakable = true
                                            }
                                        }
                                    },
                                    0  // Check if the size is greater than 0
                                ]
                            },
                            company_rating: { $ifNull: ['$ratingDetails.averageRating', 0] }
                        }
                    },
                    {
                        $match: {
                            equipmentCount: { $gt: 0 }
                        }
                    },
                    {
                        $project: {
                            ratingDetails: 0,
                            password: 0,
                            certificate_achievement: 0,
                            company_license_frontSide: 0,
                            company_license_backSide: 0,
                            driving_license_frontSide: 0,
                            driving_license_backSide: 0,
                            truck_license_frontSide: 0,
                            truck_license_backSide: 0,
                            isNotification: 0,
                            isTerm_condition: 0,
                            isDelete: 0,
                            isActive: 0,
                            createdAt: 0,
                            updatedAt: 0,
                            vehicleList: 0,
                            email: 0,
                            sub_subCatId: 0,
                            subCatId: 0,
                            catId: 0,
                            equipmentList: 0
                            // 'equipmentList.orderList':1,
                            // "equipmentList.totalAvailableEquipments": 1,
                            // "totalAvailable_Equipments_quantity":1,
                            // equipmentCount: 1
                        }
                    },
                    {
                        $skip: Number(page * perPage) - Number(perPage)
                    },
                    {
                        $limit: Number(perPage)
                    }
                ]
                const pipeline_count = [
                    {
                        $match: obj_cond
                    },
                    {
                        $lookup: {
                            localField: "_id",
                            foreignField: "companyProviderId",
                            as: "equipmentList",
                            from: "equipment",
                            pipeline: [
                                {
                                    $match: cond
                                },
                                {
                                    $lookup: {
                                        localField: "_id",
                                        foreignField: "equipmentId",
                                        as: "orderList",
                                        from: "bookings",
                                        pipeline: [
                                            {
                                                $match: order_cond
                                            },
                                            {
                                                $group: {
                                                    _id: "$equipmentId",
                                                    totalBooked_equipments: { $sum: "$chosen_equipment" }
                                                }
                                            },
                                        ]
                                    },
                                },
                                {
                                    $addFields: {
                                        totalAvailableEquipments: {
                                            $subtract: ["$total_equipmentAvailable", { $sum: "$orderList.totalBooked_equipments" }]
                                        }
                                    }
                                },
                            ]
                        }
                    },
                    {
                        $addFields: {
                            totalAvailable_Equipments_quantity: {
                                $sum: "$equipmentList.totalAvailableEquipments"
                            }
                        }
                    },
                    // Conditionally add this match stage
                    ...(startDate && endDate ? [{
                        $match: {
                            totalAvailable_Equipments_quantity: { $gt: 0 }
                        }
                    }] : []),
                    {
                        // Add fields to count vehicles and check for priceBreakable
                        $addFields: {
                            equipmentCount: { $size: "$equipmentList" },
                        }
                    },
                    {
                        $match: {
                            equipmentCount: { $gt: 0 }
                        }
                    },
                    {
                        $count: "totalCount"
                    }
                ]
                const [list, count] = await Promise.all([
                    await user_renter_delivery_Model.aggregate(pipeline_list),
                    await user_renter_delivery_Model.aggregate(pipeline_count)
                ]);
                resolve({ itemList: list, totalCount: count.length ? count[0].totalCount : 0 });
            }
        } catch (err) {
            reject(err)
        }
    });
}

function vehilceList(company_deliveryId: any, query: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en', timezone = 'Asia/Calcutta' } = headers;
            const message = messages(language);
            const currentDate = moment().tz(timezone).format('YYYY-MM-DD')
            let cond: any = {
                isDelete: false,
                isApproved: true,
                isActive: true
            }
            const { page = 1, perPage = 10, type, sizeType, loadingCapacity } = query;
            if (type && type != '' && type != null && type != undefined) {
                cond.type = type
            }
            if (sizeType && sizeType != '' && sizeType != null && sizeType != undefined) {
                cond[language == 'en' ? 'sizeType' : 'ar_sizeType'] = sizeType
                // cond.sizeType = sizeType
            }
            if (loadingCapacity && loadingCapacity != '' && loadingCapacity != null && loadingCapacity != undefined) {
                cond.loadingCapacity = loadingCapacity
            }
            const [vehicles_list, count, companyDetails] = await Promise.all([
                vehicle_addressModel.aggregate([
                    {
                        $match: { isActive: true, isDelete: false, company_deliveryId: new mongoose.Types.ObjectId(company_deliveryId) }
                    },
                    {
                        $lookup: {
                            localField: "vehicleId",
                            foreignField: "_id",
                            as: "vehicleDetails",
                            from: "delivery_vehicles",
                            pipeline: [
                                {
                                    $match: cond
                                },
                                {
                                    $lookup: {
                                        localField: "_id",
                                        foreignField: "vehicleId",
                                        as: "media_details",
                                        from: "vehicle_medias",
                                        pipeline: [
                                            {
                                                $match: { media_type: "image", isDelete: false }
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
                                    $addFields: {
                                        media_details: {
                                            $cond: {
                                                if: { $eq: [{ $size: "$media_details" }, 0] },
                                                then: {},
                                                else: { $arrayElemAt: ["$media_details", 0] }
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
                                                //$match: { isDelete: false, paymentStatus: 'paid', bookingStatus: { $nin: ['Pending', 'Cancelled', 'Completed'] } }
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
                                        total_trucks: "$total_truckAvailable",
                                    }
                                },
                                {
                                    $addFields: {
                                        available_trucks: {
                                            $cond: {
                                                if: { $lt: ["$available_trucks", 0] },
                                                then: 0,
                                                else: "$available_trucks"
                                            }
                                        },
                                        sizeType: {
                                            $cond: {
                                                if: { $eq: [language, 'ar'] },
                                                then: '$ar_sizeType',
                                                else: '$sizeType'
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
                                        }
                                    }
                                },
                                {
                                    $project: {
                                        ar_type: 0, ar_sizeType: 0, ar_vehicle_engineMake: 0, ar_vehicle_engineModel: 0, updatedAt: 0, sizeTypeId: 0, loadingCapacityId: 0, isActive: 0, isDelete: 0, vehicle_fuelCapacity: 0, vehicle_total_cylinders: 0, vehicle_wheelBase: 0, vehicle_width: 0, isOil_coolant: 0, vehicle_enginePower: 0, total_truckAvailable: 0, priceBreaking_details: 0, isBasicDetails: 0, isMediaDetails: 0, isaddressDetails: 0
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: "$vehicleDetails",
                            preserveNullAndEmptyArrays: true
                        },
                    },
                    {
                        // $match: { vehicleDetails: { $ne: null }, 'vehicleDetails.available_trucks': { $ne: 0 } }
                        $match: { vehicleDetails: { $ne: null } }
                    },
                    {
                        $group: {
                            _id: "$vehicleId",
                            nearestVehicle: { $first: "$$ROOT" }
                        }
                    },
                    {
                        $replaceRoot: { newRoot: "$nearestVehicle" }
                    },
                    {
                        $project: {
                            address: 1, city: 1, state: 1, location: 1, vehicleDetails: 1
                        }
                    },
                    {
                        $project: {
                            'vehicleDetails.total_bookedVehicles': 0
                        }
                    },
                    {
                        $sort: { createdAt: 1 } // Sort by createdAt in ascending order
                    },
                    {
                        $skip: Number(page * perPage) - Number(perPage)
                    },
                    {
                        $limit: Number(perPage)
                    }
                ]),
                vehicle_addressModel.aggregate([
                    {
                        $match: { isActive: true, isDelete: false, company_deliveryId: new mongoose.Types.ObjectId(company_deliveryId) }
                    },
                    {
                        $lookup: {
                            localField: "vehicleId",
                            foreignField: "_id",
                            as: "vehicleDetails",
                            from: "delivery_vehicles",
                            pipeline: [
                                {
                                    $match: cond
                                },
                                {
                                    $lookup: {
                                        from: 'bookings',
                                        localField: "_id",
                                        foreignField: "vehicleId",
                                        as: "total_bookedVehicles",
                                        pipeline: [
                                            {
                                                $match: { isDelete: false, paymentStatus: 'paid', bookingStatus: { $nin: ['Pending', 'Cancelled', 'Completed'] } }
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
                                        "operational_trucks": { $ifNull: ['$total_bookedVehicles.chosen_equipment', 0] }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: "$vehicleDetails",
                            preserveNullAndEmptyArrays: true
                        },
                    },
                    {
                        $match: { vehicleDetails: { $ne: null } }
                    },
                    {
                        $group: {
                            _id: "$vehicleId",
                            nearestVehicle: { $first: "$$ROOT" }
                        }
                    },
                    {
                        $replaceRoot: { newRoot: "$nearestVehicle" }
                    },
                    {
                        $sort: { distance: 1 } // Sort by distance in ascending order
                    }
                    ,
                    {
                        $count: "totalCount"
                    }
                ]),
                user_renter_delivery_Model.aggregate([
                    {
                        $match: { isDelete: false, _id: new mongoose.Types.ObjectId(company_deliveryId) }
                    },
                    {
                        $lookup: {
                            localField: "_id",
                            foreignField: "companyProviderId",
                            as: "ratingDetails",
                            from: "rating_reviews",
                            pipeline: [
                                {
                                    $group: {
                                        _id: '$companyProviderId',
                                        averageRating: { $avg: "$rating" }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: "$ratingDetails",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            company_rating: { $ifNull: ['$ratingDetails.averageRating', 0] },
                            name: 1,
                            image: 1,
                            bannerImage: 1,
                            company_description: {
                                $cond: {
                                    if: { $eq: [language, 'ar'] },
                                    then: "$ar_company_description",
                                    else: "$company_description"
                                }
                            }
                        }
                    }
                ])
            ]);
            resolve({ companyDetails: companyDetails.length ? companyDetails[0] : {}, itemList: vehicles_list, totalCount: count.length ? count[0].totalCount : 0 });

        } catch (err) {
            reject(err)
        }
    });
}

function vehicleDetails(vehicleId: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en', timezone = 'Asia/Calcutta' } = headers;
            const currentDate = moment().tz(timezone).format('YYYY-MM-DD')
            const message = messages(language);
            const vehicleDetails = await delivery_vehicleModel.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(vehicleId),
                        isDelete: false,
                        isActive: true,
                        isApproved: true
                    }
                },
                {
                    $lookup: {
                        localField: "_id",
                        foreignField: "vehicleId",
                        as: "media_details",
                        from: "vehicle_medias",
                        pipeline: [
                            {
                                $match: {
                                    isDelete: false
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        localField: "_id",
                        foreignField: "vehicleId",
                        as: "address_details",
                        from: "vehicle_addresses",
                        pipeline: [
                            {
                                $match: {
                                    isDelete: false
                                }
                            },
                            {
                                $project: {
                                    address: 1,
                                    location: 1,
                                    city: 1,
                                    country: 1,
                                    state: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        address_details: {
                            $cond: {
                                if: { $eq: [{ $size: "$address_details" }, 0] },
                                then: {},
                                else: { $arrayElemAt: ["$address_details", 0] }
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
                    $lookup: {
                        from: "admins",
                        pipeline: [
                            {
                                $match: { isDelete: false }
                            },
                            {
                                $project: {
                                    tax: 1
                                }
                            },
                            {
                                $limit: 1
                            }
                        ],
                        as: "taxDetails",

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
                                                keyName: 1,
                                                ar_keyName: 1
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
                                                keyValue: 1,
                                                ar_keyValue: 1

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
                                    ar_keyValueDetails: "$keyValueDetails.ar_keyValue",
                                    ar_keyDetails: "$keyDetails.ar_keyName",
                                    keyId: 1,
                                    keyValueId: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        "available_trucks": {
                            $subtract: ["$total_truckAvailable", { $ifNull: ["$total_bookedVehicles.chosen_equipment", 0] }]
                        },
                        "operational_trucks": { $ifNull: ['$total_bookedVehicles.chosen_equipment', 0] },
                        sizeType: {
                            $cond: {
                                if: { $eq: [language, 'ar'] },
                                then: '$ar_sizeType',
                                else: '$sizeType'
                            }
                        },
                        total_trucks: "$total_truckAvailable",
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
                        tax: {
                            $cond: {
                                if: { $eq: [{ $size: "$taxDetails" }, 0] },
                                then: 0,
                                else: { $arrayElemAt: ["$taxDetails.tax", 0] }
                            }
                        },
                    }
                },
                {
                    $project: {
                        taxDetails: 0,
                        total_truckAvailable: 0
                    }
                }
            ]);
            resolve(vehicleDetails.length ? vehicleDetails[0] : {});
        } catch (err) {
            reject(err)
        }
    });
}

function equipmentList(company_renterId: any, query: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en', timezone = 'Asia/Calcutta' } = headers;
            const message = messages(language);
            const currentDate = moment().tz(timezone).format('YYYY-MM-DD')
            const { page = 1, perPage = 10, catId, subCatId, sub_subCatId } = query;
            const Average_speed: any = process.env.Average_speed
            let cond: any = {
                isDelete: false,
                isActive: true,
                isApproved: true,
                isBasicDetails: true,
                isMediaDetails: true,
                isaddressDetails: true,
                companyProviderId: new mongoose.Types.ObjectId(company_renterId)
            }
            if (catId && catId != '' && catId != null && catId != undefined) {
                cond.categoryId = new ObjectId(catId)
            }
            if (subCatId && subCatId != '' && subCatId != null && subCatId != undefined) {
                cond.subCategoryId = new ObjectId(subCatId)
            }
            if (sub_subCatId && sub_subCatId != '' && sub_subCatId != null && sub_subCatId != undefined) {
                cond.sub_subCategoryId = new ObjectId(sub_subCatId)
            }
            const [equipments_list, count, companyDetails] = await Promise.all([
                equipment_addressModel.aggregate([
                    {
                        $match: { isActive: true, isDelete: false, companyProviderId: new mongoose.Types.ObjectId(company_renterId) }
                    },
                    {
                        $lookup: {
                            localField: "equipmentId",
                            foreignField: "_id",
                            as: "equipmentDetails",
                            from: "equipment",
                            pipeline: [
                                {
                                    $match: cond
                                },
                                {
                                    $lookup: {
                                        localField: "_id",
                                        foreignField: "equipmentId",
                                        as: "media_details",
                                        from: "equipment_medias",
                                        pipeline: [
                                            {
                                                $match: { media_type: "image", isDelete: false }
                                            },
                                            {
                                                $project: {
                                                    equipment_imageUrl: 1,
                                                    media_type: 1
                                                },
                                            },
                                            {
                                                $limit: 1
                                            }
                                        ]
                                    }
                                },
                                {
                                    $addFields: {
                                        media_details: {
                                            $cond: {
                                                if: { $eq: [{ $size: "$media_details" }, 0] },
                                                then: {},
                                                else: { $arrayElemAt: ["$media_details", 0] }
                                            }
                                        }
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
                                        "available_equipments": {
                                            $subtract: ["$total_equipmentAvailable", { $ifNull: ["$total_bookedEquipment.chosen_equipment", 0] }]
                                        },
                                        "operational_equipments": { $ifNull: ['$total_bookedEquipment.chosen_equipment', 0] },
                                        total_equipments: "$total_equipmentAvailable"
                                    }
                                },
                                {
                                    $addFields: {
                                        available_equipments: {
                                            $cond: {
                                                if: { $lt: ["$available_equipments", 0] },
                                                then: 0,
                                                else: "$available_equipments"
                                            }
                                        },
                                        equipmentName: {
                                            $cond: {
                                                if: { $eq: [language, 'ar'] },
                                                then: '$ar_equipmentName',
                                                else: '$equipmentName'
                                            }
                                        },
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
                                        total_equipmentAvailable: 0,
                                        total_bookedEquipment: 0
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: "$equipmentDetails",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $match: { equipmentDetails: { $ne: null } }
                    },
                    {
                        $group: {
                            _id: "$equipmentId",
                            nearestEquipment: { $first: "$$ROOT" }
                        }
                    },
                    {
                        $replaceRoot: { newRoot: "$nearestEquipment" }
                    },
                    {
                        $project: {
                            address: 1, city: 1, location: 1, equipmentDetails: 1, distance: 1, uniqueId: 1,
                        }
                    },
                    {
                        $sort: { distance: 1 } // Sort by distance in ascending order
                    },
                    {
                        $project: {
                            "equipmentDetails.ar_equipment_engineMake": 0,
                            "equipmentDetails.ar_equipment_engineModel": 0,
                            "equipmentDetails.ar_equipmentName": 0,
                            "equipmentDetails.equipment_engineMake": 0,
                            "equipmentDetails.equipment_engineModel": 0,
                            "equipmentDetails.equipment_enginePower": 0,
                            "equipmentDetails.equipment_fuelCapacity": 0,
                            "equipmentDetails.equipment_machineWeight": 0,
                            "equipmentDetails.equipment_maximumCutting_height": 0,
                            "equipmentDetails.equipment_rear_swingRadius": 0,
                            "equipmentDetails.equipment_swingSpped": 0,
                            "equipmentDetails.equipment_breakout_force": 0,
                            "equipmentDetails.isBoom_swingAngle": 0,
                            "equipmentDetails.isMinimum_groundClearance": 0,
                            "equipmentDetails.updatedAt": 0,
                            "equipmentDetails.priceBreaking_details": 0,
                            "equipmentDetails.categoryId": 0,
                            "equipmentDetails.subCategoryId": 0,
                            "equipmentDetails.sub_subCategoryId": 0
                        }
                    },
                    {
                        $skip: Number(page * perPage) - Number(perPage)
                    },
                    {
                        $limit: Number(perPage)
                    }
                ]),
                equipment_addressModel.aggregate([
                    {
                        $match: { isActive: true, isDelete: false, companyProviderId: new mongoose.Types.ObjectId(company_renterId) }
                    },
                    {
                        $lookup: {
                            localField: "equipmentId",
                            foreignField: "_id",
                            as: "equipmentDetails",
                            from: "equipment",
                            pipeline: [
                                {
                                    $match: cond
                                },
                                {
                                    $lookup: {
                                        from: 'bookings',
                                        localField: "_id",
                                        foreignField: "equipmentId",
                                        as: "total_bookedEquipment",
                                        pipeline: [
                                            {
                                                $match: { isDelete: false, paymentStatus: 'paid', bookingStatus: { $nin: ['Pending', 'Cancelled', 'Completed'] } }
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
                                        "available_equipments": {
                                            $subtract: ["$total_equipmentAvailable", { $ifNull: ["$total_bookedEquipment.chosen_equipment", 0] }]
                                        },
                                        "operational_equipments": { $ifNull: ['$total_bookedEquipment.chosen_equipment', 0] }
                                    }
                                },
                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: "$equipmentDetails",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $match: { equipmentDetails: { $ne: null } }
                    },
                    {
                        $group: {
                            _id: "$equipmentId",
                            nearestEquipment: { $first: "$$ROOT" }
                        }
                    },
                    {
                        $replaceRoot: { newRoot: "$nearestEquipment" }
                    },
                    {
                        $sort: { distance: 1 } // Sort by distance in ascending order
                    }
                    ,
                    {
                        $count: "totalCount"
                    }
                ]),
                user_renter_delivery_Model.aggregate([
                    {
                        $match: { isDelete: false, _id: new mongoose.Types.ObjectId(company_renterId) }
                    },
                    {
                        $lookup: {
                            localField: "_id",
                            foreignField: "companyProviderId",
                            as: "ratingDetails",
                            from: "rating_reviews",
                            pipeline: [
                                {
                                    $group: {
                                        _id: '$companyProviderId',
                                        averageRating: { $avg: "$rating" }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: "$ratingDetails",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            company_rating: { $ifNull: ['$ratingDetails.averageRating', 0] },
                            name: 1,
                            image: 1,
                            bannerImage: 1,
                            company_description: {
                                $cond: {
                                    if: { $eq: [language, 'ar'] },
                                    then: "$ar_company_description",
                                    else: "$company_description"
                                }
                            }
                        }
                    }
                ])
            ]);
            resolve({ companyDetails: companyDetails.length ? companyDetails[0] : {}, itemList: equipments_list, totalCount: count.length ? count[0].totalCount : 0 });
        } catch (err) {
            reject(err)
        }
    });
}

function equipmentDetails(equipmentId: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en', timezone = 'Asia/Calcutta' } = headers;
            const message = messages(language);
            const currentDate = moment().tz(timezone).format('YYYY-MM-DD')
            const equipmentDetails = await equipmentModel.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(equipmentId),
                        isDelete: false,
                        isActive: true,
                        isApproved: true
                    }
                },
                {
                    $lookup: {
                        localField: "_id",
                        foreignField: "equipmentId",
                        as: "media_details",
                        from: "equipment_medias",
                        pipeline: [
                            {
                                $match: {
                                    isDelete: false
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        localField: "_id",
                        foreignField: "equipmentId",
                        as: "equipmentAddress",
                        from: "equipment_addresses",
                        pipeline: [
                            {
                                $match: {
                                    isDelete: false
                                }
                            },
                            {
                                $project: {
                                    address: 1,
                                    location: 1,
                                    city: 1,
                                    country: 1,
                                    state: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        equipmentAddress: {
                            $cond: {
                                if: { $eq: [{ $size: "$equipmentAddress" }, 0] },
                                then: {},
                                else: { $arrayElemAt: ["$equipmentAddress", 0] }
                            }
                        }
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
                        from: "admins",
                        pipeline: [
                            {
                                $match: { isDelete: false }
                            },
                            {
                                $project: {
                                    tax: 1
                                }
                            },
                            {
                                $limit: 1
                            }
                        ],
                        as: "taxDetails",
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
                                    as: "keyDetails"
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
                                    as: "keyValueDetails"
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
                                    ar_keyValueDetails: "$keyValueDetails.ar_keyValue",
                                    ar_keyDetails: "$keyDetails.ar_keyName"
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        available_equipments: {
                            $subtract: ["$total_equipmentAvailable", { $ifNull: ["$total_bookedEquipment.chosen_equipment", 0] }]
                        },
                        operational_equipments: { $ifNull: ['$total_bookedEquipment.chosen_equipment', 0] },
                        total_equipments: "$total_equipmentAvailable",
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
                        },
                        tax: {
                            $cond: {
                                if: { $eq: [{ $size: "$taxDetails" }, 0] },
                                then: 0,
                                else: { $arrayElemAt: ["$taxDetails.tax", 0] }
                            }
                        },
                    }
                },
                {
                    $project: {
                        total_equipmentAvailable: 0,
                        total_bookedEquipment: 0,
                        taxDetails: 0
                    }
                }
            ]);
            resolve(equipmentDetails.length ? equipmentDetails[0] : {});
        } catch (err) {
            reject(err)
        }
    });
}

function addVisit_user(userId: any, companyProviderId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const obj = {
                userId: userId,
                companyProviderId: companyProviderId
            }
            const add = await user_visitModal.create(obj);
            resolve({ add })
        } catch (err) {
            reject(err);
        }
    });
}

function faqList(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { page = 1, perPage = 10, search } = query;
            const { language = 'en' } = headers;
            let cond: any = {
                isActive: true,
                isDelete: false
            }
            if (search) {
                cond = {
                    ...cond,
                    [language == 'ar' ? 'ar_que' : 'que']: { $regex: search, $options: 'i' }
                }
            }
            const [list, count] = await Promise.all([
                faqModel.aggregate([
                    {
                        $match: cond
                    },
                    {
                        $project: {
                            que: {
                                $cond: {
                                    if: { $eq: [language, 'ar'] },
                                    then: "$ar_que",
                                    else: "$que"
                                }
                            },
                            ans: {
                                $cond: {
                                    if: { $eq: [language, 'ar'] },
                                    then: "$ar_ans",
                                    else: "$ans"
                                }
                            }
                        }
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $skip: Number(perPage * page) - Number(perPage)
                    },
                    {
                        $limit: Number(perPage)
                    }
                ]),
                faqModel.aggregate([
                    {
                        $match: cond
                    },
                    {
                        $count: "totalCount"
                    }
                ])
            ]);
            resolve({ itemList: list, count: count.length ? count[0].totalCount : 0 });
        } catch (err) {
            reject(err);
        }
    });
}

function top_companies(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { page = 1, perPage = 6 } = query;
            const { language = 'en' } = headers;
            let cond: any = {
                isDelete: false,
                isActive: true,
                isApproved: true,
                isBasicDetails: true,
                isMediaDetails: true,
                isaddressDetails: true
            }
            const list = await user_renter_delivery_Model.aggregate([
                {
                    $match: { isDelete: false, isVerified: true }
                },
                {
                    $lookup: {
                        localField: "_id",
                        foreignField: "companyProviderId",
                        as: "ratingDetails",
                        from: "rating_reviews",
                        pipeline: [
                            {
                                $group: {
                                    _id: "companyProviderId",
                                    rating: {
                                        $avg: "$rating"
                                    }
                                }
                            },

                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$ratingDetails",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        localField: "_id",
                        foreignField: "companyProviderId",
                        as: "equipmentList",
                        from: "equipment",
                        pipeline: [
                            {
                                $match: cond
                            },
                        ]
                    }
                },
                {
                    // Add fields to count vehicles and check for priceBreakable
                    $addFields: {
                        equipmentCount: { $size: "$equipmentList" },  // Count total vehicles
                        priceBreakable: {
                            $gt: [
                                {
                                    $size: {
                                        $filter: {
                                            input: "$equipmentList",
                                            as: "equipment",
                                            cond: { $eq: ["$$equipment.isPriceBreaking", true] }  // Filter vehicles with priceBreakable = true
                                        }
                                    }
                                },
                                0  // Check if the size is greater than 0
                            ]
                        },
                        company_rating: { $ifNull: ['$ratingDetails.averageRating', 0] }
                    }
                },
                {
                    $match: {
                        equipmentCount: { $gt: 0 }
                    }
                },
                {
                    $project: {
                        name: 1, address: 1, city: 1, image: 1, equipmentCount: 1, priceBreakable: 1, company_rating: 1
                    }
                },
                {
                    $sort: { company_rating: -1 }
                },
                {
                    $skip: Number(perPage * page) - Number(perPage)
                },
                {
                    $limit: Number(perPage)
                }
            ]);
            resolve({ itemList: list })
        } catch (err) {
            reject(err);
        }
    })
}

/***
 * Recommended equipment Product
 */
function recommendedProduct(userId: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const { language = 'en' } = headers;
        const { type } = query;
        if (type == 'vehicle') {
            const list = await bookingModel.aggregate([
                {
                    $match: { isDelete: false, bookingStatus: "Completed", type: 'vehicle' }
                }, {
                    $group: {
                        _id: "$vehicleId",
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        foreignField: "_id",
                        localField: "_id",
                        from: "delivery_vehicles",
                        as: "vehicleDetails",
                        pipeline: [
                            {
                                $match: { isDelete: false, isActive: true }
                            },
                            {
                                $lookup: {
                                    foreignField: "_id",
                                    localField: "company_deliveryId",
                                    from: "user_renter_deliveries",
                                    as: "companyDetails",
                                    pipeline: [
                                        {
                                            $project: {
                                                name: 1,
                                                image: 1,
                                                address: 1,
                                                city: 1
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $match: { companyDetails: { $ne: [] } }
                            },
                            {
                                $lookup: {
                                    foreignField: "vehicleId",
                                    localField: "_id",
                                    from: "vehicle_medias",
                                    as: "vehicleImage",
                                    pipeline: [
                                        {
                                            $match: {
                                                media_type: "image"
                                            }
                                        },
                                        {
                                            $project: {
                                                media_type: 1,
                                                vehicle_imageUrl: 1
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $match: { companyDetails: { $ne: [] } }
                            },
                            {
                                $project: {
                                    companyDetails: {
                                        $cond: {
                                            if: { $eq: [{ $size: "$companyDetails" }, 0] },
                                            then: {},
                                            else: { $arrayElemAt: ["$companyDetails", 0] }
                                        }
                                    },
                                    vehicleSize: {
                                        $cond: {
                                            if: { $eq: [language, 'ar'] },
                                            then: "$ar_sizeType",
                                            else: "$sizeType"
                                        }
                                    },
                                    vehicleType: {
                                        $cond: {
                                            if: { $eq: [language, 'ar'] },
                                            then: "$ar_type",
                                            else: "$type"
                                        }
                                    },
                                    vehicleImage: {
                                        $cond: {
                                            if: { $eq: [{ $size: "$vehicleImage" }, 0] },
                                            then: {},
                                            else: { $arrayElemAt: ["$vehicleImage", 0] }
                                        }
                                    },
                                    companyProviderId: 1,
                                    priceInside_city_perDay: 1,
                                    isPriceBreaking: 1,
                                    total_truckAvailable: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $match: { vehicleDetails: { $ne: [] } }
                },
                {
                    $addFields: {
                        vehicleDetails: {
                            $cond: {
                                if: { $eq: [{ $size: "$vehicleDetails" }, 0] },
                                then: {},
                                else: { $arrayElemAt: ["$vehicleDetails", 0] }
                            }
                        },
                    }
                },
                {
                    $project: {
                        vehicleId: "$vehicleDetails._id",
                        vehicleImage: "$vehicleDetails.vehicleImage.vehicle_imageUrl",
                        vehicleType: "$vehicleDetails.vehicleType",
                        vehicleSize: "$vehicleDetails.vehicleSize",
                        priceInside_city_perDay: "$vehicleDetails.priceInside_city_perDay",
                        total_truckAvailable: "$vehicleDetails.total_truckAvailable",
                        isPriceBreaking: "$vehicleDetails.isPriceBreaking",
                        companyProviderId: "$vehicleDetails.companyProviderId",
                        companyName: "$vehicleDetails.companyDetails.name",
                        companyImage: "$vehicleDetails.companyDetails.image",
                        companyAddress: "$vehicleDetails.companyDetails.address",
                        companyCity: "$vehicleDetails.companyDetails.city",
                        count: 1
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: Number(20)
                }
            ]);
            resolve({ itemList: list });
        } else {
            const list = await bookingModel.aggregate([
                {
                    $match: { isDelete: false, bookingStatus: "Completed", type: "equipment" }
                }, {
                    $group: {
                        _id: "$equipmentId",
                        count: { $sum: 1 }

                    }
                },
                {
                    $lookup: {
                        foreignField: "_id",
                        localField: "_id",
                        from: "equipment",
                        as: "equipmentDetails",
                        pipeline: [
                            {
                                $match: { isDelete: false, isActive: true }
                            },
                            {
                                $lookup: {
                                    foreignField: "_id",
                                    localField: "companyProviderId",
                                    from: "user_renter_deliveries",
                                    as: "companyDetails",
                                    pipeline: [
                                        {
                                            $project: {
                                                name: 1,
                                                image: 1,
                                                address: 1,
                                                city: 1
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $match: { companyDetails: { $ne: [] } }
                            },
                            {
                                $lookup: {
                                    foreignField: "equipmentId",
                                    localField: "_id",
                                    from: "equipment_medias",
                                    as: "equipmentImage",
                                    pipeline: [
                                        {
                                            $match: {
                                                media_type: "image"
                                            }
                                        },
                                        {
                                            $project: {
                                                media_type: 1,
                                                equipment_imageUrl: 1
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $match: { companyDetails: { $ne: [] } }
                            },
                            {
                                $project: {
                                    companyDetails: {
                                        $cond: {
                                            if: { $eq: [{ $size: "$companyDetails" }, 0] },
                                            then: {},
                                            else: { $arrayElemAt: ["$companyDetails", 0] }
                                        }
                                    },
                                    equipmentName: {
                                        $cond: {
                                            if: { $eq: [language, 'ar'] },
                                            then: "$ar_equipmentName",
                                            else: "$equipmentName"
                                        }
                                    },
                                    equipmentImage: {
                                        $cond: {
                                            if: { $eq: [{ $size: "$equipmentImage" }, 0] },
                                            then: {},
                                            else: { $arrayElemAt: ["$equipmentImage", 0] }
                                        }
                                    },
                                    companyProviderId: 1,
                                    equipmentPrice_perDay: 1,
                                    isPriceBreaking: 1,
                                    total_equipmentAvailable: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $match: { equipmentDetails: { $ne: [] } }
                },
                {
                    $addFields: {
                        equipmentDetails: {
                            $cond: {
                                if: { $eq: [{ $size: "$equipmentDetails" }, 0] },
                                then: {},
                                else: { $arrayElemAt: ["$equipmentDetails", 0] }
                            }
                        },
                    }
                },
                {
                    $project: {
                        equipmentId: "$equipmentDetails._id",
                        equipmentImage: "$equipmentDetails.equipmentImage.equipment_imageUrl",
                        equipmentName: "$equipmentDetails.equipmentName",
                        equipmentPrice_perDay: "$equipmentDetails.equipmentPrice_perDay",
                        total_equipmentAvailable: "$equipmentDetails.total_equipmentAvailable",
                        isPriceBreaking: "$equipmentDetails.isPriceBreaking",
                        companyProviderId: "$equipmentDetails.companyProviderId",
                        companyName: "$equipmentDetails.companyDetails.name",
                        companyImage: "$equipmentDetails.companyDetails.image",
                        companyAddress: "$equipmentDetails.companyDetails.address",
                        companyCity: "$equipmentDetails.companyDetails.city",
                        count: 1
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: Number(20)
                }
            ]);
            resolve({ itemList: list });
        }
    });
}

// const data = [5, 6, 7, 6, 5, 4, 5, 6, 8, 1, 2]
// let non_repeated_arr = []
// for (let i = 0; i < data.length; i++) {
//     let repeated = false
//     for (let j = 0; j < data.length; j++) {
//         if (i !== j && data[i] === data[j]) {
//             repeated = true
//             break;
//         }
//     }
//     if (!repeated) {
//         non_repeated_arr.push(data[i])
//     }
// }
// console.log(non_repeated_arr, "non_repeated_arr")


export default {
    create_guestUser,
    add_guestUserActivity,
    categoryList,
    sub_categoryListByCatId_forDropdrown,
    subSub_categoryListBySubCatId_forDropdrown,
    vehicle_sizeTypeList,
    vehicle_load_capacityList,
    renter_deliveryList,
    vehilceList,
    vehicleDetails,
    equipmentList,
    equipmentDetails,
    addVisit_user,
    faqList,
    top_companies,
    recommendedProduct
} as const;
