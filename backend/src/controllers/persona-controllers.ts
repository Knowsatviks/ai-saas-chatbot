import type { NextFunction, Request, Response } from "express";
import Persona from "../models/Persona.js";

export const getUserPersonas = async (_req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = res.locals.jwtData?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const personas = await Persona.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ message: "Personas fetched successfully", personas });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch personas" });
  }
};

export const createPersona = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = res.locals.jwtData?.id;
    const {
      name,
      description,
      personality,
      speakingStyle,
      tone,
      emojiUsage,
      humorLevel,
      formality,
      emotionalSupportLevel,
      logicalReasoningLevel,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ message: "Persona name is required" });
    }

    const persona = new Persona({
      userId,
      name: name.trim(),
      description: description?.trim() || "",
      personality: personality?.trim() || "",
      speakingStyle: speakingStyle?.trim() || "",
      tone: tone?.trim() || "",
      emojiUsage: emojiUsage?.trim() || "",
      humorLevel: humorLevel?.trim() || "",
      formality: formality?.trim() || "",
      emotionalSupportLevel: emotionalSupportLevel?.trim() || "",
      logicalReasoningLevel: logicalReasoningLevel?.trim() || "",
    });

    await persona.save();

    return res.status(201).json({ message: "Persona created successfully", persona });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create persona" });
  }
};
