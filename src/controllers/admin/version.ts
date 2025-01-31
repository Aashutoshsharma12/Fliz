import { messages } from "@Custom_message";
import versionModel from "@models/version";
import { CustomError } from "@utils/errors";
import { StatusCodes } from "http-status-codes";

function addVersion(body: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const { language } = headers;
        const message = messages(language);
        try {
            const data1 = await versionModel.findOneAndUpdate({ isDelete: false }, body, { new: true });
            if (data1) {
                resolve(data1);
            }  else {
                const data = await versionModel.create(body);
                resolve(data);
            }
        }
        catch (error) {
            reject(error);
        }
    })
}

function versionDetails(headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { language } = headers;
            const message = messages(language);
            const data = await versionModel.findOne({isDelete: false });
            console.log(data)
            resolve(data);
        }
        catch (error) {
            reject(error);
        }
    })
}





export default { addVersion, versionDetails } as const;