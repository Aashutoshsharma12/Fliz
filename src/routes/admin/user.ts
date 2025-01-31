import { Router } from "express";
import userAdminController from "@controllers/admin/user";
import { StatusCodes } from "http-status-codes";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
import { roleValidator, statusValidator, updateUserValidator, userDetailsValidator, userRenterDelivery_schema, verifyUserValidator } from "@validators/adminValidator";
const adminUserRouter = Router();

const p = {
  listUsers: "/list",
  updateStatus: "/updateStatus/:id",
  deleteUser: "/delete/:id",
  userDetailsById: "/list/:id",
  editUser: "/edit/:id",
  verify: "/verify/:id",
  preview: "/preview/:id",
  userRenterDelivery: "/userRenterDelivery",
  excelData: "/excelData" 
};

const { OK } = StatusCodes;
adminUserRouter.get(
  p.listUsers,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator_forQueryReq(roleValidator),
  async (req, res) => {
    const data = await userAdminController.listUsers(req.query, req.headers);
    res.status(OK).json({ code: OK, data });
  }
);

adminUserRouter.get(
  p.userDetailsById,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator_forQueryReq(userDetailsValidator),
  async (req, res) => {
    const data = await userAdminController.userDetailsAtParticularId(
      req?.params,
      req?.query,
      req?.headers
    );
    res.status(OK).json({ code: OK, data });
  }
);

adminUserRouter.get(p.preview, verifyAuthToken, checkRole(["admin"]), async (req, res) => {
  const data = await userAdminController.previewUserOrder(req?.params, req?.query, req?.headers)
  res.status(OK).json({ code: OK, data });
})

adminUserRouter.patch(
  p.updateStatus,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator_forQueryReq(statusValidator),
  async (req, res) => {
    const data = await userAdminController.UpdateStatusofParticularUser(
      req?.params,
      req?.query,
      req?.headers
    );
    res.status(OK).json({ code: OK, data });
  }
);

adminUserRouter.patch(
  p.deleteUser,
  verifyAuthToken,
  checkRole(["admin"]),
  async (req, res) => {
    const data = await userAdminController.deleteUser(
      req?.params,
      req?.headers
    );
    res.status(OK).json({ code: OK, data });
  }
);

adminUserRouter.patch(
  p.editUser,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator(updateUserValidator),
  async (req, res) => {
    const data = await userAdminController.updateUserDetails(
      req?.body,
      req?.params,
      req?.headers
    );
    res.status(OK).json({ code: OK, data });
  }
);
adminUserRouter.patch(p.verify, verifyAuthToken, checkRole(["admin"]), schemaValidator_forQueryReq(verifyUserValidator), async (req, res) => {
  const data = await userAdminController.verifyUser(req?.params, req?.query, req?.headers);
  res.status(OK).json({ status: OK, data });
})

adminUserRouter.get(
  p.userRenterDelivery, 
  verifyAuthToken, 
  checkRole(["admin"]), 
  // schemaValidator_forQueryReq(userRenterDelivery_schema), 
  async (req, res) => {
    const data = await userAdminController.orderDetails_renter_delivery(req?.query, req?.headers);
    res.status(OK).json({ status: OK, data });
  }
);

adminUserRouter.get(p.excelData,
  verifyAuthToken,
  checkRole(["admin"]),
  async(req, res) =>{
    const data = await userAdminController.excelUser_Renter_Delivery(req?.query, req?.headers)
    res.status(OK).json({status:OK, data});
  }
)

export default adminUserRouter;
