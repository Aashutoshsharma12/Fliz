import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { Router } from "express";
import favController from "@controllers/user/favourite";
import { StatusCodes } from "http-status-codes";
import { schemaValidator } from "@utils/schemaValidator";
import { favSchema } from "@validators/user";
const route = Router();

const { OK, CREATED } = StatusCodes;

export const p = {
    addFav: '/addFav',
    fav_list: '/fav_list'
}
route.post(p.addFav, verifyAuthToken, checkRole(['user']), schemaValidator(favSchema), async (req: any, res: any) => {
    const data = await favController.addFav(req.body, req.user.id, req.headers);
    res.status(CREATED).json({ data: data, code: CREATED });
});

route.get(p.fav_list, verifyAuthToken, checkRole(['user']), async (req: any, res: any) => {
    const data = await favController.fav_list(req.user.id, req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});


export default route;