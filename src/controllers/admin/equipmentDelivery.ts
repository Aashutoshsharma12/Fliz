import { messages } from "@Custom_message";
import bookingModel from "@models/booking";
import equipment_addressModel from "@models/equipment_address";
import equipmentModel from "@models/equipment";
import { CustomError } from "@utils/errors";
import { identityGenerator } from "@utils/helpers";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import sub_category from "./sub_category";
import equipment_mediaModel from "@models/equipment_media";
import moment from "moment-timezone";

function listEquipment(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language } = headers;
            const message = messages(language);
            const { page, perPage, nameMatched, companyProviderId, isActive, catId } = query;
            let condition: any = {
                isDelete: false,
                companyProviderId: companyProviderId,
            }
            if (nameMatched !== "" && nameMatched !== undefined && nameMatched !== null) {
                condition = {
                    ...condition, $or: [
                        { equipmentName: { $regex: nameMatched, $options: "i" } },
                        { ar_equipmentName: { $regex: nameMatched, $options: "i" } },
                    ]
                }
            }
            if (isActive === "Active") {
                condition = { ...condition, isActive: true }
            }
            else if (isActive === "InActive") {
                condition = { ...condition, isActive: false }
            }
            else if (isActive === "all") {
                condition = {
                    ...condition
                }
            }

            if (catId && catId !== "" && catId !== null && catId !== undefined) {
                condition = {
                    ...condition,
                    categoryId: new mongoose.Types.ObjectId(catId)
                };
            }

            const [totalOngoingOrder, totalcompleteOrder, totalEquipment, totalOrder, totalDocument, equipmentDetails] = await Promise.all([bookingModel.countDocuments({ isDelete: false, companyProviderId: companyProviderId, type: "equipment", bookingStatus: "Confirmed" }),
            bookingModel.countDocuments({ isDelete: false, companyProviderId: companyProviderId, type: "equipment", bookingStatus: "Completed" }),
            equipmentModel.countDocuments({ isDelete: false, companyProviderId: companyProviderId }),
            bookingModel.countDocuments({ isDelete: false, type: "equipment", companyProviderId: companyProviderId, }),
            equipmentModel.countDocuments(condition),
            equipmentModel.find(condition).populate("categoryId", "name ar_name").populate("subCategoryId", "name ar_name").populate("sub_subCategoryId", "name ar_name").sort({ createdAt: -1 }).skip((page - 1) * perPage).limit(perPage)]);

            resolve({ totalOngoingOrder, totalcompleteOrder, totalEquipment: totalEquipment, totalOrder: totalOrder, totalDocument: totalDocument, equipmentDetails });
        }
        catch (error) {
            reject(error);
        }
    })
}

function editEquipment(body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const session = await mongoose.startSession();  // Start the session
        session.startTransaction(); // Begin transaction
        try {
            const { language } = headers;
            const message = messages(language);
            const { isPriceBreaking, equipmentId, mediaDetails, addressDetails } = body;
            if (isPriceBreaking == false) {
                body.priceBreaking_details = {
                    time: '',
                    minimumAmount: 0,
                    dueAmount: 0
                }
            }
            const details: any = await equipmentModel.findOne({ _id: equipmentId, isDelete: false }).session(session);
            if (details) {
                await equipmentModel.updateOne({ _id: equipmentId, isDelete: false }, body).session(session)
                const { companyProviderId } = details;
                const { imagesUrl = [], videoUrl, termsUrl, contractUrl } = mediaDetails;
                if (mediaDetails) {
                    if (imagesUrl.length) {
                        imagesUrl.forEach(async (item: any) => {
                            if (item._id && item._id != '' && item._id != undefined && item._id != null) {
                                await equipment_mediaModel.updateOne({ _id: item._id, isDelete: false }, { equipment_imageUrl: item.equipment_imageUrl }).session(session);
                            } else {
                                const obj: any = {
                                    equipmentId: equipmentId,
                                    isMediaDetails: true,
                                    companyProviderId: companyProviderId
                                }
                                const count = await equipment_mediaModel.countDocuments({ media_type: 'image' })
                                obj.equipment_imageUrl = item.equipment_imageUrl
                                obj.media_type = 'image'
                                obj.uniqueId = identityGenerator("equipment_media", count)
                                await equipment_mediaModel.create([obj], { session });
                            }
                        });
                    }
                    if (videoUrl && videoUrl != '' && videoUrl != undefined && videoUrl != null) {
                        const check_Video = await equipment_mediaModel.findOne({ equipmentId: equipmentId, isDelete: false, media_type: 'video' });
                        if (check_Video) {
                            await equipment_mediaModel.updateOne({ _id: check_Video._id, isDelete: false }, { equipment_videoUrl: videoUrl }).session(session);
                        } else {
                            const obj: any = {
                                equipmentId: equipmentId,
                                isMediaDetails: true,
                                companyProviderId: companyProviderId
                            }
                            const count = await equipment_mediaModel.countDocuments({ media_type: 'video' })
                            obj.equipment_videoUrl = videoUrl
                            obj.media_type = 'video'
                            obj.uniqueId = identityGenerator("equipment_media", count)
                            await equipment_mediaModel.create([obj], { session });
                        }
                    }
                    if (termsUrl && termsUrl != '' && termsUrl != undefined && termsUrl != null) {
                        const check_termUrl = await equipment_mediaModel.findOne({ equipmentId: equipmentId, isDelete: false, media_type: 'termsUrl' });
                        if (check_termUrl) {
                            await equipment_mediaModel.updateOne({ _id: check_termUrl._id, isDelete: false }, { equipment_termsUrl: termsUrl }).session(session);
                        } else {
                            const obj: any = {
                                equipmentId: equipmentId,
                                companyProviderId: companyProviderId
                            }
                            const count = await equipment_mediaModel.countDocuments()
                            obj.equipment_termsUrl = termsUrl
                            obj.media_type = 'termsUrl'
                            obj.uniqueId = identityGenerator("equipment_media", count)
                            await equipment_mediaModel.create([obj], { session });
                        }
                    }
                    if (contractUrl && contractUrl != '' && contractUrl != undefined && contractUrl != null) {
                        const check_contractUrl = await equipment_mediaModel.findOne({ equipmentId: equipmentId, isDelete: false, media_type: 'contractUrl' });
                        if (check_contractUrl) {
                            await equipment_mediaModel.updateOne({ _id: check_contractUrl._id, isDelete: false }, { equipment_contractUrl: contractUrl }).session(session);
                        } else {
                            const obj: any = {
                                equipmentId: equipmentId,
                                companyProviderId: companyProviderId
                            }
                            const count = await equipment_mediaModel.countDocuments()
                            obj.equipment_contractUrl = contractUrl
                            obj.media_type = 'contractUrl'
                            obj.uniqueId = identityGenerator("equipment_media", count)
                            await equipment_mediaModel.create([obj], { session });
                        }
                    }
                }
                if (addressDetails.length) {
                    const total_selectEquipment = addressDetails.reduce((total: any, detail: any) => total + detail.availableEquipment, 0);
                    const total_equipmentAvailable = details ? details.total_equipmentAvailable : 0
                    if (total_equipmentAvailable < total_selectEquipment) {
                        throw (new CustomError(message.maxEquipmentCount.replace('{{totalEquipments}}', details.total_equipmentAvailable).replace('{{selectedEquipment}}', total_selectEquipment), StatusCodes.BAD_REQUEST))
                    } else {
                        addressDetails.forEach(async (item: any) => {
                            if (item.addressId && item.addressId != '' && item.addressId != undefined && item.addressId != null) {
                                const data12 = await equipment_addressModel.updateOne({ _id: item.addressId }, item).session(session);
                            } else {
                                const obj: any = {
                                    equipmentId: equipmentId,
                                    companyProviderId: companyProviderId,
                                    ...item
                                }
                                const count = await equipment_addressModel.countDocuments();
                                obj.uniqueId = identityGenerator("equipment_address", count)
                                await equipment_addressModel.create([obj], { session });
                            }
                        });
                        await equipmentModel.updateOne({ _id: equipmentId }, { isaddressDetails: true }).session(session);
                    }
                } else {
                    throw (new CustomError(message.addressRequired, StatusCodes.BAD_REQUEST));
                }
                await equipmentModel.updateOne({ _id: equipmentId, isDelete: false }, { isMediaDetails: true, isaddressDetails: true, isBasicDetails: true }).session(session)
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
            const { image_videosId, equipmentId } = body;
            await equipment_mediaModel.updateOne({ _id: image_videosId, equipmentId: equipmentId, media_type: { $in: ["image", "video"] } }, { isDelete: true });
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
            const { addressId, equipmentId } = body;
            await equipment_addressModel.updateMany({ _id: addressId, equipmentId: equipmentId }, { isDelete: true });
            resolve({ success: true });
        } catch (err) {
            reject(err)
        }
    });
}

// function addEditEquipment_addressDetails(body: any, headers: any): Promise<any> {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const { language } = headers;
//             const message = messages(language);
//             const { addressDetails = [], equipmentId } = body;
//             if (addressDetails.length) {
//                 addressDetails.forEach(async (item: any) => {
//                     if (item.addressId && item.addressId != '' && item.addressId != undefined && item.addressId != null) {
//                         await equipment_addressModel.updateOne({ _id: item.addressId }, item);
//                     } else {
//                         const obj: any = {
//                             equipmentId: equipmentId,
//                             companyProviderId: body?.companyProviderId,
//                             ...item
//                         }
//                         const count = await equipment_addressModel.countDocuments();
//                         obj.uniqueId = identityGenerator("equipment_address", count)
//                         await equipment_addressModel.create(obj);
//                     }
//                 });
//                 await equipmentModel.updateOne({ _id: equipmentId }, { isaddressDetails: true });
//                 resolve({ success: true });
//             } else {
//                 reject(new CustomError(message.addressRequired, StatusCodes.BAD_REQUEST));
//             }
//         } catch (err) {
//             reject(err)
//         }
//     });
// }

function equipmentDeliveryDetails(params: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en', timezone = 'Asia/Calcutta' } = headers;
            const currentDate = moment().tz(timezone).format('YYYY-MM-DD')
            const message = messages(language);
            const order_message = message.not_allowed_delete_equip_vehicle.replace("{{type}}", 'equipment')
            const { id } = params;
            const response = await equipmentModel.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id),
                        isDelete: false
                    }
                },
                {
                    $lookup: {
                        from: "user_renter_deliveries",
                        localField: "companyProviderId",
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
                        from: "categories",
                        localField: "categoryId",
                        foreignField: '_id',
                        as: "categoryDetails"
                    }
                },
                {
                    $unwind: {
                        path: "$categoryDetails",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "sub_categories",
                        localField: "subCategoryId",
                        foreignField: "_id",
                        as: "sub_categoryDetails"
                    }
                },
                {
                    $unwind: {
                        path: "$sub_categoryDetails",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "sub_subcategories",
                        localField: "sub_subCategoryId",
                        foreignField: "_id",
                        as: "sub_sub_categoryDetails"
                    }
                },
                {
                    $unwind: {
                        path: "$sub_sub_categoryDetails",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "equipment_addresses",
                        localField: "_id",
                        foreignField: "equipmentId",
                        pipeline: [
                            {
                                $match: { isDelete: false }
                            }
                        ],
                        as: "equipment_address"
                    }
                },
                {
                    $lookup:{
                        from:'equipment_specifications',
                        localField:'_id',
                        foreignField:'equipmentId',
                        pipeline:[
                            {
                                $match:{isDelete:false}
                            },
                            {
                                $project:{
                                    isDelete:0,
                                    createdAt:0,
                                    updatedAt:0
                                }
                            }
                        ],
                        as:'equipmentSpecification'
                    }
                },
                {
                    $lookup: {
                        from: "equipment_medias",
                        localField: "_id",
                        foreignField: "equipmentId",
                        pipeline: [
                            {
                                $match: { isDelete: false }
                            }
                        ],
                        as: "equipment_media"
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
                    $project: {
                        any_order_running: {
                            $cond: {
                                if: { $gt: ['$total_bookedEquipment.chosen_equipment', 0] },
                                then: true,
                                else: false
                            }
                        },
                        order_message: order_message,
                        equipmentName: 1,
                        ar_equipmentName: 1,
                        equipmentPrice_perDay: 1,
                        equipmentPrice_1_week: 1,
                        equipmentPrice_1_month: 1,
                        equipmentPrice_3_month: 1,
                        equipmentPrice_6_month: 1,
                        equipmentPrice_1_year: 1,
                        total_equipmentAvailable: 1,
                        operational_equipments: 1,
                        isDeliveryInclude: 1,
                        isPriceBreaking: 1,
                        priceBreaking_details: 1,
                        equipment_engineMake: 1,
                        ar_equipment_engineMake: 1,
                        equipment_engineModel: 1,
                        ar_equipment_engineModel: 1,
                        equipment_enginePower: 1,
                        equipment_fuelCapacity: 1,
                        equipment_machineWeight: 1,
                        equipment_maximumCutting_height: 1,
                        equipment_rear_swingRadius: 1,
                        equipment_swingSpped: 1,
                        equipment_breakout_force: 1,
                        isBoom_swingAngle: 1,
                        isMinimum_groundClearance: 1,
                        isApproved: 1,
                        "company_details.name": 1,
                        "company_details.email": 1,
                        "company_details.address": 1,
                        "company_details.addressLine1": 1,
                        "company_details.addressLine2": 1,
                        "categoryDetails": {
                            _id: 1,
                            name: 1,
                            ar_name: 1
                        },
                        "sub_categoryDetails": {
                            _id: 1,
                            name: 1,
                            ar_name: 1
                        },
                        "sub_sub_categoryDetails": {
                            _id: 1,
                            name: 1,
                            ar_name: 1
                        },
                        "equipment_address": 1,
                        "equipment_media": 1,
                        equipmentCommission: 1,
                        equipmentSpecification:1
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

function deleteDeliveryDetails(params: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language } = headers;
            const message = messages(language);
            const { id } = params;
            const response = await equipmentModel.findOneAndUpdate({ _id: id, isDelete: false }, {
                isDelete: true
            })
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

function statusChange(params: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language } = headers;
            const message = messages(language);
            const { id } = params;
            const { isActive } = query;
            const response = await equipmentModel.findOneAndUpdate({ _id: id, isDelete: false }, { isActive: isActive });
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

function equipmentVerification(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {

            const { language } = headers;
            const message = messages(language);
            const { equipmentId, approve } = query;

            const response_Varified = await equipmentModel.findByIdAndUpdate(
                { _id: equipmentId, isDelete: false },
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


export default { listEquipment, editEquipment, delete_images_videos, delete_address, statusChange, deleteDeliveryDetails, equipmentDeliveryDetails, equipmentVerification } as const