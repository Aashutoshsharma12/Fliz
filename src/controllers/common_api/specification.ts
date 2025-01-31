import { cat_specificationModel } from "@models/cat_specification";
import { delivery_specificationModel } from "@models/deliverySpecification";
import mongoose from "mongoose";

function specificationList(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const { role, catId, vehicleSizeType } = query
            if (role == 'renter') {
                const list = await cat_specificationModel.aggregate([
                    {
                        $match: {
                            isDelete: false,
                            catId: new mongoose.Types.ObjectId(catId)
                        }
                    },
                    {
                        $project: {
                            keyName: {
                                $cond: {
                                    if: { $eq: [language, "ar"] },
                                    then: "$ar_keyName",
                                    else: "$keyName"
                                }
                            },
                            type: 1
                        }
                    },
                    {
                        $lookup: {
                            foreignField: "keyId",
                            localField: "_id",
                            as: "specifications_values",
                            from: "cat_specification_values",
                            pipeline: [
                                {
                                    $match: {
                                        isDelete: false
                                    }
                                },
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
                    }
                ]);
                resolve(list);
            } else {
                const list = await delivery_specificationModel.aggregate([
                    {
                        $match: {
                            isDelete: false,
                            vehicleType: vehicleSizeType
                        }
                    },
                    {
                        $project: {
                            keyName: {
                                $cond: {
                                    if: { $eq: [language, "ar"] },
                                    then: "$ar_keyName",
                                    else: "$keyName"
                                }
                            },
                            type: 1
                        }
                    },
                    {
                        $lookup: {
                            foreignField: "keyId",
                            localField: "_id",
                            as: "specifications_values",
                            from: "delivery_specification_values",
                            pipeline: [
                                {
                                    $match: {
                                        isDelete: false
                                    }
                                },
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
                    }
                ]);
                resolve(list);
            }
        } catch (err) {
            reject(err);
        }
    });
}

export default {
    specificationList
} as const;