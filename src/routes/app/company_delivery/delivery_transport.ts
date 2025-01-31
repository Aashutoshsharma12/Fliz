import { Router } from "express";
import vehicleController from "@controllers/company_delivery/delivery_transport";
import { StatusCodes } from "http-status-codes";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { messages } from "@Custom_message";
import { schemaValidator } from "@utils/schemaValidator";
import { addVehicleBasicDetailsSchema, deleteAddressSchema, deleteImageSchema, editVehicleAddressDetailsSchema, editVehicleBasicDetailsSchema, editVehicleMediaDetailsSchema } from "@validators/delivery_vehicle";

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
    deleteImages: '/deleteImages',
    delete: '/delete/:id',
    vehicleDetails_web: '/vehicleDetails_web/:id'
}

route.post(p.add, verifyAuthToken, checkRole(['delivery_user']), schemaValidator(addVehicleBasicDetailsSchema), async (req: any, res: any) => {
    const data = await vehicleController.addVehicle_basicDetails(req.body, req.user.id, req.headers);
    res.status(CREATED).json({ data, code: CREATED });
});

route.put(p.editMedia, verifyAuthToken, checkRole(['delivery_user']), schemaValidator(editVehicleMediaDetailsSchema), async (req: any, res: any) => {
    const data = await vehicleController.addEditVehicle_mediaDetails(req.body, req.user.id, req.headers);
    res.status(CREATED).json({ data, code: CREATED });
});

route.put(p.editAddress, verifyAuthToken, checkRole(['delivery_user']), schemaValidator(editVehicleAddressDetailsSchema), async (req: any, res: any) => {
    const data = await vehicleController.addEditVehicle_addressDetails(req.body, req.user.id, req.headers);
    res.status(CREATED).json({ data, code: CREATED });
});

route.patch(p.delete_address, verifyAuthToken, checkRole(['delivery_user']), schemaValidator(deleteAddressSchema), async (req: any, res: any) => {
    const data = await vehicleController.delete_address(req.body, req.user.id, req.headers);
    res.status(OK).json({ data, code: OK });
});

route.put(p.editBasicDetails, verifyAuthToken, checkRole(['delivery_user']), schemaValidator(editVehicleBasicDetailsSchema), async (req: any, res: any) => {
    const data = await vehicleController.editVehicle_basicDetails(req.body, req.user.id, req.headers);
    res.status(CREATED).json({ data, code: CREATED });
});

route.get(p.details, verifyAuthToken, checkRole(['delivery_user']), async (req: any, res: any) => {
    const data = await vehicleController.vehicleDetails(req.params, req.user.id, req.headers);
    res.status(OK).json({ data, code: OK });
});

route.get(p.vehicleDetails_web, verifyAuthToken, checkRole(['delivery_user']), async (req: any, res: any) => {
    const data = await vehicleController.vehicleDetails_web(req.params, req.user.id, req.headers);
    res.status(OK).json({ data, code: OK });
});

route.get(p.list, verifyAuthToken, checkRole(['delivery_user']), async (req: any, res: any) => {
    const data = await vehicleController.vehicleList(req.query, req.user.id, req.headers);
    res.status(OK).json({ data, code: OK });
});

route.put(p.deleteImages, verifyAuthToken, checkRole(['delivery_user']), schemaValidator(deleteImageSchema), async (req: any, res: any) => {
    const data = await vehicleController.delete_images_videos(req.body, req.user.id, req.headers);
    res.status(OK).json({ data, code: OK });
});

route.get(p.delete, verifyAuthToken, checkRole(['delivery_user']), async (req: any, res: any) => {
    const data = await vehicleController.deleteVehicle(req.params, req.user.id, req.headers);
    res.status(OK).json({ data, code: OK });
});

export default route;