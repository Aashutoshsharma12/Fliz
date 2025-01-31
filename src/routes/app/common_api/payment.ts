import { Router } from "express";
import paymnetController from "@controllers/common_api/payment";
import { StatusCodes } from "http-status-codes";
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { messages } from "@Custom_message";
import { createCustomerchema, generateInvoiceSchema, saveCardSchema, setTime_outSchema } from "@validators/common";
const route = Router();
const { OK, CREATED } = StatusCodes
export const p = {
    generate_downpaymentOrder_invoice: "/generate_downpaymentOrder_invoice",
    generateInstallment_invoice: '/generateInstallment_invoice/:installmentId',
    paymentDetails: '/paymentDetails/:id',
    paymentList: '/paymentList',
    createCustomer: '/createCustomer',
    deleteCustomer: '/deleteCustomer/:id',
    createPayment: '/createPayment',
    successPayment: '/successPayment',
    cancelPayment: '/cancelPayment',
    verifyPayment: '/verifyPayment/:id',
    saveCard: '/saveCard',
    deleteCard: '/deleteCard/:cardId/:customerId',
    cardList: '/cardList/:customerId'
}


route.post(p.generate_downpaymentOrder_invoice, verifyAuthToken, checkRole(['user']), schemaValidator(generateInvoiceSchema), async (req: any, res: any) => {
    const data = await paymnetController.generate_downpaymentOrder_invoice(req.user.id, req.body, req.headers);
    res.status(CREATED).json({ data, code: CREATED });
});

route.post(p.generateInstallment_invoice, verifyAuthToken, checkRole(['user']), schemaValidator(generateInvoiceSchema), async (req: any, res: any) => {
    const data = await paymnetController.generateInstallment_invoice(req.user.id, req.params.installmentId, req.body, req.headers);
    res.status(CREATED).json({ data, code: CREATED });
});


route.get(p.paymentDetails, verifyAuthToken, checkRole(['user', 'renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await paymnetController.paymentDetails(req.user.id, req.params.id, req.headers);
    res.status(OK).json({ data, code: OK });
});

route.get(p.paymentList, verifyAuthToken, checkRole(['user', 'renter_user', 'delivery_user']), async (req: any, res: any) => {
    const data = await paymnetController.paymentList(req.user.id, req.query, req.headers);
    res.status(OK).json({ data, code: OK });
});

route.post(p.createCustomer, async (req: any, res: any) => {
    const data = await paymnetController.createCustomer(req.body);
    res.status(CREATED).json({ data, code: CREATED });
});

route.delete(p.deleteCustomer, async (req: any, res: any) => {
    const data = await paymnetController.deleteCustomer(req.params.id);
    res.status(OK).json({ data, code: OK });
});

route.post(p.createPayment,verifyAuthToken,checkRole(['user']),schemaValidator(createCustomerchema), async (req: any, res: any) => {
    const data = await paymnetController.createPayment(req.body, req.user.id, req.headers);
    res.status(CREATED).json({ data, code: CREATED });
});

route.get(p.successPayment, async (req: any, res: any) => {
    const data = await paymnetController.successPayment(req.query);
    res.status(OK).json({ data, code: OK });
});

route.get(p.cancelPayment, async (req: any, res: any) => {
    const data = await paymnetController.cancelPayment(req.query);
    res.status(OK).json({ data, code: OK });
});

route.get(p.verifyPayment, async (req: any, res: any) => {
    const data = await paymnetController.verifyPayment(req.params.id);
    res.status(OK).json({ data, code: OK });
});

route.post(p.saveCard, verifyAuthToken, checkRole(['user']),schemaValidator(saveCardSchema), async (req: any, res: any) => {
    const data = await paymnetController.saveCard(req.user.id, req.body, req.headers);
    res.status(CREATED).json({ data, code: CREATED });
});

route.delete(p.deleteCard, verifyAuthToken, checkRole(['user']), async (req: any, res: any) => {
    const data = await paymnetController.deleteCard(req.user.id, req.params.cardId, req.params.customerId, req.headers);
    res.status(OK).json({ data, code: OK });
});

route.get(p.cardList, verifyAuthToken, checkRole(['user']), async (req: any, res: any) => {
    const data = await paymnetController.cardList(req.user.id, req.params.customerId, req.headers);
    res.status(OK).json({ data, code: OK });
});




export default route;