import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { Router } from "express";
import profileController from "@controllers/common_api/profile";
import { StatusCodes } from "http-status-codes";
import { schemaValidator } from "@utils/schemaValidator";
import { delete_certificateSchema, updateProfileSchema } from "@validators/common";
const route = Router();

const { OK, CREATED } = StatusCodes;

export const p = {
    profileDetails: '/details',
    updateProfile: '/updateProfile',
    update_certificates: '/update_certificates',
    update_toggle: '/update_toggle',
    delete_certificates: '/delete_certificates'
}

route.get(p.profileDetails, verifyAuthToken, checkRole(['renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await profileController.userDetails(req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.put(p.updateProfile, verifyAuthToken, checkRole(['renter_user', 'delivery_user']), schemaValidator(updateProfileSchema), async (req: any, res: any) => {
    const data = await profileController.updateProfile(req.body, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.patch(p.update_certificates, verifyAuthToken, checkRole(['renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await profileController.update_certificates(req.body, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.patch(p.delete_certificates, verifyAuthToken, checkRole(['renter_user', 'delivery_user']), schemaValidator(delete_certificateSchema), async (req: any, res: any) => {
    const data = await profileController.delete_certificates(req.body, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.update_toggle, verifyAuthToken, checkRole(['renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await profileController.update_toggle(req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

export default route;