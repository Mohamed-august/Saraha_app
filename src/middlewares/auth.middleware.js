import jwt from "jsonwebtoken";
import { errorRes } from "../utils/error.handle.js";
export const tokenEnum={
    access:"access",
    refresh:"refresh"
}
export const auth =async(req,res,next)=>{

    req.user=user
    next()
}

export const decodeToken = async(authorization,tokenType=tokenEnum.access)=>{
    console.log({authorization})
    if(!authorization || !authorization.startsWith("Bearer ")){
        errorRes({
            res,
            status:401
        }, { errMsg: "Unauthorized" })
    }

    const token =authorization.split(" ")[1]
    console.log({token})

    const payload = jwt.verify(token,tokenType===tokenEnum.access
        ?process.env.ACCESS_TOKEN_SECRET
        :process.env.REFRESH_TOKEN_SECRET)
    console.log({payload})
    const user = await userModel.findById(payload._id)
    console.log({user})
    if(!user){
        errorRes({
            res,
            status:404
        }, { errMsg: "User not found" })
    }
    return {user};
}


export const authorization=(...roles)=>(req,res,next)=>{
    console.log({roles,userRole:req.user.role})
    if(!roles.includes(req.user.role)){
        return errorRes({
            res,
            status:401
        }, { errMsg: "Unauthorized" })
    }
    next()
}
