import bookingModel from "@models/booking";
import chat_messageModal from "@models/chat_message";
import delivery_vehicleModel from "@models/delivery_vehicle";
import equipmentModel from "@models/equipment";
import paymentModal from "@models/payment";
import user_renter_delivery_Model from "@models/user";
import user_visitModal from "@models/user_visit";
import { getFirstDates, getDatesBetween } from "@utils/helpers";
import moment from "moment-timezone";
import mongoose from "mongoose";

function dashbord_countApi(userId: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            let { startDate, endDate } = query;
            const userIdObj = new mongoose.Types.ObjectId(userId);
            let order_cond: any = {
                companyProviderId: userIdObj,
                isDelete: false,
                paymentStatus: { $ne: 'unpaid' }
            }
            let pendingOrder_count = {
                ...order_cond,
                bookingStatus: 'Pending'
            }
            let cond: any = {
                isDelete: false,
                // isActive: true
            }

            let payment_cond: any = {
                isDelete: false,
                companyProviderId: userIdObj
            }
            let visit_cond: any = {
                isDelete: false,
                companyProviderId: userId
            }
            let totalRentened_cond: any = {
                companyProviderId: userIdObj,
                isDelete: false,
                paymentStatus: 'paid',
                bookingStatus: { $nin: ['Pending', 'Cancelled', 'Completed'] }
            }
            if (startDate && endDate) {
                startDate = moment(startDate).format('YYYY-MM-DD'); // Start of the day
                endDate = moment(endDate).format('YYYY-MM-DD'); // End of the day
                let startDate1 = moment(startDate).startOf('day').toISOString(); // Start of the day (00:00:00)
                let endDate1 = moment(endDate).endOf('day').toISOString(); // End of the day (23:59:59)
                order_cond.updatedAt = { $gt: moment(startDate1).toDate(), $lte: moment(endDate1).toDate() }
                payment_cond.date = { $gte: startDate, $lte: endDate }
                cond.createdAt = { $gte: moment(startDate1).toDate(), $lte: moment(endDate1).toDate() }
                visit_cond.createdAt = { $gte: moment(startDate1).toDate(), $lte: moment(endDate1).toDate() }
                totalRentened_cond.updatedAt = { $gte: moment(startDate1).toDate(), $lte: moment(endDate1).toDate() }
            }
            let activeOrder_cond = {
                ...order_cond,
                bookingStatus: { $nin: ['Cancelled', 'Completed'] }
            }
            let completeOrder_cond = {
                ...order_cond,
                bookingStatus: 'Completed'
            }
            let cancelOrder_cond = {
                ...order_cond,
                bookingStatus: 'Cancelled'
            }
            let totalEquipment = {
                ...cond,
                companyProviderId: userIdObj,
            }
            let totalVehicle = {
                ...cond,
                company_deliveryId: userIdObj,
            }
            let most_rented_equipmentcond: any = {
                isDelete: false, bookingStatus: { $nin: ['Pending', 'Cancelled'] },
                companyProviderId: new mongoose.Types.ObjectId(userId),
                paymentStatus: 'paid'
            }
            const [bookingCounts, equipmentCounts, vehicleCounts, totalVisitors, newTransactions, newChat_count, companyDetails] = await Promise.all([
                bookingModel.aggregate([
                    {
                        $facet: {
                            totalOrders: [{ $match: order_cond }, { $count: 'count' }],
                            activeOrders: [{ $match: activeOrder_cond }, { $count: 'count' }],
                            completeOrders: [{ $match: completeOrder_cond }, { $count: 'count' }],
                            cancelOrders: [{ $match: cancelOrder_cond }, { $count: 'count' }],
                            totalRentedEquipments: [
                                { $match: totalRentened_cond },
                                // {
                                //     $group: {
                                //         _id: "$equipmentId",
                                //         totalBooking: { $sum: 1 }
                                //     }
                                // },
                                { $count: 'count' }
                            ],
                            totalRentedVehicles: [{ $match: totalRentened_cond }, {
                                $group: {
                                    _id: "$vehicleId",
                                    totalBooking: { $sum: 1 }
                                }
                            }, { $count: 'count' }
                            ],
                            pendingOrder_count: [
                                {
                                    $match: pendingOrder_count,
                                },
                                {
                                    $count: "totalCount",
                                },
                            ],
                            most_rented_equipments: [
                                {
                                    $match: most_rented_equipmentcond
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
                                    $count: "count"
                                }
                            ],
                            most_rented_vehicles: [
                                {
                                    $match: most_rented_equipmentcond
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
                                    $count: "count"
                                }
                            ]
                        }
                    }
                ]),
                equipmentModel.countDocuments(totalEquipment),
                delivery_vehicleModel.countDocuments(totalVehicle),
                user_visitModal.countDocuments(visit_cond),
                paymentModal.aggregate([
                    {
                        $match: payment_cond
                    },
                    {
                        $group: {
                            _id: "$companyProviderId",
                            totalAmount: { $sum: "$paidAmount" }
                        }
                    }
                ]),
                chat_messageModal.countDocuments({ companyProviderId: userId, sendTo: 'company', readStatus: false }),
                user_renter_delivery_Model.findById(userId, { isVerified: 1 })
            ]);
            const bookingData = bookingCounts[0];
            resolve({
                totalOrders: bookingData.totalOrders[0]?.count || 0,
                activeOrders: bookingData.activeOrders[0]?.count || 0,
                completeOrders: bookingData.completeOrders[0]?.count || 0,
                cancelOrders: bookingData.cancelOrders[0]?.count || 0,
                newTransactions: newTransactions.length ? Number(parseFloat(newTransactions[0].totalAmount).toFixed(2)) : 0,
                totalVisitors: totalVisitors,
                mostRented_equipment: bookingData.most_rented_equipments[0]?.count || 0,
                totalRented_equipment: bookingData.totalRentedEquipments[0]?.count || 0,
                mostRented_vehicles: bookingData.totalRentedVehicles[0]?.count || 0,
                totalRented_vehicles: vehicleCounts,
                pendingOrder_count: bookingData.pendingOrder_count[0]?.totalCount || 0,
                newChat_count: newChat_count,
                isVerified: companyDetails ? companyDetails.isVerified : true
            });
        } catch (err) {
            reject(err)
        }
    });
}

function graph_dataApi(userId: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            let { startDate, endDate, type } = query;

            let newOrder_obj: any = {
                companyProviderId: new mongoose.Types.ObjectId(userId),
                isDelete: false,
                paymentStatus: { $ne: 'unpaid' },
                bookingStatus: "Pending"
            }
            let completeOrder_obj: any = {
                companyProviderId: new mongoose.Types.ObjectId(userId),
                isDelete: false,
                paymentStatus: { $ne: 'unpaid' },
                bookingStatus: "Completed"
            }
            let cancelOrder_obj: any = {
                companyProviderId: new mongoose.Types.ObjectId(userId),
                isDelete: false,
                paymentStatus: { $ne: 'unpaid' },
                bookingStatus: "Cancelled"
            }
            let group_obj: any = {}
            if (startDate && endDate) {
                group_obj = {
                    ...group_obj,
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' }
                        },
                        orderCounts: { $sum: 1 }
                    }
                }
                startDate = moment(startDate).format('YYYY-MM-DD'); // Start of the day
                endDate = moment(endDate).format('YYYY-MM-DD'); // End of the day
                let startDate1 = moment(startDate).startOf('day').toISOString(); // Start of the day (00:00:00)
                let endDate1 = moment(endDate).endOf('day').toISOString(); // End of the day (23:59:59)
                newOrder_obj.updatedAt = { $gt: moment(startDate1).toDate(), $lte: moment(endDate1).toDate() }
                completeOrder_obj.updatedAt = { $gt: moment(startDate1).toDate(), $lte: moment(endDate1).toDate() }
                cancelOrder_obj.updatedAt = { $gt: moment(startDate1).toDate(), $lte: moment(endDate1).toDate() }
            } else {
                startDate = moment(startDate).startOf('year').format('YYYY-MM-DD'); // Start of the day
                endDate = moment(endDate).endOf('year').format('YYYY-MM-DD'); // End of the day
                let startDate1 = moment(startDate).startOf('day').toISOString(); // Start of the day (00:00:00)
                let endDate1 = moment(endDate).endOf('day').toISOString(); // End of the day (23:59:59)
                newOrder_obj.updatedAt = { $gt: moment(startDate1).toDate(), $lte: moment(endDate1).toDate() }
                completeOrder_obj.updatedAt = { $gt: moment(startDate1).toDate(), $lte: moment(endDate1).toDate() }
                cancelOrder_obj.updatedAt = { $gt: moment(startDate1).toDate(), $lte: moment(endDate1).toDate() }
                group_obj = {
                    ...group_obj,
                    $group: {
                        _id: {
                            month: {
                                $dateToString: {
                                    format: '%Y-%m-%d', // Format the date as YYYY-MM-DD
                                    date: { $dateTrunc: { date: '$updatedAt', unit: 'month' } }
                                }
                                // month: { $month: '$bookingDate' },
                            }
                        },
                        orderCounts: { $sum: 1 }
                    }
                }
            }
            const orderCount = await bookingModel.aggregate([
                {
                    $facet: {
                        newOrders: [
                            {
                                $match: newOrder_obj
                            },
                            {
                                $addFields: {
                                    bookingDate: { $toDate: '$bookingDate' },
                                }
                            },
                            group_obj
                        ],
                        completeOrders: [
                            {
                                $match: completeOrder_obj
                            },
                            {
                                $addFields: {
                                    bookingDate: { $toDate: '$bookingDate' },
                                }
                            },
                            group_obj
                        ],
                        cancelOrders: [
                            {
                                $match: cancelOrder_obj
                            },
                            {
                                $addFields: {
                                    bookingDate: { $toDate: '$updatedAt' },
                                }
                            },
                            group_obj
                        ]
                    }
                }
            ]);
            const newOrders = orderCount[0].newOrders
            const completeOrders = orderCount[0].completeOrders
            const cancelOrders = orderCount[0].cancelOrders
            console.log(cancelOrders, "cancelOrders")
            if (type != 'yearly' && startDate && endDate) {
                const dates = getDatesBetween(startDate, endDate)
                // Create a mapping of existing orders for faster lookup
                const newOrdersMap = newOrders.reduce((acc: any, data: any) => {
                    acc[data._id] = data.orderCounts; // Map date to order count
                    return acc;
                }, {});
                // Create final results for new, complete, and cancelled orders
                const finalNewOrders = dates.map(date => ({
                    _id: date,
                    orderCounts: newOrdersMap[date] || 0 // Use the count if exists, otherwise 0
                }));
                // Create a mapping of existing orders for faster lookup
                const completeOrdersMap = completeOrders.reduce((acc: any, data: any) => {
                    acc[data._id] = data.orderCounts; // Map date to order count
                    return acc;
                }, {});
                // Create final results for new, complete, and cancelled orders
                const finalCompleteOrders = dates.map(date => ({
                    _id: date,
                    orderCounts: completeOrdersMap[date] || 0 // Use the count if exists, otherwise 0
                }));
                // Create a mapping of existing orders for faster lookup
                const cancelOrdersMap = cancelOrders.reduce((acc: any, data: any) => {
                    acc[data._id] = data.orderCounts; // Map date to order count
                    return acc;
                }, {});
                // Create final results for new, complete, and cancelled orders
                const finalCancelOrders = dates.map(date => ({
                    _id: date,
                    orderCounts: cancelOrdersMap[date] || 0 // Use the count if exists, otherwise 0
                }));
                resolve({ newOrders: finalNewOrders, completeOrders: finalCompleteOrders, cancelOrders: finalCancelOrders })
            } else {
                const dates = getFirstDates(moment().year())
                const newOrdersMap = newOrders.reduce((acc: any, data: any) => {
                    acc[data._id.month] = data.orderCounts; // Map date to order count
                    return acc;
                }, {});
                const finalNewOrders = dates.map(date => ({
                    _id: date,
                    orderCounts: newOrdersMap[date] || 0 // Use the count if exists, otherwise 0
                }));
                const completeOrdersMap = completeOrders.reduce((acc: any, data: any) => {
                    acc[data._id.month] = data.orderCounts; // Map date to order count
                    return acc;
                }, {});
                const finalCompleteOrders = dates.map(date => ({
                    _id: date,
                    orderCounts: completeOrdersMap[date] || 0 // Use the count if exists, otherwise 0
                }));
                const cancelOrdersMap = cancelOrders.reduce((acc: any, data: any) => {
                    acc[data._id.month] = data.orderCounts; // Map date to order count
                    return acc;
                }, {});
                const finalCancelOrders = dates.map(date => ({
                    _id: date,
                    orderCounts: cancelOrdersMap[date] || 0 // Use the count if exists, otherwise 0
                }));
                resolve({ newOrders: finalNewOrders, completeOrders: finalCompleteOrders, cancelOrders: finalCancelOrders })
            }
        } catch (err) {
            reject(err);
        }
    });
}

export default {
    dashbord_countApi,
    graph_dataApi
} as const;