import { Router } from "express";
const route = Router();
import vehicle_sizeTypeAdminController from "@controllers/admin/vehicle_sizeType";
import { StatusCodes } from "http-status-codes";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
import { add_deliveryTypeValidator, statusValidator } from "@validators/adminValidator";

const p = {
    add: "/add",
    edit: "/edit/:id",
    list: "/list",
    delete: "/delete/:id",
    updateStatus: "/updateStatus/:id",
    details: "/list/:id",
};

const { CREATED, OK } = StatusCodes;

route.post(p.add, verifyAuthToken, checkRole(['admin']), schemaValidator(add_deliveryTypeValidator), async (req: any, res: any) => {
    const data = await vehicle_sizeTypeAdminController.add(req.body, req.headers);
    res.status(CREATED).json({ code: CREATED, data })
})
route.patch(p.edit, verifyAuthToken, checkRole(['admin']), schemaValidator(add_deliveryTypeValidator), async (req: any, res: any) => {
    const data = await vehicle_sizeTypeAdminController.edit(req?.params, req.body, req.headers);
    res.status(OK).json({ code: OK, data })
})
route.get(p.details, verifyAuthToken, checkRole(['admin']), async (req: any, res: any) => {
    const data = await vehicle_sizeTypeAdminController.details(req.params, req.headers);
    res.status(OK).json({ code: OK, data })
})
route.get(p.list, verifyAuthToken, checkRole(['admin']), async (req: any, res: any) => {
    const data = await vehicle_sizeTypeAdminController.list(req.query, req.headers);
    res.status(OK).json({ code: OK, data })
})
route.patch(p.updateStatus, verifyAuthToken, checkRole(['admin']), schemaValidator_forQueryReq(statusValidator), async (req: any, res: any) => {
    const data = await vehicle_sizeTypeAdminController.updateStatus(req?.params, req.query, req.headers);
    res.status(OK).json({ code: OK, data })
})

route.patch(p.delete, verifyAuthToken, checkRole(['admin']), async (req: any, res: any) => {
    const data = await vehicle_sizeTypeAdminController.delete_delivery_type(req?.params, req.headers);
    res.status(OK).json({ code: OK, data })
})

export default route;
