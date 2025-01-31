import { Router } from "express";
import engine_compayController from "@controllers/admin/engine_company";
import { StatusCodes } from "http-status-codes";
import {
  schemaValidator,
  schemaValidator_forQueryReq,
} from "@utils/schemaValidator";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { messages } from "@Custom_message";
import {
  addEngine_companySchema,
  getEngine_companySchema,
  updateStatusEngine_companySchema,
} from "@validators/adminValidator";
const route = Router();
const { OK, CREATED } = StatusCodes;
export const p = {
  add: "/add",
  edit: "/edit/:id",
  details: "/list/:id",
  list: "/list",
  updateStatus: "/updateStatus/:id",
  deletEngine_company: "/delete/:id",
};

route.post(
  p.add,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator(addEngine_companySchema),
  async (req, res: any) => {
    const data = await engine_compayController.addEngine_comapny(
      req.body,
      req.headers
    );
    res.status(CREATED).json({ code: CREATED, data });
  }
);

route.patch(
  p.edit,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator(addEngine_companySchema),
  async (req, res: any) => {
    const data = await engine_compayController.editEngine_comapny(
      req?.params,
      req.body,
      req.headers
    );
    res.status(OK).json({ data, code: OK });
  }
);

route.get(
  p.details,
  verifyAuthToken,
  checkRole(["admin"]),
  async (req, res: any) => {
    const data = await engine_compayController.detailsEngine_comapny(
      req.params,
      req.headers
    );
    res.status(OK).json({ code: OK, data });
  }
);

route.get(
  p.list,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator_forQueryReq(getEngine_companySchema),
  async (req, res: any) => {
    const data = await engine_compayController.listEngine_comapny(
      req.query,
      req.headers
    );
    res.status(OK).json({ data, code: OK });
  }
);

route.patch(
  p.updateStatus,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator_forQueryReq(updateStatusEngine_companySchema),
  async (req: any, res: any) => {
    const data = await engine_compayController.updateStatus(
      req?.params,
      req.query,
      req.headers
    );
    res.status(OK).json({ code: OK, data: data });
  }
);

route.patch(
  p.deletEngine_company,
  verifyAuthToken,
  checkRole(["admin"]),
  async (req: any, res: any) => {
    const data = await engine_compayController.deleteEngine_comapny(
      req.params,
      req.headers
    );
    res.status(OK).json({ data: data, code: OK });
  }
);

export default route;
