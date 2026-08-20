import type { Request, Response, NextFunction } from "express";
import { body, type ValidationChain } from "express-validator";

export const validate = (validations: ValidationChain[])=>{
    return async (req: Request, res:Response, next: NextFunction) =>{
        // Run all validations and collect errors
        const errors = [];
        for (let validation of validations){
            const result = await validation.run(req);
            if (!result.isEmpty()){
                errors.push(...result.array());
            }
        }
        
        if (errors.length === 0){
            return next(); //move to next middleware or route handler
        }
        return res.status(422).json({message: "Validation failed", errors}); //422 Unprocessable Entity
    };
}

export const loginValidator = [
    body("email").trim().isEmail().withMessage("Valid email is required"),
    body("password").trim().isLength({min: 6}).withMessage("Password must be at least 6 characters long")
]

export const signupValidator = [
    body("name").isString().notEmpty().withMessage("Name is required and must be a string"),
    ...loginValidator
]

export const chatCompletionValidator = [
    body("message").notEmpty().withMessage("Message is required"),
]

export const forgotPasswordValidator = [
    body("email").trim().isEmail().withMessage("Valid email is required"),
];

export const verifyOtpValidator = [
    body("email").trim().isEmail().withMessage("Valid email is required"),
    body("otp").trim().matches(/^\d{4}$/).withMessage("OTP must be exactly 4 digits"),
];

export const resetPasswordValidator = [
    body("resetToken").isString().notEmpty().withMessage("Reset token is required"),
    body("password").trim().isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
];