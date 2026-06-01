import {Request, Response, NextFunction} from "express";
import User from "../models/User.js";
import { hash, compare } from "bcrypt"; 
import { createToken } from "../utils/token-manager.js";
import { COOKIE_NAME } from "../utils/constants.js";

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
        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            domain: "localhost",
            signed:true,
            path:"/",
        });
        const token = createToken(newUser._id.toString(), newUser.email, "7d"); // Expires in 7 days
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds

        res.cookie(COOKIE_NAME, token, { path: "/", domain:"localhost", expires, httpOnly:true, signed: true });


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
        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            domain: "localhost",
            signed:true,
            path:"/",
        });
        const token = createToken(user._id.toString(), user.email, "7d"); // Expires in 7 days
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds

        res.cookie(COOKIE_NAME, token, { path: "/", domain:"localhost", expires, httpOnly:true, signed: true });

        return res.status(201).json({ message: "User logged in successfully", name: user.name, email: user.email}); 
    }
    catch(err){
        console.log(err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        return res.status(500).json({message : "Error creating user", cause: errorMessage});
    }
}

export const verifyUser = async(req:Request, res:Response, next:NextFunction)=>{
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