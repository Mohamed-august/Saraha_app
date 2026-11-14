import { createClient } from "redis";

    export const redisClient = createClient({
        username: process.env.REDIS_USERNAME || "default",
        password: process.env.REDIS_PASSWORD?.trim(),
        socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        },
    });

redisClient.on("error",(err)=>console.log("Redis client error",err))
.on("connect",()=>console.log("redis client connected"))
.connect()
