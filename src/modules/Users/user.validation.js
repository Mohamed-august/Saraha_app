import {z} from "zod"
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
    })
}

export const confirmEmailSchema = {
    body: z.strictObject({
        email: z.email(),
        otp: z.union([z.string().length(6), z.number()])
    })
}

export const forgetPasswordSchema = {
    body: z.strictObject({
        email: z.email()
    })
}
