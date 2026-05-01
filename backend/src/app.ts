import express from "express";
import { config } from "dotenv";
import dns from "dns";
import morgan from "morgan";
import appRouter from "./routes/index.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

config();

const app = express();

//middlewares

app.use(express.json());

//need to remove it in production
app.use(morgan("dev"));

app.use("/api/v1", appRouter);

export default app;