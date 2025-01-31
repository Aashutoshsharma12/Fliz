import argon2 from "argon2";
import { adminauthModal, delivery_vehicleModel, equipmentModel } from "@models/index";
import { CustomError } from "@utils/errors";
import { messages } from "@Custom_message";
import { StatusCodes } from "http-status-codes";
const jwt = require("jsonwebtoken");

function registerAdmin(body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { language = 'en' } = headers;
      var message: any = messages(language);
      const adminExist = await adminauthModal.findOne({ email: body?.email });
      if (adminExist !== null) {
        reject(new CustomError(message.alreadyExist, StatusCodes.BAD_REQUEST));
      } else {
        const hashPass = await argon2.hash(body?.password);
        body.password = hashPass;
        const addDataResult = await adminauthModal.create(body);
        if (addDataResult !== null) {
          resolve(addDataResult);
        }
      }
    } catch (err) {
      if (err.code == 11000) {
        reject(
          new CustomError(message.accountAlreadyExist, StatusCodes.BAD_REQUEST)
        );
      }
      reject(err);
    }
  });
}

function loginAdmin(body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language = 'en' } = headers;
    var message = messages(language);
    try {
      const findAdmin = await adminauthModal.findOne({
        email: body?.email,
      });
      if (findAdmin) {
        const checkPassword = await argon2.verify(
          `${findAdmin.password}`,
          body?.password
        );
        if (checkPassword) {
          const access_token = jwt.sign(
            { id: findAdmin._id, role: "admin" },
            process.env.JWT_SECRET_TOKEN,
            {
              expiresIn: "30d",
            }
          );
          const adminDetails = await adminauthModal
            .findOneAndUpdate(
              { email: body?.email },
              { token: access_token },
              { new: true }
            )
            .select({ password: 0, isActive: 0, isDelete: 0 });
          resolve(adminDetails);
        } else {
          reject(
            new CustomError(message.WrongPassword, StatusCodes.BAD_REQUEST)
          );
        }
      } else {
        reject(
          new CustomError(message.noAccountMatch, StatusCodes.BAD_REQUEST)
        );
      }
    } catch (error) {
      reject(error);
    }
  });
}

function changeAdminPassword(
  body: any,
  params: any,
  headers: any
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language = 'en' } = headers;
    const message = messages(language);
    try {
      if (body.current_password !== body.new_password) {
        const findUserByID = await adminauthModal.findOne();
        if (findUserByID) {
          const verifyoldPass = await argon2.verify(
            `${findUserByID?.password}`,
            body?.current_password
          );
          if (!verifyoldPass) {
            reject(
              new CustomError(message.wrongoldPassword, StatusCodes.BAD_REQUEST)
            );
          } else {
            const newPassword = await argon2.hash(body?.new_password);
            await adminauthModal.updateOne({},
              { password: newPassword }
            );
            resolve(message.passwordUpdateSuccessful);
          }
        } else {
          reject(
            new CustomError(message.noSuchAccountExist, StatusCodes.BAD_REQUEST)
          );
        }
      } else {
        reject(new CustomError(message.bothPassSame, StatusCodes.BAD_REQUEST));
      }
    } catch (err) {
      reject(err);
    }
  });
}

function forgotPassAdmin(body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language = 'en' } = headers;
    const message = messages(language);
    try {
      const findAdminByEmail = await adminauthModal.findOne({
        email: body.email,
      });
      if (findAdminByEmail === null) {
        reject(
          new CustomError(message.noAccountMatch, StatusCodes.BAD_REQUEST)
        );
      } else {
        if (body.password === body.confirmPassword) {
          const newPassword = body?.confirmPassword;
          const hashnewPassword = await argon2.hash(newPassword);
          await adminauthModal.updateOne(
            { email: body?.email },
            {
              password: hashnewPassword,
            }
          );
          resolve(message.passwordUpdateSuccessful);
        } else {
          reject(
            new CustomError(
              message.passwordDifferError,
              StatusCodes.NOT_ACCEPTABLE
            )
          );
        }
      }
    } catch (error) {
      reject(error);
    }
  });
}

function logoutAdmin(userId: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language = 'en' } = headers;
    const message = messages(language);
    try {
      const findAdminbyId = await adminauthModal.findById(userId);
      if (findAdminbyId !== null) {
        await adminauthModal.updateOne({ _id: userId }, { token: "" });
        resolve(message.logoutSuccessful);
      } else {
        reject(
          new CustomError(message.noAccountMatch, StatusCodes.BAD_REQUEST)
        );
      }
    } catch (error) {
      reject(error);
    }
  });
}

function updateTax(body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { tax } = body;
      const update = await adminauthModal.updateOne({ isDelete: false }, { tax: tax });
      resolve({ success: true, update });
    } catch (err) {
      reject(err)
    }
  });
}

function taxDetails(headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const tax_details = await adminauthModal.findOne({ isDelete: false }, { tax: 1 });
      resolve(tax_details);
    } catch (err) {
      reject(err)
    }
  });
}

function addEditCommission(body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language = 'en' } = headers;
    const message = messages(language);
    try {
      const { equipmentCommission , equipmentId, vehicleId, vehicleCommission } = body
      if(equipmentId){
        const data = await equipmentModel.findOne({_id:equipmentId});
        if (!data) {
          reject(new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND))
        } else {
          const updatedData = await equipmentModel.updateOne({ _id:equipmentId }, {equipmentCommission:equipmentCommission} , {new:true});
          resolve(updatedData);
        }  
      }
      if(vehicleId){
        const data = await delivery_vehicleModel.findOne({_id:vehicleId});
        if (!data) {
          reject(new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND))
        } else {
          const updatedData = await delivery_vehicleModel.updateOne({ _id:vehicleId }, {vehicleCommission:vehicleCommission} , {new:true});
          resolve(updatedData);
        }  
      }
    } catch (err) {
      reject(err);
    }
  });
}

function getCommissionDetails(query:any, headers:any):Promise<any>{
    return new Promise(async (resolve, reject) => {
      try{
        const { equipmentId, vehicleId } = query     
          if(equipmentId){
            const data = await equipmentModel.findOne({_id:equipmentId, isDelete:false},{equipmentCommission:1})
            resolve(data)
          }
          if(vehicleId){
            const data = await delivery_vehicleModel.findOne({_id:vehicleId, isDelete:false},{vehicleCommission:1})
            resolve(data)
         }
      }catch(err){
        reject(err)
      }
    })
}

function commissionList(query:any, headers:any){
  return new Promise(async (resolve, reject) => {
    try{
      const page = parseInt(query?.page) || 1;
      const perPage = parseInt(query?.perPage) || 10;
      const skip = (page - 1) * perPage;
      const [equipment, vehicle] = await Promise.all([
        await equipmentModel.find(
          {
            isDelete: false,               
            equipmentCommission: { $exists: true } 
          },
          {
            _id: 1,                         
            equipmentCommission: 1         
          }
        )
        .skip(skip) 
        .limit(perPage)
        .sort({equipmentCommission:1}),
        await delivery_vehicleModel.find(
          {
            isDelete: false,                 
            vehicleCommission: { $exists: true } 
          },
          {
            _id: 1,                          
            vehicleCommission: 1              
          }
        )
        .skip(skip) 
        .limit(perPage)
        .sort({vehicleCommission:1}),
        ])
        resolve({equipment, vehicle})
    }catch(err){
      reject(err)
    }
  })
}


export default {
  registerAdmin,
  loginAdmin,
  changeAdminPassword,
  forgotPassAdmin,
  logoutAdmin,
  updateTax,
  taxDetails,
  addEditCommission,
  getCommissionDetails,
  commissionList
} as const;
