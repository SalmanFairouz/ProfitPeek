const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { registerSchema, loginSchema } = require("../schemas/auth.schema");

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

async function register(req, res) {
  let body;
  try {
    body = registerSchema.parse(req.body);
  } catch (err) {
    return res.status(400).json({ error: err instanceof z.ZodError ? err.issues[0].message : "Invalid request" });
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const password = await bcrypt.hash(body.password, SALT_ROUNDS);
  const user = await prisma.user.create({ data: { email: body.email, password } });

  res.status(201).json({ token: signToken(user), userId: user.id });
}

async function login(req, res) {
  let body;
  try {
    body = loginSchema.parse(req.body);
  } catch (err) {
    return res.status(400).json({ error: err instanceof z.ZodError ? err.issues[0].message : "Invalid request" });
  }

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  const valid = user && (await bcrypt.compare(body.password, user.password));
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({ token: signToken(user), userId: user.id });
}

module.exports = { register, login };
