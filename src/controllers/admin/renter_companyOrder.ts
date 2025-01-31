
import { ListObjectVersionsCommand } from "@aws-sdk/client-s3";
import { resolveClientEndpointParameters } from "@aws-sdk/client-s3/dist-types/endpoint/EndpointParameters";
import { messages } from "@Custom_message"
import bookingModel from "@models/booking";
import user_renter_delivery_Model from "@models/user";
import { countDocuments } from "@models/userSession";
import { CustomError } from "@utils/errors";
import { bookingSchema, order_statusSchema } from "@validators/user";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import moment from "moment";


function OrderList_equipment(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language } = headers;
            const message = messages(language);
            const page = parseInt(query?.page) || 1;
            const perPage = parseInt(query?.perPage) || 10;
            const skip = (page - 1) * perPage;
            const { bookingStatus, search, equipmentName, equipmentId, fromDate, toDate } = query;
                     
            let Conditions: any = {
                isDelete: false,
                type: "equipment",
                paymentStatus: "paid",
            };
           
            if (bookingStatus && bookingStatus !== "" && bookingStatus !== null){
               Conditions = {
                ...Conditions,
                bookingStatus:bookingStatus
               }
            }
            
            if(equipmentId && equipmentId !== null){
                Conditions.equipmentId = new mongoose.Types.ObjectId(equipmentId)
            }

            if (fromDate && toDate) {
                const fromDate1 = moment(fromDate).format('YYYY-MM-DD'); 
                const toDate1 = moment(toDate).format('YYYY-MM-DD');
                Conditions = {
                  ...Conditions,
                  bookingDate: {
                    $gte: fromDate1,
                    $lte: toDate1
                  },
                };
              } 
    
            const [result] = await bookingModel.aggregate([
                { $match: Conditions },
                {
                    $lookup: {
                        from: "user_renter_deliveries",
                        localField: "companyProviderId",
                        foreignField: "_id",
                        as: "renterCompany_details",
                    },
                },
                {
                    $unwind: {
                        path: "$renterCompany_details",
                        // preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup:{
                        from:"user_renter_deliveries",
                        localField:"userId",
                        foreignField:"_id",
                        as:"userDetails"
                    }
                },
                {
                    $unwind:{
                        path:"$userDetails"
                    }
                },
                ...(search && search !== "" && search !== null
                    ? [
                          {
                              $match: {
                                  $or: [
                                      { orderId: { $regex: search, $options: "i" } },
                                      { "renterCompany_details.name": { $regex: search, $options: "i" } },
                                      { "equipmentDetails.equipmentName": { $regex: search, $options: "i" } },
                                  ],
                              },
                          },
                      ]
                    : []),
                {
                    $project: {
                        orderId: 1,
                        userId:1,
                        order_startDate: 1,
                        order_endDate: 1,
                        bookingStatus: 1,
                        bookingDate: 1,
                        paymentStatus: 1,
                        totalAmount: 1,
                        isActive: 1,
                        isDelete: 1,
                        chosen_equipment: 1,
                        equipmentId: 1,
                        "equipmentDetails.equipmentName": 1,
                        "renterCompany_details.name": 1,
                        "renterCompany_details.role": 1,                       
                        userDetails:{
                            name:1,
                            address:1,
                            addressLine1:1,
                            addressLine2:1,
                            phoneNumber:1,
                            lat:1,
                            long:1,
                            city:1,
                            country:1,
                            state:1,                           
                        }
                    },
                },
                { $sort: { bookingDate: -1 } }, // For desending order
                {
                    $facet: {
                        totalCount: [{ $count: "count" }],
                        paginatedRes: [{ $skip: skip }, { $limit: perPage }],
                    },
                },
            ]);
            const TotalCount = result.totalCount.length > 0 ? result.totalCount[0].count : 0; 
            const bookings = result.paginatedRes;
            
            resolve({ bookings, TotalCount });
            
        } catch (error) {
            reject(error);
        }
    });
}



function renterOrder_Details(params: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language } = headers;
            const message = messages(language);
            const { id } = params;

          
            const Conditions = {
                orderId: id,
                isDelete: false,
                type:"equipment",
            };

          
            const renterDetails = await bookingModel.aggregate([
                {
                    $match: Conditions, 
                },
                {
                    $lookup: {
                        from: "user_renter_deliveries",
                        localField: "companyProviderId",
                        foreignField: "_id",
                        as: "userdata",
                    },
                },
                {
                    $unwind: {
                        path: "$userdata",                   
                    },
                },
                {
                    $lookup: {
                        from: "equipment",
                        localField: "equipmentId",
                        foreignField: "_id",
                        as: "equipmentdata",
                    },
                },
                {
                    $unwind: {
                        path: "$equipmentdata",
                    },
                },
                {
                    $lookup: {
                      foreignField: "orderId",
                      localField: "_id",
                      as: "installmentDetails",
                      from: "order_installments",
                      pipeline: [
                        {
                          $match: { confirmBookingStatus: true, isDelete: false, paymentStatus: "unpaid", type: 'installment' }
                        },
                        {
                          $sort: { date: 1 }
                        },
                        {
                          $project: {
                            type: 1,
                            date: 1,
                            time: 1,
                            confirmBookingStatus: 1,
                            totalAmount: 1,
                            paidAmount: 1,
                            orderId: 1,
                            paymentStatus: 1
                          }
                        }
                      ]
                    }
                },              
                {
                    $project: {
                        orderId: 1,
                        order_startDate: 1,
                        order_endDate: 1,                      
                        bookingDate: 1,
                        userdata:1,
                        cancelReason: 1,
                        bookingStatus: 1,
                        ar_cancelReason: 1,
                        chosen_equipment: 1,
                        totalAmount:1,
                        paidAmount:1,
                        remaining_amount:1,
                        delivery_addressDetails:1,  
                        equipmentLocation:1, 
                        admin_commission_amount:1,
                        admin_commission_percentage:1,                      
                        "equipmentDetails.technicalSpecification":1,
                        "equipmentDetails.equipmentName":1,
                        "equipmentDetails.ar_equipmentName":1,
                        "equipmentDetails.equipmentLocation":1, 
                        "equipmentDetails.day_cost":1,  
                        installmentDetails:1,
                        vat_tax:1, 
                    },
                },
                {
                    $project:{
                        "userdata.password":0
                    }
                }
            ]);
            
            resolve(renterDetails);
        } catch (error) {
            reject(error);
        }
    });
}

function excelData_renterOrder(params: any, headers: any): Promise<any> {
   return new Promise(async (resolve, reject)=>{
        try{
            var Condition:any = {
                isDelete:false,
                type:"equipment",
                paymentStatus:"paid"
            }
            const excelData = await bookingModel.aggregate([
                { $match: Condition },
                {
                    $lookup: {
                        from: "user_renter_deliveries",
                        localField: "companyProviderId",
                        foreignField: "_id",
                        as: "renterCompany_details",
                    },
                },
                {
                    $unwind: {
                        path: "$renterCompany_details",
                    },
                },
                {
                    $lookup:{
                        from:"user_renter_deliveries",
                        localField:"userId",
                        foreignField:"_id",
                        as:"userDetails"
                    }
                },
                {
                    $unwind:{
                        path:"$userDetails"
                    }
                },
                {
                    $lookup: {
                        from: "equipment",
                        localField: "equipmentId",
                        foreignField: "_id",
                        as: "equipmentdata",
                    },
                },
                {
                    $unwind:{
                        path:"$equipmentdata"
                    }
                },
                {
                    $project:{
                        orderId:1, 
                        order_startDate:1,
                        order_endDate:1,
                        bookingStatus:1,
                        bookingDate:1,
                        paymentStatus:1,
                        totalAmount:1,
                        equipmentName: "$equipmentDetails.equipmentName",
                        companyName:"$renterCompany_details.name",
                        usreName:"$userDetails.name"
                       }
                 },
                 {
                    $project:{
                        _id:0
                    }
                 },
                { $sort: { bookingDate: -1 } },
            ])
            resolve(excelData)
        }catch(error){
            reject(error)
        }
    })
}


export default {
    OrderList_equipment, 
    renterOrder_Details  ,
    excelData_renterOrder 
} as const;