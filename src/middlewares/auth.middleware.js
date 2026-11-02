import jwt from "jsonwebtoken";
import { errorRes } from "../utils/error.handle.js";
import { userModel } from "../DB/models/users.model.js";
import { userSessionJwtIdKey } from "../utils/redis.services.js";
import { redisClient } from "../DB/redis.connect.js";
export const tokenEnum={
    access:"access",
    refresh:"refresh"
}

export const auth =async(req,res,next)=>{
    const {user,jti}= await decodeToken({authorization:req.headers.authorization})
    req.user=user

    req.jti=jti

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
    const {jti}=payload;
    if(!jti)
    {
        errorRes({
            msg: "in-valid token",
            statusCode:400
        })
    }
    const redisjti=await redisClient.get(userSessionJwtIdKey(user._id,jti))
    if(!redisjti)
    {
        errorRes({
            msg: "logged out login again",
            statusCode:400
        })
    }
    return {user,jti};
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
