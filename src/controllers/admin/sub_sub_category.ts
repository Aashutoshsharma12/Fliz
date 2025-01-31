import { messages } from "@Custom_message";
import sub_subCategoryModel from "@models/sub_subCategory";
import { CustomError } from "@utils/errors";
import { identityGenerator } from "@utils/helpers";
import { stat } from "fs-extra";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

// ADD SUB-SUB-CATEGORY DATA
function add_sub_sub_Category_data(body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      body.lower_name = body.name.toLowerCase().trim();
      body.ar_lower_name = body.ar_name.toLowerCase().trim();
      const totalCount = await sub_subCategoryModel.countDocuments();
      body.uniqueId = identityGenerator("admin_sub_sub_category", totalCount);
      const find_sub_sub_categorybyname = await sub_subCategoryModel.findOne({
        $or: [
          {
            isDelete: false,
            lower_name: body.lower_name,
            categoryId: body.categoryId,
            subCategoryId: body.subCategoryId,
          },
          {
            isDelete: false,
            ar_lower_name: body.ar_lower_name,
            categoryId: body.categoryId,
            subCategoryId: body.subCategoryId,
          },
        ],
      });
      if (find_sub_sub_categorybyname === null) {
        const store_Sub_subCategoryData = await sub_subCategoryModel.create(
          body
        );
        resolve(store_Sub_subCategoryData);
      } else {
        reject(
          new CustomError(
            message.sub_subCatAlreadyExist.replace(
              "{{catName}}",
              `${body.name} OR ${body.ar_name}`
            ),
            StatusCodes.BAD_REQUEST
          )
        );
      }
    } catch (error) {
      reject(error);
    }
  });
}

// LIST SUB-SUB-CATEGORY DATA
function list_sub_sub_categoryData(headers: any, query: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      let { categoryId, subCategoryId } = query;
      const page = query.page || 1;
      const perPage = query.perPage || 10;
      const skip = (page - 1) * perPage;
      const { nameMatched, isActive } = query;
      let matchedCondition: any = {
        isDelete: false,
        categoryId: new mongoose.Types.ObjectId(categoryId),
        subCategoryId: new mongoose.Types.ObjectId(subCategoryId),
      };
      if (nameMatched !== "" && nameMatched !== undefined && nameMatched) {
        matchedCondition = {
          ...matchedCondition,
          $or: [
            { name: { $regex: nameMatched, $options: "i" }},
            { ar_name: { $regex: nameMatched, $options: "i" }},
            { uniqueId: { $regex: nameMatched, $options: "i"}}
          ],
        };
      }
      if (isActive === "Active") {
        matchedCondition = { ...matchedCondition, isActive: true }
      }
      else if (isActive === "InActive") {
        matchedCondition = { ...matchedCondition, isActive: false }
      }
      else if (isActive === "all") {
        matchedCondition = {
          ...matchedCondition
        }
      }
      const totalCount = await sub_subCategoryModel.countDocuments(
        matchedCondition
      );
      const getDataforAdmin_sub_sub_Category = await sub_subCategoryModel
        .find(matchedCondition, {
          uniqueId: 1,
          name: 1,
          ar_name:1,
          isActive: 1,
          updatedAt: 1,
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage);
      resolve({
        totalCount: totalCount,
        sub_sub_category_data: getDataforAdmin_sub_sub_Category,
      });
    } catch (error) {
      reject(error);
    }
  });
}

function list_sub_sub_category_for_Dropdown(
  query: any,
  headers: any
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      const { categoryId, subCategoryId } = query;
      const find_sub_sub_Category = await sub_subCategoryModel.aggregate([
        {
          $match: {
            isDelete: false,
            categoryId: new mongoose.Types.ObjectId(categoryId),
            subCategoryId: new mongoose.Types.ObjectId(subCategoryId),
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            ar_name: 1,
          },
        },
      ]);
      resolve(find_sub_sub_Category);
    } catch (error) {
      reject(error);
    }
  });
}

// UPDATE SUB-SUB-CATEGORY-DATA
function update_sub_sub_categoryData(
  body: any,
  params: any,
  headers: any
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      const { id } = params;
      body.lower_name = body.name.toLowerCase().trim();
      body.ar_lower_name = body.ar_name.toLowerCase().trim();
      const findOneAndUpdateData = await sub_subCategoryModel.findOne({
        $or: [
          {
            isDelete: false,
            lower_name: body.lower_name,
            categoryId: body.categoryId,
            subCategoryId: body.subCategoryId,
          },
          {
            isDelete: false,
            ar_lower_name: body.ar_lower_name,
            categoryId: body.categoryId,
            subCategoryId: body.subCategoryId,
          },
        ],
        _id: {
          $ne: id,
        },
      });
      if (findOneAndUpdateData === null) {
       const updatedData =  await sub_subCategoryModel.findOneAndUpdate(
          { _id: id, isDelete: false },
          {
            name: body?.name,
            ar_name: body?.ar_name,
            lower_name: body?.lower_name,
            ar_lower_name: body?.ar_lower_name,
            image: body?.image,
            isActive: body?.isActive, ///updated
          }
        );
        resolve({ success: true });
      } else {
        reject(
          new CustomError(
            message.sub_subCatAlreadyExist.replace(
              "{{catName}}",
              `${body.name} OR ${body.ar_name}`
            ),
            StatusCodes.BAD_REQUEST
          )
        );
      }
    } catch (error) {
      reject(error);
    }
  });
}

// DELETE SUB-SUB-CATEGORY
function deleteSub_SubCategory(params: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      const { id } = params;
      const findsub_subCategoryByID =
        await sub_subCategoryModel.findOneAndUpdate(
          { _id: id, isDelete: false },
          {
            isDelete: true,
          },
          {
            new: true,
          }
        );
      if (findsub_subCategoryByID === null) {
        reject(
          new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );
      } else {
        resolve({ success: true });
      }
    } catch (err) {
      reject(err);
    }
  });
}

// CHANGE SUB-SUB-CATEGORY STATUS
function changesub_sub_categoryStatus(
  params: any,
  headers: any,
  query: any
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      const { id } = params;
      const { isActive } = query;
      const find_sub_sub_categorybyID =
        await sub_subCategoryModel.findOneAndUpdate(
          { _id: id, isDelete: false },
          { isActive: isActive },
          { new: true }
        );
      if (find_sub_sub_categorybyID === null) {
        reject(
          new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );
      } else {
        resolve({ success: true });
      }
    } catch (error) {
      reject(error);
    }
  });
}

function get_sub_sub_categoryById(params: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      const { id } = params;
      const find_sub_sub_categorybyID = await sub_subCategoryModel.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(id), isDelete: false },
        },
        {
          $lookup: {
            from: "sub_categories",
            localField: "subCategoryId",
            foreignField: "_id",
            as: "subcategory",
          },
        },
        {
          $unwind: "$subcategory",
        },
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: "$category",
        },
      ]);
      if (!find_sub_sub_categorybyID.length) {
        reject(
          new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );
      } else {
        resolve(find_sub_sub_categorybyID);
      }
    } catch (error) {
      reject(error);
    }
  });
}

function excelData_subsubCategory(query: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);

    try {
      const { categoryId, subCategoryId } = query
      const condition = {
        isDelete: false,
        categoryId: new mongoose.Types.ObjectId(categoryId),
        subCategoryId: new mongoose.Types.ObjectId(subCategoryId),
      };

      const Data = await sub_subCategoryModel.aggregate([
        {
          $match:condition
        },
        {
          $sort:{
           createdAt:-1
          }
        }

      ])
      resolve( Data );
    } catch (error) {   
      reject(error);
    }
  });
}

export default {
  excelData_subsubCategory,
  add_sub_sub_Category_data,
  list_sub_sub_categoryData,
  update_sub_sub_categoryData,
  deleteSub_SubCategory,
  changesub_sub_categoryStatus,
  get_sub_sub_categoryById,
  list_sub_sub_category_for_Dropdown,
} as const;
