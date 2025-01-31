import { Router } from "express";
import orderController from "@controllers/company_delivery/order";
import { StatusCodes } from "http-status-codes";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { messages } from "@Custom_message";
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
import { equipment_order_inspectionSchema, order_status_vehicleSchema, order_statusSchema } from "@validators/renter";
const route = Router();
const { OK, CREATED } = StatusCodes
export const p = {
    list: '/list',
    orderDetails: '/orderDetails/:id',
    update_orderStatus: '/update_orderStatus/:id',
    equipment_inspectionByTransporter: '/equipment_inspectionByTransporter'
}


route.get(p.list, verifyAuthToken, checkRole(['delivery_user']), async (req: any, res: any) => {
    const data = await orderController.orderList(req.user.id, req.query, req.headers);
    res.status(OK).json({ data, code: OK });
});

route.get(p.orderDetails, verifyAuthToken, checkRole(['delivery_user']), async (req: any, res: any) => {
    const data = await orderController.orderDetails(req.user.id, req.params.id, req.headers);
    res.status(OK).json({ data, code: OK });
});

route.patch(p.update_orderStatus, verifyAuthToken, checkRole(['delivery_user']), schemaValidator(order_status_vehicleSchema), async (req: any, res: any) => {
    const data = await orderController.update_orderStatus(req.user.id, req.params.id, req.body, req.headers);
    res.status(CREATED).json({ data, code: CREATED });
});

route.patch(p.equipment_inspectionByTransporter, verifyAuthToken, checkRole(['delivery_user', 'user']), schemaValidator(equipment_order_inspectionSchema), async (req: any, res: any) => {
    const data = await orderController.equipment_inspectionByTransporter(req.user.id, req.body, req.headers);
    res.status(CREATED).json({ data, code: CREATED });
});

export default route;