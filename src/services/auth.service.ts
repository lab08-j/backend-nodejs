import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {prisma} from '../lib/prisma';
import {AppError} from "../error/appError";

export const authenticate = async (email: string, password: string) => {
    const user = await prisma.user.findFirst({
        where: { email },
    });

    if (!user) {
        throw new AppError("Usuário não encontrado",404 );
    }

    if (user.deletedAt) {
        // User is marked as deleted  mais a mensagem retornada para o usuário é "Usuário não encontrado" para não expor a existência do usuário
        throw new AppError("Usuário não encontrado", 404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        throw new AppError("Email ou senha inválidos", 404);
    }

    if(!process.env.JWT_SECRET){
        throw new AppError("Usuário não encontrado", 400)
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });

    const userWithoutPassword = { ...user, password: undefined };

    return { user: userWithoutPassword, token };
};