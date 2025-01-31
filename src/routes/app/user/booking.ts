import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { Router } from "express";
import bookingController from "@controllers/user/booking";
import { StatusCodes } from "http-status-codes";
import { schemaValidator } from "@utils/schemaValidator";
import { bookingSchema, order_statusSchema, orderCalculationSchema, ratingSchema } from "@validators/user";
const route = Router();

const { OK, CREATED } = StatusCodes;

export const p = {
    create_booking: '/create_booking',
    bookingDetails: '/bookingDetails/:id',
    bookingList: '/bookingList',
    cancelBooking: '/cancelBooking/:id',
    updateBooking: '/updateBooking/:id',
    update_orderStatus: '/update_orderStatus/:id',
    rating_reviews_on_order: '/rating_reviews_on_order/:id',
    booked_equipmentList: '/booked_equipmentList',
    order_price_calculation: '/order_price_calculation',
    order_installments: '/order_installments/:id'
}
route.post(p.create_booking, verifyAuthToken, checkRole(['user']), schemaValidator(bookingSchema), async (req: any, res: any) => {
    const data = await bookingController.create_booking(req.body, req.user.id, req.headers);
    res.status(CREATED).json({ data: data, code: CREATED });
});

route.patch(p.updateBooking, verifyAuthToken, checkRole(['user']), async (req: any, res: any) => {
    const data = await bookingController.updateBooking(req.body, req.params, req.user.id, req.headers);
    res.status(CREATED).json({ data: data, code: CREATED });
});

route.get(p.bookingDetails, verifyAuthToken, checkRole(['user']), async (req: any, res: any) => {
    const data = await bookingController.bookingDetails(req.params, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.bookingList, verifyAuthToken, checkRole(['user']), async (req: any, res: any) => {
    const data = await bookingController.bookingList(req.query, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.cancelBooking, verifyAuthToken, checkRole(['user']), async (req: any, res: any) => {
    const data = await bookingController.cancelBooking(req.body, req.params, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.patch(p.update_orderStatus, verifyAuthToken, checkRole(['user']), schemaValidator(order_statusSchema), async (req: any, res: any) => {
    const data = await bookingController.update_orderStatus(req.user.id, req.params.id, req.body, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.patch(p.rating_reviews_on_order, verifyAuthToken, checkRole(['user']), schemaValidator(ratingSchema), async (req: any, res: any) => {
    const data = await bookingController.rating_reviews_on_order(req.user.id, req.params.id, req.body, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.booked_equipmentList, verifyAuthToken, checkRole(['user']), async (req: any, res: any) => {
    const data = await bookingController.booked_equipmentList(req.user.id, req.query, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.post(p.order_price_calculation, verifyAuthToken, checkRole(['user']), schemaValidator(orderCalculationSchema), async (req: any, res: any) => {
    const data = await bookingController.order_price_calculation(req.user.id, req.body, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.order_installments, verifyAuthToken, checkRole(['user']), async (req: any, res: any) => {
    const data = await bookingController.order_installments(req.user.id, req.params.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});


export default route;