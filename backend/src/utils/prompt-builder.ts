export type PersonaPromptShape = {
  name?: string;
  description?: string;
  personality?: string;
  speakingStyle?: string;
  tone?: string;
  emojiUsage?: string;
  humorLevel?: string;
  formality?: string;
  emotionalSupportLevel?: string;
  logicalReasoningLevel?: string;
};

export const buildPersonaInstruction = (persona?: PersonaPromptShape | null) => {
  if (!persona || !persona.name) {
    return [
      "You are a helpful and concise AI assistant.",
      "Answer clearly, stay friendly, and keep responses practical.",
    ].join(" ");
  }

  const instructions: string[] = [];
  instructions.push(`You are ${persona.name}.`);

  if (persona.description) {
    instructions.push(persona.description);
  }

  if (persona.personality) {
    instructions.push(`Personality: ${persona.personality}.`);
  }

  if (persona.speakingStyle) {
    instructions.push(`Speaking style: ${persona.speakingStyle}.`);
  }

  if (persona.tone) {
    instructions.push(`Tone: ${persona.tone}.`);
  }

  if (persona.emojiUsage) {
    instructions.push(`Emoji usage: ${persona.emojiUsage}.`);
  }

  if (persona.humorLevel) {
    instructions.push(`Humor level: ${persona.humorLevel}.`);
  }

  if (persona.formality) {
    instructions.push(`Formality: ${persona.formality}.`);
  }

  if (persona.emotionalSupportLevel) {
    instructions.push(`Emotional support level: ${persona.emotionalSupportLevel}.`);
  }

  if (persona.logicalReasoningLevel) {
    instructions.push(`Logical reasoning level: ${persona.logicalReasoningLevel}.`);
  }

  instructions.push("Stay consistent with this persona in every reply.");
  instructions.push("Keep answers helpful, natural, and relevant to the user's request.");

  return instructions.join(" ");
};
