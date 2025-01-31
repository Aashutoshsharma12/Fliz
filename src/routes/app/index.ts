import { Router } from 'express';
import commonRoute from './common_api';
import userRoute from './user';
import renterRoute from './company_renter'
import deliveryRoute from './company_delivery'




// Export the base-router
const baseRouter = Router();

// Setup routers

baseRouter.use('/common', commonRoute);
baseRouter.use('/user', userRoute);
baseRouter.use('/renter', renterRoute);
baseRouter.use('/delivery', deliveryRoute);


// Export default.
export default baseRouter;
