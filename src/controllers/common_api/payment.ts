import { messages } from "@Custom_message";
import bookingModel from "@models/booking";
import order_installmentModal from "@models/order_installment";
import paymentModal from "@models/payment";
import { CustomError } from "@utils/errors";
import axios from "axios";
import { StatusCodes } from "http-status-codes";
import moment from "moment-timezone";
import mongoose, { mongo } from "mongoose";
const PAYMENT_HYPER_PAY_API_URL: any = process.env.PAYMENT_HYPER_PAY_API_URL
const API_KEY: any = process.env.API_KEY; // Your Hyper Gateway API Key
const API_SECRET: any = process.env.API_SECRET; // Your Hyper Gateway API Secret
const CUSTOMER_CREATE_API_URL: any = process.env.CUSTOMER_CREATE_API_URL
const SAVE_CARD_API_URL: any = process.env.SAVE_CARD_API_URL
const TOKENIZE_API_URL: any = process.env.TOKENIZE_API_URL
const DELETE_CARD_API_URL: any = process.env.DELETE_CARD_API_URL
const CARD_LIST_API_URL: any = process.env.CARD_LIST_API_URL
/**
 * Generate Down Payment Order Invoice With Payment
 * 
 */
function generate_downpaymentOrder_invoice(userId: any, body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            //(Note : Now down_payment is the first installment)
            const { timezone = 'Asia/Calcutta', language = 'en' } = headers;
            const message = messages(language);
            const { transactionId, note, paymentMethod, orderId } = body;
            const orderDetails = await bookingModel.findOneAndUpdate({ _id: body.orderId }, { paymentStatus: 'paid' }, { new: true, fields: { bookingStatus: 1, paymentStatus: 1 } });
            if (orderDetails) {
                const updateDownpayment = await order_installmentModal.findOneAndUpdate({ orderId: orderDetails._id, type: "down_payment", confirmBookingStatus: false, paymentStatus: 'unpaid' }, { paymentStatus: 'paid', confirmBookingStatus: true }, { new: true });
                if (updateDownpayment) {
                    const dueAmount1: Number = Number(updateDownpayment.totalAmount) - Number(updateDownpayment.paidAmount)
                    body = {
                        ...body,
                        userId: userId,  // only UserId
                        companyProviderId: updateDownpayment.companyProviderId,
                        orderId: updateDownpayment.orderId,
                        installmentId: updateDownpayment._id,
                        invoiceNumber: Date.now().toString(36),
                        transactionId: transactionId,
                        totalAmount: updateDownpayment.totalAmount,
                        dueAmount: dueAmount1.toFixed(2),
                        paidAmount: updateDownpayment.paidAmount,
                        note: note ? note : "",
                        paymentStatus: "paid",
                        paymentMethod: paymentMethod,
                        date: moment().tz(timezone).format('YYYY-MM-DD'),
                        time: moment().tz(timezone).format('HH:mm')
                    }
                    const save = await paymentModal.create(body);
                    await bookingModel.updateOne({ _id: body.orderId, isPriceBreaking: false }, { full_paymentStatus: true })
                    resolve(save);
                } else {
                    reject(new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND));
                }
            } else {
                reject(new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND));
            }
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Generate Installment Order Invoice With Payment
 * 
 */
function generateInstallment_invoice(userId: any, installmentId: any, body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { timezone = 'Asia/Calcutta', language = 'en' } = headers;
            const message = messages(language);
            const { transactionId, note, paymentMethod, orderId } = body;

            const orderDetails = await bookingModel.findOne({ _id: orderId, full_paymentStatus: false }, { bookingStatus: 1, full_paymentStatus: 1, paymentStatus: 1, totalAmount: 1, paidAmount: 1, remaining_amount: 1 });
            if (orderDetails) {
                let cond = {
                    _id: installmentId,
                    orderId: orderDetails._id,
                    type: "installment",
                    confirmBookingStatus: true,
                    paymentStatus: 'unpaid'
                }
                const updateInstallmentpayment = await order_installmentModal.findOneAndUpdate(cond, { paymentStatus: 'paid', confirmBookingStatus: true }, { new: true });
                if (updateInstallmentpayment) {
                    const paidAmount_order = Number(orderDetails.paidAmount) + Number(updateInstallmentpayment.paidAmount);
                    const remainingAmount_order = Number(orderDetails.remaining_amount) - Number(updateInstallmentpayment.paidAmount)
                    const update = await bookingModel.findOneAndUpdate({ _id: orderId, paymentStatus: "paid" }, { paidAmount: paidAmount_order, remaining_amount: remainingAmount_order }, { new: true, fields: { totalAmount: 1, paidAmount: 1 } });
                    if (update) {
                        body = {
                            userId: userId,  // only UserId
                            companyProviderId: updateInstallmentpayment.companyProviderId,
                            orderId: updateInstallmentpayment.orderId,
                            installmentId: updateInstallmentpayment._id,
                            invoiceNumber: Date.now().toString(36),
                            transactionId: transactionId,
                            totalAmount: updateInstallmentpayment.totalAmount,
                            dueAmount: (Number(update.totalAmount) - Number(update.paidAmount)).toFixed(2),
                            paidAmount: updateInstallmentpayment.paidAmount,
                            note: note ? note : "",
                            paymentStatus: "paid",
                            paymentMethod: paymentMethod,
                            date: moment().tz(timezone).format('YYYY-MM-DD'),
                            time: moment().tz(timezone).format('HH:mm')
                        }
                        const save = await paymentModal.create(body);
                        const checkInstallment = await order_installmentModal.findOne({ orderId: orderId, type: "installment", paymentStatus: "unpaid" }, { paymentStatus: 1, type: 1, orderId: 1 });
                        if (!checkInstallment) {
                            await bookingModel.updateOne({ _id: orderId }, { full_paymentStatus: true })
                        }
                        resolve(save);
                    } else {
                        reject(new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND));
                    }
                } else {
                    reject(new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND));
                }
            } else {
                reject(new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND));
            }
        } catch (err) {
            reject(err)
        }
    });
}

function paymentDetails(userId: any, paymentId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const details = await paymentModal.aggregate([
                {
                    $match: { _id: new mongoose.Types.ObjectId(paymentId) }
                },
                {
                    $lookup: {
                        foreignField: "_id",
                        localField: "orderId",
                        as: "orderDetails",
                        from: "bookings",
                        pipeline: [
                            {
                                $addFields: {
                                    'equipmentDetails.equipmentName': {
                                        $cond: {
                                            if: { $eq: [language, 'ar'] },
                                            then: "$equipmentDetails.ar_equipmentName",
                                            else: "$equipmentDetails.equipmentName"
                                        }
                                    },
                                    'vehicleDetails.vehicleType': {
                                        $cond: {
                                            if: { $eq: [language, 'ar'] },
                                            then: "$vehicleDetails.ar_vehicleType",
                                            else: "$vehicleDetails.vehicleType"
                                        }
                                    },
                                    'vehicleDetails.vehicleSize': {
                                        $cond: {
                                            if: { $eq: [language, 'ar'] },
                                            then: "$vehicleDetails.ar_vehicleSize",
                                            else: "$vehicleDetails.vehicleSize"
                                        }
                                    }
                                }
                            },
                            {
                                $project: {
                                    'equipmentDetails.equipmentName': 1, 'vehicleDetails.vehicleSize': 1, 'vehicleDetails.vehicleType': 1, orderId: 1, note: 1, type: 1
                                }
                            },
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$orderDetails",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        orderDetails: {
                            $ifNull: ["$orderDetails", {}]
                        }
                    }
                },
                // {
                //     $addFields: {
                //         orderDetails: {
                //             $cond: {
                //                 if: { $eq: [{ $size: "$orderDetails" }, 0] },
                //                 then: {},
                //                 else: { $arrayElemAt: ["$orderDetails", 0] }
                //             }
                //         }
                //     }
                // },
                {
                    $lookup: {
                        foreignField: "orderId",
                        localField: "orderId",
                        as: "installmentDetails",
                        from: "order_installments",
                        pipeline: [
                            {
                                $match: { type: { $ne: 'down_payment' } }
                            },
                            {
                                $project: {
                                    date: 1,
                                    time: 1,
                                    totalAmount: 1,
                                    paidAmount: 1,
                                    paymentStatus: 1,
                                    type: 1
                                }
                            },
                            {
                                $sort: { date: 1 }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        foreignField: "_id",
                        localField: "companyProviderId",
                        as: "companyDetails",
                        from: "user_renter_deliveries",
                        pipeline: [{
                            $project: { name: 1 }
                        }]
                    }
                },
                {
                    $unwind: {
                        path: "$companyDetails",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $addFields: { equipmentName: "$orderDetails.equipmentDetails.equipmentName" }
                },
                {
                    $addFields: { vehicleType: "$orderDetails.vehicleDetails.vehicleType" }
                },
                {
                    $addFields: { vehicleSize: "$orderDetails.vehicleDetails.vehicleSize" }
                },
                {
                    $addFields: { orderId: "$orderDetails.orderId" }
                },
                {
                    $addFields: { bookingFor: "$orderDetails.type" }
                },
                {
                    $project: {
                        'orderId': 1,
                        'vehicleSize': 1,
                        'vehicleType': 1,
                        'equipmentName': 1,
                        'transactionId': 1,
                        'date': 1,
                        'time': 1,
                        'paymentStatus': 1,
                        "totalAmount": 1,
                        "dueAmount": 1,
                        "paidAmount": 1,
                        "installmentDetails": 1,
                        "note": 1,
                        "invoiceNumber": 1,
                        "paymentMethod": 1,
                        companyName: "$companyDetails.name"
                    }
                },
            ]);
            resolve(details.length ? details[0] : {});

        } catch (err) {
            reject(err);
        }
    });
}

function paymentList(userId: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const { page = 1, perPage = 10, role = 'user', search, startDate, endDate } = query;
            let cond: any = {
                isDelete: false
            }

            if (role == 'company') {
                cond = {
                    ...cond,
                    companyProviderId: new mongoose.Types.ObjectId(userId)
                }
            } else {
                cond = {
                    ...cond,
                    userId: new mongoose.Types.ObjectId(userId)
                }
            }

            if (search) {
                cond = {
                    ...cond,
                    $or: [
                        { transactionId: { $regex: search, $options: 'i' } },
                        { "orderDetails.orderId": { $regex: search, $options: 'i' } }
                    ]
                }
            }

            if (startDate && endDate) {
                cond = {
                    ...cond,
                    date: { $gte: startDate, $lte: endDate }
                }
            }
            if (role === 'company') {
                const [list, earningDetails, pending_vendor_earning, adminCommission, count] = await Promise.all([
                    paymentModal.aggregate([
                        {
                            $lookup: {
                                foreignField: "_id",
                                localField: "orderId",
                                as: "orderDetails",
                                from: "bookings",
                                pipeline: [
                                    {
                                        $addFields: {
                                            'equipmentDetails.equipmentName': {
                                                $cond: {
                                                    if: { $eq: [language, 'ar'] },
                                                    then: "$equipmentDetails.ar_equipmentName",
                                                    else: "$equipmentDetails.equipmentName"
                                                }
                                            },
                                            'vehicleDetails.vehicleType': {
                                                $cond: {
                                                    if: { $eq: [language, 'ar'] },
                                                    then: "$vehicleDetails.ar_vehicleType",
                                                    else: "$vehicleDetails.vehicleType"
                                                }
                                            },
                                            'vehicleDetails.vehicleSize': {
                                                $cond: {
                                                    if: { $eq: [language, 'ar'] },
                                                    then: "$vehicleDetails.ar_vehicleSize",
                                                    else: "$vehicleDetails.vehicleSize"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            'equipmentDetails.equipmentName': 1, 'vehicleDetails.vehicleSize': 1, 'vehicleDetails.vehicleType': 1, orderId: 1, note: 1, type: 1
                                        }
                                    },
                                ]
                            }
                        },
                        {
                            $unwind: {
                                path: "$orderDetails",
                                preserveNullAndEmptyArrays: false
                            }
                        },
                        {
                            $lookup: {
                                foreignField: "orderId",
                                localField: "orderId",
                                as: "installmentDetails",
                                from: "order_installments",
                                pipeline: [
                                    // {
                                    //     $match: { type: { $ne: 'down_payment' } }
                                    // },
                                    {
                                        $project: {
                                            date: 1,
                                            time: 1,
                                            totalAmount: 1,
                                            paidAmount: 1,
                                            paymentStatus: 1,
                                            type: 1
                                        }
                                    },
                                    {
                                        $sort: { date: 1 }
                                    }
                                ]
                            }
                        },
                        {
                            $match: cond
                        },
                        {
                            $addFields: { equipmentName: "$orderDetails.equipmentDetails.equipmentName" }
                        },
                        {
                            $addFields: { vehicleType: "$orderDetails.vehicleDetails.vehicleType" }
                        },
                        {
                            $addFields: { vehicleSize: "$orderDetails.vehicleDetails.vehicleSize" }
                        },
                        {
                            $addFields: { orderId: "$orderDetails.orderId" }
                        },
                        {
                            $project: {
                                'orderId': 1,
                                'vehicleSize': 1,
                                'vehicleType': 1,
                                'equipmentName': 1,
                                'transactionId': 1,
                                'date': 1,
                                'time': 1,
                                'paymentStatus': 1,
                                "totalAmount": 1,
                                "dueAmount": 1,
                                "paidAmount": 1,
                                "installmentDetails": 1
                            }
                        },
                        {
                            $sort: { date: -1 }
                        },
                        {
                            $skip: Number(page * perPage) - Number(perPage)
                        },
                        {
                            $limit: Number(perPage)
                        }
                    ]),
                    paymentModal.aggregate([
                        {
                            $match: { paymentStatus: 'paid', companyProviderId: new mongoose.Types.ObjectId(userId), isDelete: false }
                        },
                        {
                            $group: {
                                _id: "$companyProviderId",
                                totalEarning: { "$sum": "$paidAmount" }
                            }
                        }
                    ]),
                    order_installmentModal.aggregate([
                        {
                            $match: { paymentStatus: 'unpaid', companyProviderId: new mongoose.Types.ObjectId(userId), isDelete: false, confirmBookingStatus: true }
                        },
                        {
                            $group: {
                                _id: "$companyProviderId",
                                totalEarning: { "$sum": "$paidAmount" }
                            }
                        }
                    ]),
                    bookingModel.aggregate([
                        {
                            $match: { paymentStatus: 'paid', statu: { $nin: ['Pending', 'Cancelled'] }, companyProviderId: new mongoose.Types.ObjectId(userId), isDelete: false }
                        },

                        {
                            $group: {
                                _id: "$companyProviderId",
                                totalEarning: { "$sum": "$admin_commission_amount" }
                            }
                        }
                    ]),
                    paymentModal.aggregate([
                        {
                            $lookup: {
                                foreignField: "_id",
                                localField: "orderId",
                                as: "orderDetails",
                                from: "bookings"
                            }
                        },
                        {
                            $match: cond
                        },
                        {
                            $count: "totalCount"
                        }
                    ])
                ]);
                const totalEarning = earningDetails.length ? earningDetails[0].totalEarning : 0
                const adminEarning = adminCommission.length ? adminCommission[0].totalEarning : 0
                const earning_details = {
                    vendor_earning: totalEarning - adminEarning,
                    admin_commission: adminEarning,
                    pending_vendor_earning: pending_vendor_earning.length ? pending_vendor_earning[0].totalEarning : 0,
                    due_amount_from_admin: 0
                }
                resolve({ earning_details: earning_details, itemList: list, count: count.length ? count[0].totalCount : 0 });
            } else {
                const [list, total_paid_amount, pending_amount, count] = await Promise.all([
                    paymentModal.aggregate([
                        {
                            $lookup: {
                                foreignField: "_id",
                                localField: "orderId",
                                as: "orderDetails",
                                from: "bookings",
                                pipeline: [
                                    {
                                        $addFields: {
                                            'equipmentDetails.equipmentName': {
                                                $cond: {
                                                    if: { $eq: [language, 'ar'] },
                                                    then: "$equipmentDetails.ar_equipmentName",
                                                    else: "$equipmentDetails.equipmentName"
                                                }
                                            },
                                            'vehicleDetails.vehicleType': {
                                                $cond: {
                                                    if: { $eq: [language, 'ar'] },
                                                    then: "$vehicleDetails.ar_vehicleType",
                                                    else: "$vehicleDetails.vehicleType"
                                                }
                                            },
                                            'vehicleDetails.vehicleSize': {
                                                $cond: {
                                                    if: { $eq: [language, 'ar'] },
                                                    then: "$vehicleDetails.ar_vehicleSize",
                                                    else: "$vehicleDetails.vehicleSize"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            'equipmentDetails.equipmentName': 1, 'vehicleDetails.vehicleSize': 1, 'vehicleDetails.vehicleType': 1, orderId: 1, note: 1, type: 1
                                        }
                                    },
                                ]
                            }
                        },
                        {
                            $unwind: {
                                path: "$orderDetails",
                                preserveNullAndEmptyArrays: false
                            }
                        },
                        {
                            $lookup: {
                                foreignField: "orderId",
                                localField: "orderId",
                                as: "installmentDetails",
                                from: "order_installments",
                                pipeline: [
                                    // {
                                    //     $match: { type: { $ne: 'down_payment' } }
                                    // },
                                    {
                                        $project: {
                                            date: 1,
                                            time: 1,
                                            totalAmount: 1,
                                            paidAmount: 1,
                                            paymentStatus: 1,
                                            type: 1
                                        }
                                    },
                                    {
                                        $sort: { date: 1 }
                                    }
                                ]
                            }
                        },
                        {
                            $match: cond
                        },
                        {
                            $addFields: { equipmentName: "$orderDetails.equipmentDetails.equipmentName" }
                        },
                        {
                            $addFields: { vehicleType: "$orderDetails.vehicleDetails.vehicleType" }
                        },
                        {
                            $addFields: { vehicleSize: "$orderDetails.vehicleDetails.vehicleSize" }
                        },
                        {
                            $addFields: { orderId: "$orderDetails.orderId" }
                        },
                        {
                            $project: {
                                'orderId': 1,
                                'vehicleSize': 1,
                                'vehicleType': 1,
                                'equipmentName': 1,
                                'transactionId': 1,
                                'date': 1,
                                'time': 1,
                                'paymentStatus': 1,
                                "totalAmount": 1,
                                "dueAmount": 1,
                                "paidAmount": 1,
                                "installmentDetails": 1
                            }
                        },
                        {
                            $sort: { date: -1 }
                        },
                        {
                            $skip: Number(page * perPage) - Number(perPage)
                        },
                        {
                            $limit: Number(perPage)
                        }
                    ]),
                    paymentModal.aggregate([
                        {
                            $match: { paymentStatus: 'paid', userId: new mongoose.Types.ObjectId(userId), isDelete: false }
                        },
                        {
                            $group: {
                                _id: "$userIdId",
                                totalEarning: { "$sum": "$paidAmount" }
                            }
                        }
                    ]),
                    order_installmentModal.aggregate([
                        {
                            $match: { paymentStatus: 'unpaid', userId: new mongoose.Types.ObjectId(userId), isDelete: false, confirmBookingStatus: true }
                        },
                        {
                            $group: {
                                _id: "$userId",
                                totalEarning: { "$sum": "$paidAmount" }
                            }
                        }
                    ]),
                    paymentModal.aggregate([
                        {
                            $lookup: {
                                foreignField: "_id",
                                localField: "orderId",
                                as: "orderDetails",
                                from: "bookings"
                            }
                        },
                        {
                            $match: cond
                        },
                        {
                            $count: "totalCount"
                        }
                    ])
                ]);
                const user_amount_spend_details = {
                    total_paid_amount: total_paid_amount.length ? total_paid_amount[0].totalEarning : 0,
                    due_amount: pending_amount.length ? pending_amount[0].totalEarning : 0,
                    total_spend_amount: Number(total_paid_amount.length ? total_paid_amount[0].totalEarning : 0) + Number(pending_amount.length ? pending_amount[0].totalEarning : 0)
                }
                resolve({ user_amount_spend_details: user_amount_spend_details, itemList: list, count: count.length ? count[0].totalCount : 0 });
            }
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Register A Customer on Hyper pay Account
 */
function createCustomer(body: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { name, email, phoneNumber, address, city, state, zip, country } = body;
            const data = {
                name: name,
                email: email,
                phone: phoneNumber,
                address: {
                    line1: address,
                    city: city,
                    state: state,
                    zip: zip,
                    country: country
                }
            };

            // Call the Hyper Gateway API to create the customer
            const response = await axios.post(CUSTOMER_CREATE_API_URL, data, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Customer created successfully:', response.data);
            resolve(response.data);
        } catch (err) {
            reject(err)
        }
    });
}

/**
 * Delete A Customer From Hyper pay Account
 */
function deleteCustomer(customerId: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.delete(`${CUSTOMER_CREATE_API_URL}/${customerId}`, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Customer deleted successfully:', response.data);
            resolve(response.data);
        } catch (err) {
            reject(err)
        }
    });
}

/**
 * Create Payment Through Hyper Pay
 * @param body 
 * @param userId 
 * @param headers 
 * @returns 
 */
function createPayment(body: any, userId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { orderId, amount, name, email, phoneNumber } = body;
            const paymentDetails = {
                amount: amount, // Amount in cents (1000 = $10)
                currency: 'USD',
                payment_method: 'credit_card', // or 'bank_transfer', 'paypal', etc.
                description: `Payment for order #${orderId}`,
                customer: {
                    name: name,
                    email: email,
                    phone: phoneNumber,
                },
                redirect_url: `${process.env.DEVELOPMENT_URL}/common/payment/successPayment`, // URL to redirect after successful payment
                cancel_url: `${process.env.DEVELOPMENT_URL}/common/payment/cancelPayment`, // URL to redirect if payment is canceled
            };
            const response = await axios.post(PAYMENT_HYPER_PAY_API_URL, paymentDetails, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                }
            });
            console.log("Payment created successfully:", response.data);
            resolve(response.data);
        } catch (err) {
            reject(err);
        }
    })
}

/**
 * Verify Payment
 */
function verifyPayment(transactionId: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.get(`${PAYMENT_HYPER_PAY_API_URL}/${transactionId}`, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                }
            });
            console.log("Payment verification response:", response.data);
            resolve(response.data);
        } catch (err) {
            reject(err)
        }
    });
}

/**
 *  Payment Success
 */

function successPayment(query: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { transactionId } = query; //Payment Details
            // Call an API endpoint to check payment status
            console.log("Payment successful:", query);
            resolve({ success: true });
        } catch (err) {
            reject(err);
        }
    })
}

/**
 *  Payment Cancelled/Failed
 */
function cancelPayment(query: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { transactionId } = query;
            // Verify payment using the Hyper Gateway API (e.g., to confirm payment success)
            // Call an API endpoint to check payment status
            console.log("Payment was canceled.");
            resolve({ success: false });
        } catch (err) {
            reject(err);
        }
    })
}

function saveCard(userId: any, body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { customerId, cardNumber, expiryMonth, expiryYear, cvv, cardHolderName, addressLine1, addressLine2 = '', city, state, postalCode, country } = body;
            const cardDetails = {
                cardNumber: cardNumber,
                expiryMonth: expiryMonth,
                expiryYear: expiryYear,
                cvv: cvv,
                cardHolderName: cardHolderName,
                billingAddress: {
                    addressLine1: addressLine1,
                    addressLine2: addressLine2,
                    city: city,
                    state: state,
                    postalCode: postalCode,
                    country: country
                }
            };
            const tokenResponse = await axios.post(TOKENIZE_API_URL, cardDetails, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            const token = tokenResponse.data.token; // This will be the token representing the credit card

            // Step 2: Save the token (and other card info if needed) to the user's account
            const saveResponse = await axios.post(SAVE_CARD_API_URL, {
                customerId: customerId, // Your customer identifier
                token: token
            }, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            resolve(saveResponse.data);
        } catch (err) {
            reject(err);
        }
    });
}

function deleteCard(userId: any, cardId: any, customerId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.delete(DELETE_CARD_API_URL, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    customerId: customerId,
                    cardId: cardId // Card ID or token that was saved previously
                }
            });

            resolve(response.data);
        } catch (err) {
            reject(err);
        }
    })
}

function cardList(userId: any, customerId: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.get(CARD_LIST_API_URL, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    customerId: customerId
                }
            });
            resolve(response.data);
        } catch (err) {
            reject(err);
        }
    })
}

// async function runPromisesInParallel(promises: any) {
//     try {
//         // Wait for all promises to settle (either resolve or reject)
//         const results = await Promise.allSettled(promises);
//         console.log(results, "0-------------------")
//         // Process results
//         results.forEach((result, index) => {
//             if (result.status === 'fulfilled') {
//                 console.log(`Promise ${index} fulfilled with value: ${result.value}`);
//             } else if (result.status === 'rejected') {
//                 console.log(`Promise ${index} rejected with reason: ${result.reason}`);
//             }
//         });

//         return results; // Return the results array for further processing if needed
//     } catch (error) {
//         // Handle any unexpected errors (shouldn't occur with allSettled)
//         console.error('An unexpected error occurred:', error);
//     }
// }

// // Example usage:
// const promise1 = new Promise((resolve, reject) => {
//     setTimeout(() => {
//         resolve('one');
//     }, 1000)
// });
// const promise2 = new Promise((resolve, reject) => {
//     setTimeout(() => {
//         resolve('two');
//     }, 2000)
// });
// const promise3 = new Promise((resolve, reject) => {
//     setTimeout(() => {
//         reject('three');
//     }, 3000)
// });

// runPromisesInParallel([promise1, promise2, promise3])
//     .then((results) => {
//         console.log('All promises have settled:', results);
//     });
// console.log(`Current directory: ${process.pid}`,process.stdout.write("Hello, world!\n"));

export default {
    generate_downpaymentOrder_invoice,
    generateInstallment_invoice,
    paymentDetails,
    paymentList,
    createCustomer,
    deleteCustomer,
    createPayment,
    verifyPayment,
    successPayment,
    cancelPayment,
    saveCard,
    deleteCard,
    cardList,
} as const;