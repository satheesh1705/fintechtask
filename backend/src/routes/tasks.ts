import express from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { z } from "zod";

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req: any, res) => {
  const userId = req.userId as number;
  const skip = Number(req.query.skip ?? 0);
  const take = Math.min(Number(req.query.take ?? 10), 50);
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;

  const where: any = { userId };
  if (status) where.status = status;
  if (search) where.title = { contains: search, mode: "insensitive" };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.task.count({ where })
  ]);
  res.json({ data: tasks, meta: { total, skip, take }});
});

const createSchema = z.object({ title: z.string().min(1), body: z.string().optional() });
router.post("/", async (req: any, res) => {
  const userId = req.userId as number;
  try {
    const body = createSchema.parse(req.body);
    const task = await prisma.task.create({ data: { title: body.title, body: body.body, userId }});
    res.status(201).json(task);
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req: any, res) => {
  const userId = req.userId as number;
  const id = Number(req.params.id);
  const task = await prisma.task.findUnique({ where: { id }});
  if (!task || task.userId !== userId) return res.status(404).json({ error: "Not found" });
  res.json(task);
});

router.patch("/:id", async (req: any, res) => {
  const userId = req.userId as number;
  const id = Number(req.params.id);
  const task = await prisma.task.findUnique({ where: { id }});
  if (!task || task.userId !== userId) return res.status(404).json({ error: "Not found" });
  const data = req.body;
  const updated = await prisma.task.update({ where: { id }, data });
  res.json(updated);
});

router.delete("/:id", async (req: any, res) => {
  const userId = req.userId as number;
  const id = Number(req.params.id);
  const task = await prisma.task.findUnique({ where: { id }});
  if (!task || task.userId !== userId) return res.status(404).json({ error: "Not found" });
  await prisma.task.delete({ where: { id }});
  res.status(204).end();
});

router.post("/:id/toggle", async (req: any, res) => {
  const userId = req.userId as number;
  const id = Number(req.params.id);
  const task = await prisma.task.findUnique({ where: { id }});
  if (!task || task.userId !== userId) return res.status(404).json({ error: "Not found" });
  const newStatus = task.status === "done" ? "todo" : "done";
  const updated = await prisma.task.update({ where: { id }, data: { status: newStatus }});
  res.json(updated);
});

export { router as tasksRouter };
