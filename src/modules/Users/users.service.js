
import { userModel } from "../../DB/models/users.model.js";
import { errorRes } from "../../utils/error.handle.js";
import jwt from "jsonwebtoken"
import { createHash } from "../../utils/security/hash.js";
export const signupService = async({fullname,email,password,gender,phone,bio,age,userName})=>
{
    // const isExist = await userModel.findOne({$or:
    //     [{email},
    //         {userName}]
    // })

    // const isEmailExist = await userModel.findOne({email})
    // const isUserNameExist = await userModel.findOne({userName})
    
    const {isEmailExist,isUserNameExist} = await Promise.all(
        [
            userModel.findOne({email}),
            userModel.findOne({userName})
        ]
    )
    if(isEmailExist || isUserNameExist){
        errorRes({msg:`${isEmailExist?"email":"username"}  already exists`,
            statusCode:400})
    }

    const user = await userModel.create(
        {
            fullname,
            email,
            password:await createHash(password),
            gender,
            phone,
            bio,
            age,
            userName
        }
    )
    return {data:user}
}

export const loginService = async({identifier,password})=>
{
    const user = await userModel.findOne({$or:[
        {email:identifier},
        {userName:identifier}]})
    if(!user){
        errorRes({msg:"invalid credentails",
            statusCode:400})
    }
    if(user.password !== password){
        errorRes({msg:"invalid credentials",
            statusCode:400})
    }
    const accessToken =jwt.sign({
        _id:user._id,
        email:user.email
    },process.env.TOKEN_SECRET,{expiresIn:"30M"})

    const refreshToken = jwt.sign({
        _id:user._id,
        email:user.email
    },process.env.REFRESH_TOKEN_SECRET,{expiresIn:"7d"})

    return {data:{accessToken,refreshToken}}
}

export const refreshToken=async({authorization})=>
{
    const {user} = await decodeToken({authorization,tokenType:tokenEnum.refresh})
    const accessToken = jwt.sign({_id:user._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"30M"})
    return {data:{accessToken}}
}
