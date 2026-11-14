import { createClient } from "redis";

export const redisClient = createClient({
    url:process.env.REDIS_URL,
    database:5,
    RESP: 2
})

redisClient.on("error",(err)=>console.log("Redis client error",err))
.on("connect",()=>console.log("redis client connected"))
.connect()
