import {prisma} from '../lib/prisma';
import bcrypt from 'bcrypt';
import {AppError} from "../error/appError";


export const createUser = async (name: string, email: string, password: string , avatarUrl?:string ) => {
 console.log(" asdfasdf AQUI")
    const existingUser = await prisma.user.findUnique({
   where: { email },
 });
console.log("passei ? ")
 if (existingUser) {
   throw new AppError('E-mail já cadastrado!', 409);
 }

const hashedPassword = await bcrypt.hash(password, 10);

 const user = await prisma.user.create({
   data: {
     name,
     email,
     passwordHash: hashedPassword,
       ...(avatarUrl && { avatarUrl: avatarUrl }),
   },
 });
console.log(user);
 return user;
}
