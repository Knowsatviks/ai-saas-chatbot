// ===========================================
// DATABASE CONNECTION - MongoDB Setup
// ===========================================

import { connect, disconnect } from 'mongoose';

/**
 * ENVIRONMENT CONFIG - Why we need it
 * 
 * The MONGODB_URL comes from .env file:
 *   MONGODB_URL=mongodb://username:password@cluster.mongodb.net/dbname
 * 
 * Why in .env instead of hardcoded?
 * 1. SECURITY: Password exposed in source code is dangerous
 * 2. FLEXIBILITY: Different URLs for dev vs production
 * 3. VERSION CONTROL: .env is in .gitignore, not pushed to GitHub
 * 
 * Example:
 *   Development: mongodb://localhost:27017/chatbot (local)
 *   Production:  mongodb+srv://user:pass@atlas.mongodb.net (cloud)
 */

async function connectToDatabase() {
    // Get MongoDB URL from environment variables (.env file)
    const mongoUrl = process.env.MONGODB_URL;
    
    // Check if URL exists (configuration is loaded)
    if (!mongoUrl) {
        throw new Error("MONGODB_URL environment variable is not defined");
    }
    
    try {
        // Connect to MongoDB using mongoose
        await connect(mongoUrl);
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        // Handle connection errors
        // Could be:
        // - Wrong credentials
        // - IP not whitelisted
        // - MongoDB server down
        // - Network issues (DNS problems)
        console.error("❌ Error connecting to MongoDB:", error);
        throw new Error("Failed to connect to MongoDB");
    }
}

async function disconnectFromDatabase() {
    try {
        await disconnect();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error disconnecting from MongoDB:", error);
        throw new Error("Failed to disconnect from MongoDB");
    }
}

export { connectToDatabase, disconnectFromDatabase };