import { raise_queryModel } from "@models/index";
import { identityGenerator } from "@utils/helpers";

function raise_ticket(userId: any, body: any, header: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const count = await raise_queryModel.countDocuments({ orderId: body.orderId, userId: userId })
            body.userId = userId
            body.ticketId = identityGenerator('raise_query', count)
            const data = await raise_queryModel.create(body);
            resolve(data);
        } catch (err) {
            reject(err)
        }
    });
}

function update_ticketStatus(userId: any, queryId: any, header: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await raise_queryModel.findOneAndUpdate({ _id: queryId }, { status: "resolve" }, { new: true, fields: { orderId: 1, status: 1 } });
            resolve(data);
        } catch (err) {
            reject(err)
        }
    });
}

function list(userId: any, query: any, header: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { page = 1, perPage = 10, status, orderId } = query
            let obj: any = {
                isDelete: false,
                // userId: userId
            }
            if (orderId) {
                obj = {
                    ...obj,
                    orderId: orderId
                }
            }
            if (status) {
                obj = {
                    ...obj,
                    status: status
                }
            }
            const [list, count] = await Promise.all([
                raise_queryModel.find(obj).skip((perPage * page) - perPage).limit(perPage),
                raise_queryModel.countDocuments(obj)
            ]);
            resolve({ itemList: list, count: count });
        } catch (err) {
            reject(err)
        }
    });
}

export default {
    raise_ticket,
    list,
    update_ticketStatus
} as const;