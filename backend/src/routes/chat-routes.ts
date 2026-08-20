import {Router} from "express";
import { verifyToken } from "../utils/token-manager.js";
import { createPersona, deletePersona, getUserPersonas } from "../controllers/persona-controllers.js";
import { createConversation, deleteConversation, listConversations, renameConversation, sendMessageToConversation } from "../controllers/conversation-controllers.js";
import { chatCompletionValidator, validate } from "../utils/validators.js";

const chatRoutes = Router();

chatRoutes.post("/new", validate(chatCompletionValidator), verifyToken, sendMessageToConversation);
chatRoutes.get("/personas", verifyToken, getUserPersonas);
chatRoutes.post("/personas", verifyToken, createPersona);
chatRoutes.delete("/personas", verifyToken, deletePersona);
chatRoutes.delete("/personas/:personaId", verifyToken, deletePersona);
chatRoutes.get("/conversations", verifyToken, listConversations);
chatRoutes.post("/conversations", verifyToken, createConversation);
chatRoutes.put("/conversations/rename", verifyToken, renameConversation);
chatRoutes.delete("/conversations", verifyToken, deleteConversation);

export default chatRoutes;