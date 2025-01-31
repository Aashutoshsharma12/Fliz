import { messages } from "@Custom_message";
import favModel from "@models/favourite";
import mongoose from "mongoose";

function addFav(body: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { type, equipmentId, vehicleId, companyId } = body;
            body.userId = userId
            let check_obj: any = {
                userId: userId,
                type: type
            }
            if (type == 'equipment') {
                check_obj.equipmentId = equipmentId
            } else if (type == 'company') {
                check_obj.companyId = companyId
            }
            else {
                check_obj.vehicleId = vehicleId
            }
            const check = await favModel.findOneAndUpdate(check_obj, body, { new: true });
            if (check) {
                resolve(check);
            } else {
                const save = await favModel.create(body);
                resolve(save);
            }

        } catch (err) {
            reject(err)
        }
    });
}

function fav_list(userId: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const message = messages(language);
            const average_speed: any = process.env.Average_speed
            const { page = 1, perPage = 10, type = 'equipment', longitude = 77.3812, latitude = 28.6210 } = query;
            const cond = {
                userId: new mongoose.Types.ObjectId(userId),
                type: type,
                status: true,
                isDelete: false
            }
            if (type == 'vehicle') {
                const [list, count] = await Promise.all([
                    favModel.aggregate([
                        {
                            $match: cond
                        },
                        {
                            $lookup: {
                                foreignField: "_id",
                                localField: "vehicleId",
                                from: "delivery_vehicles",
                                as: "vehicleDetails",
                                pipeline: [
                                    {
                                        $match: { isDelete: false, isActive: true }
                                    },
                                    {
                                        $lookup: {
                                            from: "vehicle_addresses",
                                            let: { vehicleId: "$_id" },
                                            pipeline: [
                                                {
                                                    $geoNear: {
                                                        near: { type: "Point", coordinates: [longitude, latitude] },
                                                        distanceField: "distance",
                                                        spherical: true,
                                                        distanceMultiplier: 0.001, // Convert distance to kilometers
                                                        query: {
                                                            isActive: true,
                                                            isDelete: false,
                                                            // companyProviderId: new mongoose.Types.ObjectId(company_renterId)
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
                                                    $addFields: {
                                                        averageTime: {
                                                            $divide: ["$distance", parseFloat(average_speed)]
                                                        }
                                                        // distance1: { $arrayElemAt: ["$equipmentAddress.distance", 0] }
                                                    }
                                                },
                                                // {
                                                //     $match: { $expr: { $eq: ["$equipmentId", "$$equipmentId"] } }
                                                // },
                                                {
                                                    $sort: { distance: 1 }
                                                },
                                                {
                                                    $limit: 1
                                                }
                                            ],
                                            as: "vehicleAddress"
                                        }
                                    },
                                    {
                                        $unwind: {
                                            path: "$vehicleAddress",
                                            preserveNullAndEmptyArrays: true
                                        }
                                    },
                                    {
                                        $lookup: {
                                            foreignField: "vehicleId",
                                            localField: "_id",
                                            from: "vehicle_medias",
                                            as: "vehicle_mediaDetails",
                                            pipeline: [
                                                {
                                                    $match: { media_type: "image", isDelete: false }
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
                                        }
                                    },
                                    {
                                        $addFields: {
                                            available_Trucks: {
                                                $subtract: ["$total_truckAvailable", { $ifNull: ["$operational_truck", 0] }]
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $match: { vehicleDetails: { $ne: [] } }
                        },
                        {
                            $unwind: {
                                path: "$vehicleDetails",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $project: {
                                userId: 1,
                                type: 1,
                                vehicleId: 1,
                                status: 1,
                                updatedAt: 1,
                                "vehicleDetails.priceInside_city_perDay": 1,
                                "vehicleDetails.priceInoutSide_city_perKm": 1,
                                "vehicleDetails.sizeType": {
                                    $cond: {
                                        if: { $eq: [language, "ar"] },
                                        then: "$vehicleDetails.ar_sizeType",
                                        else: "$vehicleDetails.sizeType"
                                    }
                                },
                                "vehicleDetails.type": {
                                    $cond: {
                                        if: { $eq: [language, "ar"] },
                                        then: "$vehicleDetails.ar_type",
                                        else: "$vehicleDetails.type"
                                    }
                                },
                                "vehicleDetails.loadingCapacity": 1,
                                "vehicleDetails.isRepeatingDelivery": 1,
                                "vehicleDetails.repeatingDeliveryAmount": 1,
                                // "vehicleDetails.total_truckAvailable": 1,
                                "vehicleDetails.isPriceBreaking": 1,
                                "vehicleDetails.vehicleAddress.address": 1,
                                "vehicleDetails.vehicleAddress.city": 1,
                                "vehicleDetails.vehicleAddress.distance": {
                                    $divide: [
                                        { $trunc: { $multiply: ["$vehicleDetails.vehicleAddress.distance", 100] } },
                                        100
                                    ]
                                },
                                "vehicleDetails.vehicleAddress.averageTime": {
                                    $divide: [
                                        { $trunc: { $multiply: [{ $divide: ["$vehicleDetails.vehicleAddress.distance", parseFloat(average_speed)] }, 100] } },
                                        100
                                    ]
                                }, //Hours
                                "vehicleDetails.available_Trucks": 1,
                                companyId: "$vehicleDetails.company_deliveryId",
                                "vehicleDetails.vehicleImage": "$vehicleDetails.vehicle_mediaDetails.vehicle_imageUrl"
                            }
                        },
                        {
                            $sort: { updatedAt: -1 }
                        },
                        {
                            $skip: Number(page * perPage) - Number(perPage)
                        },
                        {
                            $limit: Number(perPage)
                        }
                    ]),
                    favModel.aggregate([
                        {
                            $match: cond
                        },
                        {
                            $lookup: {
                                foreignField: "_id",
                                localField: "vehicleId",
                                from: "delivery_vehicles",
                                as: "vehicleDetails",
                                pipeline: [
                                    {
                                        $match: { isDelete: false, isActive: true }
                                    },
                                    {
                                        $lookup: {
                                            from: "vehicle_addresses",
                                            let: { vehicleId: "$_id" },
                                            pipeline: [
                                                {
                                                    $geoNear: {
                                                        near: { type: "Point", coordinates: [longitude, latitude] },
                                                        distanceField: "distance",
                                                        spherical: true,
                                                        distanceMultiplier: 0.001, // Convert distance to kilometers
                                                        query: {
                                                            isActive: true,
                                                            isDelete: false,
                                                            // companyProviderId: new mongoose.Types.ObjectId(company_renterId)
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
                                                    $limit: 1
                                                }
                                            ],
                                            as: "vehicleAddress"
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $match: { vehicleDetails: { $ne: [] } }
                        },
                        {
                            $count: "totalCount"
                        }
                    ]),]);
                resolve({ itemList: list, count: count.length ? count[0].totalCount : 0 })
            } else if (type == 'company') {
                const [list, count] = await Promise.all([
                    favModel.aggregate([
                        {
                            $match: cond
                        },
                        {
                            $lookup: {
                                foreignField: "_id",
                                localField: "companyId",
                                from: "user_renter_deliveries",
                                as: "companyDetails",
                                pipeline: [
                                    {
                                        $match: { isDelete: false, isActive: true } // isVerified: false,
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
                                            foreignField: "company_deliveryId",
                                            as: "vehicleList",
                                            from: "delivery_vehicles",
                                            pipeline: [
                                                {
                                                    $match: { isDelete: false, isActive: true, isApproved: true, isPriceBreaking: true }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        $lookup: {
                                            localField: "_id",
                                            foreignField: "company_deliveryId",
                                            as: "vehicleList",
                                            from: "delivery_vehicles",
                                            pipeline: [
                                                {
                                                    $match: { isDelete: false, isActive: true, isApproved: true, isPriceBreaking: true }
                                                },
                                                {
                                                    $count: "totalCount"
                                                }
                                            ]
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
                                                    $match: { isDelete: false, isActive: true, isApproved: true, isPriceBreaking: true }
                                                },
                                                {
                                                    $count: "totalCount"
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        $project: {
                                            isBusiness: 1,
                                            role: 1,
                                            renter_priceBreakable: {
                                                $cond: {
                                                    if: {
                                                        $and: [
                                                            { $gt: [{ $size: "$equipmentList" }, 0] },
                                                            { $gt: [{ $arrayElemAt: ["$equipmentList.totalCount", 0] }, 0] }
                                                        ]
                                                    },
                                                    then: true,
                                                    else: false
                                                },
                                            },
                                            delivery_priceBreakable: {
                                                $cond: {
                                                    if: {
                                                        $and: [
                                                            { $gt: [{ $size: "$vehicleList" }, 0] },
                                                            { $gt: [{ $arrayElemAt: ["$vehicleList.totalCount", 0] }, 0] }
                                                        ]
                                                    },
                                                    then: true,
                                                    else: false
                                                }
                                            },
                                            company_rating: { $ifNull: ['$ratingDetails.averageRating', 0] },
                                            address: 1,
                                            city: 1,
                                            country: 1,
                                            image: 1,
                                            bannerImage: 1,
                                            name: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $match: {
                                companyDetails: { $ne: [] }
                            }
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
                                userId: 1,
                                type: 1,
                                companyId: 1,
                                status: 1,
                                updatedAt: 1
                            }
                        },

                        {
                            $sort: { updatedAt: -1 }
                        },
                        {
                            $skip: Number(page * perPage) - Number(perPage)
                        },
                        {
                            $limit: Number(perPage)
                        }
                    ]),
                    favModel.aggregate([
                        {
                            $match: cond
                        },
                        {
                            $lookup: {
                                foreignField: "_id",
                                localField: "companyId",
                                from: "user_renter_deliveries",
                                as: "companyDetails",
                                pipeline: [
                                    {
                                        $match: { isDelete: false, isActive: true } // isVerified: false,
                                    }
                                ]
                            }
                        },
                        {
                            $match: {
                                companyDetails: { $ne: [] }
                            }
                        },
                        {
                            $count: "totalCount"
                        }
                    ])]);
                resolve({ itemList: list, count: count.length ? count[0].totalCount : 0 })
            }
            else {
                const [list, count] = await Promise.all([
                    favModel.aggregate([
                        {
                            $match: cond
                        },
                        {
                            $lookup: {
                                foreignField: "_id",
                                localField: "equipmentId",
                                from: "equipment",
                                as: "equipmentDetails",
                                pipeline: [
                                    {
                                        $match: { isDelete: false, isActive: true }
                                    },
                                    {
                                        $lookup: {
                                            from: "equipment_addresses",
                                            let: { equipmentId: "$_id" },
                                            pipeline: [
                                                {
                                                    $geoNear: {
                                                        near: { type: "Point", coordinates: [longitude, latitude] },
                                                        distanceField: "distance",
                                                        spherical: true,
                                                        distanceMultiplier: 0.001, // Convert distance to kilometers
                                                        query: {
                                                            isActive: true,
                                                            isDelete: false,
                                                            // companyProviderId: new mongoose.Types.ObjectId(company_renterId)
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
                                                    $addFields: {
                                                        averageTime: {
                                                            $divide: ["$distance", parseFloat(average_speed)]
                                                        }
                                                        // distance1: { $arrayElemAt: ["$equipmentAddress.distance", 0] }
                                                    }
                                                },
                                                // {
                                                //     $match: { $expr: { $eq: ["$equipmentId", "$$equipmentId"] } }
                                                // },
                                                {
                                                    $sort: { distance: 1 }
                                                },
                                                {
                                                    $limit: 1
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
                                            foreignField: "equipmentId",
                                            localField: "_id",
                                            from: "equipment_medias",
                                            as: "equipment_mediaDetails",
                                            pipeline: [
                                                {
                                                    $match: { media_type: "image", isDelete: false }
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
                                        }
                                    },
                                    {
                                        $addFields: {
                                            equipmentName: {
                                                $cond: {
                                                    if: { $eq: [language, 'ar'] },
                                                    then: "$ar_equipmentName",
                                                    else: "$equipmentName"
                                                }
                                            },
                                            available_equipments: {
                                                $subtract: ["$total_equipmentAvailable", { $ifNull: ["$operational_equipments", 0] }]
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $match: { equipmentDetails: { $ne: [] } }
                        },
                        {
                            $unwind: "$equipmentDetails",
                        },
                        {
                            $project: {
                                userId: 1,
                                type: 1,
                                equipmentId: 1,
                                status: 1,
                                updatedAt: 1,
                                "equipmentDetails.equipmentPrice_perDay": 1,
                                // "equipmentDetails.total_equipmentAvailable": 1,
                                "equipmentDetails.isPriceBreaking": 1,
                                "equipmentDetails.equipmentAddress.address": 1,
                                "equipmentDetails.equipmentAddress.city": 1,
                                "equipmentDetails.equipmentAddress.distance": {
                                    $divide: [
                                        { $trunc: { $multiply: ["$equipmentDetails.equipmentAddress.distance", 100] } },
                                        100
                                    ]
                                },
                                "equipmentDetails.equipmentName": 1,
                                "equipmentDetails.equipmentAddress.averageTime": {
                                    $divide: [
                                        { $trunc: { $multiply: [{ $divide: ["$equipmentDetails.equipmentAddress.distance", parseFloat(average_speed)] }, 100] } },
                                        100
                                    ]
                                }, //Hours
                                companyId: "$equipmentDetails.companyProviderId",
                                "equipmentDetails.available_equipments": 1,
                                "equipmentDetails.equipmentImage": "$equipmentDetails.equipment_mediaDetails.equipment_imageUrl"
                            }
                        },
                        {
                            $sort: { updatedAt: -1 }
                        },
                        {
                            $skip: Number(page * perPage) - Number(perPage)
                        },
                        {
                            $limit: Number(perPage)
                        }
                    ]),
                    favModel.aggregate([
                        {
                            $match: cond
                        },
                        {
                            $lookup: {
                                foreignField: "_id",
                                localField: "equipmentId",
                                from: "equipment",
                                as: "equipmentDetails",
                                pipeline: [
                                    {
                                        $match: { isDelete: false, isActive: true }
                                    },
                                    {
                                        $lookup: {
                                            from: "equipment_addresses",
                                            let: { equipmentId: "$_id" },
                                            pipeline: [
                                                {
                                                    $geoNear: {
                                                        near: { type: "Point", coordinates: [longitude, latitude] },
                                                        distanceField: "distance",
                                                        spherical: true,
                                                        distanceMultiplier: 0.001, // Convert distance to kilometers
                                                        query: {
                                                            isActive: true,
                                                            isDelete: false,
                                                            // companyProviderId: new mongoose.Types.ObjectId(company_renterId)
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
                                                    $limit: 1
                                                }
                                            ],
                                            as: "equipmentAddress"
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $match: { equipmentDetails: { $ne: [] } }
                        },
                        {
                            $count: "totalCount"
                        }
                    ])]);
                resolve({ itemList: list, count: count.length ? count[0].totalCount : 0 })
            }
        } catch (err) {
            reject(err)
        }
    });
}

export default {
    addFav,
    fav_list
} as const;