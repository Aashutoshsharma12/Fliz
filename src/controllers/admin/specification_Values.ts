import { messages } from "@Custom_message";
import { cat_specification_valuesModel } from "@models/cat_specification";
import { CustomError } from "@utils/errors";
import { StatusCodes } from "http-status-codes";

function add_SpecificationValue(body:any, headers:any):Promise<any>{
    return new Promise (async (resolve, reject)=>{
        const { language } = headers;
        const message = messages(language);
        try{
            body.lower_keyValue = body.keyValue.toLowerCase()
            body.ar_lower_keyValue = body.ar_keyValue.toLowerCase()
            const check = await cat_specification_valuesModel.findOne({
               $or:[
               { 
                 isDelete: false,
                 catId: body.catId,
                 keyId: body.keyId,
                 lower_keyValue: body.lower_keyValue
               },
               {
                 isDelete:false,
                 catId:body.catId,
                 keyId:body.keyId,
                 ar_lower_keyValue:body.ar_lower_keyValue
               }
            ]
            })
            if (check) {
                reject(new CustomError(message.alreadyExist, StatusCodes.BAD_REQUEST));
            } else {
                const add = await cat_specification_valuesModel.create(body)
                resolve(add)
            }
        }catch(error){
            reject(error)
        }
    })
}

function edit_SpecificationValue(body:any, headers:any):Promise<any>{
    return new Promise (async (resolve, reject)=>{
        const { language } = headers;
        const message = messages(language);
        try{
            const { mongoId }  = body
            body.lower_keyValue = body.keyValue.toLowerCase()
            body.ar_lower_keyValue = body.ar_keyValue.toLowerCase()
            const check = await cat_specification_valuesModel.findOne({
               $or:[
                {
                    isDelete: false,
                    catId: body.catId,
                    keyId: body.keyId,
                    lower_keyValue: body.lower_keyValue,
                },
                {
                    isDelete: false,
                    catId: body.catId,
                    keyId: body.keyId,
                    ar_lower_keyValue: body.ar_lower_keyValue,
                }
            ],
            _id: {
                $ne: mongoId
            }
        })
            if (check) {
                reject(new CustomError(message.alreadyExist, StatusCodes.BAD_REQUEST))
            } else {
                const updated = await cat_specification_valuesModel.findByIdAndUpdate({ _id: mongoId }, body, { new: true })
                resolve(updated)
            }
        }catch(error){
            reject(error)
        }
    })
}

function list_SpecificationValue(query:any, headers:any):Promise<any>{
    return new Promise (async (resolve, reject)=>{
        try{
            const page = parseInt(query?.page) || 1;
            const perPage = parseInt(query?.perPage) || 10;
            const skip = (page - 1) * perPage;
            const { search, keyId } = query;
            var obj: any = { isDelete: false }

            if(keyId && keyId !=="" && keyId !== null){
                obj.keyId = keyId
            }
            if (search && search !== "" && search !== null) {
                obj = {
                    ...obj,
                    $or:[
                    {keyValue: { $regex: search, $options: "i" }},
                    {ar_keyValue: {$regex:search, $options:"i"}}
                    ]
                }
            }
            const [listSpecificationValue, totalDocument] = await Promise.all([cat_specification_valuesModel.find(obj).sort({ createdAt: -1 }).skip(skip).limit(perPage), cat_specification_valuesModel.countDocuments(obj)]) 
            resolve({ listSpecificationValue, totalDocument })
        }catch(error){
            reject(error)
        }
    })
}

 function delete_SpecificationValue(params: any, headers: any): Promise<any> {
    return new Promise(async(resolve, reject)=>{
         const { language } = headers;
         const message = messages(language);
    try {
        const data = await cat_specification_valuesModel.findOneAndUpdate(
            { _id: params.id, isDelete: false },
            { isDelete: true },
            { new: true }
        );
        if (!data){
            reject(new CustomError(message.noDatafound, StatusCodes.NOT_FOUND));
        } else{
            resolve({ success: true });
        }        
    } catch (error) {
        throw error;
     }
  })
} 


function details_specificationValue(params: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const mongoId  = params.id;
        const findDataById = await cat_specification_valuesModel.findOne({
          _id: mongoId,
          isDelete: false,
        });
        resolve(findDataById);
      } catch (error) {
        reject(error);
      }
    });
  }

export default {
    add_SpecificationValue,
    edit_SpecificationValue,
    list_SpecificationValue,
    delete_SpecificationValue,
    details_specificationValue  
} as const;