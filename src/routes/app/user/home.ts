import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { Router } from "express";
import homeController from "@controllers/user/home";
import { StatusCodes } from "http-status-codes";
import { schemaValidator } from "@utils/schemaValidator";
const route = Router();

const { OK, CREATED } = StatusCodes;

export const p = {
    renter_deliveryList: '/renter_deliveryList',
    vehilceList: '/vehilceList/:id',
    vehicleDetails: '/vehicleDetails/:id',
    equipmentList: '/equipmentList/:id',
    equipmentDetails: '/equipmentDetails/:id',
    addVisit_user: '/addVisit_user/:id',
    recommendedProduct: '/recommendedProduct',
    check_equipmentAvailability: '/check_equipmentAvailability',
    upcomming_installment: '/upcomming_installment',
    check_user_forB2B: '/check_user_forB2B/:id'
}

route.get(p.renter_deliveryList, verifyAuthToken, checkRole(['user']), async (req: any, res: any) => {
    const data = await homeController.renter_deliveryList(req.query, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.vehilceList, verifyAuthToken, checkRole(['user']), async (req: any, res: any) => {
    const data = await homeController.vehilceList(req.params.id, req.query, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.vehicleDetails, verifyAuthToken, checkRole(['user']), async (req: any, res: any) => {
    const data = await homeController.vehicleDetails(req.params.id, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.equipmentList, verifyAuthToken, checkRole(['user']), async (req: any, res: any) => {
    const data = await homeController.equipmentList(req.params.id, req.query, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.equipmentDetails, verifyAuthToken, checkRole(['user']), async (req: any, res: any) => {
    const data = await homeController.equipmentDetails(req.params.id, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.addVisit_user, verifyAuthToken, checkRole(['user']), async (req: any, res: any) => {
    const data = await homeController.addVisit_user(req.user.id, req.params.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.recommendedProduct, verifyAuthToken, checkRole(['user']), async (req: any, res: any) => {
    const data = await homeController.recommendedProduct(req.user.id, req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.check_equipmentAvailability, verifyAuthToken, checkRole(['user']), async (req: any, res: any) => {
    const data = await homeController.check_equipmentAvailability(req.user.id, req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.upcomming_installment, verifyAuthToken, checkRole(['user']), async (req: any, res: any) => {
    const data = await homeController.upcomming_installment(req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.check_user_forB2B, verifyAuthToken, checkRole(['user']), async (req: any, res: any) => {
    const data = await homeController.check_user_forB2B(req.user.id, req.params.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

export default route;