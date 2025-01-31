import { messages } from "@Custom_message";
import bookingModel from "@models/booking";
import categoryModel from "@models/category";
import engine_companyModel from "@models/engine_company";
import engine_modelModel from "@models/engine_model";
import faqModel from "@models/faq";
import { capacityModel, inspectionModel, OrderCancel_reasonModel, user_notificationModel, user_renter_delivery_Model, vehicle_sizeTypeModel } from "@models/index";
import sub_categoryModel from "@models/sub_category";
import sub_subCategoryModel from "@models/sub_subCategory";
import mongoose, { Types } from "mongoose";
import { exit } from "process";

/***
 * Company Maker 
 */
function engineList(userId: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const message = messages(language);
            const { type } = query
            let cond = {
                isDelete: false,
                isActive: true,
                role: type  //"renter_user", "delivery_user"
            }
            const engineList = await engine_companyModel.aggregate([
                {
                    $match: cond
                },
                {
                    $project: {
                        "name": 1,
                        "ar_name": 1
                    }
                }
                // {
                //     $project: {
                //         name: {
                //             $cond: {
                //                 if: { $eq: [language, 'ar'] },
                //                 then: '$ar_name',
                //                 else: '$name'
                //             }
                //         },
                //         description: {
                //             $cond: {
                //                 if: { $eq: [language, 'ar'] },
                //                 then: '$ar_description',
                //                 else: '$description'
                //             }
                //         }
                //     }
                // }
            ]);
            resolve(engineList);
        } catch (err) {
            reject(err)
        }
    });
}

function engineModelListBy_engineCompanyId(params: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const message = messages(language);
            let cond = {
                engine_companyId: new Types.ObjectId(params.id),
                isDelete: false,
                isActive: true
            }
            const engine_modelList = await engine_modelModel.aggregate([
                {
                    $match: cond
                },
                {
                    $project: {
                        "engine_companyId": 1,
                        "name": 1,
                        "ar_name": 1
                    }
                }
                // {
                //     $project: {
                //         name: {
                //             $cond: {
                //                 if: { $eq: [language, 'ar'] },
                //                 then: '$ar_name',
                //                 else: '$name'
                //             }
                //         },
                //         description: {
                //             $cond: {
                //                 if: { $eq: [language, 'ar'] },
                //                 then: '$ar_description',
                //                 else: '$description'
                //             }
                //         },
                //         enginePower: 1,
                //         fuelCapacity: 1,
                //         machineWeight: 1,
                //         maximum_cuttingHeight: 1,
                //         rear_swing_radius: 1,
                //         swingSpeed: 1,
                //         breakout_force: 1
                //     }
                // }
            ]);
            resolve(engine_modelList);
        } catch (err) {
            reject(err)
        }
    });
}

function categoryList_forDropdrown(userId: any, query: any, headers: any): Promise<any> {
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

/**
 * All cat data such as sub cat and sub-sub cat ijf
 * @param userId 
 * @param headers 
 * @returns 
 */
function allCatList(userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            let cond = {
                isDelete: false,
                isActive: true
            }
            const list1 = await categoryModel.aggregate([
                {
                    $match: cond
                },
                {
                    $lookup: {
                        localField: "_id",
                        foreignField: "categoryId",
                        as: "subCatList",
                        from: 'sub_categories',
                        pipeline: [
                            {
                                $match: cond
                            },
                            {
                                $lookup: {
                                    localField: "_id",
                                    foreignField: "subCategoryId",
                                    as: "sub_subCatList",
                                    from: 'sub_subcategories',
                                    pipeline: [
                                        {
                                            $match: cond
                                        },
                                        {
                                            $project: {
                                                subCatname: {
                                                    $cond: {
                                                        if: { $eq: [language, 'ar'] },
                                                        then: '$ar_name',
                                                        else: '$name'
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $project: {
                                    sub_subCatname: {
                                        $cond: {
                                            if: { $eq: [language, 'ar'] },
                                            then: '$ar_name',
                                            else: '$name'
                                        }
                                    },
                                    "sub_subCatList": 1
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        catName: {
                            $cond: {
                                if: { $eq: [language, 'ar'] },
                                then: '$ar_name',
                                else: '$name'
                            }
                        },
                        "subCatList": 1
                    }
                }
            ]);
            resolve(list1);
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
            const { type = 'Heavy', role, company_deliveryId } = query;
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
            let pipeline: any = [
                {
                    $match: cond
                },
            ]

            if (role == 'user') {
                if (company_deliveryId) {
                    vehicle_cond = {
                        ...vehicle_cond,
                        company_deliveryId: new mongoose.Types.ObjectId(company_deliveryId)
                    }
                }
                pipeline = [...pipeline, ...[
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
                    }
                ]]
            }
            pipeline = [...pipeline, ...[
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $project: {
                        delivery_vehicleList: 0
                    }
                }
            ]]
            const list = await vehicle_sizeTypeModel.aggregate(pipeline);
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
            let pipeline: any = [
                {
                    $match: cond
                },
            ]

            if (role == 'user') {
                if (company_deliveryId) {
                    vehicle_cond = {
                        ...vehicle_cond,
                        company_deliveryId: new mongoose.Types.ObjectId(company_deliveryId)
                    }
                }
                pipeline = [...pipeline, ...[
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
                    }
                ]]
            }
            pipeline = [...pipeline, ...[
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $project: {
                        delivery_vehicleList: 0
                    }
                }
            ]]
            const list = await capacityModel.aggregate(pipeline);
            resolve(list);
        } catch (err) {
            reject(err)
        }
    });
}

/***
 *  Cancel Reason List
 * 
 */
function cancelReasonList(role: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const list = await OrderCancel_reasonModel.aggregate([
                {
                    $match: { role: role, isDelete: false, isActive: true } //"user", "company"
                },
                {
                    $project: { title: 1, ar_title: 1, role: 1 }
                },
                {
                    $sort: { createdAt: -1 }
                }
            ]);
            resolve({ itemList: list });
        } catch (err) {
            reject(err)
        }
    });
}

/***
 *  inspection List
 * 
 */
function inspectionList(userId: any, role: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const list = await inspectionModel.aggregate([
                {
                    $match: { role: role, isDelete: false, isActive: true }
                },
                // {
                //     $addFields: {
                //         title: {
                //             $cond: {
                //                 if: { $eq: [language, 'ar'] },
                //                 then: '$ar_title',
                //                 else: '$title'
                //             }
                //         }
                //     }
                // },
                {
                    $project: { title: 1, ar_title: 1 }
                },
                {
                    $sort: { createdAt: -1 }
                }
            ]);
            resolve({ itemList: list });
        } catch (err) {
            reject(err)
        }
    });
}

/**
 * Rented Equipments and Vehicles
 */

function rented_equipment_vehicleList(userId: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const { page = 1, perPage = 10, search } = query;
            let obj: any = {
                companyProviderId: new mongoose.Types.ObjectId(userId),
                isDelete: false,
                paymentStatus: 'paid',
                bookingStatus: { $nin: ['Pending', 'Cancelled', 'Completed'] }
            }
            if (search) {
                obj = {
                    ...obj,
                    $or: [
                        {
                            [`vehicleDetails.${language == 'ar' ? 'ar_vehicleType' : 'vehicleType'}`]: { $regex: search, $options: 'i' },
                        },
                        {
                            [`vehicleDetails.${language == 'ar' ? 'ar_vehicleSize' : 'vehicleSize'}`]: { $regex: search, $options: 'i' },
                        },
                        {
                            [`equipmentDetails.${language == 'ar' ? 'ar_equipmentName' : 'equipmentName'}`]: { $regex: search, $options: 'i' },
                        }
                    ]
                }
            }
            const [list, count] = await Promise.all([
                bookingModel.aggregate([
                    {
                        $match: obj
                    },
                    {
                        $lookup: {
                            foreignField: "equipmentId",
                            localField: "equipmentId",
                            as: "equipment_mediaDetails",
                            from: "equipment_medias",
                            pipeline: [
                                {
                                    $match: { isDelete: false, media_type: 'image' },
                                },
                                {
                                    $project: {
                                        equipment_imageUrl: 1
                                    }
                                },
                                {
                                    $limit: 1
                                }
                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: "$equipment_mediaDetails",
                            preserveNullAndEmptyArrays: true
                        },
                    },
                    {
                        $lookup: {
                            foreignField: "vehicleId",
                            localField: "vehicleId",
                            as: "vehicle_mediaDetails",
                            from: "vehicle_medias",
                            pipeline: [
                                {
                                    $match: { isDelete: false, media_type: 'image' },
                                },
                                {
                                    $project: {
                                        vehicle_imageUrl: 1
                                    }
                                },
                                {
                                    $limit: 1
                                }
                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: "$vehicle_mediaDetails",
                            preserveNullAndEmptyArrays: true
                        },
                    },
                    {
                        $lookup: {
                            foreignField: "_id",
                            localField: "vehicleId",
                            as: "vehicleDetails1",
                            from: "delivery_vehicles",
                            pipeline: [
                                {
                                    $match: { isDelete: false },
                                },
                                {
                                    $project: {
                                        repeatingDeliveryAmount: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: '$vehicleDetails1',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    // {
                    //     $lookup: {
                    //         foreignField: "_id",
                    //         localField: "equipmentId",
                    //         as: "equipmentDetails1",
                    //         from: "equipment",
                    //         pipeline: [
                    //             {
                    //                 $match: { isDelete: false },
                    //             },
                    //             {
                    //                 $project: {
                    //                     repeatingDeliveryAmount: 1
                    //                 }
                    //             }
                    //         ]
                    //     }
                    // },
                    // {
                    //     $unwind: {
                    //         path: '$equipmentDetails1',
                    //         preserveNullAndEmptyArrays: true
                    //     }
                    // },
                    {
                        $addFields: {
                            details: {
                                $cond: {
                                    if: { $eq: ["$type", 'vehicle'] },
                                    then: {
                                        '$mergeObjects': [
                                            "$vehicleDetails",
                                            {
                                                'vehicleType': {
                                                    $cond: {
                                                        if: { $eq: [language, 'ar'] },
                                                        then: "$vehicleDetails.ar_vehicleType",
                                                        else: "$vehicleDetails.vehicleType"
                                                    }
                                                },
                                                'vehicleSize': {
                                                    $cond: {
                                                        if: { $eq: [language, 'ar'] },
                                                        then: "$vehicleDetails.ar_vehicleSize",
                                                        else: "$vehicleDetails.vehicleSize"
                                                    }
                                                },
                                                'priceInoutSide_city_perKm': '$vehicleDetails.priceOutSide_city_perKm'
                                            }
                                        ]
                                    },
                                    else: {
                                        "$mergeObjects": [
                                            "$equipmentDetails",
                                            {
                                                'equipmentName': {
                                                    $cond: {
                                                        if: { $eq: [language, 'ar'] },
                                                        then: "$equipmentDetails.ar_equipmentName",
                                                        else: "$equipmentDetails.equipmentName"
                                                    }
                                                },
                                            }
                                        ]

                                    }
                                }
                            }
                        }
                    },
                    // {
                    //     $match: {
                    //         $or: [
                    //             { type: { $ne: 'vehicle' } }, // if type is not 'vehicle', include the document
                    //             { "vehicleDetails1": { $ne: null } } // if type is 'vehicle', vehicleDetails1 must not be null
                    //         ],
                    //     }
                    // },
                    // {
                    //     $match: {

                    //         $or: [
                    //             { type: { $ne: 'equipment' } }, // if type is not 'equipment', include the document
                    //             { "equipmentDetails1": { $ne: null } } // if type is 'equipment', equipmentDetails must not be null
                    //         ]
                    //     }
                    // },
                    {
                        $project: {
                            'details.equipmentName': 1,
                            'details.day_cost': 1,
                            equipment_mediaDetails: 1,
                            vehicle_mediaDetails: 1,
                            'details.vehicleType': 1,
                            'details.vehicleSize': 1,
                            'details.priceInside_city_perDay': 1,
                            'details.priceInoutSide_city_perKm': 1,
                            'details.repeatingDeliveryAmount': "$vehicleDetails1.repeatingDeliveryAmount",
                            // vehicle_equipmentDetails: {
                            //     $cond: {
                            //         if: { $eq: ['$type', 'vehicle'] },
                            //         then: { $match: { vehicleDetails1: { $ne: {} } } },
                            //         else: { $match: { equipmentDetails1: { $ne: {} } } }
                            //     }
                            // }
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
                bookingModel.aggregate([
                    {
                        $match: obj
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

/**
 * Most Rented Equipments
 */
function most_rented_equipmentList(userId: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const { perPage = 10, page = 1, search } = query;
            let cond: any = {
                isDelete: false, bookingStatus: { $nin: ['Pending', 'Cancelled'] },
                companyProviderId: new mongoose.Types.ObjectId(userId),
                paymentStatus: 'paid'
            }
            let search_cond: any = { isDelete: false }
            if (search) {
                search_cond = {
                    ...search_cond,
                    [`${language == 'ar' ? 'ar_equipmentName' : 'equipmentName'}`]: { $regex: search, '$options': 'i' }
                }
            }
            const [list, count] = await Promise.all([
                bookingModel.aggregate([
                    {
                        $match: cond
                    },
                    {
                        $group: {
                            _id: '$equipmentId',
                            rentel_time: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { rentel_time: -1 }
                    },
                    {
                        $group: {
                            _id: null,
                            maxCount: { $first: "$rentel_time" },
                            items: { $push: { _id: "$_id", rentel_time: "$rentel_time" } } // Store _id and count in a flat structure
                        }
                    },
                    {
                        $unwind: "$items"
                    },
                    {
                        $addFields: { maxCount: "$maxCount" }
                    },
                    {
                        $match: { $expr: { $eq: ["$items.rentel_time", "$maxCount"] } } // Compare counts using $expr
                    },
                    {
                        $replaceRoot: { newRoot: "$items" }
                    },
                    {
                        $lookup: {
                            foreignField: "equipmentId",
                            localField: "_id",
                            as: "equipment_mediaDetails",
                            from: "equipment_medias",
                            pipeline: [
                                {
                                    $match: { isDelete: false, media_type: 'image' }
                                },
                                {
                                    $project: {
                                        equipment_imageUrl: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            foreignField: "_id",
                            localField: "_id",
                            as: "equipmentDetails",
                            from: "equipment",
                            pipeline: [
                                {
                                    $match: search_cond
                                },
                                {
                                    $project: {
                                        equipmentName: {
                                            $cond: {
                                                if: { $eq: [language, 'ar'] },
                                                then: "$ar_equipmentName",
                                                else: "$equipmentName"
                                            }
                                        }, equipmentPrice_perDay: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: '$equipmentDetails',
                            preserveNullAndEmptyArrays: false
                        }
                    },
                    {
                        $addFields: {
                            equipmentName: "$equipmentDetails.equipmentName",
                        }
                    },
                    {
                        $addFields: { equipmentPrice_perDay: "$equipmentDetails.equipmentPrice_perDay" }
                    },
                    {
                        $project: {
                            _id: 1,
                            rentel_time: 1,
                            equipmentName: 1,
                            equipmentPrice_perDay: 1,
                            equipmentImage: {
                                $cond: {
                                    if: { $eq: [{ $size: "$equipment_mediaDetails" }, 0] },
                                    then: '',
                                    else: { $arrayElemAt: ["$equipment_mediaDetails.equipment_imageUrl", 0] }
                                }
                            }
                        }
                    },
                    {
                        $skip: Number(perPage * page) - Number(perPage)
                    },
                    {
                        $limit: Number(perPage)
                    }
                ]),
                bookingModel.aggregate([
                    {
                        $match: cond
                    },
                    {
                        $group: {
                            _id: '$equipmentId',
                            rentel_time: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { rentel_time: -1 }
                    },
                    {
                        $group: {
                            _id: null,
                            maxCount: { $first: "$rentel_time" },
                            items: { $push: { _id: "$_id", rentel_time: "$rentel_time" } } // Store _id and count in a flat structure
                        }
                    },
                    {
                        $unwind: "$items"
                    },
                    {
                        $addFields: { maxCount: "$maxCount" }
                    },
                    {
                        $match: { $expr: { $eq: ["$items.rentel_time", "$maxCount"] } } // Compare counts using $expr
                    },
                    {
                        $replaceRoot: { newRoot: "$items" }
                    },
                    {
                        $lookup: {
                            foreignField: "_id",
                            localField: "_id",
                            as: "equipmentDetails",
                            from: "equipment",
                            pipeline: [
                                {
                                    $match: search_cond
                                },
                                {
                                    $project: {
                                        equipmentName: {
                                            $cond: {
                                                if: { $eq: [language, 'ar'] },
                                                then: "$ar_equipmentName",
                                                else: "$equipmentName"
                                            }
                                        }, equipmentPrice_perDay: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: '$equipmentDetails',
                            preserveNullAndEmptyArrays: false
                        }
                    },
                    {
                        $count: "totalCount"
                    }
                ])
            ]);
            resolve({ itemList: list, totalCount: count.length ? count[0].totalCount : 0 });
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Most Rented Vehicles
 */
function most_rented_vehicleList(userId: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const { perPage = 10, page = 1, search } = query;
            let cond: any = {
                isDelete: false, bookingStatus: { $nin: ['Pending', 'Cancelled'] },
                companyProviderId: new mongoose.Types.ObjectId(userId)
            }
            let search_cond: any = {}
            if (search) {
                search_cond = {
                    ...search_cond,
                    [`${language == 'ar' ? 'ar_type' : 'type'}`]: { $regex: search, '$options': 'i' }
                }
            }
            const [list, count] = await Promise.all([
                bookingModel.aggregate([
                    {
                        $match: cond
                    },
                    {
                        $group: {
                            _id: '$vehicleId',
                            rentel_time: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { rentel_time: -1 }
                    },
                    {
                        $group: {
                            _id: null,
                            maxCount: { $first: "$rentel_time" },
                            items: { $push: { _id: "$_id", rentel_time: "$rentel_time" } } // Store _id and count in a flat structure
                        }
                    },
                    {
                        $unwind: "$items"
                    },
                    {
                        $addFields: { maxCount: "$maxCount" }
                    },
                    {
                        $match: { $expr: { $eq: ["$items.rentel_time", "$maxCount"] } } // Compare counts using $expr
                    },
                    {
                        $replaceRoot: { newRoot: "$items" }
                    },
                    {
                        $lookup: {
                            foreignField: "vehicleId",
                            localField: "_id",
                            as: "vehicle_mediaDetails",
                            from: "vehicle_medias",
                            pipeline: [
                                {
                                    $match: { isDelete: false, media_type: 'image' }
                                },
                                {
                                    $project: {
                                        vehicle_imageUrl: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            foreignField: "_id",
                            localField: "_id",
                            as: "vehicleDetails",
                            from: "delivery_vehicles",
                            pipeline: [
                                {
                                    $match: search_cond
                                },
                                {
                                    $project: {
                                        type: {
                                            $cond: {
                                                if: { $eq: [language, 'ar'] },
                                                then: "$ar_type",
                                                else: "$type"
                                            }
                                        },
                                        priceInside_city_perDay: 1,
                                        priceInoutSide_city_perKm: 1,
                                        repeatingDeliveryAmount: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: '$vehicleDetails',
                            preserveNullAndEmptyArrays: false
                        }
                    },
                    {
                        $addFields: {
                            type: "$vehicleDetails.type",
                            priceInside_city_perDay: "$vehicleDetails.priceInside_city_perDay",
                            priceInoutSide_city_perKm: "$vehicleDetails.priceInoutSide_city_perKm",
                            repeatingDeliveryAmount: "$vehicleDetails.repeatingDeliveryAmount"
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            rentel_time: 1,
                            type: 1,
                            priceInside_city_perDay: 1,
                            priceInoutSide_city_perKm: 1,
                            repeatingDeliveryAmount: 1,
                            vehicleImage: {
                                $cond: {
                                    if: { $eq: [{ $size: "$vehicle_mediaDetails" }, 0] },
                                    then: '',
                                    else: { $arrayElemAt: ["$vehicle_mediaDetails.vehicle_imageUrl", 0] }
                                }
                            }
                        }
                    },
                    {
                        $skip: Number(perPage * page) - Number(perPage)
                    },
                    {
                        $limit: Number(perPage)
                    }
                ]),
                bookingModel.aggregate([
                    {
                        $match: cond
                    },
                    {
                        $group: {
                            _id: '$vehicleId',
                            rentel_time: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { rentel_time: -1 }
                    },
                    {
                        $group: {
                            _id: null,
                            maxCount: { $first: "$rentel_time" },
                            items: { $push: { _id: "$_id", rentel_time: "$rentel_time" } } // Store _id and count in a flat structure
                        }
                    },
                    {
                        $unwind: "$items"
                    },
                    {
                        $addFields: { maxCount: "$maxCount" }
                    },
                    {
                        $match: { $expr: { $eq: ["$items.rentel_time", "$maxCount"] } } // Compare counts using $expr
                    },
                    {
                        $replaceRoot: { newRoot: "$items" }
                    },
                    {
                        $lookup: {
                            foreignField: "_id",
                            localField: "_id",
                            as: "vehicleDetails",
                            from: "delivery_vehicles",
                            pipeline: [
                                {
                                    $match: search_cond
                                },
                                {
                                    $project: {
                                        type: {
                                            $cond: {
                                                if: { $eq: [language, 'ar'] },
                                                then: "$ar_type",
                                                else: "$type"
                                            }
                                        }, priceInside_city_perDay: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: '$vehicleDetails',
                            preserveNullAndEmptyArrays: false
                        }
                    },
                    {
                        $count: "totalCount"
                    }
                ])
            ]);
            resolve({ itemList: list, totalCount: count.length ? count[0].totalCount : 0 });
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Notification List
 */
function notificationList(userId: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const { page = 1, perPage = 10 } = query;
            let cond: any = {
                isDelete: false,
                userId: new mongoose.Types.ObjectId(userId)
            }
            let update_obj = {
                userId: userId, readStatus: false
            }
            const [list, update] = await Promise.all([
                user_notificationModel.aggregate([
                    {
                        $facet: {
                            data: [
                                {
                                    $match: cond
                                },
                                {
                                    $lookup: {
                                        foreignField: "_id",
                                        localField: "notificationId",
                                        as: "notifiationDetails",
                                        from: "notifications",
                                        pipeline: [
                                            {
                                                $match: { isDelete: false }
                                            },
                                            {
                                                $project: {
                                                    title: {
                                                        $cond: {
                                                            if: { $eq: [language, 'ar'] },
                                                            then: "$ar_title",
                                                            else: "$title"
                                                        }
                                                    },
                                                    description: {
                                                        $cond: {
                                                            if: { $eq: [language, 'ar'] },
                                                            then: "$ar_description",
                                                            else: "$description"
                                                        }
                                                    },
                                                    image: 1
                                                }
                                            },
                                        ]
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$notifiationDetails",
                                        preserveNullAndEmptyArrays: false
                                    }
                                },
                                {
                                    $project: {
                                        sentTo: 1,
                                        role: 1,
                                        sendTime: 1,
                                        sendDate: 1,
                                        readStatus: 1,
                                        title: "$notifiationDetails.title",
                                        description: "$notifiationDetails.description",
                                        image: "$notifiationDetails.image",
                                        createdAt: 1
                                    },
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
                            ],
                            count: [
                                {
                                    $match: cond
                                },
                                {
                                    $lookup: {
                                        foreignField: "_id",
                                        localField: "notificationId",
                                        as: "notifiationDetails",
                                        from: "notifications",
                                        pipeline: [
                                            {
                                                $match: { isDelete: false }
                                            },
                                        ]
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$notifiationDetails",
                                        preserveNullAndEmptyArrays: false
                                    }
                                },
                                {
                                    $count: "totalCount"
                                }
                            ]
                        }
                    }
                ]),
                user_notificationModel.updateMany(update_obj, { readStatus: true })
            ]);
            resolve({ itemList: list[0].data, count: list[0].count.length ? list[0].count[0].totalCount : 0 })
        } catch (err) {
            reject(err)
        }
    });
}

/**
 * Un read notification count and User Details
 */
function un_readNotification_count(userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            let cond = {
                userId: userId,
                readStatus: false,
                isDelete: false
            }
            const [count, userDetails] = await Promise.all([
                user_notificationModel.countDocuments(cond),
                user_renter_delivery_Model.findById(userId, { name: 1, image: 1 })
            ]);
            resolve({ userDetails: userDetails, un_readNotification_count: count });
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

export default {
    engineList,
    engineModelListBy_engineCompanyId,
    categoryList_forDropdrown,
    sub_categoryListByCatId_forDropdrown,
    subSub_categoryListBySubCatId_forDropdrown,
    vehicle_sizeTypeList,
    allCatList,
    vehicle_load_capacityList,
    cancelReasonList,
    inspectionList,
    rented_equipment_vehicleList,
    most_rented_equipmentList,
    most_rented_vehicleList,
    notificationList,
    un_readNotification_count,
    faqList
} as const;