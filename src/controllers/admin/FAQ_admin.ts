import { messages } from "@Custom_message";
import { CustomError } from "@utils/errors";
import faqModel from "@models/faq"
import { identityGenerator } from "@utils/helpers";
import { StatusCodes } from "http-status-codes";
import { resolveClientEndpointParameters } from "@aws-sdk/client-s3/dist-types/endpoint/EndpointParameters";
import mongoose from "mongoose";

function addFaq(body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message:any = messages(language);
    try {
      body.lower_que = body.que.toLowerCase();
      body.ar_lower_que = body.ar_que.toLowerCase();
      body.lower_ans = body.ans.toLowerCase();
      body.ar_lower_ans = body.ar_ans.toLowerCase();
      const findFAQByName = await faqModel.findOne({
        $or: [
          {
            isDelete: false,
            lower_que: body.lower_que
          },
          {
            isDelete: false,
            ar_lower_que: body.ar_lower_que
          }
        ]
      })
      console.log(findFAQByName)
      if (findFAQByName) {
        reject(
          new CustomError(
            message.faq_AlreadyExist.replace(
              "{{que}}",
              `${body.que} OR ${body.ar_que}`
            ),
            StatusCodes.BAD_REQUEST
          )
        );
      } else {
        const resultData = await faqModel.create(body);
        if (resultData) {
          resolve( resultData);
        }
      }

    } catch (error) {
     reject(error)
    }
  });
}


function faqList(query: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
         const { language } = headers;
         const message = messages(language);
    try {
      const { page = 1, perPage = 10, isActive, search } = query;
      const skip = (page - 1) * perPage;
      let condition: any = { isDelete: false};     
      if (search && search !== "" && search !== null) {
        condition = {
          ...condition,
          $or: [
            { que: { $regex: search, $options: 'i' } },
            { ar_que: { $regex: search, $options: 'i' } }
          ]
        };        
      }
     if (isActive === "Active") {
        condition.isActive = true;
      } else if (isActive === "InActive") {
        condition.isActive = false;
      } else {
        condition = {
          ...condition
        }
      }
      const [faqList,count] = await Promise.all([
        faqModel
        .find(condition, {lower_que:0, ar_lower_que:0, lower_ans:0, ar_lower_ans:0})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage),
        faqModel.countDocuments(condition)
      ]);
      resolve( {faqList:faqList,count:count} );
    } catch (error) {
      reject(error);
    }
  });
}


function faqDelete(params: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message = messages(language);
    try {
      const { id } = params;
      const deletedFAQ = await faqModel.findOneAndUpdate(
        { _id: id, isDelete: false },
        { isDelete: true },
        { new: true }
      );
      if (deletedFAQ) {
        resolve({ deletedFAQ })

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


function editFAQ(body: any, params: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const { language } = headers;
    const message:any = messages(language);
    try {
      const { id } = params;
      body.lower_que = body.que.toLowerCase();
      body.ar_lower_que = body.ar_que.toLowerCase();
      body.lower_ans = body.ans.toLowerCase();
      body.ar_lower_ans = body.ar_ans.toLowerCase();
      const data = await faqModel.findOne({
        $or: [
          {           
            isDelete: false,
            lower_que: body.lower_que
          },
          {
            isDelete: false,
            ar_lower_que: body.ar_lower_que
          },
        ],
        _id: {
          $ne: id,
        },
      })
      console.log('inside api',data)
      if (data) {
        reject(
          new CustomError(
            message.faq_AlreadyExist.replace(
              "{{que}}",
              `${body.que} or ${body.ar_que}`
            ),
            StatusCodes.BAD_REQUEST
          )
        );
      } else {
        const updatedData = await faqModel.findOneAndUpdate(
          {
            _id: id,
            isDelete: false,
          },
          {
            que: body?.que,
            lower_que: body?.lower_que,
            ar_que: body?.ar_que,
            ar_lower_que: body?.ar_lower_que,
            ans: body?.ans,
            lower_ans: body?.lower_ans,
            ar_ans: body?.ar_ans,
            ar_lower_ans: body?.ar_lower_ans,
          },
          {new:true}
        );
        resolve(updatedData);
      }
    } catch (error) {
      reject(error)
    }
  });
}


function faqStatusChange(query: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { language } = headers;
      const message = messages(language);
      const { isActive, id } = query;
      const response = await faqModel.findOneAndUpdate({ _id: id, isDelete: false }, { isActive: isActive }, { new: true });
      if (response) {
        resolve(response);
      }
      else {
        reject(
          new CustomError(message.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );
      }
    } catch (error) {
      reject(error)
    }

  })
}



export default {
  faqStatusChange,
  addFaq,
  faqList,
  faqDelete,
  editFAQ
} as const;
