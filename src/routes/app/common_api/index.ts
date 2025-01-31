import { Router } from 'express';
import authRoute from './auth';
import profileRoute from './profile';
import bankRoute from './bank_info';
import listRoute from './list';
import dashboardRoute from './dashboard';
import chatRoute from './chat';
import paymentRoute from './payment'
import guestUserRoute from './guest_user'
import raiseQuery from './raise_query'
import queryChat from './query_chat_message'
import specification from './specification'

// Export the base-router

const baseRouter = Router();

// Setup routers
baseRouter.use('/auth', authRoute);
baseRouter.use('/profile', profileRoute);
baseRouter.use('/bank', bankRoute);
baseRouter.use('/list', listRoute);
baseRouter.use('/dashboard', dashboardRoute);
baseRouter.use('/chat', chatRoute);
baseRouter.use('/payment', paymentRoute);
baseRouter.use('/guestUser', guestUserRoute);
baseRouter.use('/raise_query', raiseQuery);
baseRouter.use('/query_chat', queryChat);
baseRouter.use('/renter_specification', specification);

// Export default.
export default baseRouter;