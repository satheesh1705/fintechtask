import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const accessSecret = process.env.JWT_ACCESS_SECRET!;
const accessExp = process.env.ACCESS_TOKEN_EXPIRES || "15m";

export function signAccess(user: { id: number; email: string }) {
  return jwt.sign({ sub: user.id, email: user.email }, accessSecret, { expiresIn: accessExp });
}

export function createRefreshToken(expiresInDays = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30)) {
  const token = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 3600 * 1000);
  return { token, expiresAt };
}
