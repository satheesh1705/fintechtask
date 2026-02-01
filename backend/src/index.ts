import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth";
import { tasksRouter } from "./routes/tasks";
import { prisma } from "./prisma";

dotenv.config();

const PORT = Number(process.env.PORT || 4000);
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/tasks", tasksRouter);

app.get("/", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Backend running on ${PORT}`);
});

