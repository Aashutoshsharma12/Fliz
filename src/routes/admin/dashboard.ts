import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { Router } from "express";
import dashboardController from "@controllers/admin/dashboard";
import { StatusCodes } from "http-status-codes";
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
import { dashboardSchema, updateProfileSchema } from "@validators/common";
const route = Router();

const { OK, CREATED } = StatusCodes;

export const p = {
    dashbord_countApi: '/dashbord_countApi',
    graph_dataApi: '/graph_dataApi',
    graph_user_dataApi: '/graph_user_dataApi'
}

route.get(p.dashbord_countApi, verifyAuthToken, checkRole(['admin']), async (req: any, res: any) => {
    const data = await dashboardController.dashbord_countApi(req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.graph_dataApi, verifyAuthToken, checkRole(['admin']), schemaValidator_forQueryReq(dashboardSchema), async (req: any, res: any) => {
    const data = await dashboardController.graph_dataApi(req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.graph_user_dataApi, verifyAuthToken, checkRole(['admin']), schemaValidator_forQueryReq(dashboardSchema), async (req: any, res: any) => {
    const data = await dashboardController.graph_user_dataApi(req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});



export default route;