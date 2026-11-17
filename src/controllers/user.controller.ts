import {createUser} from "../services/user.service";
import type {Request, Response} from "express";
import {userSchema} from "../schemas/user.schemas";
import {AppError} from "../error/appError";



export const createUserController = async (req: Request, res: Response, ) => {
    try{
        const validate = await userSchema.safeParse(req.body);

        if(!validate.success){
            return res.status(400).json({ error: validate.error.message });
        }

        const data = await createUser(
            validate.data.name, validate.data.email, validate.data.password)
        return res.status(201).json(data);

    }catch(error){
        if( error instanceof AppError){
            return res.status(error.statusCode).json({ error: error.message });
        }
      return  res.status(500).json({ message:"ERRO INTERNO DO SERVIDOR" });
    }

}
