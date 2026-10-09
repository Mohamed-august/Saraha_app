import z from "zod"
import { GenderEnum } from "./users.types.js";

export const signupSchema={
    body: z.strictObject({
    fullname:z.string(),
    email:z.email(),
    phone:z.string().min(10).max(15),
    password:z.string(),
    age:z.number().optional(),
    gender:z.enum(GenderEnum),
    userName:z.string(),
    bio:z.string().optional()
    }),
    query:z.strictObject({
        id:z.string()
    })

}

