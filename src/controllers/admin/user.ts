import { messages } from "@Custom_message";
import bookingModel, { removeListener } from "@models/booking";
import user_renter_delivery_Model from "@models/user";
import { CustomError } from "@utils/errors";
import { StatusCodes } from "http-status-codes";
import moment from "moment";
import mongoose from "mongoose";

// LIST USER , RENTER AND DELIVERY DETAILS AT ADMIN

function listUsers(query: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try { 
      const page = parseInt(query?.page) || 1;
      const perPage = parseInt(query?.perPage) || 10;
      const skip = (page - 1) * perPage;
      const nameMatched = query?.nameMatched;
      let {role, toDate, fromDate, isActive  }  = query;

      let matchedCondition: any = { isDelete: false, role:role };
      if (nameMatched !== "" && nameMatched && nameMatched != null) {
        matchedCondition = {
          ...matchedCondition,
          $or: [
            { 'name': { '$regex': nameMatched, '$options': "i" } },
            { 'email': { '$regex': nameMatched, '$options': "i" } },
            { 'phoneNumber': { '$regex': nameMatched, '$options': "i" } },
            { 'address': {'$regex': nameMatched, '$options':"i"} }
          ]
        }; 
      } 
     
      if (fromDate && toDate) {
           fromDate = moment(fromDate).format('YYYY-MM-DD'); 
           toDate = moment(toDate).format('YYYY-MM-DD'); 
           const fromDateISO = moment(fromDate).startOf('day').toISOString();
           const toDateISO = moment(toDate).endOf('day').toISOString();
           matchedCondition = {
                ...matchedCondition,
                createdAt: {
                $gte: moment(fromDateISO).toDate(),
                $lte: moment(toDateISO).toDate(),
          },
        }
      }  
      if (isActive === "Active") {
        matchedCondition = { ...matchedCondition, isActive: true }
      }
      else if (isActive === "InActive") {
        matchedCondition = { ...matchedCondition, isActive: false }
      }
      else if (isActive === "all") {
        matchedCondition.isActive === null;
      }

      const [findUserDetails, totalDocument] = await Promise.all([user_renter_delivery_Model.find(matchedCondition).select({password:0}).sort({createdAt:-1}).skip((page-1)*perPage).limit(perPage),
                                                                  user_renter_delivery_Model.countDocuments(matchedCondition)]) 
      resolve({ totalDocument, findUserDetails })
    }
    catch (error) {
      reject(error);
    }
  });
}


// LIST USER DETAILS FOR PARTICULAR ID

function userDetailsAtParticularId(params: any, query: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      const { id } = params;
      const { role, nameMatched, bookingStatus, isActive, orderType, vehicleType, fromDate, toDate } = query;
      const page = parseInt(query?.page) || 1;
      const perPage = parseInt(query?.perPage) || 10;
      let skip = (page - 1) * (perPage);
      let condition: any = { userId: new mongoose.Types.ObjectId(id), isDelete: false, companyProviderId: { $ne: null }, paymentStatus:"paid" };
      if (bookingStatus !== undefined && bookingStatus !== null && bookingStatus && bookingStatus !== "") {
        condition = { ...condition, bookingStatus: bookingStatus }
      }

      if(orderType === "renter"){
        condition.type = "equipment"
      } else if(orderType === "delivery"){
        condition.type = "vehicle"
      }else{
        condition = {...condition}
      }

      if(vehicleType && vehicleType !== "" && vehicleType !== null && vehicleType !== undefined){
        condition = {
          ...condition,
          vehicleType:vehicleType
        }
      }
 
      if (fromDate && toDate) {
        const fromDate1 = moment(fromDate).format('YYYY-MM-DD'); 
        const toDate1 = moment(toDate).format('YYYY-MM-DD');
        condition = {
          ...condition,
          bookingDate: {
            $gte: fromDate1,
            $lte: toDate1
          },
        };
      } 
           
      if (role === "user") { 
        const [userDetails, renter_totalOrder, renter_completeOrder, renter_confirmedOrder, renter_cancelledOrder, delivery_totalOrder, delivery_completeOrder, delivery_confirmOrder, delivery_cancelledOrder] = await Promise.all(
          [
            user_renter_delivery_Model.findOne({ _id: id, isDelete: false }).select("-password"),
            bookingModel.countDocuments({ userId: id, isDelete: false, type: "equipment" }),
            bookingModel.countDocuments({ userId: id, isDelete: false, type: "equipment", bookingStatus: "Completed" }),
            bookingModel.countDocuments({ userId: id, isDelete: false, type: "equipment", bookingStatus: "Confirmed" }),
            bookingModel.countDocuments({ userId: id, isDelete: false, type: "equipment", bookingStatus: "Cancelled" }),
            bookingModel.countDocuments({ userId: id, isDelete: false, type: "vehicle" }),
            bookingModel.countDocuments({ userId: id, isDelete: false, type: "vehicle", bookingStatus: "Completed" }),
            bookingModel.countDocuments({ userId: id, isDelete: false, type: "vehicle", bookingStatus: "Confirmed" }),
            bookingModel.countDocuments({ userId: id, isDelete: false, type: "vehicle", bookingStatus: "Cancelled" }),
          ])
        const orderListingByUser = await bookingModel.aggregate([ 
          {
            $match: condition,
          },     
          {
            $lookup: {
              from: "user_renter_deliveries",
              localField: "companyProviderId",
              foreignField: "_id",
              as: "companyProviderDetails"
            }
          },
          {
            $unwind: "$companyProviderDetails",
          },
          ...(nameMatched && nameMatched !== "" && nameMatched !== null && nameMatched !== undefined
            ? [
               {
                  $match: {
                      $or: [
                          { orderId: { $regex: nameMatched, $options: "i" } },
                          { "companyProviderDetails.name": { $regex: nameMatched, $options: "i" } },
                          { "equipmentDetails.equipmentName": {$regex: nameMatched, $options: "i"}}  
                      ],
                  },
               },
              ]
        : []
          ), 
          {
            $project:{
              "companyProviderDetails.password":0 , 
            }
          },
          {
            $sort: {
              createdAt: -1
            }
          },         
          {
            $facet: {
              totalCount: [{ $count: "count" }],
              paginatedRes: [
                { $skip: skip },
                { $limit: perPage }
              ]
            }
          },
        ])
        let totalcount = orderListingByUser[0]?.totalCount[0]?.count || 0;
        let paginatedResult = orderListingByUser[0].paginatedRes;
        resolve({ totalcount: totalcount, delivery_totalOrder: delivery_totalOrder, delivery_completeOrder: delivery_completeOrder, delivery_confirmOrder: delivery_confirmOrder, delivery_cancelledOrder: delivery_cancelledOrder, renter_totalOrder: renter_totalOrder, renter_completeOrder: renter_completeOrder, renter_confirmedOrder: renter_confirmedOrder, renter_cancelledOrder, orderDetails: paginatedResult, userDetails });
    }
      else {
        const [userDetails] = await Promise.all([user_renter_delivery_Model.findOne(
          { _id: id, isDelete: false },
        )])
        resolve(userDetails);
      }
    } catch (error) {
      reject(error);
    }
  });
}


function previewUserOrder(params: any, query: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { language } = headers;
      const message = messages(language);
      const { type } = query;
      const { id } = params;
      if (type === "equipment") {
        const data = await bookingModel.aggregate([
          {
            $match: { _id: new mongoose.Types.ObjectId(id), type: "equipment" }
          },
          {
            $lookup: {
              from: "user_renter_deliveries",
              localField: "companyProviderId",
              foreignField: "_id",
              as: "companyDetails"
            }
          },
          {
            $unwind:{
              path:"$companyDetails",
              preserveNullAndEmptyArrays:true
            }
          },
          {
            $lookup: {
              from: "equipment_addresses",
              localField: "equipmentId",
              foreignField: "equipmentId",
              as: "equipment_address"
            }
          },
          {
            $unwind:{
              path:"$equipment_address",
              preserveNullAndEmptyArrays:true
            }
          },
          {
            $lookup: {
              from: "equipment_medias",
              localField: "equipmentId",
              foreignField: "equipmentId",
              as: "equipment_media"
            }
          },
          {
            $unwind:{
              path:"$equipment_media",
              preserveNullAndEmptyArrays:true
            }
          },
          {
            $project: {
              "companyDetails.password": 0, 
            },
          },
          
        ]);
        resolve(data.length?data[0]:{});
      }
      else if (type === "vehicle") {
        const data = await bookingModel.aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(id),
              type: "vehicle"
            }
          },
          {
            $lookup: {
              from: "delivery_vehicles",
              localField: "vehicleId",
              foreignField: "_id",
              as: "companyDetails"
            }
          },          
          {
            $unwind:{
              path:"$companyDetails",
              preserveNullAndEmptyArrays:true
            }
          },
          {
            $lookup: {
              from: "vehicle_addresses",
              localField: "vehicleId",
              foreignField: "vehicleId",
              as: "vehicle_Address"
            }
          },
          {
            $unwind:{
              path:"$vehicle_Address",
              preserveNullAndEmptyArrays:true
            }
          },
          {
            $lookup: {
              from: "vehicle_medias",
              localField: "vehicleId",
              foreignField: "vehicleId",
              as: "vehicle_media"
            }
          },
          {
            $unwind:{
              path:"$vehicle_medias",
              preserveNullAndEmptyArrays:true
            }
          },
          {
            $project: {
              "companyDetails.password": 0, 
            },
          },
        ])
        resolve(data.length?data[0]:{});
      }
    }
    catch (error) {
      reject(error);
    }
  })
}

// UPDATE USER STATUS FOR PARTICULAR USER
function UpdateStatusofParticularUser(
  params: any,
  query: any,
  headers: any
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      const { id } = params;
      const { isActive } = query;
      const updateStatusForParticularUser =
        await user_renter_delivery_Model.findOneAndUpdate(
          { _id: id, isDelete: false },
          { isActive: isActive },
          { new: true }
        );
      if (updateStatusForParticularUser === null) {
        reject(
          new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );
      } else {
        resolve({ success: true });
      }
    } catch (error) {
      reject(error);
    }
  });
}

// DELETE USER BY ADMIN

function deleteUser(params: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      const { id } = params;
      const userDetails = await user_renter_delivery_Model.findOneAndUpdate(
        { _id: id, isDelete: false },
        { isDelete: true },
        { new: true }
      );
      if (userDetails === null) {
        reject(
          new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );
      } else {
        resolve({ success: true });
      }
    } catch (error) {
      reject(error);
    }
  });
}

function updateUserDetails(body: any, params: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      const { id } = params;
      const findAndUpdateUserDetails =
        await user_renter_delivery_Model.findOneAndUpdate(
          {
            _id: id,
            isDelete: false
          },
          {
            name: body?.name,
            image: body?.image,
            email: body?.email,
            address: body?.address,
            addressLine1: body?.addressLine1,
            addressLine2: body?.addressLine2
          },
          { new: true }
        );
      if (findAndUpdateUserDetails === null) {
        reject(
          new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );
      } else {
        resolve({ success: true });
      }
    } catch (error) {
      reject(error);
    }
  });
}

function verifyUser(params: any, query: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { language } = headers;
      const message = messages(language);
      const { id } = params;
      const { isVerified } = query;
      const updateData = await user_renter_delivery_Model.findOneAndUpdate({ _id: id, isDelete: false }, { isVerified: isVerified }, { new: true });
      if (updateData) {
        resolve(updateData);
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


function orderDetails_renter_delivery(query: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { language } = headers;
      const message = messages(language);
      const { role, search } = query;
      const page = parseInt(query?.page) || 1;
      const perPage = parseInt(query?.perPage) || 10;
      const skip = (page - 1) * perPage;
      let condition: any = { isDelete: false };
      if (role && role === "renter") {
        condition = { ...condition, type: "equipment" };
      } else if (role && role === "delivery") {
        condition = { ...condition, type: "vehicle" };
      }
      const result = await bookingModel.aggregate([
        {
          $match: condition,
        },
        {
          $lookup: {
            from: "user_renter_deliveries",
            localField: "companyProviderId",
            foreignField: "_id",
            as: "renterUserOrder_Details",
          },
        },
        {
          $unwind: {
            path: "$renterUserOrder_Details",
          },
        },
        {
          $lookup: {
            from: "user_renter_deliveries",
            localField: "userId",
            foreignField: "_id",
            as: "user_Details",
          },
        },
        {
          $unwind: {
            path: "$user_Details",
          },
        },
        ...(search && search !== "" && search !== null
          ? [
              {
                $match: {
                  $or: [
                    { orderId: search }, 
                    { "user_Details.name": { $regex: search, $options: "i" } }, 
                    { "renterUserOrder_Details.name": { $regex: search, $options: "i" } }, 
                  ],
                },
              },
            ]
          : []),
        {
          $project: {
            orderId: 1,
            deliveryDetails: 1,
            order_startDate: 1,
            order_endDate: 1,
            bookingDate: 1,
            bookingStatus: 1,
            "renterUserOrder_Details.role": 1,
            "renterUserOrder_Details.name": 1,
            "user_Details.role": 1,
            "user_Details.name": 1,
          },
        },
        {
          $sort: { bookingDate: -1 },
        },
        {
          $facet: {
            totalCount: [{ $count: "count" }], 
            paginatedRes: [
              { $skip: skip }, 
              { $limit: perPage }, 
            ],
          },
        },
      ]);

      const TotalCount = result[0]?.totalCount.length > 0 ? result[0].totalCount[0].count : 0;
      const bookings = result[0]?.paginatedRes;

      resolve({ bookings, TotalCount });
    } catch (error) {
      reject(error); 
    }
  });
}


function excelUser_Renter_Delivery(query: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
    
      const { role } = query;
      let condition: any = { isDelete: false, role: role };
     
      const totalDocument = await user_renter_delivery_Model.countDocuments(
        condition
      );
      const excelData = await user_renter_delivery_Model
        .aggregate([
          {
            $match: condition,
          },
          {
            $sort: { createdAt: -1 }, 
          },
        ])       
      resolve({ totalDocument: totalDocument, excelData });
    }
    catch (error) {
      reject(error);
    }
  });
}

export default {
  excelUser_Renter_Delivery,
  orderDetails_renter_delivery,
  userDetailsAtParticularId,
  UpdateStatusofParticularUser,
  deleteUser,
  updateUserDetails,
  verifyUser,
  previewUserOrder,
  listUsers
} as const;
