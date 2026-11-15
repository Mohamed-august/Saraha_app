import chalk from "chalk";
import { createClient } from "redis";

    export const redisClient = createClient({
        username: process.env.REDIS_USERNAME || "default",
        password: process.env.REDIS_PASSWORD?.trim(),
        socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        },
    });

redisClient.on("error",(err)=>console.log(chalk.red("Redis client error",err)))
.on("connect",()=>console.log(chalk.green("redis client connected")))
.connect()
