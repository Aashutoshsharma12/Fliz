import { Router } from "express";
import capacityAdminController from "@controllers/admin/capacity";
import { StatusCodes } from "http-status-codes";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
import { add_capacityValidator, update_statuscapacityValidator } from "@validators/adminValidator";
const route = Router();

const p = {
    add: "/add",
    edit: "/edit/:id",
    list: "/list",
    delete: "/delete/:id",
    updateStatus: "/updateStatus/:id",
    details: "/list/:id",
};

const { CREATED, OK } = StatusCodes;

route.post(p.add, verifyAuthToken, checkRole(['admin']), schemaValidator(add_capacityValidator), async (req: any, res: any) => {
    const data = await capacityAdminController.add(req.body, req.headers);
    res.status(CREATED).json({ data, code: CREATED })
});

route.patch(p.edit, verifyAuthToken, checkRole(['admin']), schemaValidator(add_capacityValidator), async (req: any, res: any) => {
    const data = await capacityAdminController.edit(req.body, req.params, req.headers);
    res.status(OK).json({ data, code: OK })
});
route.get(p.details, verifyAuthToken, checkRole(['admin']), async (req: any, res: any) => {
    const data = await capacityAdminController.details(req.params, req.headers);
    res.status(OK).json({ data, code: OK })
});
route.get(p.list, verifyAuthToken, checkRole(['admin']), async (req: any, res: any) => {
    const data = await capacityAdminController.list(req.query, req.headers);
    res.status(OK).json({ data, code: OK })
});
route.patch(p.updateStatus, verifyAuthToken, checkRole(['admin']), schemaValidator_forQueryReq(update_statuscapacityValidator), async (req: any, res: any) => {
    const data = await capacityAdminController.updateStatus(req?.params, req.query, req.headers);
    res.status(OK).json({ data, code: OK })
});
route.patch(p.delete, verifyAuthToken, checkRole(['admin']), async (req: any, res: any) => {
    const data = await capacityAdminController.delete_capacity(req.params, req.headers);
    res.status(OK).json({ data, code: OK })
});

export default route;