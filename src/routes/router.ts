import Router from "express";
import userRouter from "./user.routes";
import {authenticate} from "../services/auth.service";
import authRouter from "./auth.router";
const router = Router();

router.use("/user",userRouter);
router.use("/auth", authRouter);

export default router;