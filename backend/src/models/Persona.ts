import mongoose from "mongoose";

const personaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  personality: {
    type: String,
    default: "",
  },
  speakingStyle: {
    type: String,
    default: "",
  },
  tone: {
    type: String,
    default: "",
  },
  emojiUsage: {
    type: String,
    default: "",
  },
  humorLevel: {
    type: String,
    default: "",
  },
  formality: {
    type: String,
    default: "",
  },
  emotionalSupportLevel: {
    type: String,
    default: "",
  },
  logicalReasoningLevel: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Persona", personaSchema);
