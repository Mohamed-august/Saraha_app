import mongoose from "mongoose";

import chalk from "chalk";

export const DBConnection = async()=>
{
    try{
        await mongoose.connect(process.env.DB_URL,
            {
                serverSelectionTimeoutMS:5000
            }
        )
        console.log(chalk.green("Database connected successfully"))
    }
    catch(error){
        console.log(chalk.red("Database connection failed=>",error))
    }
}
