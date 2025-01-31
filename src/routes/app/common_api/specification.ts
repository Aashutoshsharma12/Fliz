import { Router } from "express";
import specificationController from "@controllers/common_api/specification";
import { StatusCodes } from "http-status-codes";
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { messages } from "@Custom_message";
const route = Router();
const { OK, CREATED } = StatusCodes
export const p = {
    specificationList: "/specificationList"
}

route.get(p.specificationList, verifyAuthToken, checkRole(['delivery_user', 'renter_user']), async (req: any, res: any) => {
    const data = await specificationController.specificationList(req.query, req.headers);
    res.status(OK).json({ data, code: OK })
});

export default route;
