import express from "express"

import chalk from "chalk"

import { DBConnection } from "./DB/db.connection.js"

// import { userModel } from "./DB/models/users.model.js"

import userRouter , { routes as userRoutes } from "./modules/Users/users.controller.js"

const bootstrap = async ()=>
{
    const app =express()
    app.use(express.json())
    await DBConnection()
    app.get("/",(req,res)=>
    {
        console.log("Hello")
    })

    app.use(userRoutes.base,userRouter)

    // await userModel.create(
    //     {
    //         fullname:"Ahmed Ali",
    //         email:"ahmed.ali@example.com",
    //         password:"password123",
    //         userName:"ahmed_ali",
    //     }
    // )

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
