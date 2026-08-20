import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    personaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Persona",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    embedding: {
      type: [Number],
      select: false,
    },
    category: {
      type: String,
      enum: ["preference", "fact", "goal", "relationship", "constraint"],
      required: true,
    },
    importance: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5,
    },
    sourceConversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sourceMessageId: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

memorySchema.index({ userId: 1, personaId: 1, isActive: 1, importance: -1 });
memorySchema.index({ userId: 1, personaId: 1, updatedAt: -1 });

export default mongoose.model("Memory", memorySchema);
