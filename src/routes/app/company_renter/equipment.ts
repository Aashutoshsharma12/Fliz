import { Router } from "express";
import equipmentController from "@controllers/company_renter/equipment";
import { StatusCodes } from "http-status-codes";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { messages } from "@Custom_message";
import { schemaValidator } from "@utils/schemaValidator";
import { addEquipmentBasicDetailsSchema, deleteAddressSchema, deleteImageSchema, editEquipmentAddressDetailsSchema, editEquipmentBasicDetailsSchema, editEquipmentMediaDetailsSchema } from "@validators/renter";
const route = Router();
const { OK, CREATED } = StatusCodes
export const p = {
    add: "/add",
    editMedia: "/editMedia",
    editAddress: "/editAddress",
    delete_address: "/delete_address",
    editBasicDetails: "/editBasicDetails",
    details: '/details/:id',
    list: '/list',
    deleteImage: '/deleteImage',
    delete: '/delete/:id'
}


route.post(p.add, verifyAuthToken, checkRole(['renter_user']), schemaValidator(addEquipmentBasicDetailsSchema), async (req: any, res: any) => {
    const data = await equipmentController.addEquipment_basicDetails(req.body, req.user.id, req.headers);
    res.status(CREATED).json({ data, code: CREATED });
});

route.put(p.editMedia, verifyAuthToken, checkRole(['renter_user']), schemaValidator(editEquipmentMediaDetailsSchema), async (req: any, res: any) => {
    const data = await equipmentController.addEditEquipment_mediaDetails(req.body, req.user.id, req.headers);
    res.status(CREATED).json({ data, code: CREATED });
});

route.put(p.editAddress, verifyAuthToken, checkRole(['renter_user']), schemaValidator(editEquipmentAddressDetailsSchema), async (req: any, res: any) => {
    const data = await equipmentController.addEditEquipment_addressDetails(req.body, req.user.id, req.headers);
    res.status(CREATED).json({ data, code: CREATED });
});

route.patch(p.delete_address, verifyAuthToken, checkRole(['renter_user']), schemaValidator(deleteAddressSchema), async (req: any, res: any) => {
    const data = await equipmentController.delete_address(req.body, req.user.id, req.headers);
    res.status(OK).json({ data, code: OK });
});

route.put(p.editBasicDetails, verifyAuthToken, checkRole(['renter_user']), schemaValidator(editEquipmentBasicDetailsSchema), async (req: any, res: any) => {
    const data = await equipmentController.editEquipment_basicDetails(req.body, req.user.id, req.headers);
    res.status(CREATED).json({ data, code: CREATED });
});

route.get(p.details, verifyAuthToken, checkRole(['renter_user']), async (req: any, res: any) => {
    const data = await equipmentController.equipmentDetails(req.params, req.user.id, req.headers);
    res.status(OK).json({ data, code: OK });
});

route.get(p.list, verifyAuthToken, checkRole(['renter_user']), async (req: any, res: any) => {
    const data = await equipmentController.equipmentList(req.query, req.user.id, req.headers);
    res.status(OK).json({ data, code: OK });
});

route.put(p.deleteImage, verifyAuthToken, checkRole(['renter_user']), schemaValidator(deleteImageSchema), async (req: any, res: any) => {
    const data = await equipmentController.delete_images_videos(req.body, req.user.id, req.headers);
    res.status(OK).json({ data, code: OK });
});

route.get(p.delete, verifyAuthToken, checkRole(['renter_user']), async (req: any, res: any) => {
    const data = await equipmentController.deleteEquipment(req.params, req.user.id, req.headers);
    res.status(OK).json({ data, code: OK });
});


export default route;