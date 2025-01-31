import { Router } from "express";
import chatController from "@controllers/common_api/chat";
import { StatusCodes } from "http-status-codes";
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { messages } from "@Custom_message";
import { setTime_outSchema } from "@validators/common";
const route = Router();
const { OK, CREATED } = StatusCodes
export const p = {
    setTime_out: "/setTime_out",
    messageList: '/messageList/:id',
    update_messageStatus: '/update_messageStatus/:id/:sendTo',
    update_messageStatus_during_online: '/update_messageStatus_during_online/:id/:sendTo',
    user_companyList: '/user_companyList'
}


route.patch(p.setTime_out, verifyAuthToken, checkRole(['renter_user', 'delivery_user']), schemaValidator_forQueryReq(setTime_outSchema), async (req: any, res: any) => {
    const data = await chatController.setTime_out(req.user.id, req.query, req.headers);
    res.status(CREATED).json({ data, code: CREATED });
});

route.get(p.messageList, async (req: any, res: any) => {
    const data = await chatController.messageList(req.params.id, req.headers);
    res.status(OK).json({ data, code: OK });
});

route.patch(p.update_messageStatus, verifyAuthToken, checkRole(['user', 'renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await chatController.update_messageStatus(req.user.id, req.params.id, req.params.sendTo, req.headers);
    res.status(CREATED).json({ data, code: CREATED });
});

route.patch(p.update_messageStatus_during_online, async (req: any, res: any) => {
    const data = await chatController.update_messageStatus_during_online(req.params.id, req.params.sendTo, req.headers);
    res.status(CREATED).json({ data, code: CREATED });
});

route.get(p.user_companyList, verifyAuthToken, checkRole(['user', 'renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await chatController.user_companyList(req.user.id, req.query, req.headers);
    res.status(OK).json({ data, code: OK });
});


export default route;