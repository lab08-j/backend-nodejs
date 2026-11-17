import {z} from "zod";



export const userSchema = z.object({
    email: z.email().describe("Informe um e-mail válido"),
    password: z.string(),
    name: z.string(),

});