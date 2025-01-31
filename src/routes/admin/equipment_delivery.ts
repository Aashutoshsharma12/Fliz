import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
import equipmentController from "@controllers/admin/equipmentDelivery";
import { editEquipmentBasicDetailsSchema, equipment_addressDelete, equipment_mediaDelete, equipmentVerification, listDelivery_Equipment, statusValidator } from "@validators/adminValidator";
const equipmentRouter = Router();

const p = {
    list: "/list",
    edit: "/edit",
    // editAddress: "/editAddress",
    details: "/details/:id",
    delete: "/delete/:id",
    changeStatus: "/updateStatus/:id",
    verificationStatus: "/verificationStatus",
    delete_images_videos: '/delete_images_videos',
    delete_address: '/delete_address'

}
const { OK } = StatusCodes;
equipmentRouter.get(p.list, verifyAuthToken, checkRole(["admin"]), schemaValidator_forQueryReq(listDelivery_Equipment), async (req, res) => {
    const data = await equipmentController.listEquipment(req?.query, req?.headers);
    res.status(OK).json({ code: OK, data })
})

equipmentRouter.put(p.edit, verifyAuthToken, checkRole(["admin"]), schemaValidator(editEquipmentBasicDetailsSchema), async (req, res) => {
    const data = await equipmentController.editEquipment(req?.body, req?.headers);
    res.status(OK).json({ code: OK, data })
})

// equipmentRouter.patch(p.editAddress, verifyAuthToken, checkRole(["admin"]), schemaValidator(editEquipmentAddressDetailsSchema), async (req, res) => {
//     const data = await equipmentController.addEditEquipment_addressDetails(req?.body, req?.headers);
//     res.status(OK).json({ code: OK, data })
// })

equipmentRouter.get(p.details, verifyAuthToken, checkRole(["admin"]), async (req, res) => {
    const data = await equipmentController.equipmentDeliveryDetails(req?.params, req?.headers);
    res.status(OK).json({ code: OK, data })
})

equipmentRouter.patch(p.delete, verifyAuthToken, checkRole(["admin"]), async (req, res) => {
    const data = await equipmentController.deleteDeliveryDetails(req?.params, req?.headers);
    res.status(OK).json({ code: OK, data })
})

equipmentRouter.patch(p.changeStatus, verifyAuthToken, checkRole(["admin"]), schemaValidator_forQueryReq(statusValidator), async (req, res) => {
    const data = await equipmentController.statusChange(req?.params, req?.query, req?.headers);
    res.status(OK).json({ code: OK, data })
})

equipmentRouter.patch(p.verificationStatus, verifyAuthToken, checkRole(["admin"]), schemaValidator_forQueryReq(equipmentVerification), async (req, res) => {
    const data = await equipmentController.equipmentVerification(req?.query, req?.headers);
    res.status(OK).json({ code: OK, data })
})

equipmentRouter.patch(p.delete_images_videos, verifyAuthToken, checkRole(["admin"]), schemaValidator(equipment_mediaDelete), async (req, res) => {
    const data = await equipmentController.delete_images_videos(req?.body, req?.headers);
    res.status(OK).json({ code: OK, data })
})

equipmentRouter.patch(p.delete_address, verifyAuthToken, checkRole(["admin"]), schemaValidator(equipment_addressDelete), async (req, res) => {
    const data = await equipmentController.delete_address(req?.body, req?.headers);
    res.status(OK).json({ code: OK, data })
})

export default equipmentRouter;