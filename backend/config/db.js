import mongoose from "mongoose";

let isMongoConnected = false;

export const connectDB = async () => {
  const mongoUri = process.env.MongoDB || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log("ℹ️ MONGODB_URI not provided. Running with in-memory thread storage.");
    return false;
  }
  try {
    await mongoose.connect(mongoUri);
    isMongoConnected = true;
    console.log("✅ Connected to MongoDB successfully.");
    return true;
  } catch (error) {
    console.error("⚠️ MongoDB connection error:", error.message);
    console.log("ℹ️ Falling back to in-memory thread storage.");
    isMongoConnected = false;
    return false;
  }
};

export const getIsMongoConnected = () => isMongoConnected;
