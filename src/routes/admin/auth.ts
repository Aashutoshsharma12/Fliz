import { Router } from "express";
import adminController from "@controllers/admin/auth";
import { StatusCodes } from "http-status-codes";
import { verifyAuthToken, checkRole } from "@utils/authValidator";
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
import {
  adminSignup,
  adminLogin,
  changeAdminPassValidation,
  forgotPassValidation,
  taxSchema,
  commissionSchema,
} from "@validators/adminValidator";
import { read } from "fs-extra";
import DailyRotateFile from "winston-daily-rotate-file";

const route = Router();
const { OK, CREATED } = StatusCodes;

const p = {
  add: "/addAdmin",
  login: "/login",
  changePass: "/changeAdminPass",
  forgotPass: "/forgotAdminPass",
  logout: "/logout",
  updateTax: '/updateTax',
  taxDetails: '/taxDetails',
  commission:'/commission_addEdit',
  commissiondata:"/commissiondata",
  commissionList:"/commissionList",
 
};

route.post(p.add, schemaValidator(adminSignup), async (req, res: any) => {
  const data = await adminController.registerAdmin(req.body, req.headers);
  res.status(CREATED).json({ data, code: CREATED });
});
route.post(p.login, schemaValidator(adminLogin), async (req, res: any) => {
  const data = await adminController.loginAdmin(req.body, req.headers);
  res.status(OK).json({ code: OK, data });
});

route.patch(
  p.changePass,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator(changeAdminPassValidation),
  async (req, res: any) => {
    const data = await adminController.changeAdminPassword(
      req.body,
      req.params,
      req.headers
    );
    res.status(OK).json({ data, code: OK });
  }
);

route.patch(
  p.forgotPass,
  schemaValidator(forgotPassValidation),
  async (req, res: any) => {
    const data = await adminController.forgotPassAdmin(req.body, req.header);
    res.status(OK).json({ data, code: OK });
  }
);

route.get(
  p.logout,
  verifyAuthToken,
  checkRole(["admin"]),
  async (req: any, res: any) => {
    const data = await adminController.logoutAdmin(req.user.id, req.header);
    res.status(OK).json({ data, code: OK });
  }
);

route.patch(p.updateTax, verifyAuthToken, checkRole(['admin']), schemaValidator(taxSchema), async (req, res: any) => {
  const data = await adminController.updateTax(req.body, req.headers);
  res.status(CREATED).json({ code: CREATED, data });
});

route.get(p.taxDetails, verifyAuthToken, checkRole(['admin']), async (req, res: any) => {
  const data = await adminController.taxDetails(req.headers);
  res.status(OK).json({ code: OK, data });
});

route.patch(p.commission, schemaValidator(commissionSchema), async(req, res) =>{
  const data = await adminController.addEditCommission(req.body, req.headers);
  res.status(OK).json({code:OK, data});
})

route.get(p.commissiondata, async(req, res) =>{
  const data = await adminController.getCommissionDetails(req.query, req.headers);
  res.status(OK).json({code:OK, data})
} )

route.get(p.commissionList, async(req, res) =>{
  const data = await adminController.commissionList(req.query, req.headers);
  res.status(OK).json({code:OK, data})
} )


export default route;
