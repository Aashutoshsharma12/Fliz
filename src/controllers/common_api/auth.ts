import { messages } from "@Custom_message";
import guestUserModal from "@models/guest_user";
import user_renter_delivery_Model from "@models/user";
import userSessionModel from "@models/userSession";
import { CustomError } from "@utils/errors";
import {
  generate_accessToken,
  generate_refreshToken,
  identityGenerator,
  sendOtp_using_unifonic,
  verify_unifonicOtp,
} from "@utils/helpers";
import { subscribeToTopic, unsubscribeFromTopic } from "@utils/notification";
const jwt = require("jsonwebtoken");
import argon2 from "argon2";
import { StatusCodes } from "http-status-codes";

const add_guestUser_activity_toAuth_user = async (body: any) => {
  try {
    const { guestToken, userId } = body;
    const verify = jwt.verify(guestToken, process.env.JWT_SECRET_TOKEN);
    let res: any = {};
    if (verify.id) {
      const check_userDetails = await guestUserModal.findById(verify.id);
      if (check_userDetails) {
        res = {
          ...res,
          equipmentId: check_userDetails.equipmentId,
          vehicleId: check_userDetails.vehicleId
        }
        return res;
      } else {
        return res
      }
    }
  } catch (err) {
    console.log(err);
    return {}
  }
}

function addUser_renter_delivery(body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        timezone,
        devicetype,
        devicetoken,
        language = "en",
        currentversion,
        deviceip,
        guesttoken
      } = headers;
      var message: any = messages(language);
      const count = await user_renter_delivery_Model.countDocuments({
        role: body.role,
      });
      const obj = {
        ...body,
        uniqueId: identityGenerator(body.role, count),
        password: await argon2.hash(
          body.password + "" + process.env.Password_Secret_Key
        ),
        company_description: body.company_description,
        ar_company_description: body.company_description
      };
      const createUser: any = await user_renter_delivery_Model.create(obj);
      const roles = ['renter_user', 'delivery_user']
      if (roles.includes(body.role)) {
        const update_password = {
          phoneNumber: body.phoneNumber,
          countryCode: body.countryCode,
          password: obj.password
        }
        await update_samePassword_forBoth(update_password)
      }

      const session_Object = {
        userId: createUser._id,
        timezone: timezone ? timezone : "Asia/Calcutta",
        deviceType: devicetype ? devicetype : "ios",
        deviceToken: devicetoken ? devicetoken : "",
        deviceIp: deviceip ? deviceip : "",
        language: language ? language : "en",
        currentVersion: currentversion ? currentversion : "",
        role: createUser.role,
        refreshToken: generate_refreshToken(createUser._id, createUser.role),
        accessToken: generate_accessToken(createUser._id, createUser.role),
      };
      await userSessionModel.create(session_Object);
      createUser.password = undefined;
      const responseObj = createUser.toObject();
      responseObj.refreshToken = session_Object.refreshToken;
      responseObj.accessToken = session_Object.accessToken;
      if (body.role === 'user' && guesttoken && guesttoken != '') {
        responseObj.guestUser = await add_guestUser_activity_toAuth_user({ guestToken: guesttoken, userId: createUser._id })
      } else {
        responseObj.guestUser = {}
      }
      if (devicetoken) {
        const topic = body.role == 'user' ? 'All_users' : body.role == 'renter_user' ? "All_rentel_users" : "All_delivery_users"
        subscribeToTopic(devicetoken, ['All', topic])
      }
      resolve(responseObj);
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

function login(body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        timezone = 'Asia/Calcutta',
        devicetype,
        devicetoken,
        language = "en",
        currentversion,
        deviceip,
        guesttoken
      } = headers;
      var message: any = messages(language);
      const { role, phoneNumber, countryCode, password } = body;
      const obj_forDelivery: any = {
        timezone: timezone ? timezone : 'Asia/Calcutta',
        devicetype: devicetype ? devicetype : "ios",
        devicetoken: devicetoken ? devicetoken : '',
        language: language ? language : "en",
        currentversion: currentversion ? currentversion : "1.0.1",
        deviceip: deviceip ? deviceip : '',
        phoneNumber: phoneNumber,
        countryCode: countryCode,
        password: password
      }
      if (role == 'user') {
        const checkUser: any = await user_renter_delivery_Model.findOne({
          role: role,
          phoneNumber: phoneNumber,
          countryCode: countryCode,
          isDelete: false,
        });
        if (checkUser) {
          if (checkUser?.isActive) {
            if (
              await argon2.verify(
                checkUser.password,
                password + "" + process.env.Password_Secret_Key
              )
            ) {
              const session_Object = {
                userId: checkUser._id,
                timezone: timezone ? timezone : "Asia/Calcutta",
                deviceType: devicetype ? devicetype : "ios",
                deviceToken: devicetoken ? devicetoken : "",
                deviceIp: deviceip ? deviceip : "",
                language: language ? language : "en",
                currentVersion: currentversion ? currentversion : "1.0.1",
                role: checkUser.role,
                refreshToken: generate_refreshToken(
                  checkUser._id,
                  checkUser.role
                ),
                accessToken: generate_accessToken(checkUser._id, checkUser.role),
              };
              await user_renter_delivery_Model.updateOne({ _id: checkUser._id }, { online: true })
              await userSessionModel.create(session_Object);
              const responseObj = checkUser.toObject();
              responseObj.password = undefined;
              responseObj.refreshToken = session_Object.refreshToken;
              responseObj.accessToken = session_Object.accessToken;
              if (guesttoken && guesttoken != '') {
                responseObj.guestUser = await add_guestUser_activity_toAuth_user({ guestToken: guesttoken, userId: checkUser._id })
              } else {
                responseObj.guestUser = {}
              }
              if (devicetoken) {
                subscribeToTopic(devicetoken, ['All', 'All_users'])
              }
              resolve(responseObj);
            } else {
              reject(
                new CustomError(message.WrongPassword, StatusCodes.BAD_REQUEST)
              );
            }
          } else {
            reject(
              new CustomError(message.accountBlocked, StatusCodes.BAD_REQUEST)
            );
          }
        } else {
          reject(new CustomError(message.noAccountMatch, StatusCodes.NOT_FOUND));
        }
      } else {
        const checkUser: any = await user_renter_delivery_Model.findOne({
          role: 'renter_user',
          phoneNumber: phoneNumber,
          countryCode: countryCode,
          isDelete: false,
        });
        if (checkUser) {
          if (checkUser?.isActive) {
            if (await argon2.verify(
              checkUser.password,
              password + "" + process.env.Password_Secret_Key
            )
            ) {
              const session_Object = {
                userId: checkUser._id,
                timezone: timezone ? timezone : "Asia/Calcutta",
                deviceType: devicetype ? devicetype : "ios",
                deviceToken: devicetoken ? devicetoken : "",
                deviceIp: deviceip ? deviceip : "",
                language: language ? language : "en",
                currentVersion: currentversion ? currentversion : "1.0.1",
                role: checkUser.role,
                refreshToken: generate_refreshToken(
                  checkUser._id,
                  checkUser.role
                ),
                accessToken: generate_accessToken(checkUser._id, checkUser.role),
              };
              await user_renter_delivery_Model.updateOne({ _id: checkUser._id }, { online: true })
              await userSessionModel.create(session_Object);
              const responseObj = checkUser.toObject();
              responseObj.password = undefined;
              responseObj.refreshToken = session_Object.refreshToken;
              responseObj.accessToken = session_Object.accessToken;
              if (devicetoken) {
                subscribeToTopic(devicetoken, ['All', 'All_rentel_users'])
              }
              resolve(responseObj);
            } else {
              reject(
                new CustomError(message.WrongPassword, StatusCodes.BAD_REQUEST)
              );
            }
          } else {
            obj_forDelivery.found = true
            const response = await delivery_userLogin(obj_forDelivery)
            resolve(response)
          }
        } else {
          const response = await delivery_userLogin(obj_forDelivery)
          resolve(response)
        }
      }
    } catch (err) {
      reject(err);
    }
  });
}

const delivery_userLogin = async (body: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      var message: any = messages(body.language);
      const checkUser: any = await user_renter_delivery_Model.findOne({
        role: 'delivery_user',
        phoneNumber: body.phoneNumber,
        countryCode: body.countryCode,
        isDelete: false,
      });
      if (checkUser) {
        if (checkUser?.isActive) {
          if (await argon2.verify(
            checkUser.password,
            body.password + "" + process.env.Password_Secret_Key
          )
          ) {
            const session_Object = {
              userId: checkUser._id,
              timezone: body.timezone ? body.timezone : "Asia/Calcutta",
              deviceType: body.devicetype ? body.devicetype : "ios",
              deviceToken: body.devicetoken ? body.devicetoken : "",
              deviceIp: body.deviceip ? body.deviceip : "",
              language: body.language ? body.language : "en",
              currentVersion: body.currentversion ? body.currentversion : "",
              role: checkUser.role,
              refreshToken: generate_refreshToken(
                checkUser._id,
                checkUser.role
              ),
              accessToken: generate_accessToken(checkUser._id, checkUser.role),
            };
            await user_renter_delivery_Model.updateOne({ _id: checkUser._id }, { online: true })
            await userSessionModel.create(session_Object);
            const responseObj = checkUser.toObject();
            responseObj.password = undefined;
            responseObj.refreshToken = session_Object.refreshToken;
            responseObj.accessToken = session_Object.accessToken;
            if (body.devicetoken) {
              subscribeToTopic(body.devicetoken, ['All', 'All_delivery_users'])
            }
            resolve(responseObj);
          } else {
            reject(
              new CustomError(message.WrongPassword, StatusCodes.BAD_REQUEST)
            );
          }
        } else {
          reject(
            new CustomError(message.accountBlocked, StatusCodes.BAD_REQUEST)
          );
        }
      } else {
        if (body.found && body.found === true) {
          reject(
            new CustomError(message.accountBlocked, StatusCodes.BAD_REQUEST)
          );
        }
        reject(new CustomError(message.noAccountMatch, StatusCodes.NOT_FOUND));
      }
    } catch (err) {
      reject(err)
    }
  });
}

/**
 * Check Account
 * @param query 
 * @param headers 
 * @returns 
 */
function details_Info(query: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { language = 'en' } = headers;
      var message = messages(language);
      const { role, phoneNumber, countryCode } = query;
      let obj: any = {
        phoneNumber: phoneNumber,
        countryCode: "+" + countryCode,
        isDelete: false,
      }
      if (role && role == 'user') {
        obj.role = 'user'
      } else {
        obj.role = { $ne: 'user' }
      }
      const details_Info = await user_renter_delivery_Model.findOne(
        obj,
        { countryCode: 1, phoneNumber: 1, role: 1 }
      );
      if (details_Info) {
        resolve(details_Info);
      } else {
        reject(new CustomError(message.noAccountMatch, StatusCodes.NOT_FOUND));
      }
    } catch (err) {
      reject(err);
    }
  });
}

function user_company_details_Info(userId: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { language = 'en' } = headers;
      var message = messages(language);
      const details_Info = await user_renter_delivery_Model.findOne({ _id: userId }, { password: 0 }
      );
      if (details_Info) {
        resolve(details_Info);
      } else {
        reject(new CustomError(message.noDatafound, StatusCodes.NOT_FOUND));
      }
    } catch (err) {
      reject(err);
    }
  });
}

/***
 * Password will be same for same phone number register (Renter, Delivery)
 */
function update_samePassword_forBoth(body: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { password, phoneNumber, countryCode } = body;
      console.log(body, "lddkd")
      await user_renter_delivery_Model.updateMany(
        {
          phoneNumber: phoneNumber,
          countryCode: countryCode,
          isDelete: false
        },
        { password: password }
      );
      resolve({ success: true });
    } catch (err) {
      reject(err);
    }
  });
}

// function forgotPassword(body: any, headers: any): Promise<any> {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const { language } = headers;
//       const { newPassword, userId, confirmPassword } = body;
//       var message = messages(language);
//       const checkUser = await user_renter_delivery_Model.findOne({
//         _id: userId,
//         isDelete: false,
//       });
//       if (checkUser) {
//         if (newPassword == confirmPassword) {
//           const hash_password =
//             newPassword + "" + process.env.Password_Secret_Key;
//           const password = await argon2.hash(hash_password);
//           await user_renter_delivery_Model.updateOne(
//             { _id: userId, isDelete: false },
//             { password: password }
//           );
//           resolve({ success: true });
//         } else {
//           reject(
//             new CustomError(
//               message.bothNewAndConfirmSame,
//               StatusCodes.BAD_REQUEST
//             )
//           );
//         }
//       } else {
//         reject(new CustomError(message.noDatafound, StatusCodes.NOT_FOUND));
//       }
//     } catch (err) {
//       reject(err);
//     }
//   });
// }

function forgotPassword(body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { language = 'en' } = headers;
      const { newPassword, phoneNumber, role = 'renter/delivery', countryCode, confirmPassword } = body;
      var message = messages(language);
      if (role == 'user') {
        const checkUser1 = await user_renter_delivery_Model.findOne({
          role: 'user',
          phoneNumber: phoneNumber,
          countryCode: countryCode,
          isDelete: false
        });
        if (checkUser1) {
          if (newPassword == confirmPassword) {
            const hash_password =
              newPassword + "" + process.env.Password_Secret_Key;
            const password = await argon2.hash(hash_password);
            await user_renter_delivery_Model.updateOne(
              {
                role: 'user',
                phoneNumber: phoneNumber,
                countryCode: countryCode,
                isDelete: false
              },
              { password: password }
            );
            resolve({ success: true });
          } else {
            reject(
              new CustomError(
                message.bothNewAndConfirmSame,
                StatusCodes.BAD_REQUEST
              )
            );
          }
        } else {
          reject(new CustomError(message.noDatafound, StatusCodes.NOT_FOUND));
        }
      } else {
        const checkUser = await user_renter_delivery_Model.find({
          role: { $ne: 'user' },
          phoneNumber: phoneNumber,
          countryCode: countryCode,
          isDelete: false
        });
        if (checkUser.length) {
          if (newPassword == confirmPassword) {
            const hash_password =
              newPassword + "" + process.env.Password_Secret_Key;
            const password = await argon2.hash(hash_password);
            await user_renter_delivery_Model.updateMany(
              {
                role: { $ne: 'user' },
                phoneNumber: phoneNumber,
                countryCode: countryCode,
                isDelete: false
              },
              { password: password }
            );
            resolve({ success: true });
          } else {
            reject(
              new CustomError(
                message.bothNewAndConfirmSame,
                StatusCodes.BAD_REQUEST
              )
            );
          }
        } else {
          reject(new CustomError(message.noDatafound, StatusCodes.NOT_FOUND));
        }
      }

    } catch (err) {
      reject(err);
    }
  });
}

const update_onlineStatus = async (authorization: any) => {
  try {
    const deleteSession: any = await userSessionModel.deleteMany({
      refreshToken: authorization,
    });
    if (deleteSession.deletedCount != 0) {
      const checkUserDetails = await userSessionModel.findOne({
        refreshToken: authorization,
      });
      if (checkUserDetails) {
        const checkUser_loginDevice = await userSessionModel.find({ userId: checkUserDetails.userId, isDelete: false });
        if (checkUser_loginDevice.length == 0) {
          await user_renter_delivery_Model.updateOne({ _id: checkUserDetails.userId }, { online: false })
        }
        await userSessionModel.deleteMany({
          refreshToken: authorization,
        });
      }
    }
  } catch (err) {
    console.log(err)
  }
}

function re_generateAccessToken(headers: any, res: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language = 'en', authorization } = headers;
    try {
      // const { language = 'en', authorization } = headers;
      var message: any = messages(language);
      // res.clearCookie("accessToken");
      const verified = jwt.verify(authorization, process.env.JWT_SECRET_TOKEN);
      const check = await user_renter_delivery_Model.findOne(
        { _id: verified.id, isDelete: false, role: verified.role },
        { isDelete: 1, isActive: 1 }
      );
      if (check) {
        if (check?.isActive) {
          const checkSession = await userSessionModel.findOne({
            userId: verified.id,
            refreshToken: authorization,
            role: verified.role,
            isDelete: false,
          });
          if (checkSession) {
            const newAccessToken = await generate_accessToken(
              verified.id,
              verified.role
            );
            const update = await userSessionModel.updateOne({
              userId: verified.id,
              refreshToken: authorization,
              role: verified.role,
              isDelete: false,
            }, {
              accessToken: newAccessToken
            });
            if (update && update.modifiedCount == 1) {
              res.status(StatusCodes.OK).send({
                accessToken: newAccessToken,
                message: "Access Tokens regenerated",
                code: StatusCodes.OK,
              });
            } else {
              update_onlineStatus(authorization);
              return res.status(410).json({
                error: message.invalidToken,
                message: message.invalidToken,
                code: 410,
              });
            }
            // res.cookie("accessToken", newAccessToken);
            // Optionally, send a response indicating success

            // resolve();
          } else {
            update_onlineStatus(authorization);
            return res.status(410).json({
              error: message.invalidToken,
              message: message.invalidToken,
              code: 410,
            });
          }
        } else {
          update_onlineStatus(authorization);
          return res.status(410).json({
            error: message.accountBlocked,
            message: message.accountBlocked,
            code: 410,
          });
        }
      } else {
        update_onlineStatus(authorization);
        return res.status(410).json({
          error: message.invalidToken,
          message: message.invalidToken,
          code: 410,
        });
      }
    } catch (err) {
      update_onlineStatus(authorization);
      // reject(err);
      if (err.message == "jwt expired") {
        return res.status(410).json({
          error: message.sessionExpired,
          message: message.sessionExpired,
          code: 410,
        });
      }
      return res.status(410).json({
        error: message.invalidToken,
        message: message.invalidToken,
        code: 410,
      });
    }
  });
}

function logout(headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { authorization, language = 'en', devicetoken } = headers;
      const message = messages(language);
      const checkUserDetails = await userSessionModel.findOne({
        refreshToken: authorization,
      });
      if (checkUserDetails) {
        const deleteSession: any = await userSessionModel.deleteMany({
          refreshToken: authorization,
        });
        if (deleteSession.deletedCount != 0) {
          const checkUser_loginDevice = await userSessionModel.find({ userId: checkUserDetails.userId, isDelete: false });
          if (checkUser_loginDevice.length == 0) {
            await user_renter_delivery_Model.updateOne({ _id: checkUserDetails.userId }, { online: false })
          }
          if (devicetoken) {
            const topic = checkUserDetails.role == 'user' ? 'All_users' : checkUserDetails.role == 'renter_user' ? "All_rentel_users" : "All_delivery_users"
            unsubscribeFromTopic(devicetoken, ['All', topic])
          }
          resolve({ success: true });
        } else {
          reject(new CustomError(message.invalidToken, 410));
        }
      }
    } catch (err) {
      reject(err);
    }
  });
}

// function changePassword(body: any, userId: any, headers: any): Promise<any> {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const { language } = headers;
//       const message = messages(language);
//       const { newPassword, confirmPassword, oldPassword, role } = body;
//       const checkDetails = await user_renter_delivery_Model.findOne(
//         { _id: userId, role: role, isDelete: false },
//         { password: 1 }
//       );
//       if (checkDetails) {
//         if (
//           await argon2.verify(
//             checkDetails.password,
//             oldPassword + "" + process.env.Password_Secret_Key
//           )
//         ) {
//           if (newPassword == confirmPassword) {
//             const b_pass = await argon2.hash(
//               newPassword + "" + process.env.Password_Secret_Key
//             );
//             await user_renter_delivery_Model.updateOne(
//               { _id: userId, isDelete: false },
//               { password: b_pass }
//             );
//             resolve({ success: true });
//           } else {
//             reject(
//               new CustomError(
//                 message.bothNewAndConfirmSame,
//                 StatusCodes.BAD_REQUEST
//               )
//             );
//           }
//         } else {
//           reject(
//             new CustomError(message.incorrectOldPass, StatusCodes.BAD_REQUEST)
//           );
//         }
//       } else {
//         reject(new CustomError(message.noDatafound, StatusCodes.NOT_FOUND));
//       }
//     } catch (err) {
//       reject(err);
//     }
//   });
// }

function changePassword(body: any, userId: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { language = 'en' } = headers;
      const message = messages(language);
      const { newPassword, confirmPassword, oldPassword, role } = body;
      const checkDetails = await user_renter_delivery_Model.findOne(
        { _id: userId, role: role, isDelete: false },
        { password: 1, phoneNumber: 1, countryCode: 1 }
      );
      if (checkDetails) {
        if (
          await argon2.verify(
            checkDetails.password,
            oldPassword + "" + process.env.Password_Secret_Key
          )
        ) {
          if (newPassword == confirmPassword) {
            const b_pass = await argon2.hash(
              newPassword + "" + process.env.Password_Secret_Key
            );
            if (role == 'user') {
              await user_renter_delivery_Model.updateOne(
                { _id: userId, role: role, isDelete: false },
                { password: b_pass }
              );
              resolve({ success: true });
            } else {
              await user_renter_delivery_Model.updateMany(
                { phoneNumber: checkDetails.phoneNumber, role: { $ne: 'user' }, countryCode: checkDetails.countryCode, isDelete: false },
                { password: b_pass }
              );
              resolve({ success: true });
            }

          } else {
            reject(
              new CustomError(
                message.bothNewAndConfirmSame,
                StatusCodes.BAD_REQUEST
              )
            );
          }
        } else {
          reject(
            new CustomError(message.incorrectOldPass, StatusCodes.BAD_REQUEST)
          );
        }
      } else {
        reject(new CustomError(message.noDatafound, StatusCodes.NOT_FOUND));
      }
    } catch (err) {
      reject(err);
    }
  });
}

function deleteUser(userId: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { language = 'en' } = headers;
      const message = messages(language);
      const checkUser = await user_renter_delivery_Model.findOne({
        _id: userId,
        isDelete: false,
      });
      if (checkUser) {
        await user_renter_delivery_Model.updateOne(
          { _id: userId, isDelete: false },
          { isDelete: true }
        );
        await userSessionModel.deleteMany({ userId: userId, isDelete: false });
        resolve({ success: true });
      } else {
        reject(new CustomError(message.noDatafound, StatusCodes.NOT_FOUND));
      }
    } catch (err) {
      reject(err);
    }
  });
}

function updateNotification(
  query: any,
  userId: any,
  headers: any
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { isNotification } = query;
      const data = await user_renter_delivery_Model.updateOne(
        { _id: userId, isDelete: false },
        { isNotification: isNotification }
      );
      resolve(data);
    } catch (err) {
      reject(err);
    }
  });
}

function switch_account(userId: any, role: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { language = 'en', timezone = 'Asia/Calcutta', devicetype, devicetoken, deviceip, currentversion } = headers;
      const message = messages(language);
      const checkUserId = await user_renter_delivery_Model.findOne({ _id: userId, isDelete: false, isActive: true });
      if (checkUserId) {
        const countryCode = checkUserId.countryCode
        const phoneNumber = checkUserId.phoneNumber
        // const role = checkUserId.role
        const checkAccount_with_same_phoneNumber = await user_renter_delivery_Model.findOne({ countryCode: countryCode, phoneNumber: phoneNumber, isDelete: false, role: role }, { password: 0 });
        if (checkAccount_with_same_phoneNumber) {
          if (checkAccount_with_same_phoneNumber.isActive == true) {
            const session_Object = {
              userId: checkAccount_with_same_phoneNumber._id,
              timezone: timezone ? timezone : "Asia/Calcutta",
              deviceType: devicetype ? devicetype : "ios",
              deviceToken: devicetoken ? devicetoken : "",
              deviceIp: deviceip ? deviceip : "",
              language: language ? language : "en",
              currentVersion: currentversion ? currentversion : "",
              role: checkAccount_with_same_phoneNumber.role,
              refreshToken: generate_refreshToken(
                checkAccount_with_same_phoneNumber._id,
                checkAccount_with_same_phoneNumber.role
              ),
              accessToken: generate_accessToken(checkAccount_with_same_phoneNumber._id, checkAccount_with_same_phoneNumber.role),
            };
            await userSessionModel.create(session_Object);
            const responseObj: any = checkAccount_with_same_phoneNumber.toObject();
            responseObj.refreshToken = session_Object.refreshToken;
            responseObj.accessToken = session_Object.accessToken;
            resolve(responseObj);
          } else {
            reject(new CustomError(message.accountBlocked, StatusCodes.FORBIDDEN));
          }
        } else {
          reject(new CustomError(message.noAccountMatch, StatusCodes.BAD_REQUEST));
        }
      } else {
        reject(new CustomError(message.noDatafound, StatusCodes.NOT_FOUND));
      }
    } catch (err) {
      reject(err);
    }
  });
}

function sendOtp(body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { countryCode, phoneNumber } = body;
      const phoneNumber_with_counrtyCode = countryCode + "" + phoneNumber;
      const sendOtp_toUser = await sendOtp_using_unifonic(phoneNumber_with_counrtyCode);
      resolve(sendOtp_toUser);
    } catch (err) {
      reject(err);
    }
  });
}

function verifyOtp(body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { language = 'en' } = headers;
      const { otp, token } = body;
      const verify_unifonicOtp1 = await verify_unifonicOtp(otp, token, language);
      resolve(verify_unifonicOtp1);
    } catch (err) {
      reject(err);
    }
  });
}

export default {
  addUser_renter_delivery,
  login,
  details_Info,
  user_company_details_Info,
  forgotPassword,
  re_generateAccessToken,
  logout,
  changePassword,
  deleteUser,
  updateNotification,
  switch_account,
  sendOtp,
  verifyOtp
} as const;
