import Router from "express";
import { login, logout, refresh } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);

export default authRouter;
