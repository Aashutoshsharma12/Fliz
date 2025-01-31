import versionController from "@controllers/admin/version";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { schemaValidator } from "@utils/schemaValidator";
import { addEditVersion } from "@validators/adminValidator";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";
const versionRouter = Router();

const p = {
    addEdit: "/add_edit",
    details: "/list"
}
const { CREATED, OK } = StatusCodes;

versionRouter.post(p.addEdit, verifyAuthToken, checkRole(["admin"]), schemaValidator(addEditVersion), async (req, res) => {
    const data = await versionController.addVersion(req?.body, req?.headers);
    res.status(CREATED).json({ code: CREATED, data });
})

versionRouter.get(p.details, verifyAuthToken, checkRole(["admin"]), async (req, res) => {
    const data = await versionController.versionDetails(req.headers);
    res.status(OK).json({ code: OK, data });
})

export default versionRouter;