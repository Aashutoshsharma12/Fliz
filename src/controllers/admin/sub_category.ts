import { messages } from "@Custom_message";
import sub_categoryModel, { startSession } from "@models/sub_category";
import sub_subCategoryModel from "@models/sub_subCategory";
import { CustomError } from "@utils/errors";
import { identityGenerator } from "@utils/helpers";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

// ADD SUB-CATEGORY
function addsub_category(body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const language = { headers };
    const message = messages(language);
    try {
      body.lower_name = body.name.toLowerCase().trim();
      body.ar_lower_name = body.ar_name.toLowerCase().trim();
      const totalCount = await sub_categoryModel.countDocuments();
      body.uniqueId = identityGenerator("admin_sub_category", totalCount);
      const findSubCategoryByName = await sub_categoryModel.findOne({
        $or: [
          {
            isDelete: false,
            lower_name: body.lower_name,
            categoryId: body.categoryId,
          },
          {
            isDelete: false,
            ar_lower_name: body.ar_lower_name,
            categoryId: body.categoryId,
          },
        ],
      });
      if (findSubCategoryByName === null) {
        const storeSubCategoryData = await sub_categoryModel.create(body);
        resolve(storeSubCategoryData);
      } else {
        reject(
          new CustomError(
            message.subCatAlreadyExist.replace(
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

//LIST SUB-CATEGORY
function list_sub_Category(headers: any, query: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      const { categoryId } = query;
      const nameMatched = query?.nameMatched;
      const page = parseInt(query?.page) || 1;
      const perPage = parseInt(query?.perPage) || 10;
      const { isActive } = query;
      const skip = (page - 1) * perPage;
      let matchedCondition: any = {
        isDelete: false,
        categoryId: new mongoose.Types.ObjectId(categoryId),
      };
      if (nameMatched && nameMatched !== "" && nameMatched !== undefined) {
        matchedCondition = {
          ...matchedCondition,
          $or: [
            { name: { $regex: nameMatched, $options: "i" } },
            { ar_name: { $regex: nameMatched, $options: "i" } },
            { uniqueId: { $regex:nameMatched, $options: "i"}}
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
          ... matchedCondition
        }
      }
      const totalDocument = await sub_categoryModel.countDocuments(
        matchedCondition
      );
      const findSubCategory = await sub_categoryModel.aggregate([
        {
          $match: matchedCondition,
        },
        {
          $lookup: {
            from: "sub_subcategories",
            let: { subCategoryId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$subCategoryId", "$$subCategoryId"] },
                      { $eq: ["$isDelete", false] },
                    ],
                  },
                },
              },
            ],
            as: "sub_subcategories",
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $project: {
            uniqueId: 1,
            name: 1,
            ar_name:1,
            isActive: 1,
            updatedAt: 1,
            sub_subCategoryCount: { $size: "$sub_subcategories" },
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: perPage,
        },
      ]);

      resolve({
        totalCount: totalDocument,
        sub_category_data: findSubCategory,
      });
    } catch (error) {
      reject(error);
    }
  });
}

function list_sub_sub_CategoryForDropdown(
  query: any,
  headers: any
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      const { categoryId } = query;
      const find_sub_category_for_Dropdown = await sub_categoryModel.aggregate([
        {
          $match: {
            categoryId: new mongoose.Types.ObjectId(categoryId),
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
      resolve(find_sub_category_for_Dropdown);
    } catch (error) {
      reject(error);
    }
  });
}

// UPDATE SUB-CATEGORY
function updateSub_Category(
  body: any,
  params: any,
  headers: any
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const { id } = params;
      body.lower_name = body.name.toLowerCase().trim();
      body.ar_lower_name = body.ar_name.toLowerCase().trim();
      body.categoryId = body.categoryId.trim();
      // new mongoose.Types.ObjectId(body.categoryId),
      const findSubCategoryByID: any = await sub_categoryModel.findOne({
        $or: [
          {
            isDelete: false,
            lower_name: body.lower_name,
            categoryId: body.categoryId,
          },
          {
            isDelete: false,
            ar_lower_name: body.ar_lower_name,
            categoryId: body.categoryId,
          },
        ],
        _id: {
          $ne: id,
        },
      });

      if (findSubCategoryByID === null) {
        const updateSubCategory = await sub_categoryModel.findOneAndUpdate(
          { _id: id, isDelete: false },
          {
            name: body?.name,
            ar_name: body?.ar_name,
            lower_name: body?.lower_name,
            ar_lower_name: body?.ar_lower_name,
            image: body?.image,
            isActive: body?.isActive,
          },
          {
            session,
            new: true,
          }
        );
        // throw new Error("This is not a genuine error");
        await sub_subCategoryModel.updateMany(
          {
            subCategoryId: id,
          },
          { isActive: body?.isActive },
          { session }
        );
        await session.commitTransaction();
        resolve({ success: true });
      } else {
        reject(
          new CustomError(
            message.subCatAlreadyExist.replace(
              "{{catName}}",
              `${body.name} OR ${body.ar_name}`
            ),
            StatusCodes.BAD_REQUEST
          )
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

// DELETE SUB-CATEGORY
function deleteSub_Category(params: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const { id } = params;
      const findCategoryByID = await sub_categoryModel.findOneAndUpdate(
        { _id: id, isDelete: false },
        {
          isDelete: true,
        },
        {
          session,
          new: true,
        }
      );
      if (findCategoryByID === null) {
        await session.abortTransaction();
        reject(
          new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );
      } else {
        await sub_subCategoryModel.updateMany(
          { subCategoryId: id, isDelete: false },
          { isDelete: true },
          { session }
        );
        await session.commitTransaction();
        resolve({ success: true });
      }
    } catch (err) {
      await session.abortTransaction();
      reject(err);
    } finally {
      await session.endSession;
    }
  });
}

//LIST SUB-CATEGORY BY ID
function listSub_CategoryById(params: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      const ObjectId: any = mongoose.Types.ObjectId;
      const { id } = params;
      const findSubCategoryforId = await sub_categoryModel.aggregate([
        {
          $match: { _id: new ObjectId(id), isDelete: false },
        },
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "categoryData",
          },
        },
        {
          $unwind: "$categoryData",
        },
        {
          $project:{
            lower_name:0,
            ar_lower_name:0,
            "categoryData.lower_name":0,
            "categoryData.ar_lower_name":0
          }
        }
      ]);
      if (!findSubCategoryforId.length) {
        reject(
          new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );
      } else {
        resolve(findSubCategoryforId);
      }
    } catch (error) {
      reject(error);
    }
  });
}

//UPDATE STATUS
function updateStatus(params: any, headers: any, query: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const { id } = params;
      const { isActive } = query;
      const updataeStatusData = await sub_categoryModel.findOneAndUpdate(
        { _id: id, isDelete: false },
        {
          isActive: isActive,
        },
        {
          session,
          new: true,
        }
      );
      if (!updataeStatusData) {
        await session.abortTransaction();
        reject(
          new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );
      } else {
        await sub_subCategoryModel.updateMany(
          {
            subCategoryId: id,
          },
          { isActive: isActive },
          { session }
        );
        await session.commitTransaction();
        resolve({ success: true });
      }
    } catch (error) {
      reject(error);
    } finally {
      await session.endSession();
    }
  });
}

function excelData_subCategory(query: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {  
      const { categoryId } = query 
      const condition = {
        isDelete: false,
        categoryId:new mongoose.Types.ObjectId(categoryId),
      };
      const Data = await sub_categoryModel.aggregate([
        {
          $match: condition
        },
        {
          $lookup: {
            from: "sub_subcategories",
            let: { subCategoryId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$subCategoryId", "$$subCategoryId"] },
                      { $eq: ["$isDelete", false] },
                    ],
                  },
                },
              },
            ],
            as: "sub_subcategories",
          },
        },
        {
          $project:{
            _id:1,
            uniqueId:1,
            categoryId:1,
            name:1,
            // lower_name:1,
            ar_name:1,
            // ar_lower_name:1,
            createdAt:1,
            updatedAt:1,
            isActive:1,
            isDelete:1,
            image:1,
            sub_subCategoryCount: { $size: "$sub_subcategories" },
          }
        },
        {
          $sort:{createdAt:-1}
        }
      ])
     
      resolve( Data );
    } catch (error) {   
      reject(error);
    }
  });
}


export default {
  excelData_subCategory,
  addsub_category,
  list_sub_Category,
  updateSub_Category,
  deleteSub_Category,
  listSub_CategoryById,
  updateStatus,
  list_sub_sub_CategoryForDropdown,
} as const;
