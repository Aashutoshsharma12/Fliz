import { messages } from "@Custom_message";
import engine_modelModel from "@models/engine_model";
import { CustomError } from "@utils/errors";
import { identityGenerator } from "@utils/helpers";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

function addEngine_model(body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = body;
    var message: any = messages(language);
    try {
      body.lower_name = body.name.toLowerCase().trim();
      body.ar_lower_name = body.ar_name.toLowerCase().trim();
      const totalCount = await engine_modelModel.countDocuments();
      body.uniqueId = identityGenerator("admin-engine-model", totalCount);
      const findDuplicateData = await engine_modelModel.findOne({
        $or: [
          {
            isDelete: false,
            lower_name: body.lower_name,
            engine_companyId: body.engine_companyId,
          },
          {
            isDelete: false,
            ar_lower_name: body.ar_lower_name,
            engine_companyId: body.engine_companyId,
          },
        ],
      });
      if (findDuplicateData) {
        reject(
          new CustomError(
            message.engine_modelAlreadyExist.replace(
              "{{name}}",
              `${body.name} or ${body?.ar_name}`
            ),
            StatusCodes.BAD_REQUEST
          )
        );
      } else {
        const addedData = await engine_modelModel.create(body);
        resolve(addedData);
      }
    } catch (err) {
      reject(err);
    }
  });
}

function editEngine_model(params: any, body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    var message: any = messages(language);
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
      const { id } = params;
      body.lower_name = body.name.toLowerCase();
      body.ar_lower_name = body.ar_name.toLowerCase();
      const findDataByName = await engine_modelModel
        .findOne({
          $or: [
            {
              lower_name: body?.lower_name,
              isDelete: false,
              engine_companyId: body.engine_companyId,
            },
            {
              ar_lower_name: body?.ar_lower_name,
              isDelete: false,
              engine_companyId: body.engine_companyId,
            },
          ],
          _id: {
            $ne: id,
          },
        })
        .session(session);
      if (findDataByName) {

        await session.abortTransaction();
        reject(
          new CustomError(
            message.engine_modelAlreadyExist.replace(
              "{{name}}",
              `${body.name} or ${body.ar_name}`
            ),
            StatusCodes.BAD_REQUEST
          )
        );
      } else {
        await engine_modelModel.updateOne(
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
          },
          { session }
        );
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

function engine_model_details(params: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    var message: any = messages(language);
    try {
      const details = await engine_modelModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(params.id),
            isDelete: false,
          },
        },
        {
          $lookup: {
            from: "engine_companies",
            localField: "engine_companyId",
            foreignField: "_id",
            as: "engine_company",
          },
        },
        {
          $unwind: "$engine_company",
        },
        {
          $project:{
            lower_name:0,
            ar_lower_name:0,
            "engine_company.lower_name":0,
            "engine_company.ar_lower_name":0 
          }
        }
      ]);
      resolve(details);
    } catch (err) {
      reject(err);
    }
  });
}

function engine_model_list(query: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    var message: any = messages(language);
    try {
      const { page = 1, perPage = 10, engine_companyId, nameMatched, isActive } = query;
      let matchedCondition: any = {
        isDelete: false,
        engine_companyId: engine_companyId,
      };

      if (nameMatched && nameMatched !== "") {
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
      else if (isActive === "all") {
        matchedCondition = {
          ... matchedCondition
        }
      }
      const [engine_modelData, count] = await Promise.all([
        engine_modelModel
          .find(matchedCondition, {lower_name:0, ar_lower_name:0})
          .sort({ createdAt: -1 })
          .skip((page - 1) * perPage)
          .limit(perPage),
        engine_modelModel.countDocuments(matchedCondition),
      ]);
      resolve({ totalCount: count, engine_modelData });
    } catch (err) {
      reject(err);
    }
  });
}
function updateStatus(params: any, query: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      const { isActive } = query;
      const { id } = params;
      const update = await engine_modelModel.findOneAndUpdate(
        { _id: id, isDelete: false },
        { isActive: isActive },
        { new: true }
      );
      if (update) {
        resolve({ success: true });

      } else {

        reject(
          new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );
      }
    } catch (err) {
      reject(err);
    }
  });
}
function delete_engine_model(params: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      const deletedData = await engine_modelModel.findOneAndUpdate(
        { _id: params.id, isDelete: false },
        { isDelete: true },
        { new: true }
      );
      if (deletedData) {
        resolve({ success: true });


      } else {
        reject(
          new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );
      }
    } catch (err) {
      reject(err);
    }
  });
}

export default {
  addEngine_model,
  editEngine_model,
  engine_model_details,
  engine_model_list,
  updateStatus,
  delete_engine_model,
};
