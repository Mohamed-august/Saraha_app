import express from "express"

import chalk from "chalk"

import { DBConnection } from "./DB/db.connection.js"

import userRouter , { routes as userRoutes } from "./modules/Users/users.controller.js"

import cors from "cors"

const bootstrap = async ()=>
{
    const app =express()
    app.use(cors({
        origin:"*"
    }))
    app.use(express.json())
    await DBConnection()
    app.use(userRoutes.base,userRouter)

    
    app.use((err,req,res,next)=>
    {
        const statusCode=err.cause?.statusCode || 500

        console.log({statusCode})



        res.status(statusCode).json({
            errMsg:err.message,
            status:statusCode,
            errOptions:err.cause?.options
        })
    })

    app.listen(process.env.PORT,()=>
        {
            console.log(chalk.green("Server is running on port " + process.env.PORT));
            
        })
}

export default bootstrap
