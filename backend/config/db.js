import mongoose from "mongoose";
import dns from "dns";

let isMongoConnected = false;

/**
 * Automatically URL-encodes special characters in MongoDB passwords
 */
function sanitizeMongoUri(uri) {
  if (!uri) return uri;
  try {
    const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)$/);
    if (match) {
      const scheme = match[1];
      const username = match[2];
      const rawPassword = match[3];
      const hostAndParams = match[4];
      
      // Decode first to handle pre-encoded strings without double-encoding
      let cleanPass = rawPassword;
      try { cleanPass = decodeURIComponent(rawPassword); } catch (_) {}
      
      const encodedPassword = encodeURIComponent(cleanPass);
      return `${scheme}${username}:${encodedPassword}@${hostAndParams}`;
    }
  } catch (err) {
    console.warn("URI Sanitization Warning:", err.message);
  }
  return uri;
}

export const connectDB = async () => {
  const rawUri = process.env.MongoDB || process.env.MONGODB_URI;
  if (!rawUri) {
    console.log("ℹ️ MONGODB_URI not provided. Running with in-memory thread storage.");
    return false;
  }

  const mongoUri = sanitizeMongoUri(rawUri);

  try {
    await mongoose.connect(mongoUri);
    isMongoConnected = true;
    console.log("✅ Connected to MongoDB successfully.");
    return true;
  } catch (error) {
    if (error.message && (error.message.includes("querySrv") || error.message.includes("ECONNREFUSED"))) {
      try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
        await mongoose.connect(mongoUri);
        isMongoConnected = true;
        console.log("✅ Connected to MongoDB successfully (via DNS fallback).");
        return true;
      } catch (retryError) {
        console.error("⚠️ MongoDB connection error:", retryError.message);
      }
    } else {
      console.error("⚠️ MongoDB connection error:", error.message);
    }
    console.log("ℹ️ Falling back to in-memory thread storage.");
    isMongoConnected = false;
    return false;
  }
};

export const getIsMongoConnected = () => isMongoConnected;

