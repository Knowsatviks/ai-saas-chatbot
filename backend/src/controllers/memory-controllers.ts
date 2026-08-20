import type { NextFunction, Request, Response } from "express";
import Memory from "../models/Memory.js";
import Persona from "../models/Persona.js";
import { updateMemoryContent } from "../services/memory-service.js";

export const listMemories = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = res.locals.jwtData.id;
    const personaId = String(req.query.personaId || "");

    if (!personaId) {
      return res.status(400).json({ message: "Persona id is required" });
    }

    const persona = await Persona.findOne({ _id: personaId, userId });
    if (!persona) {
      return res.status(404).json({ message: "Persona not found" });
    }

    const memories = await Memory.find({ userId, personaId, isActive: true })
      .sort({ importance: -1, updatedAt: -1 });

    return res.status(200).json({ message: "Memories fetched", memories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch memories" });
  }
};

export const deleteMemory = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = res.locals.jwtData.id;
    const memoryId = req.params.memoryId;
    const memory = await Memory.findOne({ _id: memoryId, userId });

    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }

    await Memory.deleteOne({ _id: memoryId, userId });
    return res.status(200).json({ message: "Memory deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete memory" });
  }
};

export const updateMemory = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = res.locals.jwtData.id;
    const memoryId = req.params.memoryId;
    const content = String(req.body.content || "").trim();

    if (!content) {
      return res.status(400).json({ message: "Memory content is required" });
    }

    const memory = await updateMemoryContent({ memoryId, userId, content });
    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }

    return res.status(200).json({ message: "Memory updated", memory });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update memory" });
  }
};