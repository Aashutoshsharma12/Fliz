import { Router } from "express";
import sub_subCategoryController from "@controllers/admin/sub_sub_category";
import { StatusCodes } from "http-status-codes";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import {
  schemaValidator,
  schemaValidator_forQueryReq,
} from "@utils/schemaValidator";
import {
  sub_sub__CategoryValidator,
  list_sub_sub__CategoryValidator,
  list_sub_category_for_Dropdown_Validator,
  list_sub_sub_category_for_Dropdown_Validator,
  statusValidator,
  updateSub_Sub_CategoryValidator,
  excelData_subsubCat,
} from "@validators/adminValidator";
const sub_subCatrouter = Router();
const p = {
  add: "/add",
  list: "/list",
  edit: "/edit/:id",
  listById: "/list/:id",
  delete: "/delete/:id",
  changeStatus: "/updateStatus/:id",
  listCategoryforDropdown: "/list_for_dropdown",
  excelData_subsubCat:"/excelData_subsubCat"
};

const { CREATED, OK } = StatusCodes;

// ADD SUB-SUB-CATEGORY DATA
sub_subCatrouter.post(
  p.add,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator(sub_sub__CategoryValidator),
  async (req, res) => {
    const data = await sub_subCategoryController.add_sub_sub_Category_data(
      req?.body,
      req?.headers
    );
    res.status(CREATED).json({ code: CREATED, data });
  }
);

// UPDATE SUB-SUB-CATEGORY
sub_subCatrouter.patch(
  p.edit,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator(updateSub_Sub_CategoryValidator),
  async (req, res) => {
    const data = await sub_subCategoryController.update_sub_sub_categoryData(
      req?.body,
      req?.params,
      req?.headers
    );
    res.status(OK).json({ code: OK, data });
  }
);

// DELETE SUB-SUB-CATEGORY
sub_subCatrouter.patch(
  p.delete,
  verifyAuthToken,
  checkRole(["admin"]),
  async (req: any, res: any) => {
    const data = await sub_subCategoryController.deleteSub_SubCategory(
      req?.params,
      req?.headers
    );
    res.status(OK).json({ code: OK, data });
  }
);

// UPDATE STATUS OF SUB-SUB-CATEGORY
sub_subCatrouter.patch(
  p.changeStatus,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator_forQueryReq(statusValidator),
  async (req, res) => {
    const data = await sub_subCategoryController.changesub_sub_categoryStatus(
      req?.params,
      req?.headers,
      req?.query
    );
    res.status(OK).json({ code: OK, data });
  }
);

//LIST SUB-SUB-CATEGORY DATA BY ID

sub_subCatrouter.get(
  p.listById,
  verifyAuthToken,
  checkRole(["admin"]),
  async (req, res) => {
    const data = await sub_subCategoryController.get_sub_sub_categoryById(
      req?.params,
      req?.headers
    );
    res.status(OK).json({ code: OK, data });
  }
);

// LIST SUB-SUB-CATEGORY DATA
sub_subCatrouter.get(
  p.list,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator_forQueryReq(list_sub_sub__CategoryValidator),

  async (req, res) => {
    const data = await sub_subCategoryController.list_sub_sub_categoryData(
      req?.headers,
      req?.query
    );
    res.status(OK).json({ code: OK, data });
  }
);

sub_subCatrouter.get(
  p.listCategoryforDropdown,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator_forQueryReq(list_sub_sub_category_for_Dropdown_Validator),
  async (req, res) => {
    const data =
      await sub_subCategoryController.list_sub_sub_category_for_Dropdown(
        req?.query,
        req?.headers
      );
    res.status(OK).json({ code: OK, data });
  }
);

sub_subCatrouter.get(
  p.excelData_subsubCat,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator_forQueryReq(excelData_subsubCat),
  async (req, res) => {
    const data =
      await sub_subCategoryController.excelData_subsubCategory(
        req?.query,
        req?.headers
      );
    res.status(OK).json({ code: OK, data });
  }
);
export default sub_subCatrouter;
