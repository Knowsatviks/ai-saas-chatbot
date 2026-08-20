import {Router} from "express";
import { getAllUsers, requestPasswordReset, resetPassword, userLogin, userLogout, userSignup, verifyPasswordResetOtp, verifyUser } from "../controllers/user-controllers.js";
import { forgotPasswordValidator, loginValidator, resetPasswordValidator, signupValidator, validate, verifyOtpValidator } from "../utils/validators.js";
import { verifyToken } from "../utils/token-manager.js";

const userRoutes = Router();

userRoutes.get("/", getAllUsers);
userRoutes.post("/signup", validate(signupValidator),userSignup);
userRoutes.post("/login", validate(loginValidator), userLogin);
userRoutes.post("/forgot-password", validate(forgotPasswordValidator), requestPasswordReset);
userRoutes.post("/verify-reset-otp", validate(verifyOtpValidator), verifyPasswordResetOtp);
userRoutes.post("/reset-password", validate(resetPasswordValidator), resetPassword);
userRoutes.get("/auth-status", verifyToken, verifyUser);
userRoutes.get("/logout", verifyToken, userLogout);
export default userRoutes;