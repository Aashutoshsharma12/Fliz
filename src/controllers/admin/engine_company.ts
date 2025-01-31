import { messages } from "@Custom_message";
import engine_companyModel from "@models/engine_company";
import engine_modelModel from "@models/engine_model";
import { CustomError } from "@utils/errors";
import { identityGenerator } from "@utils/helpers";
import { stat } from "fs-extra";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

function addEngine_comapny(body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      body.lower_name = body?.name.toLowerCase().trim();
      body.ar_lower_name = body?.ar_name.toLowerCase().trim();
      const totalDocument = await engine_companyModel.countDocuments();
      body.uniqueId = identityGenerator("admin_engine_company", totalDocument);
      const findCompanyByname = await engine_companyModel.findOne({
        $or: [
          { lower_name: body?.name.toLowerCase().trim(), isDelete: false, role: body?.role },
          { ar_lower_name: body?.ar_name?.toLowerCase().trim(), isDelete: false, role: body?.role },
        ],
      });
      if (findCompanyByname) {
        reject(
          new CustomError(
            message.engine_companyAlreadyExist.replace(
              "{{name}}",
              `${body.name} or ${body?.ar_name}`
            ),
            StatusCodes.BAD_REQUEST
          )
        );
      } else {
        const add = await engine_companyModel.create(body);
        resolve(add);
      }
    } catch (err) {
      reject(err);
    }
  });
}

function editEngine_comapny(
  params: any,
  body: any,
  headers: any
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const { id } = params;
      const { name, ar_name } = body;
      body.lower_name = name.toLowerCase();
      body.ar_lower_name = ar_name.toLowerCase();
      const findCompanyByname = await engine_companyModel
        .findOne({
          $or: [
            { lower_name: body.lower_name, isDelete: false, role: body?.role },
            { ar_lower_name: body.ar_lower_name, isDelete: false, role: body?.role },
          ],
          _id: {
            $ne: id,
          },
        })
        .session(session);
      if (findCompanyByname) {
        await session.abortTransaction();
        reject(
          new CustomError(
            message.engine_companyAlreadyExist.replace(
              "{{name}}",
              `${name} or ${ar_name}`
            ),
            StatusCodes.BAD_REQUEST
          )
        );

      } else {
        await engine_companyModel.findOneAndUpdate(
          {
            _id: id,
            isDelete: false,
          },
          {
            name: body?.name,
            lower_name: body?.lower_name,
            ar_name: body?.ar_name,
            ar_lower_name: body?.ar_lower_name,
            image: body?.image,
            isActive: body?.isActive,
            role:body?.role
          },
          {
            session,
            new: true,
          }
        );
        await engine_modelModel.updateMany(
          {
            engine_companyId: id,
            isDelete: false,
          },
          {
            isActive: body?.isActive,
          },
          {
            session,
            new: true,
          }
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

function detailsEngine_comapny(params: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {   
      const details = await engine_companyModel.findOne(
        {
          _id: params.id,
          isDelete: false,
        },
        {
          name: 1,
          // lower_name: 1,
          ar_name: 1,
          // ar_lower_name: 1,
          image: 1,
          isActive: 1,
          updatedAt: 1,
          role: 1
        }
      );
      resolve(details);
    } catch (err) {
      reject(err);
    }
  });
}

function listEngine_comapny(query: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      const page = parseInt(query?.page) || 1;
      const perPage = parseInt(query?.perPage) || 10
      const { nameMatched, role, isActive } = query;
      let condition: any = {
        isDelete: false,
      };
      if (role === "all") {
        condition = {
          ...condition, $or: [
            { role: "delivery_user" },
            { role: "renter_user" }
          ]
        }
      }
      else {
        condition = { ...condition, role: role };
      }
     
      if (nameMatched) {
        condition = {
          ...condition,
          $or: [
            { name: { $regex: nameMatched, $options: "i" } },
            { ar_name: { $regex: nameMatched, $options: "i" } },
          ],
        };
      }
      if (isActive === "Active") {
        condition = { ...condition, isActive: true }
      }
      else if (isActive === "InActive") {
        condition = { ...condition, isActive: false }
      }
      else if (isActive === "all") {
        condition = {
          ...condition
        }
      }
      const [list, count] = await Promise.all([
        engine_companyModel.aggregate([
          {
            $match: condition,
          },
          {
            $lookup: {
              from: "engines",
              let: { companyId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$engine_companyId", "$$companyId"] },
                        { $eq: ["$isDelete", false] },
                      ],
                    },
                  },
                },
              ],

              as: "engine_model",
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
              role: 1,
              engine_model_count: { $size: "$engine_model" },
            },
          },
          {
            $skip: (page - 1) * perPage,
          },
          {
            $limit: perPage,
          },
        ]),

        engine_companyModel.countDocuments(condition),
      ]);
      resolve({ totalCount: count, list });
    } catch (err) {
      reject(err);
    }
  });
}

function updateStatus(params: any, query: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const { isActive } = query;
      const { id } = params;
      let UpdatedData: any = await engine_companyModel.findOneAndUpdate(
        { _id: id, isDelete: false },
        { isActive: isActive },
        { session, new: true }
      );
      if (UpdatedData) {
        await engine_modelModel.updateMany(
          {
            engine_companyId: id,
            isDelete: false,
          },
          {
            isActive: isActive,
          },
          {
            session,
          }
        );
        await session.commitTransaction();
        resolve({ success: true });
      } else {
        await session.abortTransaction();
        reject(new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND))
      }
    } catch (err) {
      await session.abortTransaction();
      reject(err);
    } finally {
      await session.endSession();
    }
  });
}

function deleteEngine_comapny(params: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const Deleted_Data = await engine_companyModel.findOneAndUpdate(
        { _id: params?.id, isDelete: false },
        { isDelete: true },
        { session, new: true }
      );
      if (Deleted_Data) {

        await engine_modelModel.updateMany(
          {
            engine_companyId: params.id,
            isDelete: false,
          },
          {
            isDelete: true,
          }
        );
        await session.commitTransaction();
        resolve({ success: true });


      } else {
        await session.abortTransaction();
        reject(
          new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );
      }
    } catch (err) {
      await session.abortTransaction();
      reject(err);
    } finally {
      await session.endSession();
    }
  });
}

export default {
  addEngine_comapny,
  editEngine_comapny,
  detailsEngine_comapny,
  listEngine_comapny,
  updateStatus,
  deleteEngine_comapny,
} as const;
