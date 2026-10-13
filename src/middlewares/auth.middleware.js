import jwt from "jsonwebtoken";
import { errorRes } from "../utils/error.handle.js";
import { userModel } from "../DB/models/users.model.js";
export const tokenEnum={
    access:"access",
    refresh:"refresh"
}

export const auth =async(req,res,next)=>{
    const {user}= await decodeToken({authorization:req.headers.authorization})
    req.user=user
    next()
}

export const decodeToken = async({authorization,tokenType=tokenEnum.access})=>{
    console.log({authorization})
    if(!authorization || !authorization.startsWith("Bearer ")){
        errorRes({
            msg: "Unauthorized",
            statusCode:401
        })
    }

    const token =authorization.split(" ")[1]
    console.log({token})

    const payload = jwt.verify(token,tokenType == tokenEnum.access?
        process.env.ACCESS_TOKEN_SECRET:
        process.env.REFRESH_TOKEN_SECRET
    )
    console.log({payload})
    const user = await userModel.findById(payload._id)
    console.log({user})
    if(!user){
        errorRes({
            msg: "Unauthorized",
            statusCode:401
        })
    }
    return {user};
}

export const authorization=(...roles)=>{
    return (req,res,next)=>{
    console.log({roles,userRole:req.user.role})
    if(!roles.includes(req.user.role)){
        errorRes({
        msg:"unauthorized",
        statusCode:401
        })
    }
    next()
}
}
