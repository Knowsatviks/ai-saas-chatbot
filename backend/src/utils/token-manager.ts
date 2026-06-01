import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "./constants.js";

export const createToken = (id: string, email: string, expiresIn: any) => {
  const payload = { id, email };

  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn,
  });
  return token;
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
    const token = req.signedCookies?.[COOKIE_NAME];
    if(!token || token.trim() ===""){
        return res.status(401).json({message: "No token recieved"});
    }
    console.log("Verifying token:", token);
    return new Promise<void>((resolve, reject)=>{
      return jwt.verify(token, process.env.JWT_SECRET as string, (err: any, success:any)=>{
        if(err){
          reject(err?.message);
          return res.status(401).json({message: "Token Expired"})
        }
        else{
          console.log("Token verification Successful:");
          resolve();
          res.locals.jwtData = success; // Store decoded token data in res.locals for later use
          return next();
        }
      });
    });
};
