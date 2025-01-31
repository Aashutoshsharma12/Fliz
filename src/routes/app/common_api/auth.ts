import { Router } from "express";
import user_renter_deliveryController from "@controllers/common_api/auth";
import { StatusCodes } from "http-status-codes";
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
import { changePasswordSchema, detailsInfoSchema, forgotSchema1, loginSchema, sendOtpSchema, signUpSchema, updateNotificationSchema, verifyOtpSchema } from "@validators/common";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { messages } from "@Custom_message";
import { upload } from "@utils/multer";
const route = Router();
const { OK, CREATED } = StatusCodes
export const p = {
    add: "/signUp",
    login: "/login",
    details: "/details",
    forgotPassword: "/forgotPassword",
    re_generateAccessToken: '/re_generateAccessToken',
    logout: '/logout',
    changePassword: '/changePassword',
    deleteUser: '/deleteUser',
    updateNotification_status: '/updateNotification_status',
    user_company_details_Info: '/user_company_details_Info',
    switch_account: '/switch_account/:role',
    sendOtp: '/sendOtp',
    verifyOtp: '/verifyOtp'
}

/**
 * @swagger
 * /common/auth/signUp:
 *   post:
 *     summary: User, Renter, and Delivery sign Up
 *     description: Details
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phoneNumber
 *               - password
 *               - countryCode
 *               - address
 *               - city
 *               - state
 *               - country
 *               - lat
 *               - long
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: "User1"
 *               phoneNumber:
 *                 type: string
 *                 example: "8979012640"
 *               email:
 *                 type: string
 *                 example: "user1@gmail.com"
 *               countryCode:
 *                 type: string
 *                 example: "+91"
 *               password:
 *                 type: string
 *                 example: "User1212@"
 *               role:
 *                 type: string
 *                 example: "user"
 *               address:
 *                 type: string
 *                 example: "Noida Sector 63 B-Block"
 *               addressLine1:
 *                 type: string
 *                 example: "Noida Sector 63 B-Block"
 *               addressLine2:
 *                 type: string
 *                 example: "Noida Sector 63 B-Block"
 *               city:
 *                 type: string
 *                 example: "Noida"
 *               state:
 *                 type: string
 *                 example: "Uttar Pradesh"
 *               country:
 *                 type: string
 *                 example: "India"
 *               image:
 *                 type: string
 *                 example: "Image Url"
 *               company_license_frontSide:
 *                 type: string
 *                 example: "Image Url"
 *               company_license_backSide:
 *                 type: string
 *                 example: "Image Url"
 *               driving_license_frontSide:
 *                 type: string
 *                 example: "Image Url"
 *               driving_license_backSide:
 *                 type: string
 *                 example: "Image Url"
 *               truck_license_frontSide:
 *                 type: string
 *                 example: "Image Url"
 *               truck_license_backSide:
 *                 type: string
 *                 example: "Image Url"
 *               lat:
 *                 type: string
 *                 example: "28.6139"
 *               long:
 *                 type: string
 *                 example: "77.2090"
 *     responses:
 *       201:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "User1"
 *                     phoneNumber:
 *                       type: string
 *                       example: "8979012640"
 *                     email:
 *                       type: string
 *                       example: "user1@gmail.com"
 *                     countryCode:
 *                       type: string
 *                       example: "+91"
 *                     role:
 *                       type: string
 *                       example: "user"
 *                     address:
 *                       type: string
 *                       example: "Noida Sector 63 B-Block"
 *                     addressLine1:
 *                       type: string
 *                       example: "Noida Sector 63 B-Block"
 *                     addressLine2:
 *                       type: string
 *                       example: "Noida Sector 63 B-Block"
 *                     city:
 *                       type: string
 *                       example: "Noida"
 *                     state:
 *                       type: string
 *                       example: "Uttar Pradesh"
 *                     country:
 *                       type: string
 *                       example: "India"
 *                     image:
 *                       type: string
 *                       example: "Image Url"
 *                     company_license_frontSide:
 *                       type: string
 *                       example: "Image Url"
 *                     company_license_backSide:
 *                       type: string
 *                       example: "Image Url"
 *                     driving_license_frontSide:
 *                       type: string
 *                       example: "Image Url"
 *                     driving_license_backSide:
 *                       type: string
 *                       example: "Image Url"
 *                     truck_license_frontSide:
 *                       type: string
 *                       example: "Image Url"
 *                     truck_license_backSide:
 *                       type: string
 *                       example: "Image Url"
 *                     isActive:
 *                       type: boolean
 *                     isDelete:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     accessToken:
 *                       type: string
 *                       example: "jrekhfduewihfiuewf98437iufewjdskm"
 *                     refreshToken:
 *                       type: string
 *                       example: "jrekhfduewihfiuewf98437iufewjdskm"
 *                 code:
 *                   type: integer
 *                   example: 201
 */
route.post(p.add, schemaValidator(signUpSchema), async (req: any, res: any) => {
    const data = await user_renter_deliveryController.addUser_renter_delivery(req.body, req.headers);
    res.status(CREATED).json({ data, code: CREATED });
});

/**
 * @swagger
 * /common/auth/login:
 *   post:
 *     summary: User, Renter, and Delivery sign In
 *     description: Details
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - password
 *               - countryCode
 *               - role
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "8979012640"
 *               countryCode:
 *                 type: string
 *                 example: "+91"
 *               password:
 *                 type: string
 *                 example: "User1212@"
 *               role:
 *                 type: string
 *                 example: "user"
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "User1"
 *                     phoneNumber:
 *                       type: string
 *                       example: "8979012640"
 *                     email:
 *                       type: string
 *                       example: "user1@gmail.com"
 *                     countryCode:
 *                       type: string
 *                       example: "+91"
 *                     role:
 *                       type: string
 *                       example: "user"
 *                     address:
 *                       type: string
 *                       example: "Noida Sector 63 B-Block"
 *                     addressLine1:
 *                       type: string
 *                       example: "Noida Sector 63 B-Block"
 *                     addressLine2:
 *                       type: string
 *                       example: "Noida Sector 63 B-Block"
 *                     city:
 *                       type: string
 *                       example: "Noida"
 *                     state:
 *                       type: string
 *                       example: "Uttar Pradesh"
 *                     country:
 *                       type: string
 *                       example: "India"
 *                     image:
 *                       type: string
 *                       example: "Image Url"
 *                     company_license_frontSide:
 *                       type: string
 *                       example: "Image Url"
 *                     company_license_backSide:
 *                       type: string
 *                       example: "Image Url"
 *                     driving_license_frontSide:
 *                       type: string
 *                       example: "Image Url"
 *                     driving_license_backSide:
 *                       type: string
 *                       example: "Image Url"
 *                     truck_license_frontSide:
 *                       type: string
 *                       example: "Image Url"
 *                     truck_license_backSide:
 *                       type: string
 *                       example: "Image Url"
 *                     isActive:
 *                       type: boolean
 *                     isDelete:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     accessToken:
 *                       type: string
 *                       example: "jrekhfduewihfiuewf98437iufewjdskm"
 *                     refreshToken:
 *                       type: string
 *                       example: "jrekhfduewihfiuewf98437iufewjdskm"
 *                 code:
 *                   type: integer
 *                   example: 200
 */

route.post(p.login, schemaValidator(loginSchema), async (req, res: any) => {
    const data = await user_renter_deliveryController.login(req.body, req.headers);
    res.status(OK).json({ data, code: OK })
});

/**
 * @swagger
 * /common/auth/details:
 *   get:
 *     summary: Details
 *     description: Details
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - countryCode
 *               - role
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "8979012640"
 *               countryCode:
 *                 type: string
 *                 example: "+91"
 *               role:
 *                 type: string
 *                 example: "user"
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "User1"
 *                     phoneNumber:
 *                       type: string
 *                       example: "8979012640"
 *                     email:
 *                       type: string
 *                       example: "user1@gmail.com"
 *                     countryCode:
 *                       type: string
 *                       example: "+91"
 *                     role:
 *                       type: string
 *                       example: "user"
 *                     address:
 *                       type: string
 *                       example: "Noida Sector 63 B-Block"
 *                     addressLine1:
 *                       type: string
 *                       example: "Noida Sector 63 B-Block"
 *                     addressLine2:
 *                       type: string
 *                       example: "Noida Sector 63 B-Block"
 *                     city:
 *                       type: string
 *                       example: "Noida"
 *                     state:
 *                       type: string
 *                       example: "Uttar Pradesh"
 *                     country:
 *                       type: string
 *                       example: "India"
 *                     image:
 *                       type: string
 *                       example: "Image Url"
 *                     company_license_frontSide:
 *                       type: string
 *                       example: "Image Url"
 *                     company_license_backSide:
 *                       type: string
 *                       example: "Image Url"
 *                     driving_license_frontSide:
 *                       type: string
 *                       example: "Image Url"
 *                     driving_license_backSide:
 *                       type: string
 *                       example: "Image Url"
 *                     truck_license_frontSide:
 *                       type: string
 *                       example: "Image Url"
 *                     truck_license_backSide:
 *                       type: string
 *                       example: "Image Url"
 *                     isActive:
 *                       type: boolean
 *                     isDelete:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 code:
 *                   type: integer
 *                   example: 200
 */

route.get(p.details, schemaValidator_forQueryReq(detailsInfoSchema), async (req, res: any) => {
    const data = await user_renter_deliveryController.details_Info(req.query, req.headers);
    res.status(OK).json({ data, code: OK })
});

/**
 * @swagger
 * /common/auth/forgotPassword:
 *   get:
 *     summary: Forgot Password
 *     description: Update Password with new password.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "8979012640"
 *               newPassword:
 *                 type: string
 *                 example: "User1212@"
 *               confirmPassword:
 *                 type: string
 *                 example: "User1212@"
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                 code:
 *                   type: integer
 *                   example: 200
 */

route.put(p.forgotPassword, schemaValidator(forgotSchema1), async (req, res: any) => {
    const data = await user_renter_deliveryController.forgotPassword(req.body, req.headers);
    res.status(OK).json({ data, code: OK })
});

route.get(p.re_generateAccessToken, async (req: any, res: any) => {
    const data = await user_renter_deliveryController.re_generateAccessToken(req.headers, res);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.logout, async (req: any, res: any) => {
    const { language = 'en' } = req.headers;
    const message = messages(language);
    const data = await user_renter_deliveryController.logout(req.headers);
    res.status(OK).json({ data: data, code: OK, message: message.logoutSuccessful });
});

route.put(p.changePassword, verifyAuthToken, checkRole(['user', 'renter_user', 'delivery_user']), schemaValidator(changePasswordSchema), async (req: any, res: any) => {
    const { language = 'en' } = req.headers;
    const message = messages(language);
    const data = await user_renter_deliveryController.changePassword(req.body, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK, message: message.success });
});

route.delete(p.deleteUser, verifyAuthToken, checkRole(['user', 'renter_user', 'delivery_user']), async (req: any, res: any) => {
    const { language = 'en' } = req.headers;
    const message = messages(language);
    const data = await user_renter_deliveryController.deleteUser(req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK, message: message.userDelete });
});

route.get(p.updateNotification_status, verifyAuthToken, checkRole(['user', 'renter_user', 'delivery_user']), schemaValidator_forQueryReq(updateNotificationSchema), async (req: any, res: any) => {
    const data = await user_renter_deliveryController.updateNotification(req.query, req.user.id, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.switch_account, verifyAuthToken, checkRole(['renter_user', 'delivery_user', 'user']), async (req: any, res: any) => {
    const data = await user_renter_deliveryController.switch_account(req.user.id, req.params.role, req.headers);
    res.status(OK).json({ data: data, code: OK });
});

route.get(p.user_company_details_Info, async (req: any, res: any) => {
    const data = await user_renter_deliveryController.user_company_details_Info(req.user.id, req.headers);
    res.status(OK).json({ data, code: OK })
});

route.post(p.sendOtp, schemaValidator(sendOtpSchema), async (req: any, res: any) => {
    const { language = 'en' } = req.headers;
    const message = messages(language);
    const data = await user_renter_deliveryController.sendOtp(req.body, req.headers);
    res.status(OK).json({ data, code: OK, message: message.sendOtp })
});

route.post(p.verifyOtp, schemaValidator(verifyOtpSchema), async (req: any, res: any) => {
    const { language = 'en' } = req.headers;
    const message = messages(language);
    const data = await user_renter_deliveryController.verifyOtp(req.body, req.headers);
    res.status(OK).json({ data, code: OK, message: message.verifiedOtp })
});

export default route;