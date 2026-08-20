import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const DEFAULT_EMBEDDING_MODEL = "text-embedding-004";
let cachedEmbeddingModel: GenerativeModel | null = null;

const getEmbeddingModel = () => {
  if (cachedEmbeddingModel) {
    return cachedEmbeddingModel;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const client = new GoogleGenerativeAI(apiKey);
  cachedEmbeddingModel = client.getGenerativeModel({
    model: process.env.MEMORY_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL,
  });

  return cachedEmbeddingModel;
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  const result = await getEmbeddingModel().embedContent(text);
  return result.embedding.values;
};
