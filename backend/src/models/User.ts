import mongoose from "mongoose";
import { randomUUID } from "crypto";

const chatSchema = new mongoose.Schema({
    id:{
        type: String,
        default: randomUUID(),
    },
    role: {
        type: String,
        required: true,
    },
    content:{
        type: String,
        required: true, 
    },
    personaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Persona",
        default: null,
    }
})

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
    },
    resetOtpHash: {
        type: String,
        default: null,
    },
    resetOtpExpiresAt: {
        type: Date,
        default: null,
    },
    chats: [chatSchema]
});

    export default mongoose.model("User", userSchema);