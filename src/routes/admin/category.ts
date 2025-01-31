import { Router } from "express";
const categoryRouter = Router();
import categoryContoller from "@controllers/admin/category";
import { StatusCodes } from "http-status-codes";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
const { OK, CREATED } = StatusCodes;
import {
  schemaValidator,
  schemaValidator_forQueryReq,
} from "@utils/schemaValidator";

import {
  addCategoryValidator,
  statusValidator,
  updateCategoryValidator,
} from "@validators/adminValidator";
const p = {
  add: "/add",
  list: "/list",
  edit: "/edit/:id",
  delete: "/delete/:id",
  statusUpdate: "/updateStatus/:id",
  listuniqueCategory: "/list/:id",
  listCategoryforDropdown: "/list_for_dropdown",
  excelData_cat:"/excelData_cat"
};

//ADD CATEGORY
categoryRouter.post(
  p.add,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator(addCategoryValidator),
  async (req: any, res: any) => {
    const data = await categoryContoller.addCategory(req?.body, req?.headers);
    res.status(CREATED).json({ code: CREATED, data });
  }
);

// LIST CATEGORY
categoryRouter.get(
  p.list,
  verifyAuthToken,
  checkRole(["admin"]),
  async (req: any, res: any) => {
    const data = await categoryContoller.listCategory(req?.headers, req?.query);
    res.status(OK).json({ code: OK, data });
  }
);

categoryRouter.get(
  p.listCategoryforDropdown,
  verifyAuthToken,
  checkRole(["admin"]),
  async (req, res) => {
    const data = await categoryContoller.listCategoryForDropdown(req?.headers);
    res.status(OK).json({ code: OK, data });
  }
);

// UPDATE CATEGORY
categoryRouter.patch(
  p.edit,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator(updateCategoryValidator),
  async (req: any, res: any) => {
    const data = await categoryContoller.updateCategory(
      req?.body,
      req?.params,
      req?.headers
    );
    res.status(OK).json({ data, code: OK });
  }
);

// DELETE CATEGORY
categoryRouter.patch(
  p.delete,
  verifyAuthToken,
  checkRole(["admin"]),
  async (req: any, res: any) => {
    const data = await categoryContoller.deleteCategory(
      req?.params,
      req?.headers
    );
    res.status(OK).json({ data, code: OK });
  }
);

// UPDATE STATUS
categoryRouter.patch(
  p.statusUpdate,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator_forQueryReq(statusValidator),
  async (req: any, res: any) => {
    const data = await categoryContoller.updateStatus(
      req?.params,
      req?.headers,
      req?.query
    );
    res.status(OK).json({ data, code: OK });
  }
);

// LIST CATEGORY BY ID
categoryRouter.get(
  p.listuniqueCategory,
  verifyAuthToken,
  checkRole(["admin"]),
  async (req: any, res: any) => {
    const data = await categoryContoller.listCategoryById(
      req?.params,
      req?.headers
    );
    res.status(OK).json({ code: OK, data });
  }
);

categoryRouter.get(
  p.excelData_cat,
  verifyAuthToken,
  checkRole(["admin"]),
  async (req: any, res: any) => {
    const data = await categoryContoller.excelData_Category(
      req?.query,
      req?.headers
    );
    res.status(OK).json({ code: OK, data });
  }
);

export default categoryRouter;
