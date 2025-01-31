import { Router } from "express";
import engine_modelController from "@controllers/admin/engine_model";
import {
  schemaValidator,
  schemaValidator_forQueryReq,
} from "@utils/schemaValidator";
import {
  add_engine_model_Validator,
  edit_engine_model_Validator,
  list_engine_model_Validator,
  statusValidator,
} from "@validators/adminValidator";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { StatusCodes } from "http-status-codes";
const engine_modelRouter = Router();
const { CREATED, OK } = StatusCodes;
const p = {
  add: "/add",
  edit: "/edit/:id",
  list: "/list",
  details: "/list/:id",
  delete: "/delete/:id",
  changeStatus: "/updateStatus/:id",
};
engine_modelRouter.post(
  p.add,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator(add_engine_model_Validator),
  async (req, res) => {
    const data = await engine_modelController.addEngine_model(
      req?.body,
      req?.headers
    );
    res.status(CREATED).json({ code: CREATED, data });
  }
);

engine_modelRouter.patch(
  p.edit,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator(edit_engine_model_Validator),
  async (req, res) => {
    const data = await engine_modelController.editEngine_model(
      req?.params,
      req?.body,
      req?.headers
    );
    res.status(OK).json({ code: OK, data });
  }
);

engine_modelRouter.get(
  p.list,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator_forQueryReq(list_engine_model_Validator),
  async (req, res) => {
    const data = await engine_modelController.engine_model_list(
      req?.query,
      req?.headers
    );
    res.status(OK).json({ code: OK, data });
  }
);
engine_modelRouter.get(
  p.details,
  verifyAuthToken,
  checkRole(["admin"]),
  async (req, res) => {
    const data = await engine_modelController.engine_model_details(
      req?.params,
      req?.headers
    );
    res.status(OK).json({ code: OK, data });
  }
);
engine_modelRouter.patch(
  p.changeStatus,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator_forQueryReq(statusValidator),
  async (req, res) => {
    const data = await engine_modelController.updateStatus(
      req?.params,
      req?.query,
      req?.headers
    );
    res.status(OK).json({ code: OK, data });
  }
);

engine_modelRouter.patch(
  p.delete,
  verifyAuthToken,
  checkRole(["admin"]),
  async (req, res) => {
    const data = await engine_modelController.delete_engine_model(
      req?.params,
      req?.headers
    );
    res.status(OK).json({ code: OK, data });
  }
);

export default engine_modelRouter;
