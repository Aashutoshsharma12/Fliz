import { messages } from "@Custom_message";
import { CustomError } from "@utils/errors";
import { StatusCodes } from "http-status-codes";
import { identityGenerator } from "@utils/helpers";
import categoryModel from "@models/category";
import sub_categoryModel from "@models/sub_category";
import sub_subCategoryModel from "@models/sub_subCategory";
import mongoose from "mongoose";
import { cat_specification_valuesModel, cat_specificationModel } from "@models/cat_specification";
import equipment_specificationModel from "@models/equipment_specification";

function addCategory(body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      body.lower_name = body.name.toLowerCase().trim();
      body.ar_lower_name = body.ar_name.toLowerCase().trim();
      const totalCount = await categoryModel.countDocuments();
      const uniqueIdforCategory = identityGenerator(
        "admin_category",
        totalCount
      );
      const findCategoryByName = await categoryModel.findOne({
        $or: [
          {
            isDelete: false,
            lower_name: body.lower_name,
          },
          {
            isDelete: false,
            ar_lower_name: body.ar_lower_name,
          },
        ],
      });
      if (findCategoryByName) {
        reject(
          new CustomError(
            message.catAlreadyExist.replace(
              "{{catName}}",
              `${body.name} OR ${body.ar_name}`
            ),
            StatusCodes.BAD_REQUEST
          )
        );
      } else {
        body.uniqueId = uniqueIdforCategory;
        const resultData = await categoryModel.create(body);
        if (resultData) {
          resolve(resultData);
        }
      }
    } catch (error) {
      reject(error);
    }
  });
}
// List Category Controllers
function listCategory(headers: any, query: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      const { nameMatched, isActive } = query;
      const page = parseInt(query?.page) || 1;
      const perPage = parseInt(query?.perPage) || 10;
      const skip = (page - 1) * perPage;
      let matchedCondition: any = {
        isDelete: false,
      };
      if (nameMatched && nameMatched !== "" && nameMatched !== undefined) {
        matchedCondition = {
          ...matchedCondition,
          $or: [
            { name: { $regex: nameMatched, $options: "i" } },
            { ar_name: { $regex: nameMatched, $options: "i" } },
          ],
        };
      }
      if (isActive === "Active") {
        matchedCondition = { ...matchedCondition, isActive: true }
      }
      else if (isActive === "InActive") {
        matchedCondition = { ...matchedCondition, isActive: false }
      }

      const totalDocument = await categoryModel.countDocuments(
        matchedCondition
      );

      const findCategory = await categoryModel.aggregate([
        {
          $match: matchedCondition,
        },
        {
          $lookup: {
            from: "sub_categories",
            let: { categoryId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$categoryId", "$$categoryId"] },
                      { $eq: ["$isDelete", false] },
                    ],
                  },
                },
              },
            ],
            as: "subCategory",
          },
        },
        {
          $lookup: {
            from: "sub_subcategories",
            let: { categoryId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$categoryId", "$$categoryId"] },
                      { $eq: ["$isDelete", false] },
                    ],
                  },
                },
              },
            ],
            as: "sub_subCategory",
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $project: {
            name: 1,
            ar_name: 1,
            isActive: 1,
            updatedAt: 1,
            image: 1,
            sub_categoryCount: { $size: "$subCategory" },
            sub_subCategoryCount: { $size: "$sub_subCategory" },
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: perPage,
        },
      ]);
      resolve({ totalCount: totalDocument, category_data: findCategory });
    } catch (error) {
      reject(error);
    }
  });
}
function listCategoryForDropdown(headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      const findListForDropdown = await categoryModel.aggregate([
        {
          $match: {
            isDelete: false,
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
      resolve(findListForDropdown);
    } catch (error) {
      reject(error);
    }
  });
}
function updateCategory(body: any, params: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const { id } = params;
      body.lower_name = body?.name.toLowerCase().trim();
      body.ar_lower_name = body?.ar_name.toLowerCase().trim();
      const findCategoryByLowerAndArabic: any = await categoryModel.findOne({
        $or: [
          {
            lower_name: body.lower_name,
            isDelete: false,
          },
          {
            ar_lower_name: body.ar_lower_name,
            isDelete: false,
          },
        ],
        _id: {
          $ne: id,
        },
      });
      if (findCategoryByLowerAndArabic) {
        reject(
          new CustomError(
            message.catAlreadyExist.replace(
              "{{catName}}",
              `${body.name} OR ${body.ar_name}`
            ),
            StatusCodes.BAD_REQUEST
          )
        );
      } else {
        await categoryModel.findOneAndUpdate(
          { _id: id, isDelete: false },
          {
            name: body?.name,
            lower_name: body?.lower_name,
            ar_name: body?.ar_name,
            ar_lower_name: body?.ar_lower_name,
            image: body?.image,
            isActive: body?.isActive,
          },
          { session, new: true }
        );
        await sub_categoryModel.updateMany(
          {
            categoryId: id,
          },
          { isActive: body?.status },
          {
            session,
          }
        );
        await sub_subCategoryModel.updateMany(
          {
            categoryId: id,
          },
          { isActive: body?.status },
          { session }
        );
        await session.commitTransaction();
        resolve({ success: true });
      }
    } catch (error) {
      await session.abortTransaction();
      reject(error);
    } finally {
      await session.endSession();
    }
  });
}

function deleteCategory(params: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const { id } = params;
      const findCategoryByID: any = await categoryModel.findOneAndUpdate(
        { _id: id, isDelete: false },
        {
          isDelete: true,
        },
        {
          session,
          new: true,
        }
      ).populate({ path: "specifications", match: { isDelete: false }, select: "catId" });
      if (!findCategoryByID) {
        await session.abortTransaction();
        reject(
          new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );
      } else {
        await sub_categoryModel.updateMany(
          { categoryId: id, isDelete: false },
          {
            isDelete: true,
          },
          { session }
        );
        await sub_subCategoryModel.updateMany(
          { categoryId: id, isDelete: false },
          {
            isDelete: true,
          },
          { session }
        );
        await cat_specificationModel.updateMany({ catId: id }, { isDelete: true });
        await cat_specification_valuesModel.updateMany({ catId: id }, { isDelete: true });
        const specifications = findCategoryByID.specifications
        if (specifications.length) {
          specifications.forEach(async (item: any) => {
            await equipment_specificationModel.updateMany({ keyId: item._id }, { isDelete: true });
          })
        }
        await session.commitTransaction();
        resolve({ success: true });
      }
    } catch (err) {
      await session.abortTransaction();
      reject(err);
    } finally {
      await session.endSession();
    }
  });
}
function updateStatus(params: any, headers: any, query: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    const session: any = await mongoose.startSession();
    (await session).startTransaction();
    try {
      const { id } = params;
      const { isActive } = query;
      const updataeStatusData = await categoryModel.findOneAndUpdate(
        { _id: id, isDelete: false },
        { isActive: isActive },
        {
          session,
          new: true,
        }
      );
      if (updataeStatusData) {
        await sub_categoryModel.updateMany(
          {
            categoryId: id,
          },
          { isActive: isActive },
          {
            session,
          }
        );
        await sub_subCategoryModel.updateMany(
          {
            categoryId: id,
          },
          { isActive: isActive },
          { session }
        );
        await session.commitTransaction();
        resolve({ success: true });
      } else {

        await session.abortTransaction();
        reject(
          new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );


      }
    } catch (error) {
      await session.abortTransaction();
      reject(error);
    } finally {
      await session.endSession();
    }
  });
}
function listCategoryById(params: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      const { id } = params;
      const findCategoryforId = await categoryModel.findOne({
        _id: id,
        isDelete: false,
      },
      {
        lower_name:0,
        ar_lower_name:0
      }
    );
      if (findCategoryforId) {
        resolve(findCategoryforId);
      } else {
        reject(
          new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );
      }
    } catch (error) {
      reject(error);
    }
  });
}

function excelData_Category(query: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      const condition = {
        isDelete: false
      }
      const excelData = await categoryModel.aggregate([
        {
          $match: condition
        },
        {
          $lookup: {
            from: "sub_categories",
            let: { categoryId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$categoryId", "$$categoryId"] },
                      { $eq: ["$isDelete", false] },
                    ],
                  },
                },
              },
            ],
            as: "subCategory",
          },
        },
        {
          $lookup: {
            from: "sub_subcategories",
            let: { categoryId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$categoryId", "$$categoryId"] },
                      { $eq: ["$isDelete", false] },
                    ],
                  },
                },
              },
            ],
            as: "sub_subCategory",
          },
        },
        {
          $project: {
            _id: 1,
            uniqueId: 1,
            name: 1,
            // lower_name: 1,
            ar_name: 1,
            // ar_lower_name: 1,
            createdAt: 1,
            updatedAt: 1,
            isActive: 1,
            isDelete: 1,
            image: 1,
            sub_categoryCount: { $size: "$subCategory" },
            sub_subCategoryCount: { $size: "$sub_subCategory" },
          },
        },
        {
          $sort: { createdAt: -1 }
        }
      ])
      resolve(excelData)
    } catch (error) {
      reject(error)
    }
  })
}

export default {
  excelData_Category,
  addCategory,
  listCategory,
  updateCategory,
  deleteCategory,
  updateStatus,
  listCategoryById,
  listCategoryForDropdown,
} as const;
