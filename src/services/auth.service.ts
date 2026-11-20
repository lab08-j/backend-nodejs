import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "../lib/prisma";
import { AppError } from "../error/appError";

const ACCESS_TOKEN_TTL = "1h";
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new AppError("Configuração de autenticação inválida", 500);
  }

  return process.env.JWT_SECRET;
};

const createAccessToken = (userId: string, role: string) =>
  jwt.sign({ userId, role }, getJwtSecret(), { expiresIn: ACCESS_TOKEN_TTL });

const hashRefreshToken = (token: string) => createHash("sha256").update(token).digest("hex");

const createRefreshToken = async (userId: string) => {
  const token = randomBytes(64).toString("base64url");
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashRefreshToken(token),
      expiresAt,
    },
  });

  return token;
};

export const authenticate = async (email: string, password: string) => {
  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) {
    throw new AppError("Email ou senha inválidos", 401);
  }

  if (user.deletedAt) {
    throw new AppError("Email ou senha inválidos", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError("Email ou senha inválidos", 401);
  }

  const token = createAccessToken(user.id, user.role);
  const refreshToken = await createRefreshToken(user.id);

  return { token, refreshToken };
};

export const refreshSession = async (token: string) => {
  const now = new Date();
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashRefreshToken(token) },
    include: { user: true },
  });

  if (
    !storedToken ||
    storedToken.revokedAt ||
    storedToken.expiresAt <= now ||
    storedToken.user.deletedAt
  ) {
    throw new AppError("Refresh token inválido ou expirado", 401);
  }

  const accessToken = createAccessToken(storedToken.user.id, storedToken.user.role);
  const nextRefreshToken = randomBytes(64).toString("base64url");
  const nextExpiresAt = new Date(now.getTime() + REFRESH_TOKEN_TTL_MS);
  const nextTokenHash = hashRefreshToken(nextRefreshToken);

  await prisma.refreshToken.create({
    data: {
      userId: storedToken.user.id,
      tokenHash: nextTokenHash,
      expiresAt: nextExpiresAt,
    },
  });

  const revoked = await prisma.refreshToken.updateMany({
    where: {
      id: storedToken.id,
      revokedAt: null,
      expiresAt: { gt: now },
    },
    data: { revokedAt: now },
  });

  if (revoked.count !== 1) {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: nextTokenHash, revokedAt: null },
      data: { revokedAt: now },
    });
    throw new AppError("Refresh token inválido ou expirado", 401);
  }

  return { token: accessToken, refreshToken: nextRefreshToken };
};

export const revokeRefreshToken = async (token?: string) => {
  if (!token) {
    return;
  }

  await prisma.refreshToken.updateMany({
    where: {
      tokenHash: hashRefreshToken(token),
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
};
