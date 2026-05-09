// ===========================================
// ENTRY POINT - Application Initialization
// ===========================================

import dotenv from "dotenv";
// ENVIRONMENT CONFIG:
// - Loads all variables from .env file into process.env
// - Why? Keep secrets (passwords, API keys) separate from code
// - Different configs for dev/production without changing code
// - Example: DATABASE_URL, API_KEYS, etc are in .env, not hardcoded
dotenv.config();

import app from "./app.js";
import { connectToDatabase } from "./db/connection.js";

// ===========================================
// SERVER STARTUP FLOW
// ===========================================
// 1. Connect to MongoDB database
// 2. If successful, start Express server
// 3. If failed, catch error and log

connectToDatabase().then(() => {
  // Server only starts AFTER database connects
  // process.env.PORT comes from .env (e.g., PORT=5000)
  const port = process.env.PORT;
  app.listen(port, () => {
    console.log(`✅ Server is running on port ${port} and connected to database`);
  });
}).catch((error) => {
  console.error(`❌ Failed to start server:`, error);
  process.exit(1); // Exit if database connection fails
});

