import { Router } from "express";
import subcategoryController from "@controllers/admin/sub_category";
import { StatusCodes } from "http-status-codes";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import {
  schemaValidator,
  schemaValidator_forQueryReq,
} from "@utils/schemaValidator";
import {
  addSub_CategoryValidator,
  excelData_subCat,
  list_sub_category_for_Dropdown_Validator,
  list_sub_CategoryValidator,
  statusValidator,
  updateCategoryValidator,
  updateSub_CategoryValidator,
} from "@validators/adminValidator";
const subCatRouter = Router();

const p = {
  add: "/add",
  list: "/list",
  edit: "/edit/:id",
  listById: "/list/:id",
  delete: "/delete/:id",
  changeStatus: "/updateStatus/:id",
  listCategoryforDropdown: "/list_for_dropdown",
  excelData_subCat: "/excelData_subCat"
};

const { OK, CREATED } = StatusCodes;

// ADD SUB-CATEGORY
subCatRouter.post(
  p.add,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator(addSub_CategoryValidator),
  async (req, res) => {
    const data = await subcategoryController.addsub_category(
      req?.body,
      req?.headers
    );
    res.status(CREATED).json({ code: CREATED, data });
  }
);

// LIST SUB-CATEGORY
subCatRouter.get(
  p.list,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator_forQueryReq(list_sub_CategoryValidator),
  async (req, res) => {
    const data = await subcategoryController.list_sub_Category(
      req?.headers,
      req?.query
    );
    res.status(OK).json({ code: OK, data });
  }
);

//LIST SUB-CATEGORY FOR DROPDOWN
subCatRouter.get(
  p.listCategoryforDropdown,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator_forQueryReq(list_sub_category_for_Dropdown_Validator),
  async (req, res) => {
    const data = await subcategoryController.list_sub_sub_CategoryForDropdown(
      req?.query,
      req?.headers
    );
    res.status(OK).json({ code: OK, data });
  }
);

// UPDATE SUB-CATEGORY
subCatRouter.patch(
  p.edit,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator(updateSub_CategoryValidator),
  async (req, res) => {
    const data = await subcategoryController.updateSub_Category(
      req?.body,
      req?.params,
      req?.headers
    );
    res.status(OK).json({ code: OK, data });
  }
);

// DELETE SUB-CATEGORY
subCatRouter.patch(
  p.delete,
  verifyAuthToken,
  checkRole(["admin"]),
  async (req: any, res: any) => {
    const data = await subcategoryController.deleteSub_Category(
      req?.params,
      req?.headers
    );
    res.status(OK).json({ code: OK, data });
  }
);

// LIST BY ID
subCatRouter.get(
  p.listById,
  verifyAuthToken,
  checkRole(["admin"]),
  async (req: any, res: any) => {
    const data = await subcategoryController.listSub_CategoryById(
      req?.params,
      req?.headers
    );
    res.status(OK).json({ code: OK, data });
  }
);

// UPDTAE STATUS
subCatRouter.patch(
  p.changeStatus,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator_forQueryReq(statusValidator),
  async (req: any, res: any) => {
    const data = await subcategoryController.updateStatus(
      req?.params,
      req?.headers,
      req?.query
    );
    res.status(OK).json({ code: OK, data });
  }
);

subCatRouter.get(
  p.excelData_subCat,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator_forQueryReq(excelData_subCat),
  async (req:any, res:any)=>{
    const data = await subcategoryController.excelData_subCategory(
      req?.query,
      req?.headers
    );
    res.status(OK).json({ code: OK, data });
  }
)

export default subCatRouter;
