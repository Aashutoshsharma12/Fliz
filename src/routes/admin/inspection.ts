import { Router } from "express";
import inspectionAdminController from "@controllers/admin/inspection";
import { StatusCodes } from "http-status-codes";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
import { add_capacityValidator, add_instructionValidator, edit_instructionValidator, update_status_instructionValidator, update_statuscapacityValidator } from "@validators/adminValidator";
const route = Router();

const p = {
    add: "/add",
    edit: "/edit",
    list: "/list",
    delete: "/delete/:id",
    updateStatus: "/updateStatus",
    details: "/details/:id",
};

const { CREATED, OK } = StatusCodes;

route.post(p.add, schemaValidator(add_instructionValidator), async (req: any, res: any) => {
    const data = await inspectionAdminController.add(req.body, req.query, req.headers);
    res.status(CREATED).json({ data, code: CREATED })
});

route.patch(p.edit, schemaValidator(edit_instructionValidator), async (req: any, res: any) => {
    const data = await inspectionAdminController.edit(req.body, req.query, req.headers);
    res.status(OK).json({ data, code: OK })
});
route.get(p.details, async (req: any, res: any) => {
    console.log('inside api:rohit')
    const data = await inspectionAdminController.details(req.params, req.headers);
    res.status(OK).json({ data, code: OK })
});
route.get(p.list, async (req: any, res: any) => {
    const data = await inspectionAdminController.list(req.query, req.headers);
    res.status(OK).json({ data, code: OK })
});
route.get(p.updateStatus, schemaValidator_forQueryReq(update_status_instructionValidator), async (req: any, res: any) => {
    const data = await inspectionAdminController.updateStatus(req.query, req.headers);
    res.status(OK).json({ data, code: OK })
});
route.delete(p.delete, async (req: any, res: any) => {
    console.log('inside api')
    const data = await inspectionAdminController.delete_instruction(req.params, req.headers);
    res.status(OK).json({ data, code: OK })
});

export default route;