// ===========================================
// EXPRESS APPLICATION SETUP
// ===========================================

import express from "express";
import { config } from "dotenv";
import dns from "dns";
import morgan from "morgan";
import appRouter from "./routes/index.js";

// ===========================================
// DNS CONFIGURATION
// ===========================================
// DNS = Domain Name System (converts domain names to IP addresses)
// Example: cluster0.xydn50a.mongodb.net → 54.123.45.67
//
// Why do we need this?
// - Your ISP's DNS might be slow or blocked
// - We explicitly use Google DNS (8.8.8.8) and Cloudflare DNS (1.1.1.1)
// - Ensures reliable connection to MongoDB
// - Solves "querySrv ECONNREFUSED" errors
//
// What it does:
// - Overrides default DNS servers
// - Makes DNS lookups faster and more reliable
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// ===========================================
// ENVIRONMENT CONFIGURATION
// ===========================================
// Loads variables from .env file
// Why separate config?
// - Security: Don't hardcode API keys, passwords in source code
// - Flexibility: Change config without redeploying
// - Multiple environments:
//   • Development: Local MongoDB, test API keys
//   • Production: Real MongoDB, real API keys, no logging
// Example .env file:
//   PORT=5000
//   MONGODB_URL=mongodb://...
//   GROQ_API_KEY=sk-xxxx
config();

const app = express();

// ===========================================
// MIDDLEWARE - Functions that process requests
// ===========================================

// 1. Parse JSON requests
// If client sends JSON body, convert it to JavaScript object
// Without this: req.body would be undefined
app.use(express.json());

// 2. HTTP Request Logger - MORGAN
// What it does: Logs every HTTP request to console
// Format: GET /api/v1/users 200 - 1.234 ms
//         ↑    ↑               ↑    ↑
//      method  url          status time
// 
// Why "dev" format?
// - "dev" = colored output for development (easier to read)
// - Production uses simpler formats (like "combined")
// - Note: Removed in production for performance
app.use(morgan("dev"));

// ===========================================
// ROUTES - All API endpoints
// ===========================================
// All routes prefixed with /api/v1
// Example:
//   POST /api/v1/chat
//   GET /api/v1/users
//   DELETE /api/v1/messages
app.use("/api/v1", appRouter);

export default app;