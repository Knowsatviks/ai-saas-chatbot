import type { NextFunction, Request, Response } from "express";
import Conversation from "../models/Conversation.js";
import Persona from "../models/Persona.js";
import { generateResponse } from "../config/gemini-config.js";

export const listConversations = async (_req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = res.locals.jwtData.id;
    const conversations = await Conversation.find({ userId }).sort({ updatedAt: -1 });

    return res.status(200).json({ message: "Conversations fetched", conversations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

export const createConversation = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = res.locals.jwtData.id;
    const { title, personaId } = req.body;

    const conversation = new Conversation({
      userId,
      title: title?.trim() || "New Conversation",
      personaId: personaId || null,
    });

    await conversation.save();

    return res.status(201).json({ message: "Conversation created", conversation });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create conversation" });
  }
};

export const renameConversation = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = res.locals.jwtData.id;
    const { conversationId, title } = req.body;

    if (!conversationId || !title || title.trim() === "") {
      return res.status(400).json({ message: "Conversation id and title are required" });
    }

    const conversation = await Conversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    conversation.title = title.trim();
    await conversation.save();

    return res.status(200).json({ message: "Conversation renamed", conversation });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to rename conversation" });
  }
};

export const deleteConversation = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = res.locals.jwtData.id;
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ message: "Conversation id is required" });
    }

    const conversation = await Conversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    await Conversation.deleteOne({ _id: conversationId, userId });

    return res.status(200).json({ message: "Conversation deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete conversation" });
  }
};

export const sendMessageToConversation = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = res.locals.jwtData.id;
    const { conversationId, message, personaId } = req.body;

    if (!conversationId || !message || message.trim() === "") {
      return res.status(400).json({ message: "Conversation id and message are required" });
    }

    const conversation = await Conversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isExistingConversation = conversation.messages.length > 0;
    const requestedPersonaId = personaId || null;

    if (isExistingConversation && requestedPersonaId) {
      const existingPersonaId = conversation.personaId ? conversation.personaId.toString() : null;
      if (existingPersonaId && existingPersonaId !== requestedPersonaId) {
        return res.status(400).json({ message: "Cannot change persona for an existing conversation" });
      }
    }

    const effectivePersonaId = isExistingConversation
      ? conversation.personaId ? conversation.personaId.toString() : null
      : requestedPersonaId;

    let activePersona = null;
    if (effectivePersonaId) {
      activePersona = await Persona.findOne({ _id: effectivePersonaId, userId });
    }

    const chatHistory = conversation.messages.map(({ role, content }) => ({ role, content }));
    chatHistory.push({ role: "user", content: message });

    const aiResponse = await generateResponse(chatHistory, activePersona);

    conversation.messages.push({ role: "user", content: message, personaId: activePersona?._id ?? null });
    conversation.messages.push({ role: "assistant", content: aiResponse, personaId: activePersona?._id ?? null });
    if (!conversation.personaId && activePersona?._id) {
      conversation.personaId = activePersona._id;
    }
    conversation.title = conversation.title === "New Conversation" ? message.slice(0, 40) : conversation.title;
    await conversation.save();

    return res.status(200).json({ message: aiResponse, conversation });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to send message" });
  }
};
