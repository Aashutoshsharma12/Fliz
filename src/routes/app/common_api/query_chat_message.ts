import { Router } from "express";
import query_chatController from "@controllers/common_api/query_chat_message";
import { StatusCodes } from "http-status-codes";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
const route = Router();
const { OK, CREATED } = StatusCodes
export const p = {
    messageList: '/messageList/:id',
    update_messageStatus: '/update_messageStatus/:id/:sendTo',
    update_messageStatus_during_online: '/update_messageStatus_during_online/:id/:sendTo'
}

route.get(p.messageList, verifyAuthToken, checkRole(['user', 'renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await query_chatController.messageList(req.params.id, req.headers);
    res.status(OK).json({ data, code: OK });
});

route.patch(p.update_messageStatus, verifyAuthToken, checkRole(['user', 'renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await query_chatController.update_messageStatus(req.user.id, req.params.id, req.params.sendTo, req.headers);
    res.status(CREATED).json({ data, code: CREATED });
});

route.patch(p.update_messageStatus_during_online, async (req: any, res: any) => {
    const data = await query_chatController.update_messageStatus_during_online(req.params.id, req.params.sendTo, req.headers);
    res.status(CREATED).json({ data, code: CREATED });
});


export default route;