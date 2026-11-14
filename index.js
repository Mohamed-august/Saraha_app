    import express from "express"
    import chalk from "chalk"
    import cors from "cors"
    import { DBConnection } from "./src/DB/db.connection.js"
    import userRouter, { routes as userRoutes } from "./src/modules/Users/users.controller.js"
    import messageRouter, { routes as messageRoutes } from "./src/modules/message/message.controller.js"
    import { redisClient } from "./src//DB/redis.connect.js"

    const app = express()

    app.use(cors({ origin: "*" }))
    app.use(express.json())

    let ready
    const init = () => {
    if (!ready) {
        ready = (async () => {
        await DBConnection()
        try {
            if (!redisClient.isOpen) await redisClient.connect()
        } catch (e) {
            console.error("Redis unavailable:", e.message) 
        }
        })()
    }
    return ready
    }

    app.use(async (req, res, next) => {
    try {
        await init()
        next()
    } catch (err) {
        next(err)
    }
    })

    app.get("/", (req, res) => {
    res.status(200).json({ msg: "server is running" })
    })

    app.use("/uploads", express.static("./uploads"))
    app.use(userRoutes.base, userRouter)
    app.use(messageRoutes.base, messageRouter)

    app.use((err, req, res, next) => {
    const statusCode = err.cause?.statusCode || 500
    console.log({ statusCode })
    res.status(statusCode).json({
        errMsg: err.message,
        status: statusCode,
        errOptions: err.cause?.options,
    })
    })

    if (!process.env.VERCEL) {
    app.listen(process.env.PORT || 3000, () => {
        console.log(chalk.green("Server is running on port " + (process.env.PORT || 3000)))
    })
    }

    export default app
