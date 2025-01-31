import { Router } from 'express';
import equipmentRoute from './equipment';
import orderRoute from './order';


// Export the base-router

const baseRouter = Router();

// Setup routers
baseRouter.use('/equipment',equipmentRoute);
baseRouter.use('/order',orderRoute);

// Export default.
export default baseRouter;