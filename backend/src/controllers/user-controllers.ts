import {Request, Response, NextFunction} from "express";
import { randomInt } from "crypto";
import User from "../models/User.js";
import { hash, compare } from "bcrypt"; 
import jwt from "jsonwebtoken";
import { createToken } from "../utils/token-manager.js";
import { COOKIE_NAME } from "../utils/constants.js";
import { MailConfigurationError, sendPasswordResetOtp } from "../config/mail-config.js";

const PASSWORD_RESET_EXPIRY_MINUTES = 10;

// Production-safe cookie options based on NODE_ENV
// - Local development uses HTTP and lax SameSite
// - Production uses HTTPS and strict security settings
const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  path: "/",
  httpOnly: true,
  signed: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
};

const createPasswordResetToken = (userId: string, email: string) => jwt.sign(
    { id: userId, email, purpose: "password-reset" },
    process.env.JWT_SECRET as string,
    { expiresIn: "10m" },
);

export const getAllUsers = async(req:Request, res:Response, next:NextFunction)=>{
    //gets all users from the database and returns them as a response
    try{
        const users = await User.find();

        return res.status(200).json({message : "OK", users});   
    }
    catch(err){
        console.log(err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        return res.status(500).json({message : "Error fetching users", cause: errorMessage});
    }
}

export const userSignup = async(req:Request, res:Response, next:NextFunction)=>{
    //user Signup
    try{
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(401).json({ message: "User already exists" });
        }

        const hashedPassword = await hash(password, 10);

        const newUser = new User({ name, email, password: hashedPassword });

        //create a token and store it in a cookie
        res.clearCookie(COOKIE_NAME, cookieOptions);
        const token = createToken(newUser._id.toString(), newUser.email, "7d"); // Expires in 7 days
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds

        res.cookie(COOKIE_NAME, token, { ...cookieOptions, expires });


        await newUser.save();

        return res.status(201).json({ message: "User created successfully", name: newUser.name, email: newUser.email }); 
    }
    catch(err){
        console.log(err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        return res.status(500).json({message : "Error creating user", cause: errorMessage});
    }
}

export const userLogin = async(req:Request, res:Response, next:NextFunction)=>{
    //user Login
    try{
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).send( "User is not registered");
        }
        const isPasswordCorrect = await (compare(password, user.password));
        if(!isPasswordCorrect){
            return res.status(401).send("Incorrect password");
        }
        res.clearCookie(COOKIE_NAME, cookieOptions);
        const token = createToken(user._id.toString(), user.email, "7d"); // Expires in 7 days
        const expiresIn = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds

        res.cookie(COOKIE_NAME, token, { ...cookieOptions, expires: expiresIn });

        return res.status(201).json({ message: "User logged in successfully", name: user.name, email: user.email}); 
    }
    catch(err){
        console.log(err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        return res.status(500).json({message : "Error creating user", cause: errorMessage});
    }
}

export const userLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    res.clearCookie(COOKIE_NAME, cookieOptions);

    return res
      .status(200)
      .json({ message: "OK", name: user.name, email: user.email });
  } catch (error:any) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};

export const verifyUser = async(req:Request, res:Response, next:NextFunction)=>{
    //Verifies the user by checking the token and returns user details if token is valid
    try{
        const user = await User.findById(res.locals.jwtData.id);

        if (!user) {
            return res.status(401).send("User is not registered OR Token is invalid");
        }

        return res.status(200).json({ 
            message: "User verified successfully!", 
            name: user.name, 
            email: user.email
        }); 
    }
    catch(err){
        console.log(err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        return res.status(500).json({message : "Error verifying user", cause: errorMessage});
    }
}

export const requestPasswordReset = async (req: Request, res: Response) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "No account is registered with this email" });
        }

        const otp = randomInt(1000, 10000).toString();
        await sendPasswordResetOtp(user.email, otp);

        user.resetOtpHash = await hash(otp, 10);
        user.resetOtpExpiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000);
        await user.save();

        return res.status(200).json({ message: "Password reset OTP sent" });
    } catch (error) {
        console.error(error);
        if (error instanceof MailConfigurationError) {
            return res.status(503).json({ message: error.message });
        }
        return res.status(500).json({ message: "Unable to send password reset OTP" });
    }
};

export const verifyPasswordResetOtp = async (req: Request, res: Response) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const otp = String(req.body.otp || "").trim();
        const user = await User.findOne({ email });

        if (!user || !user.resetOtpHash || !user.resetOtpExpiresAt || user.resetOtpExpiresAt.getTime() < Date.now()) {
            return res.status(400).json({ message: "The OTP is invalid" });
        }

        const isValid = await compare(otp, user.resetOtpHash);
        if (!isValid) {
            return res.status(400).json({ message: "The OTP is invalid" });
        }

        user.set("resetOtpHash", null);
        user.set("resetOtpExpiresAt", null);
        await user.save();

        return res.status(200).json({
            message: "OTP verified",
            resetToken: createPasswordResetToken(user._id.toString(), user.email),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Unable to verify OTP" });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { resetToken, password } = req.body;
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET as string) as {
            id: string;
            email: string;
            purpose: string;
        };

        if (decoded.purpose !== "password-reset") {
            return res.status(401).json({ message: "Invalid password reset token" });
        }

        const user = await User.findOne({ _id: decoded.id, email: decoded.email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.password = await hash(password, 10);
        await user.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Invalid or expired password reset token" });
    }
};