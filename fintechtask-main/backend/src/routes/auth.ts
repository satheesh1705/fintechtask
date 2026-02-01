import express from "express";
import { prisma } from "../prisma";
import bcrypt from "bcrypt";
import { signAccess, createRefreshToken } from "../utils";
import { z } from "zod";

const router = express.Router();

const registerSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

router.post("/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email }});
    if (existing) return res.status(400).json({ error: "Email already in use" });

    const hash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({ data: { email: data.email, passwordHash: hash }});
    res.status(201).json({ id: user.id, email: user.email });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email }});
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = signAccess({ id: user.id, email: user.email });
    const refresh = createRefreshToken();

    await prisma.refreshToken.create({
      data: { token: refresh.token, userId: user.id, expiresAt: refresh.expiresAt }
    });

    res.cookie("jid", refresh.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30) * 24 * 3600 * 1000
    });

    res.json({ accessToken });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies.jid;
    if (!token) return res.status(401).json({ error: "No refresh token" });
    const stored = await prisma.refreshToken.findUnique({ where: { token }});
    if (!stored) return res.status(401).json({ error: "Invalid token" });
    if (stored.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: stored.id }});
      return res.status(401).json({ error: "Refresh token expired" });
    }
    const user = await prisma.user.findUnique({ where: { id: stored.userId }});
    if (!user) return res.status(401).json({ error: "User not found" });

    const accessToken = signAccess({ id: user.id, email: user.email });
    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", async (req, res) => {
  const token = req.cookies.jid;
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token }});
    res.clearCookie("jid");
  }
  res.status(204).end();
});

export { router as authRouter };
