import { Router } from 'express';
import vehicleRoute from './delivery_transport';
import orderRoute from './order';

// Export the base-router

const baseRouter = Router();

// Setup routers
baseRouter.use('/vehicle', vehicleRoute);
baseRouter.use('/order', orderRoute);

// Export default.
export default baseRouter;