import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant", "system", "tool"],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ThreadSchema = new mongoose.Schema({
  threadId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    default: "New Chat"
  },
  persona: {
    type: String,
    default: "friendly"
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  messages: {
    type: [MessageSchema],
    default: []
  }
});

const Thread = mongoose.model("Thread", ThreadSchema);
export default Thread;
