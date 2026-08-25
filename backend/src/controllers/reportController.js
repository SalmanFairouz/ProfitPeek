const { z } = require("zod");
const prisma = require("../lib/prisma");
const serializeReport = require("../utils/serializeReport");
const { incomeStatementSchema } = require("../schemas/incomeStatement");
const { MAX_UPLOADS_PER_USER } = require("../constants");

async function list(req, res) {
  const [reports, user] = await Promise.all([
    prisma.report.findMany({ where: { userId: req.userId }, orderBy: { createdAt: "desc" } }),
    prisma.user.findUnique({ where: { id: req.userId }, select: { uploadCount: true } }),
  ]);
  res.json({ reports: reports.map(serializeReport), uploadCount: user.uploadCount, maxUploads: MAX_UPLOADS_PER_USER });
}

async function getOne(req, res) {
  const id = Number(req.params.id);
  const report = await prisma.report.findFirst({ where: { id, userId: req.userId } });
  if (!report) return res.status(404).json({ error: "Report not found" });
  res.json({ report: serializeReport(report) });
}

async function update(req, res) {
  const id = Number(req.params.id);

  let data;
  try {
    data = incomeStatementSchema.parse(req.body);
  } catch (err) {
    return res.status(400).json({ error: err instanceof z.ZodError ? err.issues[0].message : "Invalid request" });
  }

  const existing = await prisma.report.findFirst({ where: { id, userId: req.userId } });
  if (!existing) return res.status(404).json({ error: "Report not found" });

  const report = await prisma.report.update({ where: { id }, data: { data } });
  res.json({ report: serializeReport(report) });
}

async function remove(req, res) {
  const id = Number(req.params.id);
  const existing = await prisma.report.findFirst({ where: { id, userId: req.userId } });
  if (!existing) return res.status(404).json({ error: "Report not found" });

  await prisma.report.delete({ where: { id } });
  res.status(204).end();
}

module.exports = { list, getOne, update, remove };
