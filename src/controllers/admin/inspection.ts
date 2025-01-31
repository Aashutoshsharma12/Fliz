import { messages } from "@Custom_message";
import { inspectionModel } from "@models/index";
import { CustomError } from "@utils/errors";
import { identityGenerator } from "@utils/helpers";
import { StatusCodes } from "http-status-codes";

function add(body: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language } = headers;
            const { role } = query;
            var message: any = messages(language);
            const { title, ar_title } = body;
            const lower_title = title.toLowerCase()
            const ar_lower_title = ar_title.toLowerCase()
            body.lower_title = lower_title
            body.ar_lower_title = ar_lower_title           
            const count = await inspectionModel.countDocuments(); 
            body.uniqueId = identityGenerator('inspection', count)        
            if( role === "user"){              
                body.role = role;                   
                const add = new inspectionModel(body);
                const add_user = await add.save();
                resolve(add_user);          
            }else if (role === "company"){ 
                body.role = role;               
                const add1 = new inspectionModel(body);
                const add1_company = await add1.save();
                resolve(add1_company)
            }
        } catch (err) {
            reject(err)
        }
    });
}


function edit(body: any, query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {

            const { language } = headers;
            var message: any = messages(language);
            const { role } = query;

            const { title, ar_title } = body;

            const lower_title = title.toLowerCase()
            const ar_lower_title = ar_title.toLowerCase()

            body.lower_title = lower_title
            body.ar_lower_title = ar_lower_title


            if (role === "user") {
                body.role = role;
                const updateed_data = await inspectionModel.findByIdAndUpdate({ _id: body.instructionId }, body, { new: true })
                resolve(updateed_data);
            }


            if (role === "company") {
                body.role = role;
                const updateed_data = await inspectionModel.findByIdAndUpdate({ _id: body.instructionId }, body, { new: true })
                resolve(updateed_data);
            }
        } catch (err) {
            if (err.code === 11000) {
                reject(new CustomError(message.alreadyExist, StatusCodes.BAD_REQUEST));
            }
            reject(err)
        }
    });
}

function details(params: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language } = headers;
            var message: any = messages(language);
            const _id = params.id
            console.log(_id)
            const details = await inspectionModel.findOne({ _id: params.id, isDelete: false });
            resolve(details);
        } catch (err) {
            reject(err)
        }
    });
}

function list(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language } = headers;
            var message: any = messages(language);
            const { page = 1, perPage = 10, search, isActive, role = 'user' } = query;
            let obj: any = {
                isDelete: false,
                role: role
            }
            if (search) {
                obj = {
                    ...obj,
                    $or: [
                        { title: { $regex: search, $options: 'i' } },
                        { ar_title: { $regex: search, $options: 'i' } }
                    ]
                }
            }
            if (isActive === "Active") {
                obj = { ...obj, isActive: true }
            }
            else if (isActive === "InActive") {
                obj = { ...obj, isActive: false }
            }
            else if (isActive === "all") {
                obj = {...obj }
            }            
            const [list, count] = await Promise.all([inspectionModel.find(obj).sort({ createdAt: -1 }).skip((page * perPage) - perPage).limit(perPage), inspectionModel.countDocuments(obj)]);
            resolve({ list, totalCount: count });
        } catch (err) {
            reject(err)
        }
    });
}

function updateStatus(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { isActive, instructionId } = query;
            const updated_data = await inspectionModel.findByIdAndUpdate({ _id: instructionId, isDelete: false }, { isActive: isActive }, { new: true });
            resolve(updated_data);
        } catch (err) {
            reject(err)
        }
    });
}
function delete_instruction(params: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const updated_data = await inspectionModel.updateOne({ _id: params.id }, { isDelete: true });
            resolve(updated_data);
        } catch (err) {
            reject(err)
        }
    });
}

export default {
    add,
    edit,
    details,
    list,
    updateStatus,
    delete_instruction
} as const;
