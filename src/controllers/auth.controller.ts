import  {authSchema} from "../schemas/auth.schema";
import{authenticate} from "../services/auth.service";
import type {Request, Response} from "express";


export const login = async (req: Request, res: Response) => {
    try {
        const validatedData = authSchema.safeParse(req.body);

        if (!validatedData.success) {
            return res.status(400).json({ error: validatedData.error.message });
        }

        const data = await authenticate(validatedData.data.email, validatedData.data.password);

        res.cookie("token", data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 1000,
        });

        return res.status(200).json("login success");


    } catch (error) {
        console.log(error);
        res.status(401).json({ error: "Email ou senha inválidos" });
    }
};