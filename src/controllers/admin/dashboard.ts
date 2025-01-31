import bookingModel from "@models/booking";
import equipmentModel from "@models/equipment";
import paymentModal from "@models/payment";
import user_renter_delivery_Model from "@models/user";
import { getDatesBetween, getFirstDates } from "@utils/helpers";
import moment from "moment-timezone";
import mongoose from "mongoose";

function dashbord_countApi(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            let { startDate, endDate } = query;
            let order_cond: any = {
                isDelete: false,
                paymentStatus: { $ne: 'unpaid' }
            }
            let totalRenter: any = {
                isDelete: false,
                role: 'renter_user'
            }
            let payment_cond: any = {
                isDelete: false
            }
            if (startDate && endDate) {
                startDate = moment(startDate).format('YYYY-MM-DD'); // Start of the day
                endDate = moment(endDate).format('YYYY-MM-DD'); // End of the day
                let startDate1 = moment(startDate).startOf('day').toISOString(); // Start of the day (00:00:00)
                let endDate1 = moment(endDate).endOf('day').toISOString(); // End of the day (23:59:59)
                order_cond.updatedAt = { $gt: moment(startDate1).toDate(), $lte: moment(endDate1).toDate() }
                payment_cond.date = { $gte: startDate, $lte: endDate }
                totalRenter.createdAt = { $gte: moment(startDate1).toDate(), $lte: moment(endDate1).toDate() }
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

            let totalDelivery = {
                ...totalRenter,
                role: 'delivery_user'
            }
            let totalUsers = {
                ...totalRenter,
                role: 'user'
            }
            const today_date = moment().tz('Asia/Calcutta').format('YYYY-MM-DD');
            const tomorrow_date = moment().add(1, 'days').tz('Asia/Calcutta').format('YYYY-MM-DD');

            const [bookingCounts, renterCompany_counts, deliveryCompany_counts, userCounts, latestUsers, total_transaction, today_equipments_orders, today_vehicles_orders] = await Promise.all([
                bookingModel.aggregate([
                    {
                        $facet: {
                            latestOrders: [{ $match: order_cond }, { $sort: { createdAt: -1 } }, { $limit: 10 }],
                            totalOrders: [{ $match: order_cond }, { $count: 'count' }],
                            activeOrders: [{ $match: activeOrder_cond }, { $count: 'count' }],
                            completeOrders: [{ $match: completeOrder_cond }, { $count: 'count' }],
                            cancelOrders: [{ $match: cancelOrder_cond }, { $count: 'count' }]
                        }
                    }
                ]),
                user_renter_delivery_Model.countDocuments(totalRenter),
                user_renter_delivery_Model.countDocuments(totalDelivery),
                user_renter_delivery_Model.countDocuments(totalUsers),
                user_renter_delivery_Model.find(totalUsers).sort({ createdAt: -1 }).limit(10),
                paymentModal.aggregate([
                    {
                        $match: payment_cond
                    },
                    {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: "$paidAmount" }
                        }
                    }
                ]),
                bookingModel.countDocuments({ type: "equipment", bookingDate: { $lt: tomorrow_date, $gte: today_date } }),
                bookingModel.countDocuments({ type: "vehicle", bookingDate: { $lt: tomorrow_date, $gte: today_date } })
            ]);
            const bookingData = bookingCounts[0];
            resolve({
                latestOrders: bookingData.latestOrders,
                totalOrders: bookingData.totalOrders[0]?.count || 0,
                activeOrders: bookingData.activeOrders[0]?.count || 0,
                completeOrders: bookingData.completeOrders[0]?.count || 0,
                cancelOrders: bookingData.cancelOrders[0]?.count || 0,
                total_transaction: total_transaction.length ? total_transaction[0].totalAmount : 0,
                deliveryCompany_counts: deliveryCompany_counts,
                renterCompany_counts: renterCompany_counts,
                latestUsers: latestUsers,
                userCounts: userCounts,
                today_equipments_orders,
                today_vehicles_orders
            });
        } catch (err) {
            reject(err)
        }
    });
}
/***
 * Order Graph Data
 */
function graph_dataApi(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            let { startDate, endDate, type } = query;

            let newOrder_obj: any = {
                isDelete: false,
                paymentStatus: { $ne: 'unpaid' },
                bookingStatus: "Pending"
            }
            let completeOrder_obj: any = {
                isDelete: false,
                paymentStatus: { $ne: 'unpaid' },
                bookingStatus: "Completed"
            }
            let cancelOrder_obj: any = {
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

/***
 * User Graph Data
 */

function graph_user_dataApi(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            let { startDate, endDate, type } = query;

            let obj: any = {
                isDelete: false,
                role: "user"
            }

            let group_obj: any = {}
            if (startDate && endDate) {
                group_obj = {
                    ...group_obj,
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                        },
                        userCounts: { $sum: 1 }
                    }
                }
                startDate = moment(startDate).format('YYYY-MM-DD'); // Start of the day
                endDate = moment(endDate).format('YYYY-MM-DD'); // End of the day
                let startDate1 = moment(startDate).startOf('day').toISOString(); // Start of the day (00:00:00)
                let endDate1 = moment(endDate).endOf('day').toISOString(); // End of the day (23:59:59)
                obj.createdAt = { $gt: moment(startDate1).toDate(), $lte: moment(endDate1).toDate() }
            } else {
                startDate = moment(startDate).startOf('year').format('YYYY-MM-DD'); // Start of the day
                endDate = moment(endDate).endOf('year').format('YYYY-MM-DD'); // End of the day
                let startDate1 = moment(startDate).startOf('day').toISOString(); // Start of the day (00:00:00)
                let endDate1 = moment(endDate).endOf('day').toISOString(); // End of the day (23:59:59)
                obj.createdAt = { $gt: moment(startDate1).toDate(), $lte: moment(endDate1).toDate() }
                group_obj = {
                    ...group_obj,
                    $group: {
                        _id: {
                            month: {
                                $dateToString: {
                                    format: '%Y-%m-%d', // Format the date as YYYY-MM-DD
                                    date: { $dateTrunc: { date: '$createdAt', unit: 'month' } }
                                }
                            }
                        },
                        userCounts: { $sum: 1 }
                    }
                }
            }
            const userCount = await user_renter_delivery_Model.aggregate([

                {
                    $match: obj
                },
                group_obj

            ]);
            const newUsers = userCount
            if (type != 'yearly' && startDate && endDate) {
                const dates = getDatesBetween(startDate, endDate)
                // Create a mapping of existing orders for faster lookup
                const newUsersMap = newUsers.reduce((acc: any, data: any) => {
                    acc[data._id] = data.userCounts; // Map date to order count
                    return acc;
                }, {});
                // Create final results for new, complete, and cancelled orders
                const finalNewUsers = dates.map((date: any) => ({
                    _id: date,
                    userCounts: newUsersMap[date] || 0 // Use the count if exists, otherwise 0
                }));

                resolve({ newUsers: finalNewUsers })
            } else {
                const dates = getFirstDates(moment().year())
                const newUsersMap = newUsers.reduce((acc: any, data: any) => {
                    acc[data._id.month] = data.userCounts; // Map date to order count
                    return acc;
                }, {});
                const finalNewUsers = dates.map(date => ({
                    _id: date,
                    userCounts: newUsersMap[date] || 0 // Use the count if exists, otherwise 0
                }));

                resolve({ newUsers: finalNewUsers })
            }
        } catch (err) {
            reject(err);
        }
    });
}

export default {
    dashbord_countApi,
    graph_dataApi,
    graph_user_dataApi
} as const;