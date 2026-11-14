import { createClient } from "redis";

    export const redisClient = createClient({
        url : process.env.REDIS_URL
    });

redisClient.on("error",(err)=>console.log("Redis client error",err))
.on("connect",()=>console.log("redis client connected"))
.connect()
