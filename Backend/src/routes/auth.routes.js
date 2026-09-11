const express = require("express");

const authController = require("../controllers/authcontrollers");
const authMiddleware = require("../middlewares/auth.middleware");

const authRouter = express.Router();


authRouter.post(
    "/register",
    authController.registerUserController
);


authRouter.post(
    "/login",
    authController.loginUserController
);


authRouter.post(
    "/logout",
    authMiddleware.authUser,
    authController.logoutUserController
);


authRouter.get(
    "/get-me",
    authMiddleware.authUser,
    authController.getMeController
);


module.exports = authRouter;