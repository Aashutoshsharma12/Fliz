import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { Router } from "express";
import bankController from "@controllers/common_api/bank_info";
import { StatusCodes } from "http-status-codes";
import { schemaValidator } from "@utils/schemaValidator";
import { addBankDetailsSchema, updateProfileSchema } from "@validators/common";
const route = Router();

const { OK, CREATED } = StatusCodes;

export const p = {
    bankDetails: '/bankDetails',
    addAndUpdate_bankDetails: '/addAndUpdate_bankDetails'
}

route.get(p.bankDetails, verifyAuthToken, checkRole(['user', 'renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await bankController.bankDetails(req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.post(p.addAndUpdate_bankDetails, verifyAuthToken, checkRole(['user', 'renter_user', 'delivery_user']), schemaValidator(addBankDetailsSchema), async (req: any, res: any) => {
    const data = await bankController.addAndUpdate_bankDetails(req.body, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

export default route;