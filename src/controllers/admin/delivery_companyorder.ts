import { resolveClientEndpointParameters } from "@aws-sdk/client-s3/dist-types/endpoint/EndpointParameters";
import equipment from "@controllers/company_renter/equipment";
import { messages } from "@Custom_message"
import bookingModel from "@models/booking";
import { countDocuments } from "@models/user";
import { CustomError } from "@utils/errors";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { isErrored } from "winston-daily-rotate-file";
import moment from "moment";


function OrderList_delivery(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const message = messages(language);
            const page = parseInt(query?.page) || 1;
            const perPage = parseInt(query?.perPage) || 10;
            const skip = (page - 1) * perPage;
            const { bookingStatus, search, vehicleId, fromDate, toDate } = query;           
            var Conditions:any = {
                isDelete: false,
                type:"vehicle",
                paymentStatus:"paid"   
            };
            if(bookingStatus && bookingStatus !=="" && bookingStatus !== null ){
                Conditions = {
                    ...Conditions,
                    bookingStatus
                }
            }              
            if(vehicleId && vehicleId !== null){
                Conditions.vehicleId = new mongoose.Types.ObjectId(vehicleId)
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
                { $match:Conditions },
                {
                    $lookup: {
                        from: "user_renter_deliveries",
                        localField: "companyProviderId",
                        foreignField: "_id",
                        as: "deliveryCompany_details"
                    }
                },
                {
                    $unwind: {
                        path: "$deliveryCompany_details",                     
                    }
                },
                {
                    $lookup:{
                        from:"delivery_vehicles",
                        localField:"vehicleId",
                        foreignField:"_id",
                        as:"deliveryDetails"
                    }
                },
                {
                    $unwind: {
                        path: "$deliveryDetails",               
                    }
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
                    $unwind: {
                        path: "$userDetails",                 
                    }
                },
                ...(search && search !== "" && search !==null
                    ? [
                          {
                              $match: {
                                  $or: [
                                      { orderId: { $regex: search, $options: "i" } },
                                      { "deliveryCompany_details.name": { $regex: search, $options: "i" } },
                                      { "vehicleDetails.vehicleType": {$regex:search,$options:"i"}}
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
                        chosen_equipment:1,
                        order_endDate: 1,    
                        bookingStatus: 1,    
                        bookingDate: 1,       
                        totalAmount: 1, 
                        paymentStatus:1,  
                        vehicleId:1,
                        vehicleDetails:{
                            vehicleType:1
                        },  
                        "deliveryCompany_details.name":1,
                        "deliveryCompany_details.role":1,
                        "deliveryDetails.priceInside_city_perDay":1,
                        "deliveryDetails.priceBreaking_details.time":1,
                        "deliveryDetails.priceInoutSide_city_perKm":1,
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
                    }
                },
                { $sort: { bookingDate: -1 } }, // for desending order
                {
                    $facet: {
                        totalCount: [{ $count: "count" }],
                        paginatedRes: [{ $skip: skip }, { $limit: perPage }],
                    },
                },
        ])  
            const TotalCount = result.totalCount.length > 0 ? result.totalCount[0].count : 0; 
            const bookings = result.paginatedRes;    
            resolve({bookings, TotalCount});
             
    }catch (error) {
            reject(error);
        }
    });
}


function deliveryOrder_Details(params: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language = 'en' } = headers;
            const message:any = messages(language);
            const { id } = params;
            const Conditions = {
                orderId: id,
                isDelete: false,
                type:"vehicle"
            }
            
            const orderDetails = await bookingModel.aggregate([
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
                        loadCapacity:1,
                        order_startDate: 1,
                        order_endDate: 1,
                        order_startTime: 1,
                        order_endTime: 1,
                        bookingDate: 1,
                        loadType: 1,
                        ar_loadType: 1,
                        cancelReason: 1,
                        vendor_amount:1,
                        remaining_amount:1,
                        vat_tax:1,
                        admin_commission_amount:1,
                        admin_commission_percentage:1,
                        totalAmount:1,
                        transport_cost:1,
                        chosen_equipment: 1,
                        paidAmount:1,
                        orderId:1,
                        userLocation:1,
                        pickup_addressDetails:1,
                        delivery_addressDetails:1,
                        priceBreaking_details:1,
                        paymentStatus:1,
                        createdAt:1,
                        bookingStatus:1,
                        vehicleType:1,
                        ar_vehicleType:1,
                        vehicleSize:1,
                        userdata:1 ,
                        installmentDetails:1,
                        vehicleDetails:1,
                    },
                },
                {
                    $project:{
                        "userdata.password":0
                    }
                }
            ]);
            resolve(orderDetails);
        } catch (error) {
            reject(error);
        }
    });
}

function excelData_deliveryOrder(query:any, headers:any):Promise<any>{
    return new Promise(async(resolve, reject)=>{
        try{
            var Cond:any =  {
                isDelete:false,
                type:"vehicle",
                paymentStatus:"paid"
            }
          
            const result = await bookingModel.aggregate([
                { $match:Cond },
                {
                    $lookup: {
                        from: "user_renter_deliveries",
                        localField: "companyProviderId",
                        foreignField: "_id",
                        as: "deliveryCompany_details"
                    }
                },
                {
                    $unwind: {
                        path: "$deliveryCompany_details",                     
                    }
                },
                {
                    $lookup:{
                        from:"delivery_vehicles",
                        localField:"vehicleId",
                        foreignField:"_id",
                        as:"deliveryDetails"
                    }
                },
                {
                    $unwind: {
                        path: "$deliveryDetails",               
                    }
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
                    $unwind: {
                        path: "$userDetails",                 
                    }
                },
                {
                    $project: {
                        orderId: 1,
                        order_startDate: 1,
                        order_endDate: 1,    
                        bookingStatus: 1,    
                        bookingDate: 1,       
                        totalAmount: 1, 
                        paymentStatus:1, 
                        companyName:"$deliveryCompany_details.name",
                        usreName:"$userDetails.name"
                    }
                },
                {
                    $project:{
                        _id:0
                    }
                 },
                { $sort: { bookingDate: -1 }}  
            ])        
            resolve(result)
        }catch(error){
            reject(error)
        }
    })
}

export default {
    OrderList_delivery,
    deliveryOrder_Details,
    excelData_deliveryOrder
} as const;

