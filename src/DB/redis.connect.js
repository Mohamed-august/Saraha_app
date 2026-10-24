import { createClient } from "redis";

export const redisClient = createClient({
    url:"redis://127.0.0.1:6379",
    database:5,
    RESP: 2
})

redisClient.on("error",(err)=>console.log("Redis client error",err))
.on("connect",()=>console.log("redis client connected"))
.connect()
