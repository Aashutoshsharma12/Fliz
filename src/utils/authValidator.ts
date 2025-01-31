const jwt = require("jsonwebtoken");
import StatusCodes from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { messages } from "@Custom_message";
import user_renter_delivery_Model from "@models/user";
import userSessionModel from "@models/userSession";
import adminModal from "@models/auth";
import guestUserModal from "@models/guest_user";

const verifyAuthToken = async (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  const language = req.headers.language ? req.headers.language : "en";
  var message = messages(language);
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: message.noToken,
      message: message.noToken,
      code: StatusCodes.UNAUTHORIZED,
    });
  }
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    if (verified.role == "admin") {
      // const findAdmin = await adminModal.findOne({ token: token });
      // if (findAdmin) {
      //   req.user = verified;
      //   next();
      //   return;
      // } else {
      //   return res.status(StatusCodes.UNAUTHORIZED).json({
      //     error: message.invalidToken,
      //     message: message.invalidToken,
      //     code: StatusCodes.UNAUTHORIZED,
      //   });
      // }
      req.user = verified;
      next();
      return;
    }
    if (verified.role == "guest_user") {
      const checkGuest_user = await guestUserModal.findOne({ _id: verified.id });
      if (checkGuest_user) {
        const checkSession = await userSessionModel.findOne({
          userId: verified.id,
          guestToken: token,
          role: verified.role,
          isDelete: false,
        });
        if (checkSession) {
          req.user = verified;
          next();
          return;
        } else {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            error: message.invalidToken,
            message: message.invalidToken,
            code: StatusCodes.UNAUTHORIZED,
          });
        }
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: message.invalidToken,
          message: message.invalidToken,
          code: StatusCodes.UNAUTHORIZED,
        });
      }
    }
    if (["user", "renter_user", "delivery_user"].includes(verified.role)) {
      const check = await user_renter_delivery_Model.findOne(
        { _id: verified.id, isDelete: false, role: verified.role },
        { isDelete: 1, isActive: 1 }
      );
      if (check) {
        if (check?.isActive) {
          const checkSession = await userSessionModel.findOne({
            userId: verified.id,
            accessToken: token,
            role: verified.role,
            isDelete: false,
          });
          if (checkSession) {
            req.user = verified;
            next();
            return;
          } else {
            return res.status(StatusCodes.UNAUTHORIZED).json({
              error: message.invalidToken,
              message: message.invalidToken,
              code: StatusCodes.UNAUTHORIZED,
            });
          }
        } else {
          return res.status(StatusCodes.FORBIDDEN).json({
            error: message.accountBlocked,
            message: message.accountBlocked,
            code: StatusCodes.FORBIDDEN, //403
          });
        }
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: message.invalidToken,
          message: message.invalidToken,
          code: StatusCodes.UNAUTHORIZED, //401
        });
      }
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: message.invalidToken,
        message: message.invalidToken,
        code: StatusCodes.UNAUTHORIZED,
      });
    }
  } catch (err) {
    if (err.message == "jwt expired") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: message.sessionExpired,
        message: message.sessionExpired,
        code: StatusCodes.UNAUTHORIZED,
      });
    }
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: message.invalidToken,
      message: message.invalidToken,
      code: StatusCodes.UNAUTHORIZED,
    });
  }
};

const verify_guestAuthToken = async (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  const language = req.headers.language ? req.headers.language : "en";
  var message = messages(language);
  if (!token) {
    return res.status(451).json({
      error: message.noToken,
      message: message.noToken,
      code: 451,
    });
  }
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    if (verified.role == "guest_user") {
      const checkGuest_user = await guestUserModal.findOne({ _id: verified.id });
      if (checkGuest_user) {
        const checkSession = await userSessionModel.findOne({
          userId: verified.id,
          guestToken: token,
          role: verified.role,
          isDelete: false,
        });
        if (checkSession) {
          req.user = verified;
          next();
          return;
        } else {
          return res.status(451).json({
            error: message.invalidToken,
            message: message.invalidToken,
            code: 451,
          });
        }
      } else {
        return res.status(451).json({
          error: message.invalidToken,
          message: message.invalidToken,
          code: 451,
        });
      }
    } else {
      return res.status(451).json({
        error: message.invalidToken,
        message: message.invalidToken,
        code: 451,
      });
    }
  } catch (err) {
    if (err.message == "jwt expired") {
      return res.status(451).json({
        error: message.sessionExpired,
        message: message.sessionExpired,
        code: 451,
      });
    }
    return res.status(451).json({
      error: message.invalidToken,
      message: message.invalidToken,
      code: 451,
    });
  }
};


const checkRole = (roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    const language = req.headers.language ? req.headers.language : "en";
    var message = messages(language);
    if (roles.includes(req.user.role)) {
      next();
    }
    else {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: message.unAuthRole,
        message: message.unAuthRole,
        code: StatusCodes.FORBIDDEN, //403
      });
    }
  };
};

export { verifyAuthToken, checkRole,verify_guestAuthToken };
