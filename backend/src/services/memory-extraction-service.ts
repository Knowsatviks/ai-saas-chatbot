import { getGeminiModel } from "../config/gemini-config.js";
import { generateEmbedding } from "./embedding-service.js";
import { upsertMemory, type MemoryCategory } from "./memory-service.js";

const candidatePattern = /\b(i am|i'm|i prefer|i like|i dislike|i usually|my goal|i work|i study|remember that|please remember|in the future|i want to|i need to|i want|i need)\b/i;

const memoryExtractionPrompt = (message: string) => `
Decide whether the user's message contains one durable, user-specific memory worth saving for future conversations with a persona.

Save only explicit long-term facts, preferences, goals, relationships, or constraints. Do not save greetings, temporary moods, one-off requests, questions, secrets, passwords, OTPs, tokens, financial credentials, or instructions about how the AI should behave. Do not infer facts.

Return JSON only in this exact shape:
{"shouldRemember":false,"memory":null,"category":null,"importance":0}

When appropriate, category must be one of: preference, fact, goal, relationship, constraint. Importance must be a number from 0 to 1.

User message:
${message}
`;

const extractJson = (text: string) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) {
    return null;
  }

  try {
    return JSON.parse(text.slice(start, end + 1)) as {
      shouldRemember?: boolean;
      memory?: string | null;
      category?: MemoryCategory | null;
      importance?: number;
    };
  } catch {
    return null;
  }
};

export const extractAndStoreMemory = async ({
  message,
  userId,
  personaId,
  conversationId,
  sourceMessageId,
}: {
  message: string;
  userId: string;
  personaId: string;
  conversationId: string;
  sourceMessageId: string;
}) => {
  if (!candidatePattern.test(message) || message.length > 1000) {
    return null;
  }

  const result = await getGeminiModel().generateContent(memoryExtractionPrompt(message));
  const extracted = extractJson(result.response.text());

  if (
    !extracted?.shouldRemember ||
    !extracted.memory ||
    !extracted.category ||
    extracted.memory.length > 500
  ) {
    return null;
  }

  const embedding = await generateEmbedding(extracted.memory);

  return upsertMemory({
    userId,
    personaId,
    content: extracted.memory,
    category: extracted.category,
    importance: Math.min(1, Math.max(0, extracted.importance ?? 0.5)),
    sourceConversationId: conversationId,
    sourceMessageId,
    embedding,
  });
};
