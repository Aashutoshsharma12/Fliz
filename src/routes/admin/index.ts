import { Router } from "express";
import authRoute from "@routes/admin/auth";
import categoryRoute from "@routes/admin/category";
import subCatRouter from "@routes/admin/sub_category";
import sub_sub_router from "./sub_sub_category";
import engine_companyRoute from "./engine_company";
import adminUserRouter from "./user";
import engine_modelRouter from "./engine_model";
import deliveryRouter from "./delivery_vehicle";
import equipmentRouter from "./equipment_delivery";
import vehicle_sizeTypeRouter from "./vehicle_sizeType";
import capacityRouter from './capacity';
import inspectionRouter from './inspection';
import notificationRouter from "./notification";
import versionRouter from "./version";
import cancel_reason_Router from "./cancel_reason";
import renter_admin from "./renter_companyOrder";
import delivery_admin from "./delivery_companyOrder";
import faq_admin from "./faq_route"
import dashboard from "./dashboard";
import spcification_route from "./cat_specification";
import spcificationValue_route from "./specification_Value";
import deliverySpecification from "./deliverySpecification";
import deliverySpecificationValue from "./deliverySpecificationValue";
// import transection_router from "./transectionInfo";

const baserouter = Router();

baserouter.use("/auth", authRoute);
baserouter.use("/category", categoryRoute);
baserouter.use("/sub_category", subCatRouter);
baserouter.use("/sub_sub_category", sub_sub_router);
baserouter.use("/engine_company", engine_companyRoute);
baserouter.use("/user", adminUserRouter);
baserouter.use("/engine_model", engine_modelRouter);
baserouter.use("/vehicle_size_type", vehicle_sizeTypeRouter);
baserouter.use('/capacity', capacityRouter);
baserouter.use("/inspection", inspectionRouter);
baserouter.use("/delivery_equipment", equipmentRouter);
baserouter.use('/delivery_vehicle', deliveryRouter);
baserouter.use('/notification', notificationRouter);
baserouter.use('/version', versionRouter);
baserouter.use('/cancel_reason', cancel_reason_Router);
baserouter.use('/renter_admin', renter_admin);
baserouter.use('/delivery_admin', delivery_admin);
baserouter.use('/faq_admin', faq_admin);
baserouter.use('/dashboard', dashboard)
baserouter.use('/catSpecification', spcification_route)
baserouter.use('/specificationValue', spcificationValue_route)
baserouter.use('/deliverySpecification', deliverySpecification)
baserouter.use('/deliverySpecificationValue', deliverySpecificationValue)
export default baserouter;
