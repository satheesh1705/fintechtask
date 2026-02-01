import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const accessSecret = process.env.JWT_ACCESS_SECRET!;

export function requireAuth(req: Request & { userId?: number }, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing Authorization header" });
  const parts = auth.split(" ");
  if (parts.length !== 2) return res.status(401).json({ error: "Invalid Authorization header" });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, accessSecret) as any;
    req.userId = Number(payload.sub);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
