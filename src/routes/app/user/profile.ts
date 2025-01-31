import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { Router } from "express";
import profileController from "@controllers/user/profile";
import { StatusCodes } from "http-status-codes";
import { schemaValidator } from "@utils/schemaValidator";
import { updateProfileSchema } from "@validators/user";
const route = Router();

const { OK, CREATED } = StatusCodes;

export const p = {
    profileDetails: '/details',
    updateProfile: '/updateProfile'
}
route.get(p.profileDetails, verifyAuthToken, checkRole(['user']), async (req: any, res: any) => {
    const data = await profileController.userDetails(req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.put(p.updateProfile, verifyAuthToken, checkRole(['user']), schemaValidator(updateProfileSchema), async (req: any, res: any) => {
    const data = await profileController.updateProfile(req.body, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});


export default route;