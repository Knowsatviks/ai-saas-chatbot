import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { buildMemoryInstruction, buildPersonaInstruction, type MemoryPromptShape, type PersonaPromptShape } from "../utils/prompt-builder.js";

let cachedModel: GenerativeModel | null = null;

export function configureGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    
    const config = new GoogleGenerativeAI(apiKey);
    return config;
}

// Cache the model instance to avoid recreating it on every request
export const getGeminiModel = () => {
    if (cachedModel) {
        return cachedModel;
    }
    
    const config = configureGemini();
    cachedModel = config.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 2048,
        }
    });
    
    return cachedModel;
};

export const generateResponse = async (
    chatHistory: Array<{role: string; content: string}>,
    persona?: PersonaPromptShape | null,
    memories: MemoryPromptShape[] = [],
) => {
    try {
        const model = getGeminiModel();
        const personaInstruction = buildPersonaInstruction(persona);
        const memoryInstruction = buildMemoryInstruction(memories);

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: `System instruction: ${personaInstruction}\n\n${memoryInstruction}` }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I will follow this persona consistently." }],
                },
                ...chatHistory.map(msg => ({
                    role: msg.role === "user" ? "user" : "model",
                    parts: [{ text: msg.content }]
                }))
            ]
        });
        
        const userMessage = chatHistory[chatHistory.length - 1].content;
        
        const result = await chat.sendMessage(userMessage);
        const responseText = result.response.text();
        
        return responseText;
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("429")) {
                throw new Error("Rate limit exceeded. Please try again later.");
            }
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("Failed to generate response from Gemini");
    }
};