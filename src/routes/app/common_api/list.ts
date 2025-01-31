import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { Router } from "express";
import listController from "@controllers/common_api/list";
import { StatusCodes } from "http-status-codes";
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
const route = Router();

const { OK, CREATED } = StatusCodes;

export const p = {
    engineList: '/engineList',
    engineModelListBy_engineCompanyId: '/engineModelListBy_engineCompanyId/:id',
    categoryList_forDropdrown: '/categoryList_forDropdrown',
    sub_categoryListByCatId_forDropdrown: '/sub_categoryListByCatId_forDropdrown/:id',
    subSub_categoryListBySubCatId_forDropdrown: '/subSub_categoryListBySubCatId_forDropdrown/:id',
    vehicle_sizeTypeList: '/vehicle_sizeTypeList',
    allCatList: '/allCatList',
    vehicle_load_capacityList: '/vehicle_load_capacityList',
    cancelReasonList: '/cancelReasonList/:role',
    inspectionList: '/inspectionList/:role',
    rented_equipment_vehicleList: '/rented_equipment_vehicleList',
    most_rented_equipmentList: '/most_rented_equipmentList',
    most_rented_vehicleList: '/most_rented_vehicleList',
    notificationList: '/notificationList',
    un_readNotification_count: '/un_readNotification_count',
    faqList: '/faqList'
}

route.get(p.engineList, verifyAuthToken, checkRole(['renter_user', 'delivery_user', 'admin']), async (req: any, res: any) => {
    const data = await listController.engineList(req.user.id, req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.engineModelListBy_engineCompanyId, verifyAuthToken, checkRole(['renter_user', 'delivery_user', 'admin']), async (req: any, res: any) => {
    const data = await listController.engineModelListBy_engineCompanyId(req.params, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.categoryList_forDropdrown, verifyAuthToken, checkRole(['user', 'admin', 'renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await listController.categoryList_forDropdrown(req.user.id, req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.sub_categoryListByCatId_forDropdrown, verifyAuthToken, checkRole(['user', 'admin', 'renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await listController.sub_categoryListByCatId_forDropdrown(req.params, req.query, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.subSub_categoryListBySubCatId_forDropdrown, verifyAuthToken, checkRole(['user', 'admin', 'renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await listController.subSub_categoryListBySubCatId_forDropdrown(req.params, req.query, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.vehicle_sizeTypeList, verifyAuthToken, checkRole(['delivery_user', 'user', 'admin']), async (req: any, res: any) => {
    const data = await listController.vehicle_sizeTypeList(req.user.id, req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.allCatList, verifyAuthToken, checkRole(['user', 'renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await listController.allCatList(req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.vehicle_load_capacityList, verifyAuthToken, checkRole(['user', 'renter_user', 'delivery_user', 'admin']), async (req: any, res: any) => {
    const data = await listController.vehicle_load_capacityList(req.user.id, req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.cancelReasonList, verifyAuthToken, checkRole(['user', 'renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await listController.cancelReasonList(req.params.role, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.inspectionList, verifyAuthToken, checkRole(['user', 'delivery_user']), async (req: any, res: any) => {
    const data = await listController.inspectionList(req.user.id, req.params.role, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.rented_equipment_vehicleList, verifyAuthToken, checkRole(['renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await listController.rented_equipment_vehicleList(req.user.id, req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.most_rented_equipmentList, verifyAuthToken, checkRole(['renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await listController.most_rented_equipmentList(req.user.id, req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.most_rented_vehicleList, verifyAuthToken, checkRole(['renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await listController.most_rented_vehicleList(req.user.id, req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.notificationList, verifyAuthToken, checkRole(['user', 'renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await listController.notificationList(req.user.id, req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.un_readNotification_count, verifyAuthToken, checkRole(['user', 'renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await listController.un_readNotification_count(req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.faqList, verifyAuthToken, checkRole(['user', 'renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await listController.faqList(req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

export default route;