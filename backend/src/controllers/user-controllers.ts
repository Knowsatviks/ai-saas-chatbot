import {Request, Response, NextFunction} from "express";
import User from "../models/User.js";
import { hash } from "bcrypt"; 

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
        await newUser.save();

        return res.status(201).json({ message: "User created successfully", user: newUser, id: newUser._id.toString() }); 
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
        

        // return res.status(201).json({ message: "User created successfully", user: newUser, id: newUser._id.toString() }); 
    }
    catch(err){
        console.log(err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        return res.status(500).json({message : "Error creating user", cause: errorMessage});
    }
}