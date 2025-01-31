import { Router } from "express";
import profileRoute from "./profile";
import homeRoute from "./home";
import bookingRoute from "./booking";
import favRoute from "./favourite";

// Export the base-router

const baseRouter = Router();

// Setup routers
baseRouter.use("/profile", profileRoute);
baseRouter.use("/home", homeRoute);
baseRouter.use("/booking", bookingRoute);
baseRouter.use("/favourite", favRoute);

// Export default.
export default baseRouter;
