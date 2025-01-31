import { checkRole, verify_guestAuthToken } from "@utils/authValidator";
import { Router } from "express";
import guestUserController from "@controllers/common_api/guest_user";
import { StatusCodes } from "http-status-codes";
import { schemaValidator } from "@utils/schemaValidator";
const route = Router();

const { OK, CREATED } = StatusCodes;

export const p = {
    create_guestUser: '/create_guestUser',
    add_guestUserActivity: '/add_guestUserActivity',
    categoryList: '/categoryList',
    renter_deliveryList: '/renter_deliveryList',
    vehilceList: '/vehilceList/:id',
    vehicleDetails: '/vehicleDetails/:id',
    equipmentList: '/equipmentList/:id',
    equipmentDetails: '/equipmentDetails/:id',
    addVisit_user: '/addVisit_user/:id',
    faqList: '/faqList',
    top_companies: '/top_companies',
    sub_categoryListByCatId_forDropdrown: '/sub_categoryListByCatId_forDropdrown/:id',
    subSub_categoryListBySubCatId_forDropdrown: '/subSub_categoryListBySubCatId_forDropdrown/:id',
    vehicle_load_capacityList: '/vehicle_load_capacityList',
    vehicle_sizeTypeList: '/vehicle_sizeTypeList',
    recommendedProduct: '/recommendedProduct'
}

route.get(p.create_guestUser, async (req: any, res: any) => {
    const data = await guestUserController.create_guestUser(req.headers);
    res.status(CREATED).json({ data: data, code: CREATED });
});

route.patch(p.add_guestUserActivity, verify_guestAuthToken, checkRole(['guest_user']), async (req: any, res: any) => {
    const data = await guestUserController.add_guestUserActivity(req.user.id, req.body, req.headers);
    res.status(CREATED).json({ data: data, code: CREATED });
});

route.get(p.categoryList, verify_guestAuthToken, checkRole(['guest_user']), async (req: any, res: any) => {
    const data = await guestUserController.categoryList(req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.renter_deliveryList, verify_guestAuthToken, checkRole(['guest_user']), async (req: any, res: any) => {
    const data = await guestUserController.renter_deliveryList(req.query, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.vehilceList, verify_guestAuthToken, checkRole(['guest_user']), async (req: any, res: any) => {
    const data = await guestUserController.vehilceList(req.params.id, req.query, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.vehicleDetails, verify_guestAuthToken, checkRole(['guest_user']), async (req: any, res: any) => {
    const data = await guestUserController.vehicleDetails(req.params.id, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.equipmentList, verify_guestAuthToken, checkRole(['guest_user']), async (req: any, res: any) => {
    const data = await guestUserController.equipmentList(req.params.id, req.query, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.equipmentDetails, verify_guestAuthToken, checkRole(['guest_user']), async (req: any, res: any) => {
    const data = await guestUserController.equipmentDetails(req.params.id, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.addVisit_user, verify_guestAuthToken, checkRole(['guest_user']), async (req: any, res: any) => {
    const data = await guestUserController.addVisit_user(req.user.id, req.params.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.faqList, verify_guestAuthToken, checkRole(['guest_user']), async (req: any, res: any) => {
    const data = await guestUserController.faqList(req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.top_companies, verify_guestAuthToken, checkRole(['guest_user']), async (req: any, res: any) => {
    const data = await guestUserController.top_companies(req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.sub_categoryListByCatId_forDropdrown, verify_guestAuthToken, checkRole(['guest_user']), async (req: any, res: any) => {
    const data = await guestUserController.sub_categoryListByCatId_forDropdrown(req.params, req.query, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.subSub_categoryListBySubCatId_forDropdrown, verify_guestAuthToken, checkRole(['user', 'guest_user', 'renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await guestUserController.subSub_categoryListBySubCatId_forDropdrown(req.params, req.query, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.vehicle_sizeTypeList, verify_guestAuthToken, checkRole(['guest_user']), async (req: any, res: any) => {
    const data = await guestUserController.vehicle_sizeTypeList(req.user.id, req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.vehicle_load_capacityList, verify_guestAuthToken, checkRole(['guest_user']), async (req: any, res: any) => {
    const data = await guestUserController.vehicle_load_capacityList(req.user.id, req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.recommendedProduct, verify_guestAuthToken, checkRole(['guest_user']), async (req: any, res: any) => {
    const data = await guestUserController.recommendedProduct(req.user.id, req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

export default route;