import { messages } from "@Custom_message";
import bookingModel from "@models/booking";
import delivery_vehicleModel from "@models/delivery_vehicle";
import vehicle_addressModel from "@models/delivery_vehicleAddress";
import equipment_addressModel from "@models/equipment_address";
import equipmentModel from "@models/equipment";
import order_installmentModal from "@models/order_installment";
import user_renter_delivery_Model from "@models/user";
import user_visitModal from "@models/user_visit";
import { CustomError } from "@utils/errors";
import { StatusCodes } from "http-status-codes";
import moment from "moment-timezone";
import mongoose from "mongoose";
import { populate } from "@models/guest_user";
const ObjectId = mongoose.Types.ObjectId

function renter_deliveryList(query: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const { perPage = 10, page = 1, type, sizeType, loadingCapacity, role = "delivery", catId, subCatId, sub_subCatId, search } = query;
            let cond: any = {
                isDelete: false,
                isActive: true,
                isApproved: true,
                isBasicDetails: true,
                isMediaDetails: true,
                isaddressDetails: true
            }
            let comp_obj: any = {
                isDelete: false,
                isActive: true,
                isVerified: true
            }
            if (search) {
                comp_obj.name = { $regex: search, $options: 'i' }
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
                comp_obj.role = 'delivery_user'
                const [list, count] = await Promise.all([
                    await user_renter_delivery_Model.aggregate([
                        {
                            $match: comp_obj
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
                            $match: comp_obj
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
                comp_obj.role = 'renter_user'
                const [list, count] = await Promise.all([
                    await user_renter_delivery_Model.aggregate([
                        {
                            $match: comp_obj
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
                            $match: comp_obj
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
                                        $count: "equipmentCount"
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                equipmentCount: { $arrayElemAt: ["$equipmentList.equipmentCount", 0] }
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
                    ])
                ]);

                // cond = {
                //     ...cond,
                //     catId: { $in: [catId] }
                // }
                // if (subCatId && subCatId != '' && subCatId != null && subCatId != undefined) {
                //     cond.subCatId = { $in: [subCatId] }
                // }
                // if (sub_subCatId && sub_subCatId != '' && sub_subCatId != null && sub_subCatId != undefined) {
                //     cond.sub_subCatId = { $in: [sub_subCatId] }
                // }
                // const [list, count] = await Promise.all([
                //     user_renter_delivery_Model.aggregate([
                //         {
                //             $match: cond
                //         },
                //         {
                //             $project: {
                //                 "uniqueId": 1,
                //                 "name": 1,
                //                 "address": 1,
                //                 "addressLine1": 1,
                //                 "addressLine2": 1,
                //                 "lat": 1,
                //                 "long": 1,
                //                 "country": 1,
                //                 "zipcode": 1,
                //                 "state": 1,
                //                 "city": 1,
                //                 "image": 1
                //             }
                //         },
                //         {
                //             $sort: { createdAt: -1 }
                //         },
                //         {
                //             $skip: Number(page * perPage) - Number(perPage)
                //         },
                //         {
                //             $limit: Number(perPage)
                //         }
                //     ]),
                //     user_renter_delivery_Model.aggregate([
                //         {
                //             $match: cond
                //         },
                //         {
                //             $count: "totalCount"
                //         }
                //     ])
                // ])
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
            const { page = 1, perPage = 10, type, sizeType, loadingCapacity } = query;
            let cond: any = {
                isDelete: false,
                isActive: true,
                isApproved: true,
                isBasicDetails: true,
                isMediaDetails: true,
                isaddressDetails: true,
                company_deliveryId: new mongoose.Types.ObjectId(company_deliveryId)
            }
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
            const Average_speed: any = process.env.Average_speed
            const userDetails = await user_renter_delivery_Model.findById(userId, { lat: 1, long: 1 });
            if (userDetails) {
                let latitude = parseFloat(userDetails.lat);
                let longitude = parseFloat(userDetails.long);
                const [vehicles_list, count, companyDetails] = await Promise.all([
                    vehicle_addressModel.aggregate([
                        {
                            $geoNear: {
                                near: {
                                    type: "Point",
                                    coordinates: [longitude, latitude]
                                },
                                distanceField: "distance",
                                spherical: true,
                                distanceMultiplier: 0.001, // Convert distance to kilometers
                                query: { isActive: true, isDelete: false, company_deliveryId: new mongoose.Types.ObjectId(company_deliveryId) }
                            }
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
                                            localField: "_id",
                                            foreignField: "equipmentId",
                                            as: "fav_equipment",
                                            from: "fav_equipments_vehicles",
                                            pipeline: [
                                                {
                                                    $match: { userId: new mongoose.Types.ObjectId(userId), status: true }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        $addFields: {
                                            fav_equipment: {
                                                $cond: {
                                                    if: { $eq: ['$fav_equipment', []] },
                                                    then: false,
                                                    else: true
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
                                        $addFields: {
                                            "available_trucks": {
                                                $subtract: ["$total_truckAvailable", { $ifNull: ["$total_bookedVehicles.chosen_equipment", 0] }]
                                            },
                                            "operational_trucks": { $ifNull: ['$total_bookedVehicles.chosen_equipment', 0] },
                                            total_trucks: "$total_truckAvailable"
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
                            //     // $match: { vehicleDetails: { $ne: null }, 'vehicleDetails.available_trucks': { $ne: 0 } }
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
                                address: 1,
                                city: 1,
                                location: 1,
                                vehicleDetails: 1,
                                uniqueId: 1,
                                distance: {
                                    $divide: [
                                        { $trunc: { $multiply: ["$distance", 100] } },
                                        100
                                    ]
                                },
                                averageTime: {
                                    $divide: [
                                        { $trunc: { $multiply: [{ $divide: ["$distance", parseFloat(Average_speed)] }, 100] } },
                                        100
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                'vehicleDetails.total_bookedVehicles': 0
                            }
                        },
                        {
                            $sort: { distance: 1 } // Sort by distance in ascending order
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
                            $geoNear: {
                                near: {
                                    type: "Point",
                                    coordinates: [longitude, latitude]
                                },
                                distanceField: "distance",
                                spherical: true,
                                distanceMultiplier: 0.001, // Convert distance to kilometers
                                query: { isActive: true, isDelete: false, company_deliveryId: new mongoose.Types.ObjectId(company_deliveryId) }
                            }
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
                                        //  { isDelete: false, isApproved: true, isActive: true }
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
                            $lookup: {
                                localField: "_id",
                                foreignField: "companyId",
                                as: "fav_company",
                                from: "fav_equipments_vehicles",
                                pipeline: [
                                    {
                                        $match: { userId: new mongoose.Types.ObjectId(userId), status: true }
                                    }
                                ]
                            }
                        },
                        {
                            $project: {
                                company_rating: { $ifNull: ['$ratingDetails.averageRating', 0] },
                                name: 1,
                                image: 1,
                                bannerImage: 1,
                                isBusiness: 1,
                                company_description: {
                                    $cond: {
                                        if: { $eq: [language, 'ar'] },
                                        then: "$ar_company_description",
                                        else: "$company_description"
                                    }
                                },
                                fav_company: {
                                    $cond: {
                                        if: { $eq: ['$fav_company', []] },
                                        then: false,
                                        else: true
                                    }
                                }
                            }
                        }
                    ])
                ]);
                resolve({ companyDetails: companyDetails.length ? companyDetails[0] : {}, itemList: vehicles_list, totalCount: count.length ? count[0].totalCount : 0 });
            } else {
                resolve({ itemList: [], totalCount: 0 });
            }
        } catch (err) {
            reject(err)
        }
    });
}

function vehicleDetails(vehicleId: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            let longitude: number = 0
            let latitude: number = 0
            const { language = 'en', timezone = 'Asia/Calcutta' } = headers;
            const currentDate = moment().tz(timezone).format('YYYY-MM-DD')
            const message = messages(language);
            const userDetails: any = await user_renter_delivery_Model.findById(userId, { lat: 1, long: 1, address: 1, city: 1, country: 1, state: 1 });
            if (userDetails) {
                longitude = Number(userDetails.long)
                latitude = Number(userDetails.lat)
            } else {
                reject(new CustomError(message.somethingwrong, StatusCodes.BAD_REQUEST));
            }
            const vehicleDetails = await delivery_vehicleModel.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(vehicleId),
                        isDelete: false,
                        isActive: true,
                        isApproved: true,
                        isBasicDetails: true,
                        isMediaDetails: true,
                        isaddressDetails: true
                    }
                },
                {
                    $lookup: {
                        localField: "company_deliveryId",
                        foreignField: "_id",
                        as: "companyDetails",
                        from: "user_renter_deliveries",
                        pipeline: [
                            {
                                $project: {
                                    name: 1, image: 1, bannerImage: 1, company_description: 1, role: 1, isBusiness: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        localField: "company_deliveryId",
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
                    $lookup: {
                        from: "vehicle_addresses",
                        let: {
                            vehicleId: "$_id"
                        },
                        pipeline: [
                            {
                                $geoNear: {
                                    near: {
                                        type: "Point",
                                        coordinates: [longitude, latitude]
                                    },
                                    distanceField: "distance",
                                    spherical: true,
                                    distanceMultiplier: 0.001, // Convert distance to kilometers
                                    query: {
                                        isActive: true,
                                        isDelete: false
                                    }
                                }
                            },
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$vehicleId", { $toObjectId: "$$vehicleId" }]
                                    }
                                }
                            },
                            {
                                $sort: { distance: 1 }
                            },
                            {
                                $project: {
                                    distance: {
                                        $divide: [
                                            { $trunc: { $multiply: ["$distance", 100] } },
                                            100
                                        ]
                                    },
                                    location: 1,
                                    address: 1,
                                    city: 1,
                                    state: 1,
                                    country: 1,
                                    zipcode: 1,
                                    addressLine1: 1,
                                    addressLine2: 1
                                }
                            }
                        ],
                        as: "vehiclesAddress"
                    }
                },
                {
                    $unwind: {
                        path: "$vehiclesAddress",
                        preserveNullAndEmptyArrays: true
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
                        as: "fav_vehicle",
                        from: "fav_equipments_vehicles",
                        pipeline: [
                            {
                                $match: { userId: new mongoose.Types.ObjectId(userId), status: true }
                            }
                        ]
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
                                                // {
                                                //     $cond: {
                                                //         if: { $eq: [language, "ar"] },
                                                //         then: "$ar_keyName",
                                                //         else: "$keyName"
                                                //     }
                                                // }
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
                                                ar_keyValue: 1,
                                                // {
                                                //     $cond: {
                                                //         if: { $eq: [language, "ar"] },
                                                //         then: "$ar_keyValue",
                                                //         else: "$keyValue"
                                                //     }
                                                // }
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
                                    ar_keyValueDetails: "$keyValueDetails.ar_keyValue",
                                    keyDetails: "$keyDetails.keyName",
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
                        fav_vehicle: {
                            $cond: {
                                if: { $eq: ['$fav_vehicle', []] },
                                then: false,
                                else: true
                            }
                        },
                        tax: {
                            $cond: {
                                if: { $eq: [{ $size: "$taxDetails" }, 0] },
                                then: 0,
                                else: { $arrayElemAt: ["$taxDetails.tax", 0] }
                            }
                        },                        // vehiclesAddress: {
                        //     $cond: {
                        //         if: { $eq: [{ $size: "$vehiclesAddress" }, 0] },
                        //         then: {},
                        //         else: { $arrayElemAt: ["$vehiclesAddress", 0] }
                        //     }
                        // },
                        companyDetails: {
                            $cond: {
                                if: { $eq: [{ $size: "$companyDetails" }, 0] },
                                then: {},
                                else: { $arrayElemAt: ["$companyDetails", 0] }
                            }
                        },
                        rating: { $ifNull: ['$ratingDetails.averageRating', 0] }
                    }
                },
                {
                    $addFields: {
                        'companyDetails.company_rating': "$rating"
                    }
                },
                {
                    $project: {
                        total_truckAvailable: 0,
                        taxDetails: 0,
                        ratingDetails: 0,
                        rating: 0
                    }
                }
            ]);
            let data: any = {}
            if (vehicleDetails.length) {
                data = vehicleDetails[0]
                data.userDetails = userDetails
            }
            resolve(data);
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
            const { page = 1, perPage = 10, catId, subCatId, sub_subCatId } = query;
            const currentDate = moment().tz(timezone).format('YYYY-MM-DD')
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
            const userDetails = await user_renter_delivery_Model.findById(userId, { lat: 1, long: 1 });
            if (userDetails) {
                let latitude = parseFloat(userDetails.lat);
                let longitude = parseFloat(userDetails.long);
                const [equipments_list, count, companyDetails] = await Promise.all([
                    equipment_addressModel.aggregate([
                        {
                            $geoNear: {
                                near: {
                                    type: "Point",
                                    coordinates: [longitude, latitude]
                                },
                                distanceField: "distance",
                                spherical: true,
                                distanceMultiplier: 0.001, // Convert distance to kilometers
                                query: { isActive: true, isDelete: false, companyProviderId: new mongoose.Types.ObjectId(company_renterId) }
                            }
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
                                            localField: "_id",
                                            foreignField: "equipmentId",
                                            as: "fav_equipment",
                                            from: "fav_equipments_vehicles",
                                            pipeline: [
                                                {
                                                    $match: { userId: new mongoose.Types.ObjectId(userId), status: true }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        $addFields: {
                                            fav_equipment: {
                                                $cond: {
                                                    if: { $eq: ['$fav_equipment', []] },
                                                    then: false,
                                                    else: true
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
                            // $match: { equipmentDetails: { $ne: null }, 'equipmentDetails.available_equipments': { $ne: 0 } }
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
                                address: 1,
                                city: 1,
                                location: 1,
                                equipmentDetails: 1,
                                total_bookedEquipment: 1,
                                // distance: { $round: "$distance" },
                                uniqueId: 1,
                                distance: {
                                    $divide: [
                                        { $trunc: { $multiply: ["$distance", 100] } },
                                        100
                                    ]
                                },
                                averageTime: {
                                    $divide: [
                                        { $trunc: { $multiply: [{ $divide: ["$distance", parseFloat(Average_speed)] }, 100] } },
                                        100
                                    ]
                                }
                                //Average_speed : 50 KM/Hour
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
                                "equipmentDetails.sub_subCategoryId": 0,
                                "equipmentDetails.total_equipmentAvailable": 0,
                                "equipmentDetails.total_bookedEquipment": 0
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
                            $geoNear: {
                                near: {
                                    type: "Point",
                                    coordinates: [longitude, latitude]
                                },
                                distanceField: "distance",
                                spherical: true,
                                distanceMultiplier: 0.001, // Convert distance to kilometers
                                query: { isActive: true, isDelete: false, companyProviderId: new mongoose.Types.ObjectId(company_renterId) }
                            }
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
                                            "operational_equipments": { $ifNull: ['$total_bookedEquipment.chosen_equipment', 0] }
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
                            // $match: { equipmentDetails: { $ne: null }, 'equipmentDetails.available_equipments': { $ne: 0 } }
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
                            $lookup: {
                                localField: "_id",
                                foreignField: "companyId",
                                as: "fav_company",
                                from: "fav_equipments_vehicles",
                                pipeline: [
                                    {
                                        $match: { userId: new mongoose.Types.ObjectId(userId), status: true }
                                    }
                                ]
                            }
                        },
                        {
                            $project: {
                                company_rating: { $ifNull: ['$ratingDetails.averageRating', 0] },
                                name: 1,
                                image: 1,
                                bannerImage: 1,
                                isBusiness: 1,
                                company_description: {
                                    $cond: {
                                        if: { $eq: [language, 'ar'] },
                                        then: "$ar_company_description",
                                        else: "$company_description"
                                    }
                                },
                                fav_company: {
                                    $cond: {
                                        if: { $eq: ['$fav_company', []] },
                                        then: false,
                                        else: true
                                    }
                                }
                            }
                        }
                    ])
                ]);
                resolve({ companyDetails: companyDetails.length ? companyDetails[0] : {}, itemList: equipments_list, totalCount: count.length ? count[0].totalCount : 0 });
            } else {
                resolve({ itemList: [], totalCount: 0 });
            }
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
            let longitude: number = 0
            let latitude: number = 0
            const userDetails: any = await user_renter_delivery_Model.findById(userId, { lat: 1, long: 1, address: 1, city: 1, country: 1, state: 1 });
            if (userDetails) {
                longitude = Number(userDetails.long)
                latitude = Number(userDetails.lat)
            } else {
                reject(new CustomError(message.somethingwrong, StatusCodes.BAD_REQUEST));
            }
            const equipmentDetails = await equipmentModel.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(equipmentId),
                        isDelete: false,
                        isActive: true,
                        isApproved: true,
                        isBasicDetails: true,
                        isMediaDetails: true,
                        isaddressDetails: true
                    }
                },
                {
                    $lookup: {
                        localField: "companyProviderId",
                        foreignField: "_id",
                        as: "companyDetails",
                        from: "user_renter_deliveries",
                        pipeline: [
                            {
                                $project: {
                                    name: 1, image: 1, bannerImage: 1, company_description: 1, role: 1, isBusiness: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        localField: "companyProviderId",
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
                        as: "fav_equipment",
                        from: "fav_equipments_vehicles",
                        pipeline: [
                            {
                                $match: { userId: new mongoose.Types.ObjectId(userId), status: true }
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
                        from: "equipment_addresses",
                        let: {
                            equipmentId: "$_id"
                        },
                        pipeline: [
                            {
                                $geoNear: {
                                    near: {
                                        type: "Point",
                                        coordinates: [longitude, latitude]
                                    },
                                    distanceField: "distance",
                                    spherical: true,
                                    distanceMultiplier: 0.001, // Convert distance to kilometers
                                    query: {
                                        isActive: true,
                                        isDelete: false
                                    }
                                }
                            },
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$equipmentId", { $toObjectId: "$$equipmentId" }]
                                    }
                                }
                            },
                            {
                                $sort: { distance: 1 }
                            },
                            {
                                $project: {
                                    distance: {
                                        $divide: [
                                            { $trunc: { $multiply: ["$distance", 100] } },
                                            100
                                        ]
                                    },
                                    location: 1,
                                    address: 1,
                                    city: 1,
                                    state: 1,
                                    country: 1,
                                    zipcode: 1,
                                    addressLine1: 1,
                                    addressLine2: 1
                                }
                            }
                        ],
                        as: "equipmentAddress"
                    }
                },
                {
                    $unwind: {
                        path: "$equipmentAddress",
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
                        specifications: "$specifications",
                        available_equipments: {
                            $subtract: ["$total_equipmentAvailable", { $ifNull: ["$total_bookedEquipment.chosen_equipment", 0] }]
                        },
                        operational_equipments: { $ifNull: ['$total_bookedEquipment.chosen_equipment', 0] },
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
                        fav_equipment: {
                            $cond: {
                                if: { $eq: ['$fav_equipment', []] },
                                then: false,
                                else: true
                            }
                        },
                        tax: {
                            $cond: {
                                if: { $eq: [{ $size: "$taxDetails" }, 0] },
                                then: 0,
                                else: { $arrayElemAt: ["$taxDetails.tax", 0] }
                            }
                        },
                        companyDetails: {
                            $cond: {
                                if: { $eq: [{ $size: "$companyDetails" }, 0] },
                                then: {},
                                else: { $arrayElemAt: ["$companyDetails", 0] }
                            }
                        },
                        rating: { $ifNull: ['$ratingDetails.averageRating', 0] }
                    }
                },
                {
                    $addFields: {
                        'companyDetails.company_rating': "$rating",
                        total_equipments: "$total_equipmentAvailable"
                    }
                },
                {
                    $project: {
                        total_equipmentAvailable: 0,
                        total_bookedEquipment: 0,
                        taxDetails: 0,
                        rating: 0,
                        ratingDetails: 0
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
                        Booking_count: 1
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

function check_equipmentAvailability(userId: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en', timezone = 'Asia/Calcutta' } = headers;
            const message = messages(language);
            const { type = 'equipment', Id } = query;
            const currentDate = moment().tz(timezone).format('YYYY-MM-DD')
            if (type == 'vehicle') {
                const check_vehicle: any = await delivery_vehicleModel.aggregate([
                    {
                        $match: { _id: new mongoose.Types.ObjectId(Id) }
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
                        $project: {
                            "available_trucks": {
                                $subtract: ["$total_truckAvailable", { $ifNull: ["$total_bookedVehicles.chosen_equipment", 0] }]
                            },
                            "operational_trucks": { $ifNull: ['$total_bookedVehicles.chosen_equipment', 0] },
                            total_trucks: "$total_truckAvailable"
                        }
                    },
                ]);
                if (check_vehicle.length)
                    if (check_vehicle[0].available_trucks == 0)
                        reject(new CustomError(message.transport_notAvailable, StatusCodes.BAD_REQUEST));
                    else
                        resolve({ success: true })
                else
                    reject(new CustomError(message.noDatafoundWithID, StatusCodes.BAD_REQUEST));

            } else {
                const check = await equipmentModel.aggregate([
                    {
                        $match: { _id: new mongoose.Types.ObjectId(Id) }
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
                        $project: {
                            "available_equipments": {
                                $subtract: ["$total_equipmentAvailable", { $ifNull: ["$total_bookedEquipment.chosen_equipment", 0] }]
                            },
                            "operational_equipments": { $ifNull: ['$total_bookedEquipment.chosen_equipment', 0] },
                            total_equipments: "$total_equipmentAvailable"
                        }
                    },
                ]);
                if (check.length)
                    if (check[0].available_equipments == 0)
                        reject(new CustomError(message.equipment_notAvailable, StatusCodes.BAD_REQUEST));
                    else
                        resolve({ success: true })
                else
                    reject(new CustomError(message.noDatafoundWithID, StatusCodes.BAD_REQUEST));
            }
        } catch (err) {
            reject(err)
        }
    });
}

/**
 * Upcomming / Over Due Installments
 * @param userId 
 * @param headers 
 * @returns 
 */
function upcomming_installment(userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            // const data = await order_installmentModal.find({ userId: userId, isDelete: false, paymentStatus: 'unpaid', confirmBookingStatus: true },
            //     { date: 1, time: 1, paymentStatus: 1, totalAmount: 1, paidAmount: 1, orderId: 1 }).
            //     populate([{ path: "companyProviderId", select: 'name image company_description' }, {
            //         path: "orderId", select: 'delivery_addressDetails order_startDate order_startTime order_endDate order_endTime equipmentId vehicleId bookingStatus', match: { bookingStatus: { $ne: "Cancelled" } },
            //         populate: [{
            //             path: "equipmentId",
            //             select: "equipmentName ar_equipmentName image"
            //         },
            //         {
            //             path: "vehicleId",
            //             select: "sizeType ar_sizeType"
            //         }
            //         ]
            //     }]).
            //     sort({ date: 1, time: 1 }).
            //     limit(1);
            // // const filter_payment = data.filter(item => item.orderId)
            // // resolve(filter_payment.length ? filter_payment[0] : {});
            const data = await order_installmentModal.aggregate([
                {
                    $match: { userId: new mongoose.Types.ObjectId(userId), isDelete: false, paymentStatus: 'unpaid', confirmBookingStatus: true }
                },
                {
                    $project: {
                        date: 1, time: 1, paymentStatus: 1, companyProviderId: 1, totalAmount: 1, paidAmount: 1, orderId: 1
                    }
                },
                {
                    $lookup: {
                        localField: "companyProviderId",
                        foreignField: "_id",
                        from: "user_renter_deliveries",
                        as: "companyProviderId",
                        pipeline: [
                            {
                                $project: {
                                    name: 1, image: 1, company_description: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$companyProviderId",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        localField: "orderId",
                        foreignField: "_id",
                        from: "bookings",
                        as: "orderId",
                        pipeline: [
                            {
                                $match: {
                                    bookingStatus: { $ne: "Cancelled" }
                                }
                            },
                            {
                                $lookup: {
                                    localField: "equipmentId",
                                    foreignField: "_id",
                                    from: "equipment",
                                    as: "equipmentId",
                                    pipeline: [
                                        {
                                            $project: {
                                                ar_equipmentName: 1, image: 1, equipmentName: 1
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $lookup: {
                                    localField: "vehicleId",
                                    foreignField: "_id",
                                    from: "delivery_vehicles",
                                    as: "vehicleId",
                                    pipeline: [
                                        {
                                            $project: {
                                                sizeType: 1, ar_sizeType: 1
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $unwind: {
                                    path: "$vehicleId",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $unwind: {
                                    path: "$equipmentId",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $project: {
                                    delivery_addressDetails: 1,
                                    order_startDate: 1,
                                    order_startTime: 1,
                                    order_endDate: 1,
                                    order_endTime: 1,
                                    equipmentId: 1,
                                    vehicleId: 1,
                                    bookingStatus: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $match: { orderId: { $ne: [] } }
                },
                {
                    $sort: { date: 1, time: 1 }
                },
                { $limit: 1 },
                {
                    $unwind: {
                        path: "$orderId",
                        preserveNullAndEmptyArrays: false
                    }
                }
            ]);
            resolve(data.length ? data[0] : {});
        } catch (err) {
            reject(err)
        }
    });
}

/***
 * Check user for Business to Business order
 */
function check_user_forB2B(userId: any, type: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en', timezone = 'Asia/Calcutta' } = headers;
            const message = messages(language);
            const userDetails = await user_renter_delivery_Model.findById(userId, { countryCode: 1, phoneNumber: 1 });
            if (userDetails) {
                let obj = {
                    countryCode: userDetails.countryCode,
                    phoneNumber: userDetails.phoneNumber,
                    role: type,
                    isDelete: false
                }
                const checkBusiness = await user_renter_delivery_Model.findOne(obj, { role: 1, isActive: 1 });
                if (checkBusiness) {
                    if (checkBusiness.isActive == true) {
                        resolve({ success: true })
                    }
                    resolve({ success: true })
                    // reject(new CustomError(message.accountBlocked, StatusCodes.FORBIDDEN));
                } else {
                    resolve({ success: true })
                    // reject(new CustomError(message.B2B, StatusCodes.BAD_REQUEST));
                }
            } else {
                resolve({ success: true })
                // reject(new CustomError(message.somethingwrong, StatusCodes.BAD_REQUEST));
            }
        } catch (err) {
            reject(err)
        }
    });
}

export default {
    renter_deliveryList,
    vehilceList,
    vehicleDetails,
    equipmentList,
    equipmentDetails,
    addVisit_user,
    recommendedProduct,
    check_equipmentAvailability,
    upcomming_installment,
    check_user_forB2B
} as const;
