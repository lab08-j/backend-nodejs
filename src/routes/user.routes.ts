import Router from "express";
import {createUserController} from "../controllers/user.controller";


const userRouter = Router();


userRouter.post("/register", createUserController);


export default userRouter