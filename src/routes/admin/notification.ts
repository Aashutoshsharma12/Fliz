import notificationController from "@controllers/admin/notification";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { addNotificationValidator, deleteNotification_Schema } from "@validators/adminValidator";
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
const notificationRouter = Router();

const { CREATED, OK } = StatusCodes;
notificationRouter.post('/add', verifyAuthToken, checkRole(["admin"]), schemaValidator(addNotificationValidator), async (req, res) => {
    const data = await notificationController.saveNotification(req?.body, req?.headers);
    res.status(CREATED).json({ code: CREATED, data });
})

notificationRouter.get('/list', verifyAuthToken, checkRole(["admin"]), async (req, res) => {
    const data = await notificationController.listNotification(req?.query, req?.headers);
    res.status(OK).json({ code: OK, data });
})

notificationRouter.delete('/deleteNotification', verifyAuthToken, checkRole(["admin"]),  schemaValidator_forQueryReq(deleteNotification_Schema), async (req, res) => {
    const data = await notificationController.deleteNotification(req?.query, req?.headers)
    res.status(OK).json({ code: OK, data });
})

export default notificationRouter;