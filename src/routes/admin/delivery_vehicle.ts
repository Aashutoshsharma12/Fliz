import { checkRole, verifyAuthToken } from "@utils/authValidator";
import DeliveryController from "@controllers/admin/deliveryVehicle";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
import { deliveryVerification, editVehicleAddressDetailsSchema, editVehicleBasicDetailsSchema, listDelivery_Vehicle, statusValidator, vehicle_addressDelete, vehicle_mediaDelete } from "@validators/adminValidator";
const deliveryRouter = Router();

const p = {
    list: "/list",
    details: "/details/:id",
    edit: "/edit",
    editAddress: "/editAddress",
    delete: "/delete/:id",
    changeStatus: "/updateStatus/:id",
    verificationStatus: "/verificationStatus",
    delete_images_videos: '/delete_images_videos',
    delete_address: '/delete_address'
}

const { OK } = StatusCodes;
deliveryRouter.get(p.list, verifyAuthToken, checkRole(["admin"]), schemaValidator_forQueryReq(listDelivery_Vehicle), async (req, res) => {
    const data = await DeliveryController.listDelivery_Vehicle(req?.query, req?.headers);
    res.status(OK).json({ code: OK, data })
})

deliveryRouter.put(p.edit, verifyAuthToken, checkRole(["admin"]), schemaValidator(editVehicleBasicDetailsSchema), async (req, res) => {
    const data = await DeliveryController.editTransport(req?.body, req?.headers);
    res.status(OK).json({ code: OK, data })
})

deliveryRouter.get(p.details, verifyAuthToken, checkRole(["admin"]), async (req, res) => {
    const data = await DeliveryController.deliveryVehicleDetails(req?.params, req?.headers);
    res.status(OK).json({ code: OK, data })
})

deliveryRouter.patch(p.delete, verifyAuthToken, checkRole(["admin"]), async (req, res) => {
    const data = await DeliveryController.deleteDeliveryVehicle(req?.params, req?.headers);
    res.status(OK).json({ code: OK, data })
})

deliveryRouter.patch(p.changeStatus, verifyAuthToken, checkRole(["admin"]), schemaValidator_forQueryReq(statusValidator), async (req, res) => {
    const data = await DeliveryController.changeDeliveryStatus(req?.params, req?.query, req?.headers);
    res.status(OK).json({ code: OK, data })
})

deliveryRouter.patch(p.verificationStatus, verifyAuthToken, checkRole(["admin"]), schemaValidator_forQueryReq(deliveryVerification), async (req, res) => {
    const data = await DeliveryController.deliveryVerification(req?.query, req?.headers);
    res.status(OK).json({ code: OK, data })
})


deliveryRouter.patch(p.delete_images_videos, verifyAuthToken, checkRole(["admin"]), schemaValidator(vehicle_mediaDelete), async (req, res) => {
    const data = await DeliveryController.delete_images_videos(req?.body, req?.headers);
    res.status(OK).json({ code: OK, data })
})

deliveryRouter.patch(p.delete_address, verifyAuthToken, checkRole(["admin"]), schemaValidator(vehicle_addressDelete), async (req, res) => {
    const data = await DeliveryController.delete_address(req?.body, req?.headers);
    res.status(OK).json({ code: OK, data })
})

export default deliveryRouter;