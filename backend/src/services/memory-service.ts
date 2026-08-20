import mongoose from "mongoose";
import Memory from "../models/Memory.js";
import { generateEmbedding } from "./embedding-service.js";

export type MemoryCategory = "preference" | "fact" | "goal" | "relationship" | "constraint";

export type MemoryContext = {
  _id: unknown;
  content: string;
  category: MemoryCategory;
  importance: number;
};

type MemoryCandidate = {
  _id: unknown;
  content: string;
  category: string;
  importance: number;
  updatedAt: Date | string;
  semanticScore?: number;
};

export const getRelevantMemories = async (
  userId: string,
  personaId: string,
  currentMessage?: string,
  limit = 12,
): Promise<MemoryContext[]> => {
  const finalLimit = Math.min(Math.max(limit, 5), 8);
  const candidateLimit = Math.max(finalLimit * 4, 20);
  let memories: MemoryCandidate[] = [];

  if (currentMessage) {
    try {
      const queryEmbedding = await generateEmbedding(currentMessage);
      memories = await Memory.aggregate<MemoryCandidate>([
        {
          $vectorSearch: {
            index: process.env.MEMORY_VECTOR_INDEX_NAME || "memory_vector_index",
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: candidateLimit * 10,
            limit: candidateLimit,
            filter: {
              $and: [
                { userId: { $eq: new mongoose.Types.ObjectId(userId) } },
                { personaId: { $eq: new mongoose.Types.ObjectId(personaId) } },
                { isActive: { $eq: true } },
              ],
            },
          },
        },
        {
          $project: {
            content: 1,
            category: 1,
            importance: 1,
            updatedAt: 1,
            lastUsedAt: 1,
            semanticScore: { $meta: "vectorSearchScore" },
          },
        },
      ] as any);
    } catch (error) {
      console.warn("Semantic memory retrieval unavailable; using legacy retrieval:", error);
    }
  }

  if (memories.length === 0) {
    memories = await Memory.find({ userId, personaId, isActive: true })
      .sort({ importance: -1, updatedAt: -1 })
      .limit(candidateLimit)
      .lean();
  }

  const now = Date.now();
  const rankedMemories = memories
    .map((memory) => {
      const ageInDays = Math.max(0, (now - new Date(memory.updatedAt).getTime()) / 86_400_000);
      const recencyScore = Math.exp(-ageInDays / 90);
      const semanticScore = typeof memory.semanticScore === "number" ? memory.semanticScore : 0;
      const hybridScore = semanticScore * 0.7 + (memory.importance || 0) * 0.2 + recencyScore * 0.1;
      return { ...memory, hybridScore };
    })
    .sort((left, right) => right.hybridScore - left.hybridScore)
    .slice(0, finalLimit);

  if (rankedMemories.length > 0) {
    await Memory.updateMany(
      { _id: { $in: rankedMemories.map((memory) => memory._id) }, userId, personaId },
      { $set: { lastUsedAt: new Date() } },
    );
  }

  return rankedMemories.map(({ _id, content, category, importance }) => ({
    _id,
    content,
    category: category as MemoryCategory,
    importance,
  }));
};

export const upsertMemory = async ({
  userId,
  personaId,
  content,
  category,
  importance,
  sourceConversationId,
  sourceMessageId,
  embedding,
}: {
  userId: string;
  personaId: string;
  content: string;
  category: MemoryCategory;
  importance: number;
  sourceConversationId: string;
  sourceMessageId: string;
  embedding?: number[];
}) => {
  const normalizedContent = content.trim();
  const existingMemory = await Memory.findOne({
    userId,
    personaId,
    content: normalizedContent,
    isActive: true,
  });

  if (existingMemory) {
    if (!existingMemory.embedding || existingMemory.embedding.length === 0) {
      existingMemory.embedding = embedding || await generateEmbedding(normalizedContent);
    }
    existingMemory.importance = Math.max(existingMemory.importance, importance);
    existingMemory.updatedAt = new Date();
    await existingMemory.save();
    return existingMemory;
  }

  return Memory.create({
    userId,
    personaId,
    content: normalizedContent,
    category,
    importance,
    sourceConversationId,
    sourceMessageId,
    embedding: embedding || await generateEmbedding(normalizedContent),
  });
};

export const updateMemoryContent = async ({
  memoryId,
  userId,
  content,
}: {
  memoryId: string;
  userId: string;
  content: string;
}) => {
  const normalizedContent = content.trim();
  const embedding = await generateEmbedding(normalizedContent);

  return Memory.findOneAndUpdate(
    { _id: memoryId, userId },
    { $set: { content: normalizedContent, embedding } },
    { new: true, runValidators: true },
  );
};
