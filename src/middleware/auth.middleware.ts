import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "../types/jwt";

export const authMiddleware: RequestHandler = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({
      message: "Token não informado.",
    });
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      message: "Configuração de autenticação não encontrada.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });

    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string" ||
      (decoded.role !== "ADMIN" && decoded.role !== "USER")
    ) {
      res.status(401).json({
        message: "Token inválido.",
      });
      return;
    }

    const payload: JwtPayload = {
      sub: decoded.sub,
      role: decoded.role,
    };

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    res.status(401).json({
      message: "Token inválido ou expirado.",
    });
  }
};
