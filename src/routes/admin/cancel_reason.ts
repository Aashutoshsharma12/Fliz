import cancelReasonController from "@controllers/admin/cancel_reason";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
import { add_Order_Cancel_Reason, statusValidator } from "@validators/adminValidator";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";
const cancel_reason_Router = Router();

const p = {
    add: "/add",
    edit: "/edit/:id",
    list: "/list",
    details: "/list/:id",
    delete: "/delete/:id",
    changeStatus: "/updateStatus/:id",
};
const { OK, CREATED } = StatusCodes;

cancel_reason_Router.post(p.add, verifyAuthToken, checkRole(["admin"]), schemaValidator(add_Order_Cancel_Reason), async (req, res) => {
    const data = await cancelReasonController.addReason(req?.body, req?.headers);
    res.status(CREATED).json({ code: CREATED, data });
})

cancel_reason_Router.patch(p.edit, verifyAuthToken, checkRole(["admin"]), schemaValidator(add_Order_Cancel_Reason), async (req, res) => {
    const data = await cancelReasonController.editReason(req?.params, req?.body, req?.headers);
    res.status(OK).json({ code: OK, data });
})

cancel_reason_Router.get(p.list, verifyAuthToken, checkRole(["admin"]), async (req, res) => {
    const data = await cancelReasonController.listReason(req?.query, req?.headers);
    res.status(OK).json({ code: OK, data });
})

cancel_reason_Router.get(p.details, verifyAuthToken, checkRole(["admin"]), async (req, res) => {
    const data = await cancelReasonController.detailsReason(req?.params, req?.headers);
    res.status(OK).json({ code: OK, data });
})

cancel_reason_Router.patch(p.delete, verifyAuthToken, checkRole(["admin"]), async (req, res) => {
    const data = await cancelReasonController.deleteReason(req?.params, req?.headers);
    res.status(OK).json({ code: OK, data });
})

cancel_reason_Router.patch(p.changeStatus, verifyAuthToken, checkRole(["admin"]), schemaValidator_forQueryReq(statusValidator), async (req, res) => {
    const data = await cancelReasonController.changeStatus(req?.params, req?.query, req?.headers);
    res.status(OK).json({ code: OK, data });
})

export default cancel_reason_Router;