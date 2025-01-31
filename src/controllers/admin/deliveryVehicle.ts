import { resolveClientEndpointParameters } from "@aws-sdk/client-s3/dist-types/endpoint/EndpointParameters";
import { messages } from "@Custom_message";
import bookingModel from "@models/booking";
import delivery_vehicleModel from "@models/delivery_vehicle";
import vehicle_addressModel from "@models/delivery_vehicleAddress";
import vehicle_mediaModel from "@models/delivery_vehicleMedia";
import { CustomError } from "@utils/errors";
import { identityGenerator } from "@utils/helpers";
import { StatusCodes } from "http-status-codes";
import moment from "moment-timezone";
import mongoose from "mongoose";

function listDelivery_Vehicle(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const message = messages(language);
            const { company_deliveryId, page = 1, perPage = 10, type, isActive } = query;
            let condition: any = { isDelete: false, company_deliveryId: company_deliveryId };
            if (type !== "" && type !== undefined && type) {
                condition = {
                    ...condition, $or: [
                        { type: { $regex: type, $options: "i" } },
                        { ar_type: { $regex: type, $options: "i" } },
                    ],
                }
            }
            if (isActive === "Active") {
                condition = { ...condition, isActive: true }
            }
            else if (isActive === "InActive") {
                condition = { ...condition, isActive: false }
            }
            else if (isActive === "all") {
                condition.isActive === null;
            }
            const [totalOngoingOrder, totalcompleteOrder, totalVehicle, totalOrder, totalDocument, vehicleDetails] = await Promise.all([bookingModel.countDocuments({ isDelete: false, companyProviderId: company_deliveryId, type: "vehicle", bookingStatus: "Confirmed" }), bookingModel.countDocuments({ isDelete: false, companyProviderId: company_deliveryId, type: "vehicle", bookingStatus: "Completed" }), delivery_vehicleModel.countDocuments({ isDelete: false, company_deliveryId: company_deliveryId }), bookingModel.countDocuments({ isDelete: false, type: "vehicle", companyProviderId: company_deliveryId }), delivery_vehicleModel.countDocuments(condition), delivery_vehicleModel.find(condition).sort({ createdAt: -1 }).skip((page - 1) * perPage).limit(perPage)])
            resolve({ totalOngoingOrder: totalOngoingOrder, totalcompleteOrder: totalcompleteOrder, totalOrder: totalOrder, totalVehicle: totalVehicle, totalDocument: totalDocument, vehicleDetails });
        }
        catch (error) {
            reject(error);
        }
    })
}

function editTransport(body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const session = await mongoose.startSession();  // Start the session
        session.startTransaction(); // Begin transaction
        try {
            const { language } = headers;
            const message = messages(language);
            const { isPriceBreaking, vehicleId, mediaDetails, addressDetails, isRepeatingDelivery } = body;
            if (isPriceBreaking == false) {
                body.priceBreaking_details = {
                    time: '',
                    minimumAmount: 0,
                    dueAmount: 0
                }
            }
            if (isRepeatingDelivery == true) {
                body.priceInside_city_perDay = 0
            } else {
                body.repeatingDeliveryAmount = 0
            }
            const details: any = await delivery_vehicleModel.findOne({ _id: vehicleId, isDelete: false }).session(session);
            if (details) {
                await delivery_vehicleModel.updateOne({ _id: vehicleId, isDelete: false }, body).session(session)
                const { company_deliveryId } = details;
                const { imagesUrl = [], videoUrl, termsUrl, contractUrl } = mediaDetails;
                if (mediaDetails) {
                    if (Array.isArray(imagesUrl) && imagesUrl.length > 0) {
                        const imageTask = imagesUrl.map(async (item: any) => {
                            if (item._id && item._id != '' && item._id != undefined && item._id != null) {
                                await vehicle_mediaModel.updateOne({ _id: item._id, isDelete: false }, { vehicle_imageUrl: item.vehicle_imageUrl }).session(session);
                            } else {
                                const obj: any = {
                                    vehicleId: vehicleId,
                                    isMediaDetails: true,
                                    company_deliveryId: company_deliveryId
                                }
                                const count = await vehicle_mediaModel.countDocuments({ media_type: 'image' })
                                obj.vehicle_imageUrl = item.vehicle_imageUrl
                                obj.media_type = 'image'
                                obj.uniqueId = identityGenerator("vehicle_media", count)
                                await vehicle_mediaModel.create([obj], { session });
                            }
                        });
                        await Promise.all(imageTask);
                    }
                    if (videoUrl && videoUrl != '' && videoUrl != undefined && videoUrl != null) {
                        console.log(videoUrl, "eooee")
                        const check_Video = await vehicle_mediaModel.findOne({ vehicleId: vehicleId, isDelete: false, media_type: 'video' });
                        if (check_Video) {
                            await vehicle_mediaModel.updateOne({ _id: check_Video._id, isDelete: false }, { vehicle_videoUrl: videoUrl }).session(session);
                        } else {
                            const obj: any = {
                                vehicleId: vehicleId,
                                isMediaDetails: true,
                                company_deliveryId: company_deliveryId
                            }
                            const count = await vehicle_mediaModel.countDocuments({ media_type: 'video' })
                            obj.vehicle_videoUrl = videoUrl
                            obj.media_type = 'video'
                            obj.uniqueId = identityGenerator("vehicle_media", count)
                            await vehicle_mediaModel.create([obj], { session });
                        }
                    }
                    if (termsUrl && termsUrl != '' && termsUrl != undefined && termsUrl != null) {
                        const check_termUrl = await vehicle_mediaModel.findOne({ vehicleId: vehicleId, isDelete: false, media_type: 'termsUrl' });
                        if (check_termUrl) {
                            await vehicle_mediaModel.updateOne({ _id: check_termUrl._id, isDelete: false }, { vehicle_termsUrl: termsUrl }).session(session);
                        } else {
                            const obj: any = {
                                vehicleId: vehicleId,
                                company_deliveryId: company_deliveryId
                            }
                            const count = await vehicle_mediaModel.countDocuments()
                            obj.vehicle_termsUrl = termsUrl
                            obj.media_type = 'termsUrl'
                            obj.uniqueId = identityGenerator("vehicle_media", count)
                            await vehicle_mediaModel.create([obj], { session });
                        }
                    }
                    if (contractUrl && contractUrl != '' && contractUrl != undefined && contractUrl != null) {
                        const check_contractUrl = await vehicle_mediaModel.findOne({ vehicleId: vehicleId, isDelete: false, media_type: 'contractUrl' });
                        if (check_contractUrl) {
                            await vehicle_mediaModel.updateOne({ _id: check_contractUrl._id, isDelete: false }, { vehicle_contractUrl: contractUrl }).session(session);
                        } else {
                            const obj: any = {
                                vehicleId: vehicleId,
                                company_deliveryId: company_deliveryId
                            }
                            const count = await vehicle_mediaModel.countDocuments()
                            obj.vehicle_contractUrl = contractUrl
                            obj.media_type = 'contractUrl'
                            obj.uniqueId = identityGenerator("vehicle_media", count)
                            await vehicle_mediaModel.create([obj], { session });
                        }
                    }
                } else {
                    throw new CustomError(message.mediaRequired, StatusCodes.BAD_REQUEST);
                }
                if (addressDetails.length) {
                    const total_selectVehicle = addressDetails.reduce((total: any, detail: any) => total + detail.availableTruck, 0);
                    const total_truckAvailable = details ? details.total_truckAvailable : 0
                    if (total_truckAvailable < total_selectVehicle) {
                        throw (new CustomError(message.maxVehicleCount.replace('{{totalVehicles}}', details.total_truckAvailable).replace('{{selectedVehicle}}', total_selectVehicle), StatusCodes.BAD_REQUEST))
                    } else {
                        const updateTasks = addressDetails.map(async (item: any) => {
                            if (item.addressId && item.addressId != '' && item.addressId != undefined && item.addressId != null) {
                                await vehicle_addressModel.updateOne({ _id: item.addressId }, item).session(session);
                            } else {
                                const obj: any = {
                                    vehicleId: vehicleId,
                                    company_deliveryId: company_deliveryId,
                                    ...item
                                }
                                const count = await vehicle_addressModel.countDocuments();
                                obj.uniqueId = identityGenerator("vehicle_address", count)
                                await vehicle_addressModel.create([obj], { session });
                            }
                        });
                        await Promise.all(updateTasks);
                        await delivery_vehicleModel.updateOne({ _id: vehicleId }, { isaddressDetails: true }).session(session);
                    }
                } else {
                    throw new CustomError(message.addressRequired, StatusCodes.BAD_REQUEST);
                }
                await delivery_vehicleModel.updateOne({ _id: vehicleId, isDelete: false }, { isMediaDetails: true, isaddressDetails: true, isBasicDetails: true }).session(session)
                await session.commitTransaction()
                resolve({ success: true });
            } else {
                throw (
                    new CustomError(
                        message.somethingwrong,
                        StatusCodes.BAD_REQUEST
                    )
                );
            }

        }
        catch (error) {
            // Abort the transaction in case of an error
            await session.abortTransaction();
            reject(error);
        } finally {
            // End the session
            session.endSession();
        }
    })
}

function delete_images_videos(body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { image_videosId, vehicleId } = body;
            await vehicle_mediaModel.updateOne({ _id: image_videosId, vehicleId: vehicleId, media_type: { $in: ["image", "video"] } }, { isDelete: true });
            // deleteImage_from_S3Bucket(image_videosId, 'equipment')
            resolve({ success: true });
        } catch (err) {
            reject(err)
        }
    });
}

function delete_address(body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { addressId, vehicleId } = body;
            await vehicle_addressModel.updateMany({ _id: addressId, vehicleId: vehicleId }, { isDelete: true });
            resolve({ success: true });
        } catch (err) {
            reject(err)
        }
    });
}

function deliveryVehicleDetails(params: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language, timezone = 'Asia/Calcutta' } = headers;
            const message = messages(language);
            const currentDate = moment().tz(timezone).format('YYYY-MM-DD')
            const order_message = message.not_allowed_delete_equip_vehicle.replace("{{type}}", 'vehicle')
            const { id } = params;
            const response = await delivery_vehicleModel.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id),
                        isDelete: false,
                    },
                },
                {
                    $lookup: {
                        from: "user_renter_deliveries",
                        localField: "company_deliveryId",
                        foreignField: "_id",
                        as: "company_details"
                    }
                },
                {
                    $unwind: {
                        path: "$company_details",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "vehicle_addresses",
                        localField: "_id",
                        foreignField: "vehicleId",
                        pipeline:[
                            {
                                $match:{isDelete:false}
                            }
                        ],
                        as: "vehicle_address"
                    }
                },
                {
                    $lookup: {
                        from: "vehicle_medias",
                        localField: "_id",
                        foreignField: "vehicleId",
                        pipeline:[
                            {
                                $match:{isDelete:false}
                            }
                        ],
                        as: "vehicle_media"
                    }
                },
                {
                    $lookup:{
                        from:"vehilce_specifications",
                        localField:"_id",
                        foreignField:"vehicleId",
                        pipeline:[
                            {
                                $match:{isDelete:false}
                            },
                            {
                               $project:{
                                createdAt:0,
                                isDelete:0,
                                updatedAt:0
                               }
                            }
                        ],
                        as:"vehicleSpecifications"
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
                    $project: {
                        type: 1,
                        ar_type: 1,
                        any_order_running: {
                            $cond: {
                                if: { $gt: ['$operational_trucks', 0] },
                                then: true,
                                else: false
                            }
                        },
                        order_message: order_message,
                        sizeType: 1,
                        sizeTypeId:1,
                        ar_sizeType:1,
                        loadingCapacity: 1,
                        loadingCapacityId:1,
                        priceBreaking_details: 1,
                        priceInside_city_perDay: 1,
                        priceInoutSide_city_perKm: 1,
                        total_truckAvailable: 1,
                        operational_truck: 1,
                        isRepeatingDelivery: 1,
                        repeatingDeliveryAmount:1, 
                        isPriceBreaking: 1,
                        vehicle_engineMake: 1,
                        vehicle_engineModel: 1,
                        vehicle_enginePower: 1,
                        vehicle_fuelCapacity: 1,
                        vehicle_total_cylinders: 1,
                        vehicle_wheelBase: 1,
                        vehicle_width: 1,
                        isOil_coolant: 1,
                        isApproved: 1,
                        "company_details.name": 1,
                        "company_details.email": 1,
                        "company_details.address": 1,
                        "company_details.addressLine1": 1,
                        "company_details.addressLine2": 1,
                        vehicle_address: 1,
                        "vehicle_media": 1,
                        vehicleCommission:1,
                        vehicleSpecifications:1
                    }
                }
            ])
            resolve(response.length ? response[0] : {});
        }
        catch (error) {
            reject(error);
        }
    })
}

function deleteDeliveryVehicle(params: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language } = headers;
            const message = messages(language);
            const { id } = params;
            const response = await delivery_vehicleModel.findOneAndUpdate({ _id: id, isDelete: false }, { isDelete: true });
            if (response) {
                resolve({ success: true });
            }
            else {
                reject(
                    new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
                );
            }
        }
        catch (error) {
            throw (error);
        }
    })
}

function changeDeliveryStatus(params: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language } = headers;
            const message = messages(language);
            const { id } = params;
            const { isActive } = query;
            const response = await delivery_vehicleModel.findOneAndUpdate({ _id: id, isDelete: false }, { isActive: isActive });
            if (response) {
                resolve({ success: true });
            }
            else {
                reject(
                    new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
                );
            }
        }
        catch (error) {
            reject(error);
        }

    })
}

function deliveryVerification(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {

            const { language } = headers;
            const message = messages(language);
            const { deliveryId, approve } = query;

            const response_Varified = await delivery_vehicleModel.findByIdAndUpdate(
                { _id: deliveryId, isDelete: false },
                { isApproved: approve },
                { new: true, fields: { isApproved: 1 } }
            );

            if (response_Varified) {
                resolve(response_Varified);
            } else {
                reject(
                    new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
                );
            }
        } catch (error) {
            reject(error);
        }
    });
}



export default { listDelivery_Vehicle, editTransport, delete_address, delete_images_videos, deliveryVehicleDetails, changeDeliveryStatus, deleteDeliveryVehicle, deliveryVerification } as const