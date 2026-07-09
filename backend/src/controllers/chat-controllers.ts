import type { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import Persona from "../models/Persona.js";
import { generateResponse } from "../config/gemini-config.js";

export const generateChatCompletion = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const { message, personaId } = req.body;

        // Validate input
        if (!message || message.trim() === "") {
            return res.status(400).json({ message: "Message cannot be empty" });
        }

        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).json({ message: "User not registered or token is invalid" });
        }

        let activePersona = null;

        if (personaId) {
            activePersona = await Persona.findOne({ _id: personaId, userId: user._id });
        }

        // Prepare chat history
        const chatHistory = user.chats.map(({ role, content }) => ({ role, content }));
        chatHistory.push({ content: message, role: "user" });

        // Get response from Gemini
        const aiResponse = await generateResponse(chatHistory, activePersona);

        // Save both user message and AI response to database
        user.chats.push({ content: message, role: "user", personaId: activePersona?._id ?? null });
        user.chats.push({ content: aiResponse, role: "assistant", personaId: activePersona?._id ?? null });
        await user.save();

        return res.status(200).json({ 
            message: aiResponse,
            chats: user.chats 
        });

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return res.status(500).json({ message: errorMessage });
    }
};

export const sendChatsToUser = async(_req:Request, res:Response, _next:NextFunction)=>{
    //User token check
    try{
        const user = await User.findById(res.locals.jwtData.id);

        if (!user) {
            return res.status(401).send("User is not registered OR Token is invalid");
        }

        if(user._id.toString() !== res.locals.jwtData.id){
            return res.status(401).json({message: "Forbidden: You can only access your own chats"});
        }

        return res.status(200).json({ 
            message: "Returning user chats successfully!", 
            chats: user.chats,
        }); 
    }
    catch(err){
        console.log(err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        return res.status(500).json({message : "Error verifying user, could not retrieve chats", cause: errorMessage});
    }
} 

export const deleteChats = async(_req:Request, res:Response, _next:NextFunction)=>{
    //User token check
    try{
        const user = await User.findById(res.locals.jwtData.id);

        if (!user) {
            return res.status(401).send("User is not registered OR Token is invalid");
        }
        if(user._id.toString() !== res.locals.jwtData.id){
            return res.status(401).json({message: "Forbidden: You can only access your own chats"});
        }
        //@ts-ignore
        user.chats = [];
        await user.save();

        return res.status(200).json({ 
            message: "Deleted user chats successfully!", 
            chats: user.chats,
        }); 
    }
    catch(err){
        console.log(err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        return res.status(500).json({message : "Error verifying user, could not delete chats", cause: errorMessage});
    }
} 
