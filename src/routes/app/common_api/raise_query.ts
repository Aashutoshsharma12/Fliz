import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { Router } from "express";
import raise_queryController from "@controllers/common_api/raise_query";
import { StatusCodes } from "http-status-codes";
import { schemaValidator } from "@utils/schemaValidator";
import { delete_certificateSchema, raise_querySchema, updateProfileSchema } from "@validators/common";
const route = Router();

const { OK, CREATED } = StatusCodes;

export const p = {
    raise_ticket: '/raise_ticket',
    update_ticketStatus: '/update_ticketStatus/:id',
    list: '/list'
}

route.post(p.raise_ticket, verifyAuthToken, checkRole(['user']), schemaValidator(raise_querySchema), async (req: any, res: any) => {
    const data = await raise_queryController.raise_ticket(req.user.id, req.body, req.headers);
    res.status(CREATED).json({ data: data, code: CREATED });
});

route.get(p.update_ticketStatus, verifyAuthToken, checkRole(['delivery_user', 'renter_user', 'user']), async (req: any, res: any) => {
    const data = await raise_queryController.update_ticketStatus(req.user.id, req.params.id, req.headers);
    res.status(CREATED).json({ data: data, code: CREATED });
});

route.get(p.list, verifyAuthToken, checkRole(['renter_user', 'delivery_user', 'user']), async (req: any, res: any) => {
    const data = await raise_queryController.list(req.user.id, req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

export default route;