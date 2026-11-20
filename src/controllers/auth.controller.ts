import { authSchema } from "../schemas/auth.schema";
import {
  authenticate,
  REFRESH_TOKEN_TTL_MS,
  refreshSession,
  revokeRefreshToken,
} from "../services/auth.service";
import type { Request, Response } from "express";
import { AppError } from "../error/appError";

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
});

const setAuthCookies = (res: Response, tokens: { token: string; refreshToken: string }) => {
  res.cookie("token", tokens.token, {
    ...cookieOptions(),
    maxAge: 60 * 60 * 1000,
  });
  res.cookie("refreshToken", tokens.refreshToken, {
    ...cookieOptions(),
    maxAge: REFRESH_TOKEN_TTL_MS,
  });
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie("token", cookieOptions());
  res.clearCookie("refreshToken", cookieOptions());
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = authSchema.safeParse(req.body);

    if (!validatedData.success) {
      return res.status(400).json({ error: validatedData.error.message });
    }

    const data = await authenticate(validatedData.data.email, validatedData.data.password);

    setAuthCookies(res, data);

    return res.status(200).json("login success");
  } catch (error) {
    if (error instanceof AppError && error.statusCode < 500) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (typeof refreshToken !== "string") {
    clearAuthCookies(res);
    return res.status(401).json({ error: "Refresh token inválido ou expirado" });
  }

  try {
    const tokens = await refreshSession(refreshToken);
    setAuthCookies(res, tokens);
    return res.status(200).json("token refreshed");
  } catch (error) {
    if (error instanceof AppError) {
      if (error.statusCode < 500) {
        clearAuthCookies(res);
      }
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken =
      typeof req.cookies?.refreshToken === "string" ? req.cookies.refreshToken : undefined;
    await revokeRefreshToken(refreshToken);
    clearAuthCookies(res);
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};
